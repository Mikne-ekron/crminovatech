<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <PageHeader
      title="Catálogo de Sobres"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Gestión', href: '#' },
        { text: 'Tesorería', href: '#' },
        { text: 'Sobres', href: '#' }
      ]"
    />

    <!-- Resumen -->
    <v-row dense class="mb-2">
      <v-col cols="12" sm="4">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="d-flex align-center ga-4 py-4">
            <v-avatar color="primary" variant="tonal" size="48"><v-icon>mdi-email-multiple-outline</v-icon></v-avatar>
            <div><div class="text-h5 font-weight-bold">{{ activos.length }}</div><div class="text-caption text-light-muted">Sobres activos</div></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="d-flex align-center ga-4 py-4">
            <v-avatar color="success" variant="tonal" size="48"><v-icon>mdi-cash-multiple</v-icon></v-avatar>
            <div><div class="text-h5 font-weight-bold" :class="saldoTotal < 0 ? 'text-error' : ''">{{ money(saldoTotal) }}</div><div class="text-caption text-light-muted">Saldo total</div></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="d-flex align-center ga-4 py-4">
            <v-avatar color="warning" variant="tonal" size="48"><v-icon>mdi-lock-outline</v-icon></v-avatar>
            <div><div class="text-h5 font-weight-bold">{{ conSaldo }}</div><div class="text-caption text-light-muted">Con saldo (bloqueados)</div></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-card elevation="0" class="rounded-lg card-dark-blue">
      <v-toolbar color="transparent" density="comfortable" class="header-dark-blue border-b-dark px-4">
        <v-icon class="mr-2 text-primary">mdi-format-list-bulleted</v-icon>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Sobres</v-toolbar-title>
        <v-spacer />
        <v-text-field
          v-model="search" density="compact" variant="solo-filled" flat hide-details
          placeholder="Buscar…" prepend-inner-icon="mdi-magnify" class="mr-3" style="max-width:240px"
        />
        <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openDialog()">Nuevo sobre</v-btn>
      </v-toolbar>

      <v-data-table
        :headers="headers" :items="activos" :search="search" :loading="loading"
        class="bg-transparent dark-table" hover density="comfortable"
        no-data-text="No hay sobres. Crea el primero con «Nuevo sobre»."
      >
        <template v-slot:item.nombre="{ item }">
          <div class="d-flex align-center ga-2">
            <v-icon size="20" class="text-primary">mdi-email-outline</v-icon>
            <span class="font-weight-medium">{{ item.nombre }}</span>
          </div>
        </template>

        <template v-slot:item.descripcion="{ item }">
          <span class="text-light-muted">{{ item.descripcion || '—' }}</span>
        </template>

        <template v-slot:item.saldo="{ item }">
          <v-chip :color="saldoColor(item.saldo)" size="small" variant="flat" class="font-weight-bold">
            {{ money(item.saldo) }}
          </v-chip>
        </template>

        <template v-slot:item.acciones="{ item }">
          <div class="d-flex justify-end ga-1">
            <!-- Editar -->
            <v-tooltip location="top" :text="canModify(item) ? 'Editar' : 'No se puede editar: el sobre tiene saldo'">
              <template v-slot:activator="{ props }">
                <span v-bind="props">
                  <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" :disabled="!canModify(item)" @click="openDialog(item)" />
                </span>
              </template>
            </v-tooltip>
            <!-- Eliminar -->
            <v-tooltip location="top" :text="canModify(item) ? 'Eliminar' : 'No se puede eliminar: el sobre tiene saldo'">
              <template v-slot:activator="{ props }">
                <span v-bind="props">
                  <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" :disabled="!canModify(item)" @click="askDelete(item)" />
                </span>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- DIALOG: crear / editar -->
    <v-dialog v-model="dialog.show" max-width="460" persistent>
      <v-card class="card-dark-blue">
        <v-toolbar :color="dialog.id ? 'primary' : 'success'" density="compact">
          <v-icon class="ml-4">{{ dialog.id ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          <v-toolbar-title class="font-weight-bold">{{ dialog.id ? 'Editar sobre' : 'Nuevo sobre' }}</v-toolbar-title>
          <v-btn icon @click="dialog.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-5">
          <v-form ref="form" @submit.prevent="save">
            <v-text-field
              v-model="edit.nombre" label="Nombre del sobre" autofocus variant="outlined"
              prepend-inner-icon="mdi-email-outline" class="mb-2"
              :rules="[v => !!v?.trim() || 'El nombre es requerido']"
            />
            <v-textarea
              v-model="edit.descripcion" label="Descripción (opcional)" variant="outlined"
              rows="2" auto-grow prepend-inner-icon="mdi-text"
            />
            <v-alert v-if="dialog.id" type="info" variant="tonal" density="compact" class="mt-1">
              Saldo actual: <strong>{{ money(dialog.saldo) }}</strong>. Solo se puede editar con saldo en $0.
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog.show = false">Cancelar</v-btn>
          <v-btn :color="dialog.id ? 'primary' : 'success'" variant="flat" :loading="saving" @click="save">
            {{ dialog.id ? 'Guardar cambios' : 'Crear sobre' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG: confirmar eliminación -->
    <v-dialog v-model="del.show" max-width="420">
      <v-card class="card-dark-blue">
        <v-card-text class="pt-5 text-center">
          <v-avatar color="error" variant="tonal" size="56" class="mb-3"><v-icon size="30">mdi-delete-alert</v-icon></v-avatar>
          <h3 class="text-h6 font-weight-bold mb-1">¿Eliminar sobre?</h3>
          <p class="text-light-muted">Se dará de baja el sobre <strong class="text-white">{{ del.item?.nombre }}</strong>. Podrás volver a crear uno con el mismo nombre.</p>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" @click="del.show = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3500" location="top right">
      {{ snack.text }}
    </v-snackbar>
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
const deleting = ref(false);
const search = ref('');
const form = ref(null);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Creado por', key: 'usuario_creacion' },
  { title: 'Saldo', key: 'saldo', align: 'end' },
  { title: 'Acciones', key: 'acciones', align: 'end', sortable: false },
];

const activos = computed(() => items.value.filter(s => s.activo));
const saldoTotal = computed(() => activos.value.reduce((a, s) => a + Number(s.saldo || 0), 0));
const conSaldo = computed(() => activos.value.filter(s => Number(s.saldo) !== 0).length);
const canModify = (item) => Number(item.saldo) === 0;

const loadData = async () => {
  loading.value = true;
  try {
    items.value = (await axios.get('/tesoreria/sobres')).data;
  } catch (e) {
    notify('Error cargando sobres', 'error');
  } finally {
    loading.value = false;
  }
};

// ---- Crear / Editar ----
const dialog = ref({ show: false, id: null, saldo: 0 });
const edit = ref({ nombre: '', descripcion: '' });

const openDialog = (item = null) => {
  if (item) {
    dialog.value = { show: true, id: item.id, saldo: Number(item.saldo) };
    edit.value = { nombre: item.nombre, descripcion: item.descripcion || '' };
  } else {
    dialog.value = { show: true, id: null, saldo: 0 };
    edit.value = { nombre: '', descripcion: '' };
  }
};

const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (dialog.value.id) {
      await axios.put(`/tesoreria/sobres/${dialog.value.id}`, {
        nombre: edit.value.nombre.trim(),
        descripcion: edit.value.descripcion,
      });
      notify('Sobre actualizado');
    } else {
      await axios.post('/tesoreria/sobres', {
        nombre: edit.value.nombre.trim(),
        descripcion: edit.value.descripcion,
        usuario: authStore.user?.name || 'Admin',
      });
      notify('Sobre creado');
    }
    dialog.value.show = false;
    await loadData();
  } catch (e) {
    notify(e.response?.data?.message || 'Error al guardar el sobre', 'error');
  } finally {
    saving.value = false;
  }
};

// ---- Eliminar ----
const del = ref({ show: false, item: null });
const askDelete = (item) => { del.value = { show: true, item }; };
const confirmDelete = async () => {
  deleting.value = true;
  try {
    await axios.delete(`/tesoreria/sobres/${del.value.item.id}`);
    notify('Sobre eliminado');
    del.value.show = false;
    await loadData();
  } catch (e) {
    notify(e.response?.data?.message || 'Error al eliminar el sobre', 'error');
  } finally {
    deleting.value = false;
  }
};

// ---- Helpers ----
const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const saldoColor = (v) => {
  const n = Number(v);
  if (n === 0) return 'grey';
  return n < 0 ? 'error' : 'success';
};

onMounted(loadData);
</script>
