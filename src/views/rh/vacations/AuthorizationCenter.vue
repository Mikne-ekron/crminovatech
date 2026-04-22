<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <!-- <BaseBreadcrumb :title="'Centro de Autorizaciones'" :breadcrumbs="breadcrumbs"></BaseBreadcrumb> -->
    <PageHeader title="Centro de Autorizaciones" :breadcrumbs="breadcrumbs" />

    <v-row class="mb-4">
        <v-col cols="12" md="4">
            <v-card 
                elevation="0" 
                class="cursor-pointer transition-swing card-dark-blue"
                :class="{'bg-primary text-white': filter === 'PENDING', 'card-dark-blue': filter !== 'PENDING'}"
                @click="filter = 'PENDING'"
                style="border: 1px solid #2e3852"
            >
                <v-card-text class="d-flex align-center justify-space-between">
                    <div>
                        <h2 class="text-h3 font-weight-bold" :class="filter === 'PENDING' ? 'text-white' : 'text-primary-dark'">{{ stats.pending }}</h2>
                        <span class="text-subtitle-1 font-weight-medium">Pendientes de Acción</span>
                    </div>
                    <v-icon size="48" :class="{'opacity-50': true, 'text-primary-dark': filter !== 'PENDING'}">mdi-clock-alert-outline</v-icon>
                </v-card-text>
            </v-card>
        </v-col>
        
        <v-col cols="12" md="4">
             <v-card 
                elevation="0" 
                class="cursor-pointer transition-swing card-dark-blue"
                :class="{'bg-success text-white': filter === 'APPROVED', 'card-dark-blue': filter !== 'APPROVED'}"
                @click="filter = 'APPROVED'"
                style="border: 1px solid #2e3852"
            >
                <v-card-text class="d-flex align-center justify-space-between">
                    <div>
                        <h2 class="text-h3 font-weight-bold" :class="filter === 'APPROVED' ? 'text-white' : 'text-success'">{{ stats.approved }}</h2>
                        <span class="text-subtitle-1 font-weight-medium">Autorizados</span>
                    </div>
                    <v-icon size="48" class="opacity-50" :class="filter !== 'APPROVED' ? 'text-success' : ''">mdi-check-decagram</v-icon>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="4">
             <v-card 
                elevation="0" 
                class="cursor-pointer transition-swing card-dark-blue"
                :class="{'bg-error text-white': filter === 'REJECTED', 'card-dark-blue': filter !== 'REJECTED'}"
                @click="filter = 'REJECTED'"
                style="border: 1px solid #2e3852"
            >
                <v-card-text class="d-flex align-center justify-space-between">
                    <div>
                        <h2 class="text-h3 font-weight-bold" :class="filter === 'REJECTED' ? 'text-white' : 'text-error'">{{ stats.rejected }}</h2>
                        <span class="text-subtitle-1 font-weight-medium">Rechazados</span>
                    </div>
                    <v-icon size="48" class="opacity-50" :class="filter !== 'REJECTED' ? 'text-error' : ''">mdi-close-circle-outline</v-icon>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <v-card elevation="0" class="rounded-lg card-dark-blue">
        <v-card-title class="pa-4 d-flex justify-space-between align-center border-b-dark header-dark-blue">
            <span class="text-h6 font-weight-bold">Listado de Solicitudes</span>
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Buscar empleado..."
                single-line hide-details
                density="compact"
                style="max-width: 300px;"
                variant="outlined"
                base-color="#2e3852"
                bg-color="#111936"
                color="white"
            ></v-text-field>
        </v-card-title>
        
        <v-data-table
            :headers="headers"
            :items="filteredItems"
            :search="search"
            hover
            class="bg-transparent dark-table"
        >
            <template v-slot:item.Employee="{ item }">
                <div class="d-flex align-center py-2">
                    <v-avatar color="#252b48" variant="flat" size="40" class="mr-3 rounded-lg border-thin">
                        <span class="text-h6 font-weight-bold text-white">{{ item.EmployeeName.charAt(0) }}</span>
                    </v-avatar>
                    <div>
                        <div class="font-weight-bold text-white">{{ item.EmployeeName }}</div>
                        <div class="text-caption text-grey">{{ item.JobTitle }}</div>
                    </div>
                </div>
            </template>

            <template v-slot:item.RequestType="{ item }">
                <v-chip size="small" :color="getTypeColor(item.RequestType)" class="font-weight-bold">
                    {{ getTypeLabel(item.RequestType) }}
                </v-chip>
            </template>

             <template v-slot:item.fechas="{ item }">
                <div class="text-body-2 text-white">
                    {{ formatDate(item.StartDate) }} - {{ formatDate(item.EndDate) }}
                    <div class="text-caption text-grey">({{ item.DaysQuantity }} días)</div>
                </div>
            </template>
            
            <template v-slot:item.Reason="{ item }">
                <div class="text-grey">{{ item.Reason }}</div>
            </template>

            <template v-slot:item.actions="{ item }">
                <div class="d-flex gap-2 justify-end" v-if="filter === 'PENDING'">
                    <v-btn size="small" color="error" variant="tonal" icon="mdi-close" @click="confirmAction(item, 'REJECT')"></v-btn>
                    <v-btn size="small" color="success" variant="flat" icon="mdi-check" @click="confirmAction(item, 'APPROVE')"></v-btn>
                </div>
                <div class="d-flex gap-2 justify-end" v-else>
                    <v-btn size="small" color="warning" variant="text" prepend-icon="mdi-undo" @click="confirmAction(item, 'REVOKE')">
                        Reconsiderar
                    </v-btn>
                </div>
            </template>
        </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import axios from '@/utils/axios';

