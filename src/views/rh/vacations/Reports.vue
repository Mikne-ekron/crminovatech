<template>
  <v-container fluid class="page-wrapper bg-dark-canvas">
    <PageHeader title="Reportes de Ausencias" :breadcrumbs="breadcrumbs" />

    <v-card elevation="0" class="card-dark-blue border-thin mb-6">
        <div class="pa-4 border-b-dark d-flex align-center header-dark-blue">
            <v-icon start color="primary" class="mr-2">mdi-filter-variant</v-icon>
            <span class="text-white font-weight-bold">Filtros de Búsqueda</span>
        </div>
        
        <div class="pa-4 bg-transparent">
          <div class="d-flex flex-wrap align-center ga-3">
             <div style="width: 200px;">
                 <v-select 
                    label="Tipo de Solicitud" 
                    v-model="filters.requestType"
                    :items="['Todos', 'Vacaciones', 'Permisos', 'Canjes']" 
                    variant="outlined" density="compact" 
                    bg-color="#1A223F" base-color="#2e3852" color="white"
                    hide-details
                 ></v-select>
             </div>
            
             <div style="width: 250px;">
                 <v-autocomplete
                    label="Buscar Empleado"
                    v-model="filters.employeeId"
                    :items="employeesList"
                    item-title="FullName"
                    item-value="EmployeeID"
                    variant="outlined" density="compact"
                    bg-color="#1A223F" base-color="#2e3852" color="white"
                    clearable
                    hide-details
                    no-data-text="No encontrado"
                 ></v-autocomplete>
             </div>

             <div style="width: 155px;">
                 <v-text-field 
                    type="date" label="Desde" v-model="filters.startDate"
                    variant="outlined" density="compact" 
                    bg-color="#1A223F" base-color="#2e3852" color="white"
                    hide-details
                ></v-text-field>
             </div>
             
             <div style="width: 155px;">
                 <v-text-field 
                    type="date" label="Hasta" v-model="filters.endDate"
                    variant="outlined" density="compact" 
                    bg-color="#1A223F" base-color="#2e3852" color="white"
                    hide-details
                ></v-text-field>
             </div>

             <div class="d-flex ga-2 ml-sm-auto">
                <v-btn variant="text" color="grey" @click="clearFilters" size="small">Limpiar</v-btn>
                <v-btn color="primary" prepend-icon="mdi-magnify" @click="generateReport" :loading="loading" size="small">Generar Reporte</v-btn>
             </div>
          </div>
        </div>
    </v-card>

    <v-card elevation="0" class="card-dark-blue border-thin">
        <v-toolbar color="transparent" density="compact" class="border-b-dark px-2">
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">
                Resultados encontrados: <span class="text-primary">{{ reportData.length }}</span>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            
            <div v-if="reportData.length > 0">
                <v-btn color="#1D6F42" variant="flat" prepend-icon="mdi-microsoft-excel" class="mr-2 text-white" @click="exportToExcel">
                    Excel
                </v-btn>
                <v-btn color="#F40F02" variant="flat" prepend-icon="mdi-file-pdf-box" class="text-white" @click="exportToPDF">
                    PDF
                </v-btn>
            </div>
        </v-toolbar>
        
        <v-data-table 
            :headers="reportHeaders" 
            :items="reportData" 
            density="comfortable" 
            class="bg-transparent dark-table" 
            hover
            :loading="loading"
            no-data-text="Selecciona filtros y genera un reporte."
        >
             <template v-slot:item.FullName="{ item }">
                <div class="py-2">
                    <div class="font-weight-bold text-white">{{ item.FullName }}</div>
                    <div class="text-caption text-grey">{{ item.Department }}</div>
                </div>
             </template>

             <template v-slot:item.RequestType="{ item }">
                 <v-chip size="x-small" :color="getTypeColor(item.RequestType)" variant="flat" class="font-weight-bold">
                    {{ getTypeLabel(item.RequestType) }}
                 </v-chip>
             </template>

             <template v-slot:item.DaysQuantity="{ item }">
                 <div class="text-body-2 font-weight-medium text-white">
                    {{ formatDurationPrecise(item) }}
                 </div>
             </template>

             <template v-slot:item.StartDate="{ item }">
                 <span class="text-grey-lighten-1">{{ formatDateShort(item.StartDate) }}</span>
             </template>
             <template v-slot:item.EndDate="{ item }">
                 <span class="text-grey-lighten-1">{{ formatDateShort(item.EndDate) }}</span>
             </template>

             <template v-slot:item.Status="{ item }">
                <v-chip size="x-small" :color="getStatusColor(item.Status)" variant="tonal" class="font-weight-bold">
                    {{ getStatusLabel(item.Status) }}
                </v-chip>
            </template>
        </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import axios from '@/utils/axios';
import * as XLSX from 'xlsx'; // Importar librería Excel
import jsPDF from 'jspdf';    // Importar librería PDF
import autoTable from 'jspdf-autotable'; // Plugin tablas PDF

const breadcrumbs = ref([{ text: 'RH' }, { text: 'Reportes' }]);
const panelOpen = ref(0);
const loading = ref(false);

