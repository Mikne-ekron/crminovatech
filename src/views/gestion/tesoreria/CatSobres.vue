<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <v-card elevation="0" class="card-dark-blue">
      <v-toolbar color="transparent" density="compact" class="header-dark-blue border-b-dark px-2">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Catálogo de Sobres</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-plus" variant="tonal" color="white" @click="dialog = true"></v-btn>
      </v-toolbar>

      <v-data-table 
        :headers="headers" 
        :items="items" 
        :loading="loading"
        class="bg-transparent dark-table"
        hover
        density="comfortable"
      >
        <template v-slot:item.activo="{ item }">
          <v-chip color="success" size="small" variant="tonal" class="font-weight-bold" v-if="item.activo">Activo</v-chip>
          <v-chip color="error" size="small" variant="tonal" class="font-weight-bold" v-else>Inactivo</v-chip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="400">
      <v-card class="card-dark-blue">
        <v-card-title class="header-dark-blue text-white">Nuevo Sobre</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field 
            v-model="newItem.nombre" 
            label="Nombre del Sobre" 
            autofocus 
            variant="outlined" 
            bg-color="#111936" 
            base-color="#2e3852" 
            color="white"
            class="mb-2"
          ></v-text-field>
          <v-text-field 
            v-model="newItem.descripcion" 
            label="Descripción (Opcional)" 
            variant="outlined"
            bg-color="#111936" 
            base-color="#2e3852" 
            color="white"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="border-t-dark">
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false" variant="text" color="white">Cancelar</v-btn>
          <v-btn color="primary" @click="save" variant="flat">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from '@/utils/axios';

const authStore = useAuthStore();
const items = ref([]);
const loading = ref(false);
const dialog = ref(false);
const newItem = ref({ nombre: '', descripcion: '' });

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Creado Por', key: 'usuario_creacion' },
  { title: 'Estado', key: 'activo' },
];

const loadData = async () => {
  try {
    loading.value = true;
    const res = await axios.get('/tesoreria/sobres');
    items.value = res.data;
  } catch (error) {
    console.error("Error cargando sobres", error);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if(!newItem.value.nombre) return;
  try {
    await axios.post('/tesoreria/sobres', {
      nombre: newItem.value.nombre,
      descripcion: newItem.value.descripcion,
      usuario: authStore.user?.name || 'Admin'
    });
    newItem.value = { nombre: '', descripcion: '' };
    dialog.value = false;
    loadData();
  } catch (error) {
    console.error("Error guardando sobre", error);
    alert("Error al guardar el sobre");
  }
};

onMounted(loadData);
</script>