const breadcrumbs = ref([{ text: 'RH', disabled: false }, { text: 'Autorizaciones', disabled: true }]);
const requests = ref([]);
const filter = ref('PENDING'); // PENDING, APPROVED, REJECTED
const search = ref('');

const headers = [
    { title: 'Empleado', key: 'Employee', align: 'start' },
    { title: 'Tipo', key: 'RequestType', align: 'start' },
    { title: 'Fechas Solicitadas', key: 'fechas', align: 'start' },
    { title: 'Motivo', key: 'Reason', align: 'start' },
    { title: 'Acciones', key: 'actions', align: 'end' },
];

const stats = computed(() => {
    return {
        pending: requests.value.filter(r => r.Status === 'PENDING').length,
        approved: requests.value.filter(r => r.Status === 'APPROVED').length, 
        rejected: requests.value.filter(r => r.Status === 'REJECTED').length,
    };
});

const filteredItems = computed(() => {
    if (filter.value === 'PENDING') return requests.value.filter(r => r.Status === 'PENDING');
    if (filter.value === 'APPROVED') return requests.value.filter(r => r.Status === 'APPROVED');
    return requests.value.filter(r => r.Status === 'REJECTED');
});

const loadData = async () => {
    try {
        const res = await axios.get('/rh/authorization/dashboard');
        requests.value = res.data;
    } catch (error) {
         console.error("Error loading authorizations", error);
         // MOCK DATA Fallback
        requests.value = [
            { RequestID: 1, EmployeeName: 'Ana Gomez', JobTitle: 'Vendedora', RequestType: 'VACATION', StartDate: '2025-10-10', EndDate: '2025-10-15', DaysQuantity: 6, Reason: 'Viaje familiar', Status: 'PENDING' },
            { RequestID: 2, EmployeeName: 'Carlos Ruiz', JobTitle: 'Chofer', RequestType: 'PERMIT_5H', StartDate: '2025-10-12', EndDate: '2025-10-12', DaysQuantity: 0.5, Reason: 'Cita médica', Status: 'APPROVED' },
        ];
    }
};

const confirmAction = async (item, action) => {
    if(!confirm(`¿Estás seguro de ${action === 'APPROVE' ? 'AUTORIZAR' : (action === 'REVOKE' ? 'REVERTIR' : 'RECHAZAR')} esta solicitud?`)) return;
    
    try {
        await axios.post('/rh/authorization/action', { requestId: item.RequestID, action });
        // alert(`Acción ${action} ejecutada`);
        loadData(); // Recargar todo para reflejar estado real
    } catch (error) {
        alert("Error al procesar acción");
    }
};


const getTypeColor = (type) => type === 'VACATION' ? 'primary' : (type === 'CASH_OUT' ? 'success' : 'secondary');
const getTypeLabel = (type) => type === 'VACATION' ? 'Vacaciones' : (type === 'CASH_OUT' ? 'Canje' : 'Permiso');
const formatDate = (d) => new Date(d).toLocaleDateString('es-MX', {day: '2-digit', month: 'short'});

onMounted(() => loadData());
</script>
