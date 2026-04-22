<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-10 text-center rounded-xl" elevation="3" max-width="500">
      <v-icon size="120" color="error" class="mb-4">mdi-alert-octagon-outline</v-icon>
      <h1 class="text-h3 font-weight-black text-grey-darken-4">404</h1>
      <h2 class="text-h5 font-weight-bold text-grey-darken-2 mt-2">Página No Encontrada</h2>
      <p class="text-body-1 text-grey mt-4">
        Lo sentimos, la ruta que intentas acceder no existe o ha sido movida.
      </p>
      <v-btn 
        color="primary" 
        size="large" 
        class="mt-6 rounded-lg px-8" 
        prepend-icon="mdi-home" 
        to="/app/dashboard"
        variant="elevated"
      >
        Volver al Dashboard
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
</script>
