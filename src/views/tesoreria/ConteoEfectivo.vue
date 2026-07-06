<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Conteo de Efectivo"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Conteo de Efectivo', href: '#' }
      ]"
    />

    <v-row dense class="mb-2">
      <v-col cols="12" sm="6">
        <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="d-flex align-center ga-4 py-4">
          <v-avatar color="warning" variant="tonal" size="48"><v-icon>mdi-cash-clock</v-icon></v-avatar>
          <div><div class="text-h5 font-weight-bold">{{ items.length }}</div><div class="text-caption text-light-muted">Ingresos por contar</div></div>
        </v-card-text></v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="d-flex align-center ga-4 py-4">
          <v-avatar color="info" variant="tonal" size="48"><v-icon>mdi-cash-multiple</v-icon></v-avatar>
          <div><div class="text-h5 font-weight-bold">{{ money(totalPorContar) }}</div><div class="text-caption text-light-muted">Total por contar</div></div>
        </v-card-text></v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" class="rounded-lg card-dark-blue">
      <v-toolbar color="transparent" density="comfortable" class="header-dark-blue border-b-dark px-4">
        <v-icon class="mr-2 text-primary">mdi-hand-coin-outline</v-icon>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Abonos por factura al sobre «Sergio» pendientes de contar</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :headers="headers" :items="items" :loading="loading" density="comfortable"
        class="bg-transparent dark-table"
        no-data-text="No hay ingresos pendientes de contar."
      >
        <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
        <template v-slot:item.card_code="{ item }">
          <v-chip size="x-small" variant="tonal" :color="item.card_code === 'P0148' ? 'primary' : 'info'">{{ item.card_code === 'P0148' ? 'Trade' : 'Log' }}</v-chip>
        </template>
        <template v-slot:item.monto="{ item }"><span class="font-weight-bold text-success">{{ money(item.monto) }}</span></template>
        <template v-slot:item.acciones="{ item }">
          <v-btn size="small" color="success" variant="flat" prepend-icon="mdi-cash-check" @click="openContar(item)">Contar</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog contar -->
    <v-dialog v-model="dlg.show" max-width="440" persistent>
      <v-card class="card-dark-blue" v-if="dlg.item">
        <v-toolbar color="success" density="compact">
          <v-icon class="ml-4">mdi-cash-check</v-icon>
          <v-toolbar-title class="font-weight-bold">Contar efectivo</v-toolbar-title>
          <v-btn icon @click="dlg.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <div class="text-caption text-light-muted">Folio {{ dlg.item.folio_sap }} · Ref {{ dlg.item.numatcard || '—' }}</div>
          <div class="mb-3">{{ dlg.item.concepto }}</div>
          <div class="d-flex justify-space-between mb-3">
            <span class="text-light-muted">Monto ingresado</span>
            <strong class="text-h6">{{ money(dlg.item.monto) }}</strong>
          </div>
          <v-text-field v-model.number="dlg.montoContado" label="Monto contado ($)" type="number" prefix="$"
            variant="outlined" autofocus></v-text-field>
          <v-alert :type="cuadra ? 'success' : 'warning'" variant="tonal" density="compact">
            <template v-if="cuadra">El monto contado <strong>cuadra</strong> con lo ingresado.</template>
            <template v-else>Diferencia de <strong>{{ money(dlg.montoContado - dlg.item.monto) }}</strong> respecto a lo ingresado. Se marcará contado de todas formas.</template>
          </v-alert>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" @click="dlg.show=false">Cancelar</v-btn>
          <v-btn color="success" variant="flat" :loading="saving" @click="confirmarContado">Marcar como contado</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3500" location="top right">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const authStore = useAuthStore();
const items = ref([]);
const loading = ref(false);
const saving = ref(false);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const headers = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Prov.', key: 'card_code' },
  { title: 'Folio', key: 'folio_sap' },
  { title: 'Referencia', key: 'numatcard' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Monto', key: 'monto', align: 'end' },
  { title: 'Acción', key: 'acciones', align: 'end', sortable: false },
];

const totalPorContar = computed(() => items.value.reduce((a, i) => a + Number(i.monto || 0), 0));

const load = async () => {
  loading.value = true;
  try { items.value = (await axios.get('/tesoreria/conteo-efectivo')).data; }
  catch (e) { notify('Error cargando conteo', 'error'); }
  finally { loading.value = false; }
};

const dlg = ref({ show: false, item: null, montoContado: 0 });
const cuadra = computed(() => dlg.value.item && Number(dlg.value.montoContado) === Number(dlg.value.item.monto));
const openContar = (item) => { dlg.value = { show: true, item, montoContado: Number(item.monto) }; };

const confirmarContado = async () => {
  saving.value = true;
  try {
    await axios.post(`/tesoreria/conteo-efectivo/${dlg.value.item.id}/contar`, {
      monto_contado: dlg.value.montoContado,
      usuario: authStore.user?.name || 'Usuario',
    });
    notify(cuadra.value ? 'Efectivo contado (cuadra)' : 'Efectivo contado (con diferencia)');
    dlg.value.show = false;
    await load();
  } catch (e) { notify('Error al marcar contado', 'error'); }
  finally { saving.value = false; }
};

const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

onMounted(load);
</script>
