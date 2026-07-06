<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <PageHeader
      title="Catálogo de Categorías"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Gestión', href: '#' },
        { text: 'Tesorería', href: '#' },
        { text: 'Categorías', href: '#' }
      ]"
    />

    <!-- Resumen -->
    <v-row dense class="mb-2">
      <v-col cols="12" sm="6">
        <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="d-flex align-center ga-4 py-4">
          <v-avatar color="primary" variant="tonal" size="48"><v-icon>mdi-folder-multiple-outline</v-icon></v-avatar>
          <div><div class="text-h5 font-weight-bold">{{ categorias.length }}</div><div class="text-caption text-light-muted">Categorías</div></div>
        </v-card-text></v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="d-flex align-center ga-4 py-4">
          <v-avatar color="info" variant="tonal" size="48"><v-icon>mdi-file-tree-outline</v-icon></v-avatar>
          <div><div class="text-h5 font-weight-bold">{{ totalSubs }}</div><div class="text-caption text-light-muted">Subcategorías</div></div>
        </v-card-text></v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" class="rounded-lg card-dark-blue">
      <v-toolbar color="transparent" density="comfortable" class="header-dark-blue border-b-dark px-4">
        <v-icon class="mr-2 text-primary">mdi-shape-outline</v-icon>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Categorías de egresos</v-toolbar-title>
        <v-spacer />
        <v-text-field
          v-model="search" density="compact" variant="solo-filled" flat hide-details
          placeholder="Buscar…" prepend-inner-icon="mdi-magnify" class="mr-3" style="max-width:220px"
        />
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openCat()">Nueva categoría</v-btn>
      </v-toolbar>

      <div class="pa-3">
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />
        <v-expansion-panels v-model="open" multiple variant="accordion">
          <v-expansion-panel v-for="c in categoriasFiltradas" :key="c.id" bg-color="transparent" elevation="0" class="mb-2 panel-dark">
            <v-expansion-panel-title>
              <div class="d-flex align-center w-100 ga-2">
                <v-icon class="text-primary">mdi-folder-outline</v-icon>
                <span class="font-weight-bold text-body-1">{{ c.nombre }}</span>
                <v-chip size="x-small" variant="tonal" color="info">{{ (c.subcategorias || []).length }} subcat.</v-chip>
                <v-spacer />
                <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click.stop="openCat(c)" title="Editar categoría" />
                <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click.stop="askDelCat(c)" title="Eliminar categoría" />
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-list density="compact" bg-color="transparent" class="py-0">
                <v-list-item v-for="s in c.subcategorias" :key="s.id" class="px-2 subcat-row rounded mb-1">
                  <template v-slot:prepend>
                    <v-icon size="18" class="text-light-muted mr-2">mdi-subdirectory-arrow-right</v-icon>
                  </template>
                  <v-list-item-title>
                    {{ s.nombre }}
                    <v-chip v-if="s.es_manual" size="x-small" color="warning" variant="tonal" class="ml-2">captura manual</v-chip>
                  </v-list-item-title>
                  <template v-slot:append>
                    <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="openSub(c, s)" />
                    <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="delSub(s)" />
                  </template>
                </v-list-item>
                <div v-if="!(c.subcategorias || []).length" class="text-light-muted text-caption px-2 py-2">
                  Sin subcategorías (categoría de nivel único).
                </div>
              </v-list>
              <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" class="mt-1" @click="openSub(c)">
                Agregar subcategoría
              </v-btn>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div v-if="!loading && !categoriasFiltradas.length" class="text-center text-light-muted py-8">
          No hay categorías. Crea la primera con «Nueva categoría».
        </div>
      </div>
    </v-card>

    <!-- Dialog categoría -->
    <v-dialog v-model="catDlg" max-width="440" persistent>
      <v-card class="card-dark-blue">
        <v-toolbar :color="cat.id ? 'primary' : 'success'" density="compact">
          <v-icon class="ml-4">{{ cat.id ? 'mdi-pencil' : 'mdi-folder-plus' }}</v-icon>
          <v-toolbar-title class="font-weight-bold">{{ cat.id ? 'Editar categoría' : 'Nueva categoría' }}</v-toolbar-title>
          <v-btn icon @click="catDlg=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-5">
          <v-form ref="catForm" @submit.prevent="saveCat">
            <v-text-field v-model="cat.nombre" label="Nombre de la categoría" autofocus variant="outlined"
              prepend-inner-icon="mdi-folder-outline" :rules="[v => !!v?.trim() || 'Requerido']" />
          </v-form>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer /><v-btn variant="text" @click="catDlg=false">Cancelar</v-btn>
          <v-btn :color="cat.id ? 'primary' : 'success'" variant="flat" :loading="saving" @click="saveCat">
            {{ cat.id ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog subcategoría -->
    <v-dialog v-model="subDlg" max-width="460" persistent>
      <v-card class="card-dark-blue">
        <v-toolbar :color="sub.id ? 'primary' : 'success'" density="compact">
          <v-icon class="ml-4">mdi-file-tree</v-icon>
          <v-toolbar-title class="font-weight-bold">{{ sub.id ? 'Editar subcategoría' : 'Nueva subcategoría' }}</v-toolbar-title>
          <v-btn icon @click="subDlg=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-5">
          <v-form ref="subForm" @submit.prevent="saveSub">
            <div class="text-caption text-light-muted mb-2">Categoría: <strong class="text-white">{{ sub.catNombre }}</strong></div>
            <v-text-field v-model="sub.nombre" label="Nombre de la subcategoría" autofocus variant="outlined"
              prepend-inner-icon="mdi-subdirectory-arrow-right" :rules="[v => !!v?.trim() || 'Requerido']" />
            <v-switch v-model="sub.es_manual" color="warning" hide-details
              label="Captura manual (el usuario escribe el concepto libre al registrar el egreso)" />
          </v-form>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer /><v-btn variant="text" @click="subDlg=false">Cancelar</v-btn>
          <v-btn :color="sub.id ? 'primary' : 'success'" variant="flat" :loading="saving" @click="saveSub">
            {{ sub.id ? 'Guardar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmar borrado categoría -->
    <v-dialog v-model="delCat.show" max-width="420">
      <v-card class="card-dark-blue">
        <v-card-text class="pt-5 text-center">
          <v-avatar color="error" variant="tonal" size="56" class="mb-3"><v-icon size="30">mdi-folder-remove</v-icon></v-avatar>
          <h3 class="text-h6 font-weight-bold mb-1">¿Eliminar categoría?</h3>
          <p class="text-light-muted">Se dará de baja <strong class="text-white">{{ delCat.item?.nombre }}</strong> y todas sus subcategorías.</p>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer /><v-btn variant="text" @click="delCat.show=false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelCat">Eliminar</v-btn>
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
const categorias = ref([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const search = ref('');
const open = ref([]);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const totalSubs = computed(() => categorias.value.reduce((a, c) => a + (c.subcategorias?.length || 0), 0));
const categoriasFiltradas = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return categorias.value;
  return categorias.value.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    (c.subcategorias || []).some(s => s.nombre.toLowerCase().includes(q)));
});

const load = async () => {
  loading.value = true;
  try { categorias.value = (await axios.get('/tesoreria/categorias')).data; }
  catch (e) { notify('Error cargando categorías', 'error'); }
  finally { loading.value = false; }
};

// ---- Categoría ----
const catForm = ref(null);
const catDlg = ref(false);
const cat = ref({ id: null, nombre: '' });
const openCat = (c = null) => { cat.value = c ? { id: c.id, nombre: c.nombre } : { id: null, nombre: '' }; catDlg.value = true; };
const saveCat = async () => {
  const { valid } = await catForm.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (cat.value.id) await axios.put(`/tesoreria/categorias/${cat.value.id}`, { nombre: cat.value.nombre.trim() });
    else await axios.post('/tesoreria/categorias', { nombre: cat.value.nombre.trim(), usuario: authStore.user?.name || 'Admin' });
    notify(cat.value.id ? 'Categoría actualizada' : 'Categoría creada');
    catDlg.value = false; await load();
  } catch (e) { notify(e.response?.data?.message || 'Error al guardar', 'error'); }
  finally { saving.value = false; }
};

const delCat = ref({ show: false, item: null });
const askDelCat = (c) => { delCat.value = { show: true, item: c }; };
const confirmDelCat = async () => {
  deleting.value = true;
  try {
    await axios.delete(`/tesoreria/categorias/${delCat.value.item.id}`);
    notify('Categoría eliminada'); delCat.value.show = false; await load();
  } catch (e) { notify(e.response?.data?.message || 'Error al eliminar', 'error'); }
  finally { deleting.value = false; }
};

// ---- Subcategoría ----
const subForm = ref(null);
const subDlg = ref(false);
const sub = ref({ id: null, categoria_id: null, catNombre: '', nombre: '', es_manual: false });
const openSub = (c, s = null) => {
  sub.value = { id: s?.id || null, categoria_id: c.id, catNombre: c.nombre, nombre: s?.nombre || '', es_manual: !!s?.es_manual };
  subDlg.value = true;
};
const saveSub = async () => {
  const { valid } = await subForm.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (sub.value.id)
      await axios.put(`/tesoreria/subcategorias/${sub.value.id}`, { nombre: sub.value.nombre.trim(), es_manual: sub.value.es_manual });
    else
      await axios.post('/tesoreria/subcategorias', { categoria_id: sub.value.categoria_id, nombre: sub.value.nombre.trim(), es_manual: sub.value.es_manual, usuario: authStore.user?.name || 'Admin' });
    notify(sub.value.id ? 'Subcategoría actualizada' : 'Subcategoría creada');
    subDlg.value = false; await load();
  } catch (e) { notify(e.response?.data?.message || 'Error al guardar', 'error'); }
  finally { saving.value = false; }
};
const delSub = async (s) => {
  if (!confirm(`¿Eliminar la subcategoría "${s.nombre}"?`)) return;
  try { await axios.delete(`/tesoreria/subcategorias/${s.id}`); notify('Subcategoría eliminada'); await load(); }
  catch (e) { notify('Error al eliminar', 'error'); }
};

onMounted(load);
</script>

<style scoped>
.panel-dark { border: 1px solid rgba(255,255,255,0.06); border-radius: 8px !important; }
.subcat-row:hover { background: rgba(255,255,255,0.03); }
</style>