const employeesList = ref([]);
const reportData = ref([]);

const filters = ref({
    requestType: 'Todos',
    employeeId: null,
    startDate: null,
    endDate: null
});

const reportHeaders = [
    { title: 'Folio', key: 'RequestID' },
    { title: 'Empleado', key: 'FullName' }, // Incluye Depto visualmente
    { title: 'Tipo', key: 'RequestType' },
    { title: 'Detalle/Duración', key: 'DaysQuantity' }, // Columna Precisa
    { title: 'Inicio', key: 'StartDate' },
    { title: 'Fin', key: 'EndDate' },
    { title: 'Estado', key: 'Status' },
];

// --- API Calls ---
const loadEmployees = async () => {
    try {
        const res = await axios.get('/rh/employees-list');
        employeesList.value = res.data;
    } catch (e) { console.error(e); }
};

const generateReport = async () => {
    loading.value = true;
    try {
        const res = await axios.post('/rh/reports/generate', filters.value);
        reportData.value = res.data;
        panelOpen.value = null; // Cerrar acordeón al buscar
    } catch (e) {
        console.error(e);
        alert("Error generando reporte");
    } finally {
        loading.value = false;
    }
};

const clearFilters = () => {
    filters.value = { requestType: 'Todos', employeeId: null, startDate: null, endDate: null };
    reportData.value = [];
};

// --- EXPORTAR EXCEL ---
const exportToExcel = () => {
    // 1. Mapear datos para que el Excel sea legible (no códigos)
    const dataForExcel = reportData.value.map(item => ({
        Folio: item.RequestID,
        Empleado: item.FullName,
        Departamento: item.Department,
        Tipo: getTypeLabel(item.RequestType),
        Detalle: formatDurationPrecise(item), // Usar la función precisa
        Inicio: formatDateShort(item.StartDate),
        Fin: formatDateShort(item.EndDate),
        Estado: getStatusLabel(item.Status),
        Motivo: item.Reason
    }));

    // 2. Crear Hoja y Libro
    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Ausencias");

    // 3. Descargar
    XLSX.writeFile(wb, `Reporte_Ausencias_${new Date().toISOString().slice(0,10)}.xlsx`);
};

// --- EXPORTAR PDF ---
const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Ausencias", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

    // Definir columnas y filas
    const tableColumn = ["Folio", "Empleado", "Depto", "Tipo", "Detalle", "Fechas", "Estado"];
    const tableRows = [];

    reportData.value.forEach(item => {
        const rowData = [
            item.RequestID,
            item.FullName,
            item.Department,
            getTypeLabel(item.RequestType),
            formatDurationPrecise(item),
            `${formatDateShort(item.StartDate)} - ${formatDateShort(item.EndDate)}`,
            getStatusLabel(item.Status)
        ];
        tableRows.push(rowData);
    });

    // Generar Tabla
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [21, 101, 192] } // Azul corporativo
    });

    doc.save(`Reporte_Ausencias_${new Date().toISOString().slice(0,10)}.pdf`);
};

// --- HELPERS (Formato Preciso) ---

// Función clave para mostrar "3 Horas", "5 Días", etc.
const formatDurationPrecise = (item) => {
    if (item.RequestType === 'PERMIT_3H') return '3 Horas';
    if (item.RequestType === 'PERMIT_5H') return '5 Horas';
    
    // Si es día completo o vacaciones
    const days = item.DaysQuantity;
    if (days === 1) return '1 Día';
    if (days % 1 !== 0) return `${days} Días (Parcial)`; // Por si acaso
    return `${days} Días`;
};

const getTypeLabel = (type) => {
    if(type === 'VACATION') return 'Vacaciones';
    if(type && type.includes('PERMIT')) return 'Permiso';
    return 'Canje Efectivo';
};
const getTypeColor = (type) => {
    if(type === 'VACATION') return 'primary';
    if(type && type.includes('PERMIT')) return 'purple-lighten-2';
    return 'success';
};
const getStatusLabel = (status) => {
    const map = { 'APPROVED': 'Autorizado', 'REJECTED': 'Rechazado', 'PENDING': 'Pendiente', 'CANCELLED': 'Cancelado' };
    return map[status] || status;
};
const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    if (status === 'PENDING') return 'warning';
    return 'grey';
};
const formatDateShort = (d) => { 
    if(!d) return '-'; 
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' }); 
};

onMounted(() => {
    loadEmployees();
});
</script>

<style scoped>
/* Tema Dark Blue */
.bg-dark-canvas { background-color: #111936 !important; }
.card-dark-blue { background-color: #1A223F !important; color: white; }
.header-dark-blue { background-color: #1A223F !important; }
.border-thin { border: 1px solid #2e3852; }
.border-b-dark { border-bottom: 1px solid #2e3852; }
.bg-transparent { background-color: transparent !important; }

/* Tabla Hover */
:deep(.v-data-table__tr:hover) { background-color: #202a4d !important; }
:deep(.v-data-table-footer) { color: #b2b9c5; }
</style>
