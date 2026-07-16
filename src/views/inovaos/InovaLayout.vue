<template>
  <div class="h-100 inovaos-module">
    <div v-if="loadingInit" class="text-center py-16"><v-progress-circular indeterminate color="primary" /></div>

    <v-container v-else-if="!store.habilitado" class="py-8" style="max-width:640px">
      <v-alert type="warning" variant="tonal" class="rounded-lg">
        <div class="font-weight-bold mb-1">No tienes acceso a InovaOS</div>
        Tu correo ({{ authEmail }}) no está registrado en InovaOS, así que no puedes ver ni operar pendientes.
        Pide que te den de alta en InovaOS con este mismo correo.
      </v-alert>
    </v-container>

    <router-view v-else />

    <!-- Detalle compartido -->
    <InovaDetalle @editar="abrirEdicion" />

    <!-- Edición -->
    <v-dialog v-model="dlgEditar" max-width="560">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">Editar pendiente</span>
          <v-btn icon="mdi-close" size="small" variant="text" @click="dlgEditar = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <InovaForm :initial="editItem" es-edicion :loading="guardando" @submit="guardarEdicion" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="store.snack.show" :color="store.snack.color" timeout="3500" location="top right">{{ store.snack.text }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import { useAuthStore } from '@/stores/auth';
import { msgError } from '@/views/inovaos/inova-helpers';
import InovaDetalle from '@/components/inovaos/InovaDetalle.vue';
import InovaForm from '@/components/inovaos/InovaForm.vue';
import '@/views/inovaos/inovaos.css';

const store = useInovaosStore();
const authStore = useAuthStore();
const authEmail = computed(() => authStore.user?.email || '');
const loadingInit = ref(true);

const dlgEditar = ref(false);
const guardando = ref(false);
const editItem = ref({});
let editId = null;

const abrirEdicion = (pend) => { editItem.value = { ...pend }; editId = pend.id; dlgEditar.value = true; };
const guardarEdicion = async (payload) => {
  guardando.value = true;
  try { await store.editar(editId, payload); dlgEditar.value = false; store.notify('Pendiente actualizado'); }
  catch (err) { store.notify(msgError(err), 'error'); }
  finally { guardando.value = false; }
};

onMounted(async () => {
  if (!store.usuarios.length) await store.fetchUsuarios();
  loadingInit.value = false;
});
</script>
