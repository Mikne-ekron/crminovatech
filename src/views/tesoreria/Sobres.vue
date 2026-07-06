<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Monitor de Sobres"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Sobres', href: '#' }
      ]"
    />

    <v-row class="mb-2" dense>
      <v-col cols="12" class="d-flex align-center ga-2">
        <div class="text-subtitle-1 text-medium-emphasis">Selecciona un sobre para ver su auxiliar</div>
        <v-spacer />
        <v-btn color="warning" variant="flat" prepend-icon="mdi-swap-horizontal" @click="openTraspaso()">Traspaso</v-btn>
      </v-col>
    </v-row>

    <!-- Tarjetas de sobres -->
    <v-row>
      <v-col v-for="s in sobres" :key="s.id" cols="12" sm="6" md="3">
        <v-card
          elevation="0" class="cursor-pointer rounded-xl card-dark-blue"
          :class="{ 'selected-sobre': selected?.id === s.id }"
          @click="selectSobre(s)"
        >
          <v-card-item>
            <template v-slot:prepend>
              <v-icon size="42" class="text-primary">{{ s.es_entrada ? 'mdi-inbox-arrow-down' : 'mdi-email-multiple-outline' }}</v-icon>
            </template>
            <v-card-title class="text-h6 font-weight-bold d-flex align-center">
              {{ s.nombre }}
              <v-chip v-if="s.es_entrada" size="x-small" color="info" variant="tonal" class="ml-2">Entrada</v-chip>
              <v-icon v-if="s.no_eliminable" size="14" class="ml-1 text-light-muted" title="No eliminable">mdi-lock</v-icon>
            </v-card-title>
          </v-card-item>
          <v-card-text class="d-flex justify-end pb-4 pr-6">
            <div class="text-h4 font-weight-bold" :class="Number(s.saldo) < 0 ? 'text-error' : ''">{{ money(s.saldo) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Auxiliar del sobre seleccionado -->
    <v-card v-if="selected" class="mt-6 rounded-lg card-dark-blue" elevation="0">
      <v-toolbar density="comfortable" class="header-dark-blue border-b-dark">
        <v-toolbar-title class="text-h6 font-weight-bold text-primary">
          <v-icon start>mdi-history</v-icon> Movimientos: {{ selected.nombre }}
        </v-toolbar-title>
        <v-spacer />
        <v-chip color="primary" variant="flat" size="large" class="mr-4">Saldo: {{ money(selected.saldo) }}</v-chip>
      </v-toolbar>
      <v-data-table :headers="headers" :items="auxiliar" :loading="loadingAux" density="compact" class="bg-transparent dark-table">
        <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
        <template v-slot:item.entrada="{ item }">
          <span v-if="item.entrada > 0" class="text-success font-weight-bold">+{{ money(item.entrada) }}</span>
          <span v-else class="text-light-muted">-</span>
        </template>
        <template v-slot:item.salida="{ item }">
          <span v-if="item.salida > 0" class="text-error font-weight-bold">-{{ money(item.salida) }}</span>
          <span v-else class="text-light-muted">-</span>
        </template>
        <template v-slot:item.saldoAcum="{ item }"><strong class="text-primary">{{ money(item.saldoAcum) }}</strong></template>
        <template v-slot:item.tipo="{ item }"><v-chip size="x-small" :color="tipoColor(item.tipo)" variant="tonal">{{ item.tipo }}</v-chip></template>
      </v-data-table>
    </v-card>

    <!-- DIALOG TRASPASO -->
    <v-dialog v-model="traspaso.show" max-width="480">
      <v-card class="card-dark-blue">
        <v-toolbar color="warning" density="compact">
          <v-toolbar-title class="font-weight-bold">Traspaso entre sobres</v-toolbar-title>
          <v-btn icon @click="traspaso.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-form ref="tform">
            <v-select v-model="traspaso.sobre_origen_id" :items="sobres" item-title="nombre" item-value="id" label="Desde (origen) *" variant="outlined" :rules="[v => !!v || 'Requerido']">
              <template v-slot:item="{ props, item }"><v-list-item v-bind="props" :subtitle="money(item.raw.saldo)"></v-list-item></template>
            </v-select>
            <v-icon class="d-block mx-auto mb-2 text-white">mdi-arrow-down-bold</v-icon>
            <v-select v-model="traspaso.sobre_destino_id" :items="sobres" item-title="nombre" item-value="id" label="Hacia (destino) *" variant="outlined" :rules="[v => !!v || 'Requerido', v => v !== traspaso.sobre_origen_id || 'Debe ser distinto al origen']" />
            <v-text-field v-model.number="traspaso.monto" label="Monto ($) *" prefix="$" type="number" variant="outlined" :rules="[v => v>0 || 'Requerido']" />
            <v-text-field v-model="traspaso.fecha" label="Fecha (puede ser a posteriori)" type="date" variant="outlined" />
            <v-text-field v-model="traspaso.concepto" label="Concepto" variant="outlined" />
          </v-form>
          <v-alert type="info" variant="tonal" density="compact">La operación se cierra completa: resta del origen y abona al destino en un solo asiento.</v-alert>
        </v-card-text>
        <v-card-actions class="border-t-dark">
          <v-spacer />
          <v-btn variant="text" @click="traspaso.show=false">Cancelar</v-btn>
          <v-btn color="warning" variant="flat" :loading="traspaso.saving" @click="saveTraspaso">Ejecutar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const sobres = ref([]), selected = ref(null), auxiliar = ref([]);
const loadingAux = ref(false);
const tform = ref(null);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const headers = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Contraparte', key: 'contraparte' },
  { title: 'Entrada', key: 'entrada', align: 'end' },
  { title: 'Salida', key: 'salida', align: 'end' },
  { title: 'Saldo', key: 'saldoAcum', align: 'end' },
  { title: 'Usuario', key: 'usuario' },
];

const fetchSobres = async () => {
  const r = await axios.get('/tesoreria/sobres');
  sobres.value = r.data;
  if (selected.value) selected.value = sobres.value.find(s => s.id === selected.value.id) || null;
};

const selectSobre = async (s) => {
  selected.value = s;
  loadingAux.value = true;
  try {
    const r = await axios.get('/tesoreria/movimientos', { params: { sobre_id: s.id } });
    // Recalcular saldo corrido relativo a este sobre (viejo → nuevo)
    const rows = [...r.data].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    let saldo = 0;
    const mapped = rows.map(m => {
      const entra = m.sobre_destino_id === s.id ? Number(m.monto) : 0;
      const sale = m.sobre_origen_id === s.id ? Number(m.monto) : 0;
      saldo += entra - sale;
      let contraparte = '-';
      if (m.tipo === 'TRASPASO') contraparte = entra ? `De: ${m.sobre_origen}` : `A: ${m.sobre_destino}`;
      else if (entra) contraparte = m.origen_texto || 'Ingreso';
      else contraparte = `${m.categoria || 'Gasto'}${m.subcategoria ? ' / ' + m.subcategoria : ''}`;
      return { ...m, entrada: entra, salida: sale, saldoAcum: saldo, contraparte };
    });
    auxiliar.value = mapped.reverse();
  } catch (e) { notify('Error cargando auxiliar', 'error'); }
  finally { loadingAux.value = false; }
};

// ---- Traspaso ----
const traspaso = ref({ show: false, sobre_origen_id: null, sobre_destino_id: null, monto: null, fecha: '', concepto: '', saving: false });
const openTraspaso = () => {
  traspaso.value = { show: true, sobre_origen_id: selected.value?.id || null, sobre_destino_id: null, monto: null, fecha: '', concepto: '', saving: false };
};
const saveTraspaso = async () => {
  const { valid } = await tform.value.validate();
  if (!valid) return;
  traspaso.value.saving = true;
  try {
    await axios.post('/tesoreria/traspasos', {
      sobre_origen_id: traspaso.value.sobre_origen_id,
      sobre_destino_id: traspaso.value.sobre_destino_id,
      monto: traspaso.value.monto,
      fecha: traspaso.value.fecha || undefined,
      concepto: traspaso.value.concepto || 'Traspaso entre sobres',
    });
    notify('Traspaso ejecutado');
    traspaso.value.show = false;
    await fetchSobres();
    if (selected.value) await selectSobre(selected.value);
  } catch (e) { notify(e.response?.data?.message || 'Error en traspaso', 'error'); }
  finally { traspaso.value.saving = false; }
};

const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const tipoColor = (t) => t === 'INGRESO' ? 'success' : (t === 'EGRESO' ? 'error' : 'warning');

onMounted(fetchSobres);
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.selected-sobre { border: 2px solid rgb(var(--v-theme-primary)) !important; }
</style>
