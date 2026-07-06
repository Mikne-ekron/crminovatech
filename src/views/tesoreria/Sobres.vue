<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Monitor de Sobres"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Sobres', href: '#' }
      ]"
    />

    <!-- ================= VISTA LISTA ================= -->
    <template v-if="!selected">
      <!-- Resumen -->
      <v-row dense class="mb-1">
        <v-col cols="12" sm="4">
          <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="d-flex align-center ga-4 py-4">
            <v-avatar color="primary" variant="tonal" size="48"><v-icon>mdi-wallet-outline</v-icon></v-avatar>
            <div><div class="text-h5 font-weight-bold">{{ sobres.length }}</div><div class="text-caption text-light-muted">Sobres</div></div>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="d-flex align-center ga-4 py-4">
            <v-avatar color="success" variant="tonal" size="48"><v-icon>mdi-cash-multiple</v-icon></v-avatar>
            <div><div class="text-h5 font-weight-bold" :class="saldoTotal<0?'text-error':''">{{ money(saldoTotal) }}</div><div class="text-caption text-light-muted">Saldo total</div></div>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="d-flex align-center ga-4 py-4">
            <v-avatar color="info" variant="tonal" size="48"><v-icon>mdi-swap-horizontal</v-icon></v-avatar>
            <div><div class="text-h5 font-weight-bold">{{ rawTransactions.length }}</div><div class="text-caption text-light-muted">Movimientos</div></div>
          </v-card-text></v-card>
        </v-col>
      </v-row>

      <div class="d-flex align-center mb-3 mt-2">
        <div class="text-subtitle-1 text-medium-emphasis">Selecciona un sobre para ver su detalle</div>
        <v-spacer />
        <v-text-field v-model="search" density="compact" variant="solo-filled" flat hide-details
          placeholder="Buscar sobre…" prepend-inner-icon="mdi-magnify" style="max-width:240px" />
      </div>

      <v-row>
        <v-col v-for="s in sobresFiltrados" :key="s.id" cols="12" sm="6" md="4" lg="3">
          <v-card elevation="0" class="rounded-xl sobre-card card-dark-blue h-100" @click="enter(s)"
            :style="`border-left: 4px solid ${accent(s.saldo)}`">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-4">
                <v-avatar :color="accentName(s.saldo)" variant="tonal" size="44">
                  <v-icon>{{ s.es_entrada ? 'mdi-inbox-arrow-down' : 'mdi-email-outline' }}</v-icon>
                </v-avatar>
                <div class="d-flex ga-1">
                  <v-chip v-if="s.es_entrada" size="x-small" color="info" variant="tonal">Entrada</v-chip>
                  <v-icon v-if="s.no_eliminable" size="16" class="text-light-muted" title="No eliminable">mdi-lock</v-icon>
                </div>
              </div>

              <div class="text-subtitle-1 font-weight-bold text-truncate">{{ s.nombre }}</div>
              <div class="text-caption text-light-muted text-truncate mb-3" :title="s.descripcion">{{ s.descripcion || 'Sin descripción' }}</div>

              <div class="text-h5 font-weight-bold mb-1" :class="Number(s.saldo)<0?'text-error':'text-primary'">{{ money(s.saldo) }}</div>

              <v-divider class="border-b-dark my-3" />

              <div class="d-flex justify-space-between align-center">
                <div class="d-flex ga-3">
                  <div class="text-center">
                    <div class="text-caption text-success font-weight-bold">{{ statFor(s.nombre).count }}</div>
                    <div class="text-caption text-light-muted" style="font-size:10px">movs</div>
                  </div>
                </div>
                <span class="text-caption text-primary font-weight-bold text-uppercase d-flex align-center">
                  Ver detalle <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col v-if="!loading && !sobresFiltrados.length" cols="12">
          <div class="text-center text-light-muted py-10">
            <v-icon size="56" class="mb-2">mdi-email-off-outline</v-icon>
            <div>No hay sobres que coincidan.</div>
          </div>
        </v-col>
      </v-row>
    </template>

    <!-- ================= VISTA DETALLE ================= -->
    <template v-else>
      <div class="d-flex align-center flex-wrap ga-3 mb-4">
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-arrow-left" @click="back">Volver</v-btn>
        <v-avatar :color="accentName(selected.saldo)" variant="tonal" size="44">
          <v-icon>{{ selected.es_entrada ? 'mdi-inbox-arrow-down' : 'mdi-email-outline' }}</v-icon>
        </v-avatar>
        <div>
          <div class="text-h5 font-weight-bold d-flex align-center">
            {{ selected.nombre }}
            <v-chip v-if="selected.es_entrada" size="x-small" color="info" variant="tonal" class="ml-2">Entrada</v-chip>
          </div>
          <div class="text-caption text-light-muted">{{ selected.descripcion || 'Sin descripción' }}</div>
        </div>
      </div>

      <!-- Stats del sobre -->
      <v-row dense class="mb-2">
        <v-col cols="6" md="3">
          <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="text-center py-4">
            <div class="text-caption text-light-muted mb-1">Saldo actual</div>
            <div class="text-h5 font-weight-bold" :class="Number(selected.saldo)<0?'text-error':'text-primary'">{{ money(selected.saldo) }}</div>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="text-center py-4">
            <div class="text-caption text-light-muted mb-1">Entradas</div>
            <div class="text-h5 font-weight-bold text-success">{{ money(detalle.entradas) }}</div>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="text-center py-4">
            <div class="text-caption text-light-muted mb-1">Salidas</div>
            <div class="text-h5 font-weight-bold text-error">{{ money(detalle.salidas) }}</div>
          </v-card-text></v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card elevation="0" class="rounded-lg card-dark-blue"><v-card-text class="text-center py-4">
            <div class="text-caption text-light-muted mb-1">Movimientos</div>
            <div class="text-h5 font-weight-bold text-high-emphasis">{{ detalle.movs.length }}</div>
          </v-card-text></v-card>
        </v-col>
      </v-row>

      <v-card elevation="0" class="rounded-lg card-dark-blue">
        <v-toolbar color="transparent" density="comfortable" class="header-dark-blue border-b-dark px-4">
          <v-icon class="mr-2 text-primary">mdi-history</v-icon>
          <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Auxiliar de movimientos</v-toolbar-title>
          <v-spacer />
          <v-btn-toggle v-model="filtroMov" mandatory divided density="compact" color="primary">
            <v-btn value="Todos" size="small">Todos</v-btn>
            <v-btn value="entrada" size="small" class="text-success">Entradas</v-btn>
            <v-btn value="salida" size="small" class="text-error">Salidas</v-btn>
          </v-btn-toggle>
        </v-toolbar>
        <v-data-table :headers="movHeaders" :items="movsFiltrados" :loading="loading" density="compact"
          class="bg-transparent dark-table" :items-per-page="15" no-data-text="Sin movimientos en este sobre.">
          <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
          <template v-slot:item.tipo="{ item }"><v-chip size="x-small" :color="tipoColor(item.tipo)" variant="tonal" class="font-weight-bold">{{ item.tipo }}</v-chip></template>
          <template v-slot:item.entrada="{ item }"><span v-if="item.entrada>0" class="text-success font-weight-bold">+{{ money(item.entrada) }}</span><span v-else class="text-light-muted">-</span></template>
          <template v-slot:item.salida="{ item }"><span v-if="item.salida>0" class="text-error font-weight-bold">-{{ money(item.salida) }}</span><span v-else class="text-light-muted">-</span></template>
          <template v-slot:item.saldoAcumulado="{ item }"><strong class="text-primary">{{ money(item.saldoAcumulado) }}</strong></template>
        </v-data-table>
      </v-card>
    </template>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000" location="top right">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const loading = ref(false);
