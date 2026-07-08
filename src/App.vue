<template>
  <v-app>
    <router-view />
    <InstallPrompt />
  </v-app>
</template>

<script setup>
import InstallPrompt from '@/components/shared/InstallPrompt.vue';
</script>
