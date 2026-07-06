<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Tesorería — Caja Chica"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Resumen', href: '#' }
      ]"
    />

    <!-- Accesos rápidos -->
    <v-row class="mb-2">
      <v-col cols="12" md="3"><v-card class="rounded-lg cursor-pointer card-dark-blue" elevation="0" style="border-bottom:4px solid #4caf50" @click="go('IngresosTes')"><v-card-text class="pa-5 d-flex align-center ga-4"><v-btn icon class="bg-success elevation-0"><v-icon>mdi-cash-plus</v-icon></v-btn><div><h2 class="text-h5 text-primary">Ingresos</h2><p class="text-medium-emphasis text-15">Conciliar facturas</p></div></v-card-text></v-card></v-col>
      <v-col cols="12" md="3"><v-card class="rounded-lg cursor-pointer card-dark-blue" elevation="0" style="border-bottom:4px solid #ff5252" @click="go('EgresosTes')"><v-card-text class="pa-5 d-flex align-center ga-4"><v-btn icon class="bg-error elevation-0"><v-icon>mdi-cash-minus</v-icon></v-btn><div><h2 class="text-h5 text-primary">Egresos</h2><p class="text-medium-emphasis text-15">Gastos por sobre</p></div></v-card-text></v-card></v-col>
      <v-col cols="12" md="3"><v-card class="rounded-lg cursor-pointer card-dark-blue" elevation="0" style="border-bottom:4px solid #ffc107" @click="go('MonitorSobres')"><v-card-text class="pa-5 d-flex align-center ga-4"><v-btn icon class="bg-warning elevation-0"><v-icon>mdi-swap-horizontal</v-icon></v-btn><div><h2 class="text-h5 text-primary">Sobres</h2><p class="text-medium-emphasis text-15">Saldos y traspasos</p></div></v-card-text></v-card></v-col>
      <v-col cols="12" md="3"><v-card class="rounded-lg cursor-pointer card-dark-blue" elevation="0" style="border-bottom:4px solid #03c9d7" @click="go('ReportesTes')"><v-card-text class="pa-5 d-flex align-center ga-4"><v-btn icon class="bg-info elevation-0"><v-icon>mdi-file-chart</v-icon></v-btn><div><h2 class="text-h5 text-primary">Reportes</h2><p class="text-medium-emphasis text-15">Estado de cuenta</p></div></v-card-text></v-card></v-col>
    </v-row>

    <!-- KPIs -->
    <v-row dense>
      <v-col cols="6" md="2"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Saldo Global</p><h3 class="text-h5 text-primary">{{ money(resumen.saldoGlobal) }}</h3></v-card-text></v-card></v-col>
      <v-col cols="6" md="2"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Por cobrar</p><h3 class="text-h5 text-warning">{{ money(resumen.conciliacion.porCobrar) }}</h3></v-card-text></v-card></v-col>
      <v-col cols="6" md="2"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Ingresos Hoy</p><h3 class="text-h5 text-success">{{ money(resumen.kpis.ingresoHoy) }}</h3></v-card-text></v-card></v-col>
      <v-col cols="6" md="2"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Egresos Hoy</p><h3 class="text-h5 text-error">{{ money(resumen.kpis.egresoHoy) }}</h3></v-card-text></v-card></v-col>
      <v-col cols="6" md="2"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Ingreso Mes</p><h3 class="text-h6 text-white">{{ money(resumen.kpis.ingresoMes) }}</h3></v-card-text></v-card></v-col>
      <v-col cols="6" md="2"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Egreso Mes</p><h3 class="text-h6 text-white">{{ money(resumen.kpis.egresoMes) }}</h3></v-card-text></v-card></v-col>
    </v-row>

    <!-- Saldos por sobre + alerta de conciliación -->
    <v-row class="mt-2">
      <v-col cols="12" md="7">
        <v-card class="rounded-lg card-dark-blue" elevation="0">
          <v-card-title class="header-dark-blue border-b-dark py-3"><v-icon start class="text-primary">mdi-wallet</v-icon>Saldos por sobre</v-card-title>
          <v-table density="compact" class="bg-transparent dark-table">
            <tbody>
              <tr v-for="s in resumen.sobres" :key="s.id">
                <td>{{ s.nombre }}</td>
                <td class="text-right font-weight-bold" :class="Number(s.saldo)<0 ? 'text-error' : 'text-primary'">{{ money(s.saldo) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card class="rounded-lg card-dark-blue" elevation="0">
          <v-card-title class="header-dark-blue border-b-dark py-3"><v-icon start class="text-warning">mdi-alert-decagram</v-icon>Conciliación</v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between mb-2"><span class="text-light-muted">Facturas abiertas</span><strong>{{ resumen.conciliacion.facturasAbiertas }}</strong></div>
            <div class="d-flex justify-space-between mb-2"><span class="text-light-muted">En rojo (sin abono)</span><strong class="text-error">{{ resumen.conciliacion.enRojo }}</strong></div>
            <div class="d-flex justify-space-between mb-2"><span class="text-light-muted">Parciales</span><strong class="text-warning">{{ resumen.conciliacion.parciales }}</strong></div>
            <v-divider class="my-2 border-b-dark" />
            <div class="d-flex justify-space-between"><span>Total por cobrar</span><strong class="text-warning text-h6">{{ money(resumen.conciliacion.porCobrar) }}</strong></div>
            <v-btn class="mt-3" block color="primary" variant="tonal" @click="go('IngresosTes')">Ir a conciliar</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const router = useRouter();
const snack = ref({ show: false, text: '', color: 'success' });
const resumen = ref({ saldoGlobal: 0, sobres: [], kpis: {}, conciliacion: { porCobrar: 0, facturasAbiertas: 0, enRojo: 0, parciales: 0 } });

const fetchResumen = async () => {
  try {
    const r = await axios.get('/tesoreria/resumen');
    resumen.value = r.data;
  } catch (e) { snack.value = { show: true, text: 'Error cargando resumen', color: 'error' }; }
};

const go = (name) => router.push({ name });
const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);

onMounted(fetchResumen);
</script>
