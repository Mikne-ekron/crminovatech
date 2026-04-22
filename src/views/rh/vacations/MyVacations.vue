<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <PageHeader title="Mis Vacaciones" :breadcrumbs="breadcrumbs" />

    <v-row>
      <v-col cols="12" md="4" lg="3">
        <v-card elevation="0" class="rounded-lg overflow-hidden card-dark-blue h-100">
            
            <div class="position-relative" style="height: 130px; background: linear-gradient(135deg, #635BFF 0%, #4e46e5 100%);"></div>
            
            <v-card-text class="position-relative text-center pt-0">
                
                <div class="d-flex justify-center" style="margin-top: -65px;">
                    <v-avatar size="130" style="border: 6px solid #1A223F;" class="elevation-4">
                        <v-img 
                            src="https://randomuser.me/api/portraits/men/85.jpg" 
                            alt="user"
                            cover
                        ></v-img>
                    </v-avatar>
                </div>
                
                <div class="mt-4">
                    <h3 class="text-h5 font-weight-bold text-white text-truncate px-2">
                        {{ employee.FullName || 'Cargando...' }}
                    </h3>
                    
                    <div class="d-flex flex-column align-center mt-2">
                        <span class="text-subtitle-1 text-grey-lighten-1 font-weight-medium mb-2">
                            {{ employee.JobTitle }}
                        </span>
                        <v-chip size="small" color="#635BFF" variant="flat" class="font-weight-bold text-white px-4">
                            {{ employee.Department }}
                        </v-chip>
                    </div>
                </div>

                <v-divider class="my-6" style="border-color: #2e3852; opacity: 1;"></v-divider>

                <v-list density="comfortable" class="text-start py-0 bg-transparent">
                    
                    <v-list-item class="px-0 mb-4 rounded-lg">
                        <template v-slot:prepend>
                            <v-avatar color="rgba(99, 91, 255, 0.1)" rounded="lg" size="48" class="mr-4">
                                <v-icon size="24" color="#635BFF">mdi-calendar-check</v-icon>
                            </v-avatar>
                        </template>
                        
                        <div>
                            <div class="text-caption text-uppercase font-weight-bold text-grey">Fecha de Ingreso</div>
                            <div class="text-body-1 font-weight-bold text-white mt-1">
                                {{ formatDate(employee.EntryDate) }}
                            </div>
                        </div>
                    </v-list-item>

                    <v-list-item class="px-0 rounded-lg">
                        <template v-slot:prepend>
                            <v-avatar color="rgba(19, 222, 185, 0.1)" rounded="lg" size="48" class="mr-4">
                                <v-icon size="24" color="#13DEB9">mdi-medal-outline</v-icon>
                            </v-avatar>
                        </template>
                        
                        <div>
                            <div class="text-caption text-uppercase font-weight-bold text-grey">Antigüedad</div>
                            <div class="text-body-1 font-weight-bold text-white mt-1">
                                {{ employee.YearsOfService }} Años
                            </div>
                            <div class="text-caption text-grey-lighten-1">
                                ({{ employee.SeniorityMonths || 0 }} meses totales)
                            </div>
                        </div>
                    </v-list-item>
                </v-list>

                <v-alert
                    v-if="employee.BalancePreviousPeriod > 0"
                    color="warning"
                    variant="tonal"
                    icon="mdi-alert-circle-outline"
                    class="mt-6 text-start text-caption"
                    border="start"
                    density="compact"
                    style="background-color: rgba(255, 152, 0, 0.1) !important;"
                >
                    <span class="text-white">Tienes <b>{{ employee.BalancePreviousPeriod }} días</b> pendientes del periodo anterior.</span>
                </v-alert>

            </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8" lg="9">
        
        <v-row>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="0" class="rounded-lg h-100 card-dark-blue" style="border-left: 4px solid #13DEB9;">
                    <v-card-text class="d-flex flex-column align-center justify-center py-4">
                        <v-icon size="32" class="mb-2" color="#13DEB9">mdi-beach</v-icon>
                        <div class="text-h4 font-weight-bold text-white">{{ employee.BalanceCurrentPeriod }}</div>
                        <div class="text-subtitle-2 font-weight-bold text-uppercase mt-1 text-grey">Disponibles</div>
                        <div class="text-caption text-grey-darken-1">Periodo Actual</div>
                    </v-card-text>
                </v-card>
            </v-col>
             <v-col cols="12" sm="6" md="3">
                <v-card elevation="0" class="rounded-lg h-100 card-dark-blue" style="border-left: 4px solid #03c9d7;">
                    <v-card-text class="d-flex flex-column align-center justify-center py-4">
                         <v-icon size="32" class="mb-2 text-info">mdi-calendar-check</v-icon>
                        <div class="text-h4 font-weight-bold text-white">{{ employee.DaysUsed }}</div>
                        <div class="text-subtitle-2 font-weight-bold text-uppercase mt-1 text-grey">Disfrutados</div>
                        <div class="text-caption text-grey-darken-1">Histórico</div>
                    </v-card-text>
                </v-card>
            </v-col>
             <v-col cols="12" sm="6" md="3">
                <v-card elevation="0" class="rounded-lg h-100 card-dark-blue" style="border-left: 4px solid #635BFF;">
                    <v-card-text class="d-flex flex-column align-center justify-center py-4">
                         <v-icon size="32" class="mb-2" color="#635BFF">mdi-calendar-clock</v-icon>
                        <div class="text-h4 font-weight-bold text-white">{{ employee.DaysScheduled || 0 }}</div>
                        <div class="text-subtitle-2 font-weight-bold text-uppercase mt-1 text-grey">Por Disfrutar</div>
                        <div class="text-caption text-grey-darken-1">Futuros</div>
                    </v-card-text>
                </v-card>
            </v-col>
             <v-col cols="12" sm="6" md="3">
                <v-card elevation="0" class="rounded-lg h-100 card-dark-blue" style="border-left: 4px solid #FA896B;">
                    <v-card-text class="d-flex flex-column align-center justify-center py-4">
                         <v-icon size="32" class="mb-2" color="#FA896B">mdi-history</v-icon>
                        <div class="text-h4 font-weight-bold text-white">{{ employee.BalancePreviousPeriod }}</div>
                        <div class="text-subtitle-2 font-weight-bold text-uppercase mt-1 text-grey">Pendientes</div>
                        <div class="text-caption text-grey-darken-1">Periodo Anterior</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-card elevation="0" class="rounded-lg mt-6 card-dark-blue">
             <v-card-text class="pa-5">
                <v-row>
                    <v-col cols="12" sm="4">
                        <v-btn block height="60" color="#635BFF" variant="flat" class="text-none text-white" @click="openRequestDialog('VACATION')">
                            <v-icon start size="28" class="mr-3">mdi-palm-tree</v-icon>
                            <div class="d-flex flex-column align-start">
                                <span class="font-weight-bold text-body-1">Solicitar Vacaciones</span>
                                <span class="text-caption opacity-80 font-weight-light">Días completos</span>
                            </div>
                        </v-btn>
                    </v-col>
                     <v-col cols="12" sm="4">
                        <v-btn block height="60" color="#13DEB9" variant="flat" class="text-none text-white" @click="openRequestDialog('PERMIT')">
                            <v-icon start size="28" class="mr-3">mdi-clock-outline</v-icon>
                            <div class="d-flex flex-column align-start">
                                <span class="font-weight-bold text-body-1">Solicitar Permiso</span>
                                <span class="text-caption opacity-80 font-weight-light">Por horas o día</span>
                            </div>
                        </v-btn>
                    </v-col>
                     <v-col cols="12" sm="4">
                        <v-btn block height="60" color="#FA896B" variant="tonal" class="text-none text-white" @click="openRequestDialog('CASH_OUT')">
                            <v-icon start size="28" class="mr-3">mdi-cash-multiple</v-icon>
                            <div class="d-flex flex-column align-start">
                                <span class="font-weight-bold text-body-1">Canjear Días</span>
                                <span class="text-caption opacity-80 font-weight-light">Pago en efectivo</span>
                            </div>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card elevation="0" class="rounded-lg mt-6 card-dark-blue">
             <div class="pa-5 border-b-dark d-flex justify-space-between align-center header-dark-blue">
                <h4 class="text-h6 font-weight-bold text-white">Historial de Solicitudes</h4>
                <v-chip size="small" color="#252b48" class="text-white border-thin">Total: {{ history.length }}</v-chip>
            </div>
            <v-data-table
                :headers="headers"
                :items="history"
                density="comfortable"
                class="rounded-0 elevation-0 bg-transparent dark-table"
                hover
            >
                <template v-slot:item.RequestType="{ item }">
                    <v-chip size="small" :color="getTypeColor(item.RequestType)" variant="flat" class="font-weight-bold">
                        {{ getTypeLabel(item.RequestType) }}
                    </v-chip>
                </template>

                 <template v-slot:item.fechas="{ item }">
                    <div class="text-body-2 font-weight-black text-white">
                        {{ formatDateShort(item.StartDate) }} 
                        <span v-if="item.StartDate !== item.EndDate" class="opacity-70 font-weight-medium text-grey"> 
                            - {{ formatDateShort(item.EndDate) }}
                        </span>
                    </div>
                 </template>

                 <template v-slot:item.DaysQuantity="{ item }">
                    <div class="text-body-2 font-weight-medium text-grey-lighten-1">
                        {{ formatDuration(item) }}
                    </div>
                 </template>

                <template v-slot:item.Status="{ item }">
                    <v-chip :color="getStatusColor(item.Status)" size="small" variant="tonal" class="font-weight-bold">
                        <v-icon start size="small" class="mr-1">{{ getStatusIcon(item.Status) }}</v-icon>
                        {{ getStatusLabel(item.Status) }}
                    </v-chip>
                </template>
            </v-data-table>
        </v-card>

      </v-col>
    </v-row>
    
    <v-dialog v-model="dialog.show" max-width="600" persistent>
        <v-card class="rounded-lg elevation-10 card-dark-blue border-thin">
             <v-card-title class="text-white d-flex justify-space-between align-center pa-4" style="background-color: #635BFF !important;">
                <span class="text-h6"><v-icon class="mr-2">{{ getDialogIcon() }}</v-icon>{{ getDialogTitle() }}</span>
                <v-btn icon="mdi-close" variant="text" color="white" @click="dialog.show = false"></v-btn>
            </v-card-title>
            <v-card-text class="pt-6">
                <v-form ref="formRef" v-model="validForm">
                     <div v-if="dialog.type === 'PERMIT'" class="mb-4">
                        <label class="text-subtitle-2 font-weight-bold mb-2 d-block text-white">Duración del Permiso</label>
                        <v-btn-toggle v-model="form.subType" color="secondary" mandatory divided class="w-100 border-thin">
                            <v-btn value="PERMIT_3H" class="flex-grow-1 text-white">3 Horas</v-btn>
                            <v-btn value="PERMIT_5H" class="flex-grow-1 text-white">5 Horas</v-btn>
                            <v-btn value="PERMIT_DAY" class="flex-grow-1 text-white">Día Completo</v-btn>
                        </v-btn-toggle>
                    </div>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="form.startDate" type="date" label="Desde" variant="outlined" :rules="[v => !!v || 'Requerido']" bg-color="#111936" base-color="#2e3852" color="white"></v-text-field>
                        </v-col>
                        <v-col cols="6" v-if="dialog.type !== 'PERMIT_3H' && dialog.type !== 'PERMIT_5H'">
                             <v-text-field v-model="form.endDate" type="date" label="Hasta" variant="outlined" :disabled="dialog.type === 'PERMIT'" bg-color="#111936" base-color="#2e3852" color="white"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-textarea v-model="form.reason" label="Motivo" variant="outlined" rows="3" :rules="[v => !!v || 'Requerido']" bg-color="#111936" base-color="#2e3852" color="white"></v-textarea>
                </v-form>
            </v-card-text>
            <v-card-actions class="pa-4 border-t-dark">
                <v-spacer></v-spacer>
                <v-btn variant="text" color="grey-lighten-1" @click="dialog.show = false">Cancelar</v-btn>
                <v-btn color="#635BFF" variant="flat" :loading="sending" @click="submitRequest" class="text-white">Enviar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        location="top right"
        variant="flat"
        elevation="10"
        timeout="4000"
        class="text-white font-weight-bold"
    >
        <div class="d-flex align-center">
            <v-icon start size="24" class="mr-2">{{ snackbar.icon }}</v-icon>
            {{ snackbar.message }}
        </div>

        <template v-slot:actions>
            <v-btn
                color="white"
                variant="text"
                icon="mdi-close"
                @click="snackbar.show = false"
                density="compact"
            ></v-btn>
        </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import axios from '@/utils/axios';

