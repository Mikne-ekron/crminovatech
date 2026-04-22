<template>
    <v-container fluid class="page-wrapper">
        <!-- <BaseBreadcrumb title="Calendario de Equipo" :breadcrumbs="breadcrumbs"></BaseBreadcrumb> -->
        <PageHeader title="Calendario de Equipo" :breadcrumbs="breadcrumbs" />
        
        <v-card elevation="10" class="rounded-lg">
            <div class="pa-4 d-flex align-center justify-space-between border-b">
                <v-btn icon="mdi-chevron-left" variant="text" @click="changeMonth(-1)"></v-btn>
                <h2 class="text-h5 font-weight-bold text-uppercase">{{ currentMonthName }} {{ currentYear }}</h2>
                <v-btn icon="mdi-chevron-right" variant="text" @click="changeMonth(1)"></v-btn>
            </div>

            <v-row no-gutters class="bg-grey-lighten-4 text-center py-2 font-weight-bold">
                <v-col v-for="day in ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']" :key="day" cols class="text-caption">
                    {{ day }}
                </v-col>
            </v-row>

            <div class="calendar-grid">
                <div v-for="blank in blankDays" :key="'blank-'+blank" class="calendar-cell bg-grey-lighten-5"></div>
                
                <div v-for="day in daysInMonth" :key="day" class="calendar-cell border-e border-b pa-1 position-relative">
                    <div class="text-right text-caption font-weight-bold mr-1">{{ day }}</div>
                    
                    <div class="events-container mt-1">
                        <v-chip 
                            v-for="event in getEventsForDay(day)" 
                            :key="event.id"
                            size="x-small" 
                            :color="event.color" 
                            variant="flat" 
                            class="mb-1 w-100 justify-start px-1"
                            label
                        >
                            <span class="text-truncate">{{ event.employee }}</span>
                        </v-chip>
                    </div>
                </div>
            </div>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const breadcrumbs = ref([{ text: 'RH' }, { text: 'Calendario' }]);

// Mock Data (Debería venir de API)
const events = ref([
    { id: 1, employee: 'Juan Pérez', start: '2025-10-10', end: '2025-10-15', color: 'primary' },
    { id: 2, employee: 'Ana López', start: '2025-10-12', end: '2025-10-12', color: 'secondary' }
]);

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

const getEventsForDay = (day) => {
    const checkDate = new Date(currentYear.value, currentMonth.value, day);
    return events.value.filter(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        // Reset hours para comparar solo fechas
        start.setHours(0,0,0,0); end.setHours(0,0,0,0); checkDate.setHours(0,0,0,0);
        return checkDate >= start && checkDate <= end;
    });
};
</script>

<style scoped>
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    /* 5 o 6 filas dependiendo del mes */
    grid-auto-rows: minmax(100px, auto); 
}
.calendar-cell {
    min-height: 100px;
    transition: background-color 0.2s;
}
.calendar-cell:hover {
    background-color: #f5f5f5;
}
</style>
