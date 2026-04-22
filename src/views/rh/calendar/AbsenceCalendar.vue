<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <PageHeader title="Calendario de Ausencias" :breadcrumbs="breadcrumbs" />

    <v-row>
      <v-col cols="12">
        <v-card elevation="0" class="rounded-lg overflow-hidden card-dark-blue">
            
            <div class="pa-4 d-flex flex-wrap align-center justify-space-between header-dark-blue">
                <div class="d-flex align-center gap-3">
                    <v-btn icon="mdi-chevron-left" variant="text" color="white" @click="changeMonth(-1)"></v-btn>
                    <h2 class="text-h5 font-weight-bold text-white mx-2 text-capitalize" style="min-width: 200px; text-align: center;">
                        {{ currentMonthName }} <span style="color: #635BFF">{{ currentYear }}</span>
                    </h2>
                    <v-btn icon="mdi-chevron-right" variant="text" color="white" @click="changeMonth(1)"></v-btn>
                </div>
                
                <div class="d-none d-md-flex gap-6 align-center">
                    <div class="d-flex align-center gap-2">
                        <v-badge dot inline color="#635BFF"></v-badge>
                        <span class="text-caption font-weight-bold text-grey-lighten-1">Vacaciones</span>
                    </div>
                    <div class="d-flex align-center gap-2">
                        <v-badge dot inline color="#13DEB9"></v-badge>
                        <span class="text-caption font-weight-bold text-grey-lighten-1">Permisos</span>
                    </div>
                    <div class="d-flex align-center gap-2">
                        <v-badge dot inline color="#FA896B"></v-badge>
                        <span class="text-caption font-weight-bold text-grey-lighten-1">Canjes</span>
                    </div>
                </div>
            </div>

            <div class="calendar-header-grid py-3 border-b-dark" style="background-color: #1A223F;">
                <div v-for="day in ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']" :key="day" 
                     class="text-center font-weight-bold text-caption text-grey">
                    {{ day }}
                </div>
            </div>

            <div class="calendar-grid">
                <div v-for="blank in blankDays" :key="'blank-'+blank" class="calendar-cell cell-empty"></div>
                
                <div 
                    v-for="day in daysInMonth" 
                    :key="day" 
                    class="calendar-cell pa-2 cursor-pointer transition-swing position-relative"
                    :class="{'selected-cell': isSelected(day), 'today-cell': isToday(day)}"
                    @click="selectDate(day)"
                >
                    <div class="d-flex justify-space-between align-start mb-1">
                        <div 
                            class="day-number text-caption font-weight-bold d-flex align-center justify-center"
                            :class="isToday(day) ? 'today-badge elevation-4' : 'text-grey-lighten-2'"
                        >
                            {{ day }}
                        </div>
                        <v-icon v-if="getEventsForDay(day).length > 3" size="14" color="grey">mdi-dots-horizontal</v-icon>
                    </div>
                    
                    <div class="events-stack">
                        <v-chip 
                            v-for="(event, i) in getEventsForDay(day).slice(0, 3)" 
                            :key="i"
                            size="x-small" 
                            :color="getEventColor(event.RequestType)" 
                            variant="flat" 
                            class="w-100 justify-start px-2 mb-1 event-chip"
                            label
                        >
                            <span class="text-truncate font-weight-bold text-white" style="font-size: 10px !important;">
                                {{ event.FullName.split(' ')[0] }}
                            </span>
                        </v-chip>
                    </div>
                </div>
            </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-slide-y-transition>
            <v-card v-if="selectedDayEvents.length > 0 || isSelected(selectedDate.getDate())" 
                    elevation="0" 
                    class="rounded-lg mt-4 card-dark-blue border-top-accent">
                
                <v-card-item class="py-5 px-6">
                    <div class="d-flex justify-space-between align-center">
                        <div>
                            <div class="d-flex align-center gap-2 mb-1">
                                <v-icon color="#635BFF" size="small">mdi-calendar-blank</v-icon>
                                <span class="text-overline font-weight-bold" style="color: #635BFF">DETALLE DEL DÍA</span>
                            </div>
                            <h3 class="text-h4 font-weight-bold text-white text-capitalize">
                                {{ formatDateLong(selectedDate) }}
                            </h3>
                        </div>
                        
                        <div class="text-right d-none d-sm-block">
                            <div class="text-h3 font-weight-black" style="color: #635BFF">{{ selectedDayEvents.length }}</div>
                            <div class="text-caption font-weight-bold text-grey text-uppercase">Ausencias</div>
                        </div>
                    </div>
                </v-card-item>

                <v-divider class="border-opacity-100" style="border-color: #2e3852 !important"></v-divider>

                <v-data-table
                    :headers="headers"
                    :items="selectedDayEvents"
                    density="comfortable"
                    class="bg-transparent dark-table"
                    no-data-text="No hay ausencias programadas para este día."
                    hover
                >
                    <template v-slot:item.FullName="{ item }">
                        <div class="d-flex align-center py-2">
                            <v-avatar color="#252b48" variant="flat" size="40" class="mr-3 rounded-circle border-thin">
                                <span class="text-h6 font-weight-bold text-white">{{ item.FullName.charAt(0) }}</span>
                            </v-avatar>
                            <div>
                                <div class="font-weight-bold text-body-2 text-white">{{ item.FullName }}</div>
                                <div class="text-caption text-grey">{{ item.JobTitle }}</div>
                            </div>
                        </div>
                    </template>

                    <template v-slot:item.RequestType="{ item }">
                        <v-chip size="small" :color="getEventColor(item.RequestType)" class="font-weight-bold px-3">
                            {{ getTypeLabel(item.RequestType) }}
                        </v-chip>
                    </template>

                    <template v-slot:item.Duration="{ item }">
                        <div class="text-body-2 text-grey-lighten-1">
                            Del <b class="text-white">{{ formatDateShort(item.StartDate) }}</b> 
                            al <b class="text-white">{{ formatDateShort(item.EndDate) }}</b>
                        </div>
                    </template>

                    <template v-slot:item.Reason="{ item }">
                        <div class="text-truncate text-caption text-grey" style="max-width: 250px;">
                            {{ item.Reason }}
                        </div>
                    </template>
                </v-data-table>
            </v-card>
        </v-slide-y-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import axios from '@/utils/axios'; 