// --- ESTADO DE NOTIFICACIÓN ---
const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
    icon: 'mdi-check-circle'
});

const showNotify = (message, type = 'success') => {
    snackbar.value = {
        show: true,
        message,
        color: type === 'success' ? '#13DEB9' : '#FA896B',
        icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
    };
};

const breadcrumbs = ref([ { text: 'RH', disabled: false }, { text: 'Mis Vacaciones', disabled: true } ]);

const headers = [
    { title: 'Tipo', key: 'RequestType', align: 'start' },
    { title: 'Fechas', key: 'fechas', align: 'start' },
    { title: 'Duración (Días/Hrs)', key: 'DaysQuantity', align: 'center' }, 
    { title: 'Estado', key: 'Status', align: 'center' },
];

const employee = ref({});
const history = ref([]);
const sending = ref(false);
const validForm = ref(false);
const formRef = ref(null);

const dialog = ref({
    show: false,
    type: 'VACATION' 
});

const form = ref({
    startDate: null,
    endDate: null,
    reason: '',
    subType: 'PERMIT_DAY'
});

const loadData = async () => {
    try {
        const res = await axios.get('/rh/my-vacations');
        if (res.data.stats) employee.value = res.data.stats;
        if (res.data.history) history.value = res.data.history;
    } catch (e) { console.error(e); }
};

