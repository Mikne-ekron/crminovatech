<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="pa-4 bg-primary text-white">
        <span class="text-h6">Nuevo Prospecto (Logo)</span>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-form ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="prospect.name"
                label="Nombre de la Empresa / Cliente"
                variant="outlined"
                density="compact"
                :rules="[(v) => !!v || 'Requerido']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="prospect.rfc"
                label="RFC / Tax ID"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="prospect.industry"
                :items="industries"
                label="Industria / Sector"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="prospect.contact"
                label="Contacto Principal"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-account"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="prospect.email"
                label="Email"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="prospect.phone"
                label="Teléfono"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-phone"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :disabled="!valid" @click="save">Guardar Prospecto</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'save']);

const dialog = ref(props.modelValue);
const valid = ref(false);
const form = ref(null);

const industries = [
  'Tecnología',
  'Manufactura',
  'Servicios',
  'Construcción',
  'Logística',
  'Retail',
  'Salud'
];

const prospect = ref({
  name: '',
  rfc: '',
  industry: '',
  contact: '',
  email: '',
  phone: ''
});

const emailRules = [
  (v) => !v || /.+@.+\..+/.test(v) || 'Email no válido'
];

watch(() => props.modelValue, (val) => {
  dialog.value = val;
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
});

const close = () => {
  dialog.value = false;
};

const save = () => {
  if (form.value.validate()) {
    emit('save', { ...prospect.value, id: Date.now(), status: 'Nuevo', lastFollowup: new Date().toISOString() });
    resetForm();
    close();
  }
};

const resetForm = () => {
  prospect.value = {
    name: '',
    rfc: '',
    industry: '',
    contact: '',
    email: '',
    phone: ''
  };
};
</script>
