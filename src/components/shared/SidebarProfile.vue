<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

const authStore = useAuthStore();
const router = useRouter();
const menu = ref(false);

const userInitials = computed(() => {
  const name = authStore.user?.name || 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <v-menu v-model="menu" location="bottom" offset="10">
    <template v-slot:activator="{ props }">
      <div 
        v-bind="props"
        class="d-flex justify-space-between align-center w-100 cursor-pointer"
      >
        <h5 class="text-white font-weight-medium text-15">
          {{ authStore.user?.name || 'Usuario' }}
        </h5>
        <Icon 
          icon="solar:alt-arrow-down-bold" 
          class="text-white" 
          width="15" 
          height="15" 
        />
      </div>
    </template>

    <v-list density="compact" class="py-0" elevation="10">
      <v-list-item 
        prepend-icon="mdi-account-circle" 
        title="Mi Perfil"
        value="profile"
      ></v-list-item>
      
      <v-list-item 
        prepend-icon="mdi-cog" 
        title="Configuración"
        value="settings"
      ></v-list-item>
      
      <v-divider></v-divider>
      
      <v-list-item 
        prepend-icon="mdi-logout" 
        title="Cerrar Sesión"
        value="logout"
        @click="handleLogout"
      ></v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.text-15 {
  font-size: 15px;
}
</style>