const submitRequest = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    sending.value = true;
    try {
        const payload = {
            type: dialog.value.type === 'PERMIT' ? form.value.subType : dialog.value.type,
            startDate: form.value.startDate,
            endDate: form.value.endDate || form.value.startDate,
            reason: form.value.reason
        };

        await axios.post('/rh/request-time-off', payload);
        
        showNotify('¡Solicitud enviada y notificada con éxito!', 'success');
        
        dialog.value.show = false;
        loadData(); 
    } catch (e) {
        console.error(e);
        showNotify('Error al procesar la solicitud', 'error');
    } finally {
        sending.value = false;
    }
};

const openRequestDialog = (type) => { dialog.value.type = type; form.value = { startDate: null, endDate: null, reason: '', subType: 'PERMIT_DAY' }; dialog.value.show = true; };
const getDialogTitle = () => { if(dialog.value.type === 'VACATION') return 'Solicitar Vacaciones'; if(dialog.value.type === 'PERMIT') return 'Solicitar Permiso'; return 'Canjear Días'; };
const getDialogIcon = () => { if(dialog.value.type === 'VACATION') return 'mdi-palm-tree'; if(dialog.value.type === 'PERMIT') return 'mdi-clock'; return 'mdi-cash'; };


const formatDuration = (item) => {
    if (item.RequestType === 'PERMIT_3H') return '3 Horas';
    if (item.RequestType === 'PERMIT_5H') return '5 Horas';
    
    if (item.DaysQuantity === 1) return '1 Día';
    if (item.DaysQuantity < 1 && item.DaysQuantity > 0) return 'Medio Día';
    return `${item.DaysQuantity} Días`;
};

