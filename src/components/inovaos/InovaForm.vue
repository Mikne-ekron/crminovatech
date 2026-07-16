<template>
  <div>
    <v-text-field v-model="form.titulo" label="Título *" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
    <v-textarea v-model="form.descripcion" label="Descripción" variant="outlined" rows="2" auto-grow density="comfortable" class="mb-2"></v-textarea>
    <div class="d-flex ga-2">
      <v-select v-model="form.prioridad" :items="['Alta','Media','Baja']" label="Prioridad" variant="outlined" density="comfortable" class="mb-2"></v-select>
      <v-text-field v-model="form.area" label="Área" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
    </div>
    <v-select
      v-model="form.responsable_id" :items="store.usuarios" item-title="nombre" item-value="id"
      label="Responsable (delegar a)" variant="outlined" density="comfortable" clearable class="mb-2"
      :hint="!esEdicion ? 'Vacío = queda capturado; si te eliges a ti, es tarea personal.' : ''" persistent-hint
    ></v-select>
    <div class="d-flex ga-2">
      <v-text-field v-model="form.cliente" label="Cliente" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
      <v-text-field v-model="form.fecha_compromiso" label="Fecha compromiso" type="date" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
    </div>
    <div class="d-flex justify-end ga-2 mt-1">
      <slot name="pre-actions"></slot>
      <v-btn color="primary" :loading="loading" :disabled="!form.titulo.trim()" @click="submit">
        {{ esEdicion ? 'Guardar cambios' : 'Crear pendiente' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  esEdicion: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['submit']);
const store = useInovaosStore();

const vacio = () => ({ titulo: '', descripcion: '', prioridad: 'Media', area: '', responsable_id: null, cliente: '', fecha_compromiso: '' });
const form = reactive(vacio());

const cargar = (data) => {
  Object.assign(form, vacio(), {
    titulo: data.titulo || '', descripcion: data.descripcion || '', prioridad: data.prioridad || 'Media',
    area: data.area || '', responsable_id: data.responsable_id || null, cliente: data.cliente || '',
    fecha_compromiso: data.fecha_compromiso ? String(data.fecha_compromiso).slice(0, 10) : '',
  });
};
watch(() => props.initial, (v) => cargar(v || {}), { immediate: true, deep: true });

const submit = () => {
  if (!form.titulo.trim()) return;
  emit('submit', { ...form, fecha_compromiso: form.fecha_compromiso || null });
};
defineExpose({ reset: () => cargar({}) });
</script>
