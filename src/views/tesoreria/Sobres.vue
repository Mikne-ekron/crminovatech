<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    
    <v-row class="mb-2">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold">
          <v-icon icon="mdi-wallet-outline" class="mr-2 text-primary"></v-icon>
          Monitor de Sobres
        </h2>
        <div class="text-subtitle-1 text-medium-emphasis">Selecciona un sobre para ver su auxiliar de movimientos</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col 
        v-for="(saldo, nombreSobre) in saldosPorSobre" 
        :key="nombreSobre" 
        cols="12" sm="6" md="3"
      >
        <v-card 
          elevation="0" 
          class="cursor-pointer transition-swing rounded-xl card-dark-blue"
          :class="{'selected-sobre': selectedSobre === nombreSobre}"
          @click="selectedSobre = nombreSobre"
        >
          <v-card-item>
            <template v-slot:prepend>
               <v-icon 
                 size="48" 
                 :class="selectedSobre === nombreSobre ? 'text-primary' : 'text-primary'"
               >
                 mdi-email-multiple-outline
               </v-icon>
            </template>
            
            <v-card-title class="text-h6 font-weight-bold">
              {{ nombreSobre }}
            </v-card-title>
          </v-card-item>

          <v-card-text class="d-flex align-center justify-end pb-4 pr-6">
            <div class="text-h4 font-weight-bold">
              {{ formatCurrency(saldo) }}
            </div>
          </v-card-text>
          
          <v-divider class="border-b-dark" v-if="selectedSobre !== nombreSobre"></v-divider>
          <v-card-actions v-if="selectedSobre !== nombreSobre" class="justify-center">
             <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold">Ver Detalles</span>
          </v-card-actions>
           <v-card-actions v-else class="justify-center bg-primary">
             <v-icon size="small" class="mr-1 text-white">mdi-check-circle</v-icon>
             <span class="text-caption font-weight-bold text-white">Seleccionado</span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-expand-transition v-if="selectedSobre">
      <v-card class="mt-6 rounded-lg elevation-0 card-dark-blue" border>
        <v-toolbar density="comfortable" class="header-dark-blue border-b-dark">
          <v-toolbar-title class="text-h6 font-weight-bold text-primary">
            <v-icon icon="mdi-history" start></v-icon>
            Movimientos: <span>{{ selectedSobre }}</span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip color="primary" variant="flat" size="large" class="mr-4">
            Saldo Final: {{ formatCurrency(saldosPorSobre[selectedSobre]) }}
          </v-chip>
        </v-toolbar>

        <v-data-table
          :headers="headers"
          :items="transactionsFiltered"
          density="compact"
          class="bg-transparent dark-table"
        >
          <template v-slot:item.fecha="{ item }">
            <span class="text-light-muted">{{ formatDate(item.fecha) }}</span>
          </template>

          <template v-slot:item.entrada="{ item }">
            <span v-if="item.entrada > 0" class="text-success font-weight-bold">
              +{{ formatCurrency(item.entrada) }}
            </span>
            <span v-else class="text-light-muted">-</span>
          </template>

          <template v-slot:item.salida="{ item }">
            <span v-if="item.salida > 0" class="text-error font-weight-bold">
              -{{ formatCurrency(item.salida) }}
            </span>
            <span v-else class="text-light-muted">-</span>
          </template>

          <template v-slot:item.saldoAcumulado="{ item }">
            <strong class="text-primary">{{ formatCurrency(item.saldoAcumulado) }}</strong>
          </template>

          <template v-slot:item.tipo="{ item }">
             <v-chip size="x-small" :color="getTypeColor(item.tipo)" variant="tonal" class="font-weight-bold">{{ item.tipo }}</v-chip>
          </template>

        </v-data-table>
      </v-card>
    </v-expand-transition>
    
    <v-row v-else class="mt-10 text-center">
        <v-col>
            <v-icon icon="mdi-cursor-default-click-outline" size="64" class="text-medium-emphasis"></v-icon>
            <h3 class="text-h5 text-medium-emphasis mt-2">Selecciona un sobre arriba para ver sus detalles</h3>
        </v-col>
    </v-row>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';

// --- DATA ---
const loading = ref(false);
const rawTransactions = ref([]); // Todos los datos crudos de la BD
const selectedSobre = ref(null); // El sobre que el usuario seleccionó

// Lista de sobres dinámica
const knownSobres = ref([]);

