<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import { useCustomizerStore } from '@/stores/customizer';
import { Icon } from '@iconify/vue';

const theme = useTheme();
const customizer = useCustomizerStore();

const toggleTheme = () => {
    const newTheme = customizer.actTheme === 'BLUE_THEME' ? 'DARK_BLUE_THEME' : 'BLUE_THEME';
    customizer.actTheme = newTheme;
};

</script>

<template>
    <div class="position-relative">
        <v-btn
            icon
            variant="text"
            color="primary"
            @click="toggleTheme"
            size="small"
            class="ms-md-2 custom-hover-primary-white"
        >
            <Icon 
                v-if="customizer.actTheme === 'DARK_BLUE_THEME'" 
                icon="solar:moon-line-duotone" 
                height="22" 
                class="text-primary"
            />
            <Icon 
                v-else 
                icon="solar:sun-2-line-duotone" 
                height="22" 
                class="text-warning"
            />
        </v-btn>
    </div>
</template>