const breadcrumbs = ref([{ text: 'RH' }, { text: 'Calendario de Ausencias' }]);

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(new Date()); 
const events = ref([]);

const headers = [
    { title: 'Empleado', key: 'FullName', align: 'start' },
    { title: 'Departamento', key: 'Department', align: 'start' },
    { title: 'Tipo', key: 'RequestType', align: 'start' },
    { title: 'Periodo Completo', key: 'Duration', align: 'start' },
    { title: 'Motivo', key: 'Reason', align: 'start' },
];

const loadEvents = async () => {
    try {
        const res = await axios.get('/rh/calendar-events');
        events.value = res.data;
    } catch (e) { console.error(e); }
};

const currentMonthName = computed(() => {
    return new Date(currentYear.value, currentMonth.value).toLocaleString('es-MX', { month: 'long' });
});

const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate());
const blankDays = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay());

const changeMonth = (step) => {
    let newMonth = currentMonth.value + step;
    if(newMonth > 11) { currentMonth.value = 0; currentYear.value++; }
    else if(newMonth < 0) { currentMonth.value = 11; currentYear.value--; }
    else { currentMonth.value = newMonth; }
};

const selectDate = (day) => {
    selectedDate.value = new Date(currentYear.value, currentMonth.value, day);
};

const getEventsForDay = (day) => {
    const checkDate = new Date(currentYear.value, currentMonth.value, day);
    checkDate.setHours(0,0,0,0);
    return events.value.filter(e => {
        const start = new Date(e.StartDate); start.setHours(0,0,0,0);
        const end = new Date(e.EndDate); end.setHours(0,0,0,0);
        return checkDate >= start && checkDate <= end;
    });
};

const selectedDayEvents = computed(() => getEventsForDay(selectedDate.value.getDate()));

const isSelected = (day) => {
    const d = new Date(currentYear.value, currentMonth.value, day);
    return d.toDateString() === selectedDate.value.toDateString();
};

const isToday = (day) => {
    const d = new Date(currentYear.value, currentMonth.value, day);
    return d.toDateString() === new Date().toDateString();
};

// COLORES TOMADOS DE TU ARCHIVO FullCalender.vue
const getEventColor = (type) => {
    if(type === 'VACATION') return '#635BFF'; // Primary del template
    if(type && type.includes('PERMIT')) return '#13DEB9'; // Success del template (o similar a ReactJs color)
    return '#FA896B'; // Naranja/Error
};

const getTypeLabel = (type) => {
    if(type === 'VACATION') return 'Vacaciones';
    if(type && type.includes('PERMIT')) return 'Permiso';
    return 'Canje';
};

const formatDateLong = (date) => {
    return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateShort = (d) => { 
    if(!d) return '-'; 
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).replace('.', ''); 
};

onMounted(() => loadEvents());
</script>

<style scoped>
/* =========================================
   PALETA DE COLORES DARK BLUE THEME
   Basado en la estética de AdminPro/MaterialPro Dark
   ========================================= */

/* Fondo de la página (Deep Navy) */
.bg-dark-canvas {
    background-color: #111936 !important;
}

/* Fondo de las tarjetas (Lighter Navy) */
.card-dark-blue {
    background-color: #1A223F !important;
    color: white;
    border: 1px solid #2e3852;
}

/* Header de la tarjeta */
.header-dark-blue {
    background-color: #1A223F;
}

.border-b-dark {
    border-bottom: 1px solid #2e3852;
}

/* GRID DEL CALENDARIO */
.calendar-header-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: minmax(120px, auto); /* Más altura para elegancia */
    /* El GAP define el color del borde */
    gap: 1px; 
    background-color: #2e3852; /* Color de las líneas divisorias */
    border-bottom: 1px solid #2e3852;
}

/* Celdas individuales */
.calendar-cell {
    background-color: #1A223F; /* Mismo color que la tarjeta */
    transition: background-color 0.2s ease;
}

/* Celdas vacías (mes anterior/siguiente) */
.cell-empty {
    background-color: #171e37; /* Ligeramente más oscuro */
    opacity: 0.5;
}

.calendar-cell:hover {
    background-color: #202a4d; /* Hover sutil */
    z-index: 2;
}

/* CELDA SELECCIONADA */
.selected-cell {
    background-color: #1f294d !important; 
    box-shadow: inset 0 0 0 2px #635BFF; /* Primary Color border inside */
}

/* DÍA DE HOY (Badge) */
.day-number {
    width: 26px;
    height: 26px;
    border-radius: 50%;
}
.today-badge {
    background-color: #635BFF; /* Primary Color */
    color: white;
}

/* Chips de eventos */
.events-stack {
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.event-chip {
    border-radius: 4px;
}

/* TABLA DE DETALLES */
.border-top-accent {
    border-top: 4px solid #635BFF;
}

.bg-transparent {
    background-color: transparent !important;
}

/* Ajustes finos para la tabla en modo dark manual */
:deep(.v-data-table__tr:hover) {
    background-color: #202a4d !important;
}
:deep(.v-data-table-footer) {
    color: #b2b9c5;
}
</style>
