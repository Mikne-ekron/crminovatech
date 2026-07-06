<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Egresos"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Egresos', href: '#' }
      ]"
    />

    <v-row class="mb-2" dense>
      <v-col cols="12" class="d-flex ga-2">
        <v-btn color="error" variant="flat" prepend-icon="mdi-cash-minus" @click="openDialog()">Registrar egreso</v-btn>
        <v-spacer />
        <v-text-field v-model="filtros.desde" type="date" label="Desde" density="compact" variant="outlined" hide-details style="max-width:170px" @update:model-value="fetchMovs" />
        <v-text-field v-model="filtros.hasta" type="date" label="Hasta" density="compact" variant="outlined" hide-details style="max-width:170px" @update:model-value="fetchMovs" />
      </v-col>
    </v-row>

    <v-card class="rounded-lg card-dark-blue" elevation="0">
      <v-data-table :headers="headers" :items="movimientos" :loading="loading" density="compact" class="bg-transparent dark-table" hover>
        <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
        <template v-slot:item.monto="{ item }"><strong class="text-error">-{{ money(item.monto) }}</strong></template>
        <template v-slot:item.categoria="{ item }">
          <span>{{ item.categoria || '-' }}</span>
          <span v-if="item.subcategoria" class="text-light-muted"> / {{ item.subcategoria }}</span>
        </template>
        <template v-slot:item.acciones="{ item }">
          <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="openDialog(item)" />
          <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="delMov(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- DIALOG EGRESO -->
    <v-dialog v-model="dialog.show" max-width="520">
      <v-card class="card-dark-blue">
        <v-toolbar color="error" density="compact">
          <v-toolbar-title class="font-weight-bold">{{ dialog.id ? 'Editar egreso' : 'Registrar egreso' }}</v-toolbar-title>
          <v-btn icon @click="dialog.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-form ref="form">
            <!-- Primera pregunta obligatoria: ¿de qué sobre sale? -->
            <v-select
              v-model="edit.sobre_origen_id" :items="sobres" item-title="nombre" item-value="id"
              label="¿De qué sobre sale? *" prepend-inner-icon="mdi-email-open-outline"
              variant="outlined" :rules="[v => !!v || 'Sobre requerido']"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="money(item.raw.saldo)"></v-list-item>
              </template>
            </v-select>
            <v-text-field v-model.number="edit.monto" label="Monto ($) *" prefix="$" type="number" variant="outlined" :rules="[v => v>0 || 'Monto requerido']" />
            <v-select v-model="edit.categoria_id" :items="categorias" item-title="nombre" item-value="id" label="Categoría *" variant="outlined" :rules="[v => !!v || 'Categoría requerida']" @update:model-value="edit.subcategoria_id=null" />
            <v-select v-if="subcatsDeCategoria.length" v-model="edit.subcategoria_id" :items="subcatsDeCategoria" item-title="nombre" item-value="id" label="Subcategoría" variant="outlined" clearable />
            <v-text-field v-model="edit.concepto" label="Concepto / comentario" variant="outlined" />
          </v-form>
        </v-card-text>
        <v-card-actions class="border-t-dark">
          <v-spacer />
          <v-btn variant="text" @click="dialog.show=false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="saving" @click="save">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const loading = ref(false), saving = ref(false);
const movimientos = ref([]), sobres = ref([]), categorias = ref([]);
const form = ref(null);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const today = new Date();
const filtros = ref({ desde: `${today.getFullYear()}-01-01`, hasta: today.toISOString().slice(0, 10) });

const headers = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Sobre', key: 'sobre_origen' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Monto', key: 'monto', align: 'end' },
  { title: 'Usuario', key: 'usuario' },
  { title: '', key: 'acciones', align: 'end', sortable: false },
];

const dialog = ref({ show: false, id: null });
const edit = ref({ sobre_origen_id: null, monto: null, categoria_id: null, subcategoria_id: null, concepto: '' });
const subcatsDeCategoria = computed(() => categorias.value.find(c => c.id === edit.value.categoria_id)?.subcategorias || []);

const fetchMovs = async () => {
  loading.value = true;
  try {
    const r = await axios.get('/tesoreria/movimientos', { params: { tipo: 'EGRESO', desde: filtros.value.desde, hasta: filtros.value.hasta } });
    movimientos.value = r.data;
  } catch (e) { notify('Error cargando egresos', 'error'); }
  finally { loading.value = false; }
};

const fetchCatalogos = async () => {
  const [rs, rc] = await Promise.all([axios.get('/tesoreria/sobres'), axios.get('/tesoreria/categorias')]);
  sobres.value = rs.data;
  categorias.value = rc.data.filter(c => c.aplica === 'EGRESO' || c.aplica === 'AMBOS');
};

const openDialog = (item = null) => {
  if (item) {
    dialog.value = { show: true, id: item.id };
    edit.value = { sobre_origen_id: item.sobre_origen_id, monto: Number(item.monto), categoria_id: item.categoria_id, subcategoria_id: item.subcategoria_id, concepto: item.concepto };
  } else {
    dialog.value = { show: true, id: null };
    edit.value = { sobre_origen_id: null, monto: null, categoria_id: null, subcategoria_id: null, concepto: '' };
  }
};

const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    const payload = { tipo: 'EGRESO', ...edit.value };
    if (dialog.value.id) await axios.put(`/tesoreria/movimientos/${dialog.value.id}`, payload);
    else await axios.post('/tesoreria/movimientos', payload);
    notify('Egreso guardado');
    dialog.value.show = false;
    await Promise.all([fetchMovs(), fetchCatalogos()]);
  } catch (e) { notify(e.response?.data?.message || 'Error al guardar', 'error'); }
  finally { saving.value = false; }
};

const delMov = async (item) => {
  if (!confirm('¿Eliminar este egreso?')) return;
  try { await axios.delete(`/tesoreria/movimientos/${item.id}`); await Promise.all([fetchMovs(), fetchCatalogos()]); }
  catch (e) { notify('Error al eliminar', 'error'); }
};

const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

onMounted(async () => { await fetchCatalogos(); await fetchMovs(); });
</script>
