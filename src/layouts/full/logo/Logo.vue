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

// El SVG de Inovatech trae padding interno, por lo que a la misma altura se ve
// más pequeño que el de Mikne. Se agranda solo para Inovatech.
const logoStyle = computed(() => ({
    height: companyStore.company?.id === 'SBOINOVA' ? '74px' : '56px'
}));
</script>

<template>
    <div class="logo">
        <RouterLink to="/">
            <img :src="logoSrc" :alt="altText" class="company-logo" :style="logoStyle" />
        </RouterLink>
    </div>
</template>

<style scoped>
.company-logo {
    height: 56px;
    width: auto;
    max-width: 260px;
    object-fit: contain;
    display: block;
}
</style>
