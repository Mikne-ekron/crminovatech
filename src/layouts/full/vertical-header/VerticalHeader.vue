<script setup>
import { ref, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useCustomizerStore } from '@/stores/customizer';
import { useCompanyStore } from '@/stores/company';
import { useNotificationsStore } from '@/stores/notifications';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';
// import LanguageDD from './LanguageDD.vue';
// import NotificationDD from './NotificationDD.vue';
import ProfileDD from './ProfileDD.vue';
import Searchbar from './Searchbar.vue';
import Logo from '../logo/Logo.vue';
import LogoIcon from '../logo/LogoIcon.vue';
import RtlLogo from '../logo/RtlLogo.vue';
import ThemeToggler from './ThemeToggler.vue';
import CompanySwitcher from './CompanySwitcher.vue';
// import Navigations from './Navigations.vue';
// import Messages from './Messages.vue';
// import RightMobileSidebar from './RightMobileSidebar.vue';

const customizer = useCustomizerStore();
const companyStore = useCompanyStore();
const notifStore = useNotificationsStore();
const chatStore = useChatStore();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'ADMIN');
const companyLogo = computed(() => companyStore.company?.logoLight || null);
// El SVG de Inovatech trae padding interno: a igual altura se ve más chico,
// por eso se agranda solo para Inovatech (mismo criterio que Logo.vue en desktop).
const mobileLogoStyle = computed(() => ({
    height: companyStore.company?.id === 'SBOINOVA' ? '48px' : '34px'
}));
const { smAndDown } = useDisplay();
const showSearch = ref(false);
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
function searchbox() {
    showSearch.value = !showSearch.value;
}
watch(priority, (newPriority) => {
    priority.value = newPriority;
});

const getCart = computed(() => {
    return [];
});
</script>

<template>
    <v-app-bar elevation="5" :priority="priority" height="60" color="primary" class="main-head" id="top">
        <!-- ============ MÓVIL: notas · logo · campana ============ -->
        <template v-if="smAndDown">
            <v-btn icon variant="text" color="white" size="small" class="ms-1" to="/app/notes">
                <Icon icon="solar:notes-bold-duotone" height="24" />
            </v-btn>
            <v-spacer />
            <img v-if="companyLogo" :src="companyLogo" alt="logo" class="mobile-head-logo" :style="mobileLogoStyle" />
            <v-spacer />
            <v-btn icon variant="text" color="white" size="small" class="me-1" @click="notifStore.openDrawer()">
                <v-badge :content="notifStore.unread" :model-value="notifStore.unread > 0" color="error" offset-x="-1" offset-y="-1">
                    <Icon icon="solar:bell-bold-duotone" height="24" />
                </v-badge>
            </v-btn>
        </template>

        <!-- ============ DESKTOP: barra completa ============ -->
        <template v-else>
        <!---LOGO RTL/LTR--->
        <div class="hidden-sm-and-down">
            <v-locale-provider v-if="customizer.setRTLLayout" rtl>
                <div class="pt-2 d-sm-flex d-none">
                    <RtlLogo />
                </div>
                <div class="pt-2 pr-2 d-sm-none d-flex">
                    <LogoIcon />
                </div>
            </v-locale-provider>
            <v-locale-provider v-else>
                <div class="pt-2 d-sm-flex d-none">
                    <Logo />
                </div>
                <div class="pt-2 pr-2 d-sm-none d-flex">
                    <LogoIcon />
                </div>
            </v-locale-provider>
        </div>

        <v-btn
            class="hidden-md-and-down custom-hover-primary menu-toggle"
            size="small"
            icon
            color="primary"
            variant="text"
            @click.stop="customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)"
        >
            <Icon icon="solar:list-bold" height="22" />
        </v-btn>
        <v-btn v-if="!smAndDown" class="hidden-lg-and-up" icon variant="text" @click.stop="customizer.SET_SIDEBAR_DRAWER" size="small">
            <Icon icon="solar:list-bold" height="22" />
        </v-btn>

        <!-- ---------------------------------------------- -->
        <!-- Search part -->
        <!-- ---------------------------------------------- -->

        <Searchbar />

        <!-- ---------------------------------------------- -->
        <!-- Mega menu -->
        <!-- ---------------------------------------------- -->
        <!-- <div class="hidden-sm-and-down">
            <Navigations />
        </div> -->

        <!---/Search part -->

        <v-spacer class="hidden-sm-and-down" />
        <!-- ---------------------------------------------- -->
        <!---right part -->
        <!-- ---------------------------------------------- -->
        <!-- ---------------------------------------------- -->
        <!-- translate -->
        <!-- ---------------------------------------------- -->
        <!-- <div class="hidden-sm-and-down">
            <LanguageDD />
        </div> -->

        <!-- ---------------------------------------------- -->
        <!-- Mobile Logo -->
        <!-- ---------------------------------------------- -->
        <div class="hidden-md-and-up mt-2">
            <LogoIcon />
        </div>
        <CompanySwitcher class="hidden-sm-and-down" />
        <v-btn
            to="/app/notes"
            icon variant="text" color="primary" size="small"
            class="hidden-sm-and-down custom-hover-primary"
        >
            <Icon icon="solar:notes-bold-duotone" height="22" />
        </v-btn>
        <v-btn
            to="/app/chat"
            icon variant="text" color="primary" size="small"
            class="hidden-sm-and-down custom-hover-primary"
        >
            <v-badge :content="chatStore.unread" :model-value="chatStore.unread > 0" color="error" offset-x="-2" offset-y="-2">
                <Icon icon="solar:plain-2-bold-duotone" height="22" />
            </v-badge>
        </v-btn>
        <v-btn
            v-if="isAdmin"
            icon variant="text" color="primary" size="small"
            class="hidden-sm-and-down custom-hover-primary"
            @click="notifStore.openDrawer()"
        >
            <v-badge :content="notifStore.unread" :model-value="notifStore.unread > 0" color="error" offset-x="-2" offset-y="-2">
                <Icon icon="solar:bell-bold-duotone" height="22" />
            </v-badge>
        </v-btn>
        <div class="me-md-1">
            <ThemeToggler />
        </div>

        <!-- ---------------------------------------------- -->
        <!-- Notification -->
        <!-- ---------------------------------------------- -->
        <!-- <div class="hidden-sm-and-down">
            <NotificationDD />
        </div> -->
        <!-- ---------------------------------------------- -->
        <!-- Messages -->
        <!-- ---------------------------------------------- -->
        <!-- <div class="hidden-sm-and-down">
            <Messages />
        </div> -->

        <!-- ---------------------------------------------- -->
        <!-- ShoppingCart -->
        <!-- ---------------------------------------------- -->
        <!-- <v-btn icon variant="text" color="primary" to="/ecommerce/checkout" size="small" class="ms-1 hidden-sm-and-down custom-hover-primary">
            <v-badge color="error" :content="getCart?.length">
                <Icon icon="solar:cart-large-2-outline" height="22" />
            </v-badge>
        </v-btn> -->

        <!-- ---------------------------------------------- -->
        <!-- User Profile -->
        <!-- ---------------------------------------------- -->
        <div class="ms-2 hidden-sm-and-down">
            <ProfileDD />
        </div>

        <!----Mobile ----->
        <v-menu :close-on-content-click="true" class="mobile_popup">
            <template v-slot:activator="{ props }">
                <v-btn icon class="hidden-md-and-up " color="primary" variant="text" v-bind="props" size="small">
                    <Icon icon="solar:menu-dots-bold-duotone" height="22" />
                </v-btn>
            </template>
            <v-sheet rounded="lg" elevation="10" class="mt-4 dropdown-box px-4 py-3">
                <div class="d-flex justify-space-between align-center">
                    <!-- <RightMobileSidebar /> -->
                    <!-- <LanguageDD /> -->
                    <!-- <v-btn icon variant="text" class="mr-sm-3 mr-2 custom-hover-primary" to="/ecommerce/checkout" size="small">
                        <v-badge color="error" :content="getCart?.length" offset-x="-4" offset-y="-6">
                            <Icon icon="solar:cart-large-2-outline" height="22" />
                        </v-badge>
                    </v-btn> -->
                    <!-- <NotificationDD /> -->
                    <!-- <Messages /> -->
                    <ProfileDD />
                </div>
            </v-sheet>
        </v-menu>
        </template>
    </v-app-bar>
</template>

<style scoped>
.mobile-head-logo {
    width: auto;
    max-width: 190px;
    object-fit: contain;
    display: block;
}
</style>