const getTypeColor = (type) => { if (type === 'VACATION') return '#635BFF'; if (type === 'CASH_OUT') return '#FA896B'; if (type && type.includes('PERMIT')) return '#13DEB9'; return 'grey'; };
const getTypeLabel = (type) => { if (type === 'VACATION') return 'Vacaciones'; if (type === 'CASH_OUT') return 'Canje Efectivo'; if (type && type.includes('PERMIT')) return 'Permiso'; return type; };
const getStatusColor = (status) => { if (status === 'APPROVED') return 'success'; if (status === 'REJECTED') return 'error'; if (status === 'PENDING') return 'warning'; return 'grey'; };
const getStatusLabel = (status) => { if (status === 'APPROVED') return 'Autorizado'; if (status === 'REJECTED') return 'Rechazado'; if (status === 'PENDING') return 'Pendiente'; return status; };
const getStatusIcon = (status) => { if (status === 'APPROVED') return 'mdi-check-circle'; if (status === 'REJECTED') return 'mdi-close-circle'; if (status === 'PENDING') return 'mdi-clock-outline'; return 'mdi-minus-circle'; };
const formatDateShort = (d) => { if(!d) return '-'; return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year:'2-digit' }); };
const formatDate = (d) => { if(!d) return ''; return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }); };

onMounted(() => loadData());
</script>

<style scoped>
/* ESTILOS DARK BLUE THEME */
.bg-dark-canvas {
    background-color: #111936 !important;
}
.card-dark-blue {
    background-color: #1A223F !important;
    border: 1px solid #2e3852;
}
.border-thin {
    border: 1px solid #2e3852;
}
.border-b-dark {
    border-bottom: 1px solid #2e3852;
}
.border-t-dark {
    border-top: 1px solid #2e3852;
}
.bg-transparent {
    background-color: transparent !important;
}

/* Hover en tabla */
:deep(.v-data-table__tr:hover) {
    background-color: #202a4d !important;
}
</style>
