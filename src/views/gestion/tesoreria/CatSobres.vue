<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <v-card elevation="0" class="card-dark-blue">
      <v-toolbar color="transparent" density="compact" class="header-dark-blue border-b-dark px-2">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Catálogo de Sobres</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-plus" variant="tonal" color="white" @click="openDialog()" />
      </v-toolbar>

      <v-data-table :headers="headers" :items="items" :loading="loading" class="bg-transparent dark-table" hover density="comfortable">
        <template v-slot:item.es_entrada="{ item }">
          <v-chip v-if="item.es_entrada" color="info" size="small" variant="tonal">Entrada</v-chip>
          <span v-else class="text-light-muted">-</span>
        </template>
        <template v-slot:item.saldo="{ item }"><strong :class="Number(item.saldo)<0 ? 'text-error':'text-primary'">{{ money(item.saldo) }}</strong></template>
        <template v-slot:item.acciones="{ item }">
          <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click="openDialog(item)" />
          <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" :disabled="!!item.no_eliminable" :title="item.no_eliminable ? 'No eliminable' : 'Eliminar'" @click="del(item)" />
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="440">
      <v-card class="card-dark-blue">
        <v-card-title class="header-dark-blue text-white">{{ edit.id ? 'Editar sobre' : 'Nuevo sobre' }}</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field v-model="edit.nombre" label="Nombre del sobre" autofocus variant="outlined" class="mb-2" />
          <v-text-field v-model="edit.descripcion" label="Descripción (opcional)" variant="outlined" />
          <v-switch v-model="edit.es_entrada" label="Es sobre de entrada (recibe abonos por default)" color="info" hide-details />
        </v-card-text>
        <v-card-actions class="border-t-dark">
          <v-spacer />
          <v-btn variant="text" color="white" @click="dialog=false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="save">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/utils/axios';

const items = ref([]), loading = ref(false), saving = ref(false), dialog = ref(false);
const edit = ref({ id: null, nombre: '', descripcion: '', es_entrada: false });
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Tipo', key: 'es_entrada' },
  { title: 'Saldo', key: 'saldo', align: 'end' },
  { title: '', key: 'acciones', align: 'end', sortable: false },
];

const load = async () => {
  loading.value = true;
  try { items.value = (await axios.get('/tesoreria/sobres')).data; }
  catch (e) { notify('Error cargando sobres', 'error'); }
  finally { loading.value = false; }
};

const openDialog = (item = null) => {
  edit.value = item ? { id: item.id, nombre: item.nombre, descripcion: item.descripcion, es_entrada: !!item.es_entrada }
                    : { id: null, nombre: '', descripcion: '', es_entrada: false };
  dialog.value = true;
};

const save = async () => {
  if (!edit.value.nombre) return notify('Nombre requerido', 'error');
  saving.value = true;
  try {
    if (edit.value.id) await axios.put(`/tesoreria/sobres/${edit.value.id}`, edit.value);
    else await axios.post('/tesoreria/sobres', edit.value);
    dialog.value = false;
    await load();
  } catch (e) { notify('Error al guardar', 'error'); }
  finally { saving.value = false; }
};

const del = async (item) => {
  if (!confirm(`¿Eliminar el sobre "${item.nombre}"?`)) return;
  try { await axios.delete(`/tesoreria/sobres/${item.id}`); await load(); }
  catch (e) { notify(e.response?.data?.message || 'No se pudo eliminar', 'error'); }
};

const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
onMounted(load);
</script>