const fetchKnownSobres = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/tesoreria/sobres');
        knownSobres.value = res.data.map(s => s.nombre);
    } catch (e) {
        console.error("Error cargando lista de sobres", e);
    }
};

const headers = [
    { title: 'Fecha', key: 'fecha', align: 'start', width: '120px' },
    { title: 'Concepto', key: 'concepto' },
    { title: 'Tipo', key: 'tipo' },
    { title: 'Contraparte', key: 'contraparte' }, // De dónde viene o a dónde va
    { title: 'Entrada (+)', key: 'entrada', align: 'end' },
    { title: 'Salida (-)', key: 'salida', align: 'end' },
    { title: 'Saldo', key: 'saldoAcumulado', align: 'end' }, // Saldo recalculado
    { title: 'Usuario', key: 'usuario' },
];

// --- API FETCH ---
const fetchOperations = async () => {
    try {
        loading.value = true;
        const token = localStorage.getItem('token');
        const response = await axios.get('/tesoreria/operaciones');

        rawTransactions.value = response.data.map(item => ({
            id: item.id || item.ID,
            fecha: item.fecha || item.created_at,
            concepto: item.concepto,
            tipo: item.tipo,
            monto: parseFloat(item.monto),
            sobre_origen: item.sobre_origen,
            sobre_destino: item.sobre_destino,
            usuario: item.usuario
        }));
    } catch (error) {
        console.error("Error", error);
    } finally {
        loading.value = false;
    }
};

// --- LOGICA COMPUTADA ---

// 1. CALCULAR SALDOS ACTUALES PARA LOS KPIs
const saldosPorSobre = computed(() => {
    const saldos = {};
    // Inicializar en 0
    knownSobres.value.forEach(s => saldos[s] = 0);

    rawTransactions.value.forEach(t => {
        const m = t.monto;
        
        // Si entra dinero a este sobre (Ingreso o Traspaso recibido)
        if (t.sobre_destino && saldos[t.sobre_destino] !== undefined) {
            saldos[t.sobre_destino] += m;
        }
        // Si sale dinero de este sobre (Egreso o Traspaso enviado)
        if (t.sobre_origen && saldos[t.sobre_origen] !== undefined) {
            saldos[t.sobre_origen] -= m;
        }
    });
    return saldos;
});

// 2. FILTRAR Y RECALCULAR TABLA PARA EL SOBRE SELECCIONADO
const transactionsFiltered = computed(() => {
    if (!selectedSobre.value) return [];

    const sobre = selectedSobre.value;
    
    // a) Filtramos solo operaciones que toquen este sobre
    const filtered = rawTransactions.value.filter(t => 
        t.sobre_origen === sobre || t.sobre_destino === sobre
    );

    // b) Ordenamos por fecha ascendente (antiguo a nuevo) para calcular saldo histórico
    filtered.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // c) Recalculamos saldo línea por línea
    let saldoRunning = 0;
    
    const mapped = filtered.map(t => {
        let entrada = 0;
        let salida = 0;
        let contraparte = '-';

        // Lógica de Entrada/Salida relativa a ESTE sobre
        if (t.sobre_destino === sobre) {
            // Dinero entrando
            entrada = t.monto;
            // ¿De dónde vino?
            contraparte = t.tipo === 'Traspaso' ? `De: ${t.sobre_origen}` : 'Ingreso Externo';
            saldoRunning += entrada;
        } 
        else if (t.sobre_origen === sobre) {
            // Dinero saliendo
            salida = t.monto;
            // ¿A dónde fue?
            contraparte = t.tipo === 'Traspaso' ? `A: ${t.sobre_destino}` : 'Gasto Externo';
            saldoRunning -= salida;
        }

        return {
            ...t,
            entrada,
            salida,
            saldoAcumulado: saldoRunning,
            contraparte
        };
    });

    // d) Invertimos orden (Más nuevo arriba) para mostrar en la tabla
    return mapped.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

// --- HELPERS ---
const formatCurrency = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

const formatDate = (d) => {
    if(!d) return '-';
    return new Date(d).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
};

const getTypeColor = (type) => {
    if(!type) return 'grey';
    const t = type.toLowerCase();
    if(t === 'ingreso') return 'success';
    if(t === 'egreso') return 'error';
    return 'warning';
};

onMounted(() => {
    fetchOperations();
    fetchKnownSobres();
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
.transition-swing {
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.selected-sobre {
    border: 2px solid rgb(var(--v-theme-primary)) !important;
    background-color: var(--hover-bg) !important;
}
</style>