const sobres = ref([]);            // desde /tesoreria/sobres (incluye saldo)
const rawTransactions = ref([]);   // todas las operaciones
const selected = ref(null);
const search = ref('');
const filtroMov = ref('Todos');
const snack = ref({ show: false, text: '', color: 'success' });

const movHeaders = [
  { title: 'Fecha', key: 'fecha', width: '150px' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Contraparte', key: 'contraparte' },
  { title: 'Entrada', key: 'entrada', align: 'end' },
  { title: 'Salida', key: 'salida', align: 'end' },
  { title: 'Saldo', key: 'saldoAcumulado', align: 'end' },
  { title: 'Usuario', key: 'usuario' },
];

const saldoTotal = computed(() => sobres.value.reduce((a, s) => a + Number(s.saldo || 0), 0));
const sobresFiltrados = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return sobres.value;
  return sobres.value.filter(s => s.nombre.toLowerCase().includes(q));
});

// Estadística rápida por sobre para las tarjetas
const statFor = (nombre) => {
  let count = 0;
  rawTransactions.value.forEach(t => { if (t.sobre_origen === nombre || t.sobre_destino === nombre) count++; });
  return { count };
};

const load = async () => {
  loading.value = true;
  try {
    const [rs, ro] = await Promise.all([
      axios.get('/tesoreria/sobres'),
      axios.get('/tesoreria/operaciones'),
    ]);
    sobres.value = rs.data;
    rawTransactions.value = ro.data.map(item => ({
      id: item.id,
      fecha: item.fecha || item.created_at,
      concepto: item.concepto,
      tipo: item.tipo,
      monto: parseFloat(item.monto || 0),
      categoria: item.categoria,
      subcategoria: item.subcategoria,
      origen_ingreso: item.origen_ingreso,
      sobre_origen: item.sobre_origen,
      sobre_destino: item.sobre_destino,
      usuario: item.usuario,
    }));
  } catch (e) { snack.value = { show: true, text: 'Error cargando sobres', color: 'error' }; }
  finally { loading.value = false; }
};

