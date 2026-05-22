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

    <!-- KPI Cards: embudo comercial Pipeline -> Backlog -> Revenue + Utilidad + Hit Rate -->
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="" v-for="(kpi, index) in kpis" :key="index" class="flex-grow-1">
        <v-card elevation="0" class="h-100 kpi-card border" :loading="loading" :style="{ borderTop: `3px solid ${kpi.accent}` }">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-overline font-weight-bold text-medium-emphasis">{{ kpi.title }}</span>
              <v-icon :color="kpi.color" size="22">{{ kpi.icon }}</v-icon>
            </div>
            <h3 class="text-h5 font-weight-bold">{{ kpi.value }}</h3>
            <div v-if="kpi.secondary" class="text-subtitle-2 font-weight-bold" :class="`text-${kpi.color}`">
              {{ kpi.secondary }}
            </div>
            <div class="mt-1 text-caption text-medium-emphasis">{{ kpi.subtitle }}</div>
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
    title: 'Pipeline',
    value: '$0',
    secondary: '',
    subtitle: 'Oportunidades activas (no cerradas)',
    icon: 'mdi-filter-variant',
    color: 'info',
    accent: '#2CABE3'
  },
  {
    title: 'Backlog',
    value: '$0',
    secondary: '',
    subtitle: 'Órdenes colocadas por facturar',
    icon: 'mdi-truck-fast-outline',
    color: 'purple',
    accent: '#725AF2'
  },
  {
    title: 'Revenue',
    value: '$0',
    secondary: '',
    subtitle: 'Venta real facturada (sin IVA, neta de NC)',
    icon: 'mdi-cash-check',
    color: 'success',
    accent: '#2CD07E'
  },
  {
    title: 'Utilidad',
    value: '$0',
    secondary: '0%',
    subtitle: 'Margen sobre venta real',
    icon: 'mdi-chart-areaspline',
    color: 'primary',
    accent: '#1B84FF'
  },
  {
    title: 'Hit Rate',
    value: '0%',
    secondary: '',
    subtitle: 'Cotizado convertido a OV (por monto)',
    icon: 'mdi-target',
    color: 'warning',
    accent: '#F6C000'
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
      label: 'Revenue',
      data: monthlyData.value.map(d => d.revenue),
      borderColor: '#2CD07E',
      backgroundColor: '#2CD07E',
      yAxisID: 'y',
      tension: 0.3,
    },
    {
      label: 'Utilidad',
      data: monthlyData.value.map(d => d.utilidad),
      borderColor: '#1B84FF',
      backgroundColor: '#1B84FF',
      yAxisID: 'y',
      tension: 0.3,
    },
    {
      label: 'Pipeline',
      data: monthlyData.value.map(d => d.pipeline),
      borderColor: '#2CABE3',
      backgroundColor: '#2CABE3',
      borderDash: [5, 4],
      yAxisID: 'y',
      tension: 0.3,
    },
    {
      label: 'Backlog',
      data: monthlyData.value.map(d => d.backlog),
      borderColor: '#725AF2',
      backgroundColor: '#725AF2',
      borderDash: [5, 4],
      yAxisID: 'y',
      tension: 0.3,
    },
    {
      label: 'Hit Rate %',
      data: monthlyData.value.map(d => d.hitRate),
      borderColor: '#F6C000',
      backgroundColor: '#F6C000',
      yAxisID: 'y1',
      tension: 0.3,
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
      max: 100,
      ticks: { callback: (value) => value + '%' }
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
        // 0 Pipeline, 1 Backlog, 2 Revenue, 3 Utilidad, 4 Hit Rate
        kpis.value[0].value = formatCurrency(data.pipeline);
        kpis.value[1].value = formatCurrency(data.backlog);
        kpis.value[2].value = formatCurrency(data.revenue);
        kpis.value[3].value = formatCurrency(data.utilidadMonto);
        kpis.value[3].secondary = `${data.utilidadPorc.toFixed(1)}% margen`;
        kpis.value[4].value = formatPercent(data.hitRate);
        kpis.value[4].secondary = `${formatCurrency(data.montoConvertido)} de ${formatCurrency(data.montoCotizado)}`;

        monthlyData.value = statsRes.data;

        const periodoStr = filters.value.month
            ? `${monthOptions.find(m => m.value === filters.value.month).text} ${filters.value.year}`
            : `Todo ${filters.value.year}`;
        kpis.value[2].subtitle = `Venta real · ${periodoStr}`;

    } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
    } finally {
        loading.value = false;
    }
};

const fetchSalespeople = async () => {
    try {
        const response = await axios.get('/crm/salespeople');
        // El endpoint devuelve [{id, name}] (consolidado multi-empresa); usamos nombres
        vendedorOptions.value = response.data.map(v => v.name || v);
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
