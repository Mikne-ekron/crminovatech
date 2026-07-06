<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <v-card elevation="0" class="card-dark-blue">
      <v-toolbar color="transparent" density="compact" class="header-dark-blue border-b-dark px-2">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Catálogo de Categorías</v-toolbar-title>
        <v-spacer />
        <v-btn prepend-icon="mdi-plus" variant="tonal" color="white" @click="openCat()">Categoría</v-btn>
      </v-toolbar>

      <v-expansion-panels multiple variant="accordion" class="pa-2">
        <v-expansion-panel v-for="c in categorias" :key="c.id" bg-color="transparent">
          <v-expansion-panel-title>
            <div class="d-flex align-center w-100">
              <v-icon class="mr-2 text-primary">mdi-folder-outline</v-icon>
              <span class="font-weight-bold">{{ c.nombre }}</span>
              <v-chip size="x-small" variant="tonal" class="ml-2">{{ c.aplica }}</v-chip>
              <v-spacer />
              <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click.stop="openCat(c)" />
              <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click.stop="delCat(c)" />
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact" bg-color="transparent">
              <v-list-item v-for="s in c.subcategorias" :key="s.id" :title="s.nombre">
                <template v-slot:prepend><v-icon size="small" class="text-light-muted">mdi-subdirectory-arrow-right</v-icon></template>
                <template v-slot:append>
                  <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openSub(c, s)" />
                  <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="delSub(s)" />
                </template>
              </v-list-item>
              <v-list-item v-if="!c.subcategorias.length" class="text-light-muted text-caption">Sin subcategorías</v-list-item>
            </v-list>
            <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" @click="openSub(c)">Agregar subcategoría</v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <!-- Dialog categoría -->
    <v-dialog v-model="catDlg" max-width="420">
      <v-card class="card-dark-blue">
        <v-card-title class="header-dark-blue text-white">{{ cat.id ? 'Editar' : 'Nueva' }} categoría</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field v-model="cat.nombre" label="Nombre" autofocus variant="outlined" />
          <v-select v-model="cat.aplica" :items="['EGRESO','INGRESO','AMBOS']" label="Aplica a" variant="outlined" />
        </v-card-text>
        <v-card-actions class="border-t-dark"><v-spacer /><v-btn variant="text" color="white" @click="catDlg=false">Cancelar</v-btn><v-btn color="primary" variant="flat" @click="saveCat">Guardar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog subcategoría -->
    <v-dialog v-model="subDlg" max-width="420">
      <v-card class="card-dark-blue">
        <v-card-title class="header-dark-blue text-white">{{ sub.id ? 'Editar' : 'Nueva' }} subcategoría</v-card-title>
        <v-card-text class="pt-4">
          <div class="text-caption text-light-muted mb-1">Categoría: {{ sub.catNombre }}</div>
          <v-text-field v-model="sub.nombre" label="Nombre" autofocus variant="outlined" />
        </v-card-text>
        <v-card-actions class="border-t-dark"><v-spacer /><v-btn variant="text" color="white" @click="subDlg=false">Cancelar</v-btn><v-btn color="primary" variant="flat" @click="saveSub">Guardar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/utils/axios';

const categorias = ref([]);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const load = async () => {
  try { categorias.value = (await axios.get('/tesoreria/categorias')).data; }
  catch (e) { notify('Error cargando categorías', 'error'); }
};

// Categoría
const catDlg = ref(false);
const cat = ref({ id: null, nombre: '', aplica: 'EGRESO' });
const openCat = (c = null) => { cat.value = c ? { id: c.id, nombre: c.nombre, aplica: c.aplica } : { id: null, nombre: '', aplica: 'EGRESO' }; catDlg.value = true; };
const saveCat = async () => {
  if (!cat.value.nombre) return notify('Nombre requerido', 'error');
  try {
    if (cat.value.id) await axios.put(`/tesoreria/categorias/${cat.value.id}`, cat.value);
    else await axios.post('/tesoreria/categorias', cat.value);
    catDlg.value = false; await load();
  } catch (e) { notify('Error al guardar', 'error'); }
};
const delCat = async (c) => {
  if (!confirm(`¿Eliminar "${c.nombre}" y sus subcategorías?`)) return;
  try { await axios.delete(`/tesoreria/categorias/${c.id}`); await load(); }
  catch (e) { notify('Error al eliminar', 'error'); }
};

// Subcategoría
const subDlg = ref(false);
const sub = ref({ id: null, categoria_id: null, catNombre: '', nombre: '' });
const openSub = (c, s = null) => { sub.value = { id: s?.id || null, categoria_id: c.id, catNombre: c.nombre, nombre: s?.nombre || '' }; subDlg.value = true; };
const saveSub = async () => {
  if (!sub.value.nombre) return notify('Nombre requerido', 'error');
  try {
    if (sub.value.id) await axios.put(`/tesoreria/subcategorias/${sub.value.id}`, { nombre: sub.value.nombre });
    else await axios.post('/tesoreria/subcategorias', { categoria_id: sub.value.categoria_id, nombre: sub.value.nombre });
    subDlg.value = false; await load();
  } catch (e) { notify('Error al guardar', 'error'); }
};
const delSub = async (s) => {
  if (!confirm(`¿Eliminar subcategoría "${s.nombre}"?`)) return;
  try { await axios.delete(`/tesoreria/subcategorias/${s.id}`); await load(); }
  catch (e) { notify('Error al eliminar', 'error'); }
};

onMounted(load);
</script>
