<script setup>
import { computed } from 'vue';
import { useCompanyStore } from '@/stores/company';
import { useAuthStore } from '@/stores/auth';
import { useCustomizerStore } from '@/stores/customizer';

const companyStore = useCompanyStore();
const authStore = useAuthStore();
const customizer = useCustomizerStore();

const canSwitch = computed(() => authStore.canSwitchCompany);
const current = computed(() => companyStore.company);
const companies = computed(() => companyStore.companies);

const isDark = computed(() => (customizer.actTheme || '').toUpperCase().includes('DARK'));
const logoFor = (c) => isDark.value ? c.logoDark : c.logoLight;

const choose = (c) => {
    if (c.id !== companyStore.currentCompany) {
        companyStore.setCompany(c.id);
        // El watch en MainLayout dispara recarga automaticamente
    }
};
</script>

<template>
    <v-menu v-if="canSwitch" :close-on-content-click="true" location="bottom end">
        <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                variant="outlined"
                size="small"
                class="company-switcher-btn mr-2"
                color="primary"
            >
                <v-avatar size="20" rounded="sm" class="mr-2">
                    <v-img :src="logoFor(current)" :alt="current.label" contain></v-img>
                </v-avatar>
                <span class="text-body-2 font-weight-bold">{{ current.shortLabel }}</span>
                <v-icon size="16" class="ml-1">mdi-chevron-down</v-icon>
            </v-btn>
        </template>

        <v-card min-width="240" class="pa-2">
            <div class="text-overline px-2 pb-1 text-medium-emphasis">Cambiar empresa</div>
            <v-list density="compact" class="pa-0">
                <v-list-item
                    v-for="c in companies"
                    :key="c.id"
                    :class="{ 'company-active': c.id === companyStore.currentCompany }"
                    @click="choose(c)"
                >
                    <template v-slot:prepend>
                        <v-avatar size="28" rounded="sm">
                            <v-img :src="logoFor(c)" :alt="c.label" contain></v-img>
                        </v-avatar>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">
                        {{ c.label }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ c.id }}</v-list-item-subtitle>
                    <template v-slot:append v-if="c.id === companyStore.currentCompany">
                        <v-icon size="18" color="primary">mdi-check-circle</v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-card>
    </v-menu>
</template>

<style scoped>
.company-switcher-btn {
    height: 36px;
    border-radius: 18px;
    text-transform: none;
    letter-spacing: 0;
}
.company-active {
    background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
