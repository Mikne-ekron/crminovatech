<template>
  <div>
    <v-text-field v-model="form.titulo" label="Pendiente *" placeholder="¿Qué hay que hacer?" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
    <v-textarea v-model="form.descripcion" label="Descripción" placeholder="Detalles (opcional)" variant="outlined" rows="2" auto-grow density="comfortable" class="mb-2"></v-textarea>

    <!-- Para mí (tarea personal) -->
    <div class="d-flex align-center flex-wrap ga-2 mb-2">
      <v-btn :variant="esParaMi ? 'flat' : 'outlined'" :color="esParaMi ? 'primary' : undefined" size="small" rounded="xl"
             :prepend-icon="esParaMi ? 'mdi-check-circle' : 'mdi-account-circle-outline'" @click="toggleParaMi">
        {{ esParaMi ? 'Es para mí' : 'Para mí' }}
      </v-btn>
      <span v-if="esParaMi" class="text-caption text-medium-emphasis">Sin evidencia; la cierras en un toque.</span>
    </div>

    <v-select
      v-model="form.responsable_id" :items="store.usuarios" item-title="nombre" item-value="id"
      label="Responsable (delegar a)" variant="outlined" density="comfortable" clearable class="mb-2"
    ></v-select>

    <div class="d-flex ga-2">
      <v-select v-model="form.prioridad" :items="['Alta','Media','Baja']" label="Prioridad" variant="outlined" density="comfortable" class="mb-2"></v-select>
      <v-select v-model="form.area" :items="AREAS" label="Área" clearable placeholder="Sin área" variant="outlined" density="comfortable" class="mb-2"></v-select>
    </div>
    <v-text-field v-model="form.fecha_compromiso" label="Fecha compromiso" type="date" :min="hoy" variant="outlined" density="comfortable" class="mb-2"></v-text-field>

    <div class="d-flex justify-end ga-2 mt-1">
      <slot name="pre-actions"></slot>
      <v-btn class="iv-btn-accent" :loading="loading" :disabled="!form.titulo.trim()" @click="submit" elevation="0">{{ textoBoton }}</v-btn>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import { AREAS } from '@/views/inovaos/inova-helpers';

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  esEdicion: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['submit']);
const store = useInovaosStore();
const hoy = new Date().toISOString().slice(0, 10);

const vacio = () => ({ titulo: '', descripcion: '', prioridad: 'Alta', area: null, responsable_id: null, cliente: '', fecha_compromiso: '' });
const form = reactive(vacio());

const cargar = (data) => {
  Object.assign(form, vacio(), {
    titulo: data.titulo || '', descripcion: data.descripcion || '', prioridad: data.prioridad || 'Alta',
    area: data.area || null, responsable_id: data.responsable_id || null, cliente: data.cliente || '',
    fecha_compromiso: data.fecha_compromiso ? String(data.fecha_compromiso).slice(0, 10) : '',
  });
};
watch(() => props.initial, (v) => cargar(v || {}), { immediate: true, deep: true });

const esParaMi = computed(() => form.responsable_id != null && Number(form.responsable_id) === Number(store.myId));
const toggleParaMi = () => { form.responsable_id = esParaMi.value ? null : store.myId; };

const textoBoton = computed(() => {
  if (props.esEdicion) return 'Guardar cambios';
  if (esParaMi.value) return 'Guardar para mí';
  return form.responsable_id ? 'Delegar' : 'Guardar sin asignar';
});

const submit = () => {
  if (!form.titulo.trim()) return;
  emit('submit', { ...form, area: form.area || null, fecha_compromiso: form.fecha_compromiso || null });
};
</script>
