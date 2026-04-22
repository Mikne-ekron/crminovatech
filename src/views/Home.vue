<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-thin mb-1">Bienvenido, {{ authStore.user?.name }}</h1>
        <p class="text-subtitle-1 text-grey-darken-1">Resumen de operaciones Inovatech</p>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="primary" variant="tonal">
          <v-card-item title="Tareas Pendientes">
            <template v-slot:subtitle>
              <v-icon icon="mdi-alert-circle-outline" size="18" class="me-1 pb-1"></v-icon>
              Requieren atención
            </template>
          </v-card-item>
          <v-card-text class="py-0">
            <v-row align="center" no-gutters>
              <v-col class="text-h2 font-weight-bold" cols="6">3</v-col>
              <v-col cols="6" class="text-right">
                <v-icon icon="mdi-clipboard-list-outline" size="64" class="text-primary opacity-50"></v-icon>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="success" variant="tonal" to="/app/tesoreria/efectivo/sobres">
          <v-card-item title="Caja Chica">
            <template v-slot:subtitle>
              <v-icon icon="mdi-cash" size="18" class="me-1 pb-1"></v-icon>
              Saldo actual
            </template>
          </v-card-item>
          <v-card-text class="py-0">
            <v-row align="center" no-gutters>
              <v-col class="text-h4 font-weight-bold" cols="8">$0.00</v-col>
              <v-col cols="4" class="text-right">
                <v-icon icon="mdi-wallet" size="64" class="text-success opacity-50"></v-icon>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>