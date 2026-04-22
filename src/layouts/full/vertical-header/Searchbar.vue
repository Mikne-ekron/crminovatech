<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const dialog = ref(false);
const search = ref('');
</script>

<template>
    <v-btn
        icon
        variant="text"
        class="ms-md-2 custom-hover-primary"
        color="primary"
        size="small"
        @click="dialog = true"
    >
        <Icon icon="solar:magnifer-linear" height="20" />
    </v-btn>
    <v-dialog v-model="dialog" max-width="600" transition="dialog-top-transition">
        <v-card class="rounded-lg">
            <v-card-text class="pa-5">
                <v-text-field 
                    v-model="search"
                    placeholder="Buscar en el portal..." 
                    color="primary" 
                    density="comfortable" 
                    variant="outlined" 
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    @keyup.enter="dialog = false"
                    autofocus
                ></v-text-field>
                
                <div class="mt-6">
                    <h6 class="text-subtitle-1 font-weight-bold mb-3">Accesos Rápidos</h6>
                    <v-list density="compact" class="pa-0">
                        <v-list-item 
                            prepend-icon="mdi-view-dashboard-outline" 
                            title="Dashboard" 
                            to="/app/dashboard"
                            class="rounded-md"
                        ></v-list-item>
                        <v-list-item 
                            prepend-icon="mdi-bank-outline" 
                            title="Tesoreria" 
                            to="/app/tesoreria/caja-chica"
                            class="rounded-md"
                        ></v-list-item>
                    </v-list>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
