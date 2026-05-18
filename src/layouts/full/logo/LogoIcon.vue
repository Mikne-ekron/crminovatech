<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useCompanyStore } from '@/stores/company';
import { useCustomizerStore } from '@/stores/customizer';

const companyStore = useCompanyStore();
const customizer = useCustomizerStore();

const isDark = computed(() => (customizer.actTheme || '').toUpperCase().includes('DARK'));
const logoSrc = computed(() => {
    const c = companyStore.company;
    if (!c) return null;
    return isDark.value ? c.logoDark : c.logoLight;
});
const altText = computed(() => companyStore.company?.label || 'Logo');
</script>

<template>
    <div class="logo">
        <RouterLink to="/">
            <img :src="logoSrc" :alt="altText" style="height: 32px; width: auto; max-width: 120px; object-fit: contain;" />
        </RouterLink>
    </div>
</template>
