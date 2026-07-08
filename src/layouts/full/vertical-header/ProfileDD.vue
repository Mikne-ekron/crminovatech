<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const initials = computed(() => {
  if (!authStore.user?.name) return 'U';
  return authStore.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});
const avatar = computed(() => authStore.user?.avatar || null);

const goProfile = () => router.push('/app/perfil');
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <v-menu open-on-hover class="profile_popup">
    <template v-slot:activator="{ props }">
      <v-btn variant="text" v-bind="props" icon size="small" color="primary" class="custom-hover-primary ms-md-2">
        <v-avatar size="35" color="secondary">
          <v-img v-if="avatar" :src="avatar" cover />
          <span v-else class="text-h6 text-white">{{ initials }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-sheet rounded="md" width="300" elevation="10">
      <div class="pa-4">
        <div class="d-flex align-center pb-4">
          <v-avatar size="45" color="secondary">
            <v-img v-if="avatar" :src="avatar" cover />
            <span v-else class="text-h6 text-white">{{ initials }}</span>
          </v-avatar>
          <div class="ml-3">
            <h6 class="text-h6 textPrimary font-weight-medium">{{ authStore.user?.name || 'Usuario' }}</h6>
            <span class="text-caption textSecondary">{{ authStore.user?.email || '' }}</span>
          </div>
        </div>
        <v-divider></v-divider>

        <v-list class="py-2" density="compact">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Mi perfil"
            class="rounded-md mb-1"
            @click="goProfile"
          ></v-list-item>
        </v-list>

        <v-btn block color="error" variant="tonal" class="mt-2" prepend-icon="mdi-logout" @click="handleLogout">
          Cerrar sesión
        </v-btn>
      </div>
    </v-sheet>
  </v-menu>
</template>
