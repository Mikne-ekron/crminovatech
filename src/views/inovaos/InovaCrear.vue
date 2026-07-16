<template>
  <v-container class="py-6" style="max-width:640px">
    <h1 class="text-h5 font-weight-bold mb-1 d-flex align-center ga-2">
      <v-icon color="primary">mdi-plus-circle-outline</v-icon> Nuevo pendiente
    </h1>
    <div class="text-body-2 text-medium-emphasis mb-5">Captura o delega un pendiente. Si eliges un responsable, se le notifica.</div>

    <v-card border elevation="0" class="rounded-xl pa-4">
      <InovaForm :initial="{}" :loading="guardando" @submit="crear" />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInovaosStore } from '@/stores/inovaos';
import { msgError } from '@/views/inovaos/inova-helpers';
import InovaForm from '@/components/inovaos/InovaForm.vue';

const store = useInovaosStore();
const router = useRouter();
const guardando = ref(false);

const crear = async (payload) => {
  guardando.value = true;
  try {
    await store.crear(payload);
    store.notify('Pendiente creado');
    router.push('/app/inovaos/tareas');
  } catch (err) { store.notify(msgError(err), 'error'); }
  finally { guardando.value = false; }
};

onMounted(() => { if (!store.usuarios.length) store.fetchUsuarios(); });
</script>
