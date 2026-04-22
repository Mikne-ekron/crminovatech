<template>
  <v-container fluid class="page-wrapper">
    <!-- Header/Title -->
    <v-row class="mb-2">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold">Tablero de Control Comercial</h2>
        <p class="text-subtitle-1 text-medium-emphasis">Resumen de KPIs y desempeño</p>
      </v-col>
    </v-row>

    <!-- Filters Bar -->
    <v-card elevation="0" class="border mb-6">
      <v-card-text style="background: rgba(var(--v-theme-surface-variant), 0.05)">
        <v-row density="compact" align="center">
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.year"
              :items="yearOptions"
              label="Año"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchKPIs"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.month"
              :items="monthOptions"
              label="Mes"
              item-title="text"
              item-value="value"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              @update:model-value="fetchKPIs"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.tipo"
              :items="['Todos', 'Transaccional', 'Proyecto']"
              label="Tipo de Venta"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchKPIs"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.slpName"
              :items="['Todos', ...vendedorOptions]"
              label="Vendedor"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchKPIs"
            ></v-select>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn 
              color="primary" 
              prepend-icon="mdi-refresh" 
              variant="flat"
              @click="fetchKPIs" 
              :loading="loading"
            >
              Actualizar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- KPI Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="(kpi, index) in kpis" :key="index">
        <v-card elevation="0" class="h-100 kpi-card border" :loading="loading">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-overline font-weight-bold text-medium-emphasis">{{ kpi.title }}</span>
              <v-icon :color="kpi.color" size="24">{{ kpi.icon }}</v-icon>
            </div>
            <div class="d-flex align-end">
              <h3 class="text-h4 font-weight-bold mr-2">{{ kpi.value }}</h3>
              <span :class="[`text-${kpi.trendColor}`, 'text-caption', 'mb-1', 'font-weight-bold', 'd-flex', 'align-center']">
                <v-icon size="14" :color="kpi.trendColor" class="mr-1">{{ kpi.trendIcon }}</v-icon>
                {{ kpi.trend }}
              </span>
            </div>
            <div class="mt-2 text-caption text-medium-emphasis">{{ kpi.subtitle }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="border">
          <v-card-title class="d-flex align-center py-4 px-6">
            Avance Mensual
            <v-spacer></v-spacer>
            <v-btn variant="text" size="small" color="primary">Ver Detalle</v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <div style="height: 350px;">
              <Line :data="chartData" :options="chartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from '@/utils/axios';

// Chart.js Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const loading = ref(false);

const filters = ref({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(), // Mes actual por defecto
    slpName: 'Todos',
    tipo: 'Todos'
});

const vendedorOptions = ref([]);

const yearOptions = ['2023', '2024', '2025', '2026'];
const monthOptions = [
    { text: 'Enero', value: '1' },
    { text: 'Febrero', value: '2' },
    { text: 'Marzo', value: '3' },
    { text: 'Abril', value: '4' },
    { text: 'Mayo', value: '5' },
    { text: 'Junio', value: '6' },
    { text: 'Julio', value: '7' },
    { text: 'Agosto', value: '8' },
    { text: 'Septiembre', value: '9' },
    { text: 'Octubre', value: '10' },
    { text: 'Noviembre', value: '11' },
    { text: 'Diciembre', value: '12' },
];

const kpis = ref([
  {
    title: 'Utilidad Bruta',
    key: 'utilidadBruta',
    value: '$0',
    subtitle: 'Venta facturada',
    icon: 'mdi-cash-multiple',
    color: 'success',
    trend: 'En vivo',
    trendColor: 'success',
    trendIcon: 'mdi-pulse'
  },
  {
    title: 'Pipe Activo',
    key: 'pipeActivo',
    value: '$0',
    subtitle: 'Cotizaciones abiertas',
    icon: 'mdi-filter-outline',
    color: 'primary',
    trend: 'Pipeline',
    trendColor: 'info',
    trendIcon: 'mdi-chart-line'
  },
  {
    title: 'Hit Rate',
    key: 'hitRate',
    value: '0%',
    subtitle: 'Conversión de pedidos',
    icon: 'mdi-target',
    color: 'warning',
    trend: 'Eficiencia',
    trendColor: 'warning',
    trendIcon: 'mdi-trending-up'
  },
  {
    title: 'Cross-Selling',
    key: 'crossSelling',
    value: '0.0',
    subtitle: 'Categorías por cliente',
    icon: 'mdi-briefcase-search-outline',
    color: 'info',
    trend: 'Diversificación',
    trendColor: 'secondary',
    trendIcon: 'mdi-account-group'
  }
]);

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN',
        maximumFractionDigits: 0
    }).format(value);
};