const enter = (s) => { selected.value = s; filtroMov.value = 'Todos'; };
const back = () => { selected.value = null; };

// Detalle del sobre seleccionado: movimientos con saldo corrido + totales
const detalle = computed(() => {
  if (!selected.value) return { movs: [], entradas: 0, salidas: 0 };
  const nombre = selected.value.nombre;
  const filtered = rawTransactions.value.filter(t => t.sobre_origen === nombre || t.sobre_destino === nombre);
  filtered.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  let saldo = 0, entradas = 0, salidas = 0;
  const mapped = filtered.map(t => {
    const entra = t.sobre_destino === nombre ? t.monto : 0;
    const sale = t.sobre_origen === nombre ? t.monto : 0;
    saldo += entra - sale; entradas += entra; salidas += sale;
    let contraparte = '-';
    if (t.tipo === 'Traspaso') contraparte = entra ? `De: ${t.sobre_origen}` : `A: ${t.sobre_destino}`;
    else if (entra) contraparte = t.origen_ingreso || 'Ingreso';
    else contraparte = `${t.categoria || 'Gasto'}${t.subcategoria ? ' / ' + t.subcategoria : ''}`;
    return { ...t, entrada: entra, salida: sale, saldoAcumulado: saldo, contraparte };
  });
  return { movs: mapped.reverse(), entradas, salidas };
});

const movsFiltrados = computed(() => {
  if (filtroMov.value === 'entrada') return detalle.value.movs.filter(m => m.entrada > 0);
  if (filtroMov.value === 'salida') return detalle.value.movs.filter(m => m.salida > 0);
  return detalle.value.movs;
});

const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const tipoColor = (t) => t === 'Ingreso' ? 'success' : (t === 'Egreso' ? 'error' : 'warning');
const accent = (saldo) => Number(saldo) < 0 ? '#ff5252' : (Number(saldo) > 0 ? '#4caf50' : '#5b6b8c');
const accentName = (saldo) => Number(saldo) < 0 ? 'error' : (Number(saldo) > 0 ? 'success' : 'primary');

onMounted(load);
</script>

<style scoped>
.sobre-card { cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease; }
.sobre-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,0.35) !important; }
</style>