const formatPercent = (value) => {
    return new Intl.NumberFormat('es-MX', { 
        style: 'percent', 
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
};

const monthlyData = ref([]);

const chartData = computed(() => ({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Utilidad Bruta',
      data: monthlyData.value.map(d => d.utilidad),
      borderColor: '#1e88e5',
      backgroundColor: '#1e88e5',
      yAxisID: 'y',
    },
    {
      label: 'Pipe Activo',
      data: monthlyData.value.map(d => d.pipe),
      borderColor: '#5e35b1',
      backgroundColor: '#5e35b1',
      yAxisID: 'y',
    },
    {
      label: 'Hit Rate %',
      data: monthlyData.value.map(d => d.hitRate),
      borderColor: '#43a047',
      backgroundColor: '#43a047',
      yAxisID: 'y1',
    },
    {
      label: 'Cross-Selling',
      data: monthlyData.value.map(d => d.crossSelling),
      borderColor: '#fb8c00',
      backgroundColor: '#fb8c00',
      yAxisID: 'y1',
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'Monto (MXN)' },
      ticks: {
          callback: (value) => '$' + value.toLocaleString()
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: { drawOnChartArea: false },
      title: { display: true, text: 'Hit Rate %' },
      min: 0,
      max: 100
    }
  },
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (context) => {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.dataset.yAxisID === 'y') {
            label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.parsed.y);
          } else {
            label += context.parsed.y.toFixed(1) + '%';
          }
          return label;
        }
      }
    }
  }
};

const fetchKPIs = async () => {
    loading.value = true;
    try {
        const params = {
            year: filters.value.year,
            month: filters.value.month,
            slpName: filters.value.slpName,
            tipo: filters.value.tipo
        };

        const [kpiRes, statsRes] = await Promise.all([
            axios.get('/crm/dashboard/kpis', { params }),
            axios.get('/crm/dashboard/monthly-stats', { params: { ...params } })
        ]);

        const data = kpiRes.data;
        kpis.value[0].value = formatCurrency(data.utilidadBruta);
        kpis.value[1].value = formatCurrency(data.pipeActivo);
        kpis.value[2].value = formatPercent(data.hitRate);
        kpis.value[3].value = data.crossSelling.toFixed(2);
        
        monthlyData.value = statsRes.data;

        // Actualizar subtítulos
        const periodoStr = filters.value.month 
            ? `${monthOptions.find(m => m.value === filters.value.month).text} ${filters.value.year}`
            : `Todo ${filters.value.year}`;
        
        kpis.value[0].subtitle = `Facturado ${periodoStr}`;
        kpis.value[1].subtitle = `Abierto ${periodoStr}`;

    } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
    } finally {
        loading.value = false;
    }
};

const fetchSalespeople = async () => {
    try {
        const response = await axios.get('/crm/salespeople');
        vendedorOptions.value = response.data;
    } catch (error) {
        console.error("Error al cargar vendedores:", error);
    }
};

onMounted(async () => {
    await fetchSalespeople();
    await fetchKPIs();
});
</script>

<style scoped>
.kpi-card {
  transition: all 0.3s ease;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}
</style>
