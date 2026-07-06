<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    
    <!-- Page Header -->
    <PageHeader 
      title="Caja Chica - Operaciones" 
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Caja Chica', href: '#' }
      ]"
    />
    
    <!-- Action Cards Row -->
    <v-row class="mb-4">
      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg cursor-pointer card-dark-blue border-b-dark" @click="openDialog('ingreso')" style="border-bottom: 4px solid #4caf50 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-success elevation-0" dark>
                <v-icon>mdi-cash-plus</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Ingreso</h2>
                <p class="text-medium-emphasis mt-1 text-15">Recibir dinero</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg cursor-pointer card-dark-blue border-b-dark" @click="openDialog('egreso')" style="border-bottom: 4px solid #ff5252 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-error elevation-0" dark>
                <v-icon>mdi-cash-minus</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Egreso</h2>
                <p class="text-medium-emphasis mt-1 text-15">Gasto o pago</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg cursor-pointer card-dark-blue border-b-dark" @click="openDialog('traspaso')" style="border-bottom: 4px solid #ffc107 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-warning elevation-0" dark>
                <v-icon>mdi-swap-horizontal</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Traspaso</h2>
                <p class="text-medium-emphasis mt-1 text-15">Mover entre sobres</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg card-dark-blue border-b-dark" style="border-bottom: 4px solid #03c9d7 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-info elevation-0" dark>
                <v-icon>mdi-email-outline</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Saldos</h2>
                <p class="text-medium-emphasis mt-1 text-15">Ver desglose</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- KPI Cards Row -->
    <v-row dense>
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Ingresos Hoy</p>
              <h3 class="text-h3 text-success">{{ formatCurrency(kpis.ingresoHoy) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Egresos Hoy</p>
              <h3 class="text-h3 text-error">{{ formatCurrency(kpis.egresoHoy) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Ingreso Mensual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.ingresoMes) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Egreso Mensual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.egresoMes) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Ingreso Anual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.ingresoAnio) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Egreso Anual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.egresoAnio) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-4 rounded-lg card-dark-blue" elevation="0">
      <v-card-title class="d-flex align-center py-3 px-4 header-dark-blue border-b-dark">
        <v-icon icon="mdi-history" class="mr-2 text-primary"></v-icon>
        <span class="font-weight-bold">Historial de Operaciones</span>
        <v-spacer></v-spacer>
        <v-chip color="primary" variant="flat" size="large">
            Saldo Global Actual: {{ formatCurrency(globalBalance) }}
        </v-chip>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="transactionsWithBalance"
        item-value="id"
        density="compact"
        class="bg-transparent dark-table"
        :sort-by="[{ key: 'fecha', order: 'desc' }]"
        hover
      >
        <template v-slot:item.ingreso="{ item }">
          <span v-if="item.ingreso > 0" class="text-success font-weight-bold">+{{ formatCurrency(item.ingreso) }}</span>
          <span v-else class="text-light-muted">-</span>
        </template>

        <template v-slot:item.egreso="{ item }">
          <span v-if="item.egreso > 0" class="text-error font-weight-bold">-{{ formatCurrency(item.egreso) }}</span>
          <span v-else class="text-light-muted">-</span>
        </template>

        <template v-slot:item.saldo="{ item }">
           <strong class="text-primary">{{ formatCurrency(item.saldo) }}</strong>
        </template>

        <template v-slot:item.fecha="{ item }">
           <span class="text-light-muted">{{ formatDate(item.fecha) }}</span>
        </template>
        
        <template v-slot:item.tipo="{ item }">
           <v-chip size="x-small" :color="getTypeColor(item.tipo)" class="font-weight-bold" variant="tonal">{{ item.tipo }}</v-chip>
        </template>

        <template v-slot:item.monto="{ item }">
          <span class="font-weight-bold">{{ formatCurrency(item.monto) }}</span>
        </template>

      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog.show" max-width="500px">
      <v-card class="card-dark-blue">
        <v-toolbar :color="dialogColor" density="compact">
          <v-toolbar-title class="font-weight-bold">{{ dialogTitle }}</v-toolbar-title>
          <v-btn icon @click="dialog.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>

        <v-card-text class="pt-4">
            <v-form ref="form" v-model="valid">
                <v-row dense>
                    <v-col cols="12">
                        <v-text-field 
                            v-model="editedItem.monto" 
                            label="Monto ($)" 
                            type="number" 
                            prefix="$"
                            variant="outlined"
                            :rules="[v => !!v || 'Monto es requerido']"
                        ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12">
                        <v-text-field 
                            v-model="editedItem.concepto" 
                            label="Concepto" 
                            variant="outlined"
                            :rules="[v => !!v || 'Concepto es requerido']"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="12" v-if="dialog.type === 'ingreso'">
                        <v-select 
                            v-model="editedItem.sobreDestino" 
                            :items="sobresList" 
                            label="Guardar en Sobre" 
                            prepend-inner-icon="mdi-email"
                            variant="outlined"
                        ></v-select>
                        <v-select 
                            v-model="editedItem.categoria" 
                            :items="categoriasList" 
                            label="Categoría (Opcional)" 
                            variant="outlined"
                        ></v-select>
                    </v-col>

                    <v-col cols="12" v-if="dialog.type === 'egreso'">
                        <v-select 
                            v-model="editedItem.sobreOrigen" 
                            :items="sobresList" 
                            label="Tomar del Sobre" 
                            prepend-inner-icon="mdi-email-open"
                            variant="outlined"
                        ></v-select>
                    </v-col>

                    <v-col cols="12" v-if="dialog.type === 'traspaso'">
                        <v-select 
                            v-model="editedItem.sobreOrigen" 
                            :items="sobresList" 
                            label="Desde Sobre (Origen)" 
                            variant="outlined"
                        ></v-select>
                        <v-icon class="mb-2 mx-auto d-block text-white">mdi-arrow-down-bold</v-icon>
                        <v-select 
                            v-model="editedItem.sobreDestino" 
                            :items="sobresList" 
                            label="Hacia Sobre (Destino)" 
                            variant="outlined"
                        ></v-select>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>

        <v-card-actions class="border-t-dark">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="dialog.show = false">Cancelar</v-btn>
            <v-btn :color="dialogColor" variant="flat" @click="saveOperation">Guardar Operación</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const authStore = useAuthStore();
const dialog = ref({ show: false, type: 'ingreso' });
const valid = ref(false);
const loading = ref(false);
const form = ref(null);

// Listas Dinámicas
const sobresList = ref([]);
const categoriasList = ref([]);

const fetchCatalogos = async () => {
  try {
    const [resSobres, resCats] = await Promise.all([
      axios.get('/tesoreria/sobres'),
      axios.get('/tesoreria/categorias')
    ]);
    
    sobresList.value = resSobres.data.map(s => s.nombre);
    categoriasList.value = resCats.data.map(c => c.nombre);
  } catch (e) {
    console.error("Error cargando catálogos", e);
  }
};

// Modelo para el formulario
const editedItem = ref({
    monto: null,
    concepto: '',
    sobreOrigen: null,
    sobreDestino: null,
    categoria: null
});

// ARRAY VACÍO: Se llenará desde la BD
const transactions = ref([]);

const headers = [
    { title: 'Fecha', key: 'fecha', align: 'start', width: '100px' },
    { title: 'Concepto', key: 'concepto' },
    { title: 'Sobre / Ruta', key: 'sobre_display' },
    { title: 'Categoría', key: 'categoria' },
    { title: 'Monto Op.', key: 'monto', align: 'end' }, 
    { title: 'Ingreso', key: 'ingreso', align: 'end' },
    { title: 'Egreso', key: 'egreso', align: 'end' },
    { title: 'Saldo Global', key: 'saldo', align: 'end' },
    { title: 'Usuario', key: 'usuario' },
];

// --- API: CARGAR DATOS ---
const fetchOperations = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/tesoreria/operaciones');

        transactions.value = response.data.map(item => ({
            id: item.id || item.ID,
            fecha: item.fecha || item.Fecha || item.created_at,
            concepto: item.concepto || item.Concepto,
            tipo: item.tipo || item.Tipo,
            ingreso: parseFloat(item.ingreso || item.Ingreso || 0),
            egreso: parseFloat(item.egreso || item.Egreso || 0),
            monto: parseFloat(item.monto || item.Monto || 0),
            categoria: item.categoria || item.Categoria || '-',
            sobre_origen: item.sobre_origen || item.SobreOrigen,
            sobre_destino: item.sobre_destino || item.SobreDestino,
            usuario: item.usuario || item.Usuario,
            sobre_display: (item.tipo === 'Traspaso' || item.Tipo === 'Traspaso') 
                           ? `${item.sobre_origen || '-'} → ${item.sobre_destino || '-'}`
                           : (item.sobre_destino || item.sobre_origen || '-')
        }));

    } catch (error) {
        console.error("Error cargando operaciones:", error);
    } finally {
        loading.value = false;
    }
};

// --- API: GUARDAR DATOS ---
const saveOperation = async () => {
    const { valid: isFormValid } = await form.value.validate();
    if (!isFormValid) return;

    try {
        const payload = {
            monto: parseFloat(editedItem.value.monto),
            concepto: editedItem.value.concepto,
            usuario: authStore.user?.name || 'Usuario',
            tipo: dialog.value.type === 'ingreso' ? 'Ingreso' : (dialog.value.type === 'egreso' ? 'Egreso' : 'Traspaso'),
            categoria: editedItem.value.categoria || null,
            sobreOrigen: (dialog.value.type === 'egreso' || dialog.value.type === 'traspaso') ? editedItem.value.sobreOrigen : null,
            sobreDestino: (dialog.value.type === 'ingreso' || dialog.value.type === 'traspaso') ? editedItem.value.sobreDestino : null,
        };

        await axios.post('/tesoreria/operaciones', payload);

        await fetchOperations(); 
        dialog.value.show = false;

    } catch (error) {
        console.error("Error guardando:", error);
        alert("Error al guardar operación");
    }
};

// --- COMPUTED LOGIC ---

const transactionsWithBalance = computed(() => {
    let saldoAcumulado = 0;
    const sorted = [...transactions.value].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    return sorted.map(t => {
        saldoAcumulado = saldoAcumulado + t.ingreso - t.egreso;
        return { ...t, saldo: saldoAcumulado };
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const globalBalance = computed(() => {
    if (transactionsWithBalance.value.length === 0) return 0;
    return transactionsWithBalance.value[0].saldo;
});

const kpis = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let data = { ingresoHoy: 0, egresoHoy: 0, ingresoMes: 0, egresoMes: 0, ingresoAnio: 0, egresoAnio: 0 };

    transactions.value.forEach(t => {
        const tDate = new Date(t.fecha);
        if(isNaN(tDate)) return; 

        const tDateString = tDate.toISOString().slice(0, 10);
        
        if (tDateString === today) {
            data.ingresoHoy += t.ingreso;
            data.egresoHoy += t.egreso;
        }
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            data.ingresoMes += t.ingreso;
            data.egresoMes += t.egreso;
        }
        if (tDate.getFullYear() === currentYear) {
            data.ingresoAnio += t.ingreso;
            data.egresoAnio += t.egreso;
        }
    });
    return data;
});

const dialogTitle = computed(() => {
    if (dialog.value.type === 'ingreso') return 'Registrar Ingreso';
    if (dialog.value.type === 'egreso') return 'Registrar Egreso';
    return 'Traspaso entre Sobres';
});

const dialogColor = computed(() => {
    if (dialog.value.type === 'ingreso') return 'success';
    if (dialog.value.type === 'egreso') return 'error';
    return 'warning';
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const formatDate = (dateString) => {
    if(!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
};

const getTypeColor = (type) => {
    if(!type) return 'grey';
    const t = type.toLowerCase();
    if(t === 'ingreso') return 'success';
    if(t === 'egreso') return 'error';
    return 'warning';
}

const openDialog = (type) => {
    dialog.value.type = type;
    editedItem.value = { monto: null, concepto: '', sobreOrigen: null, sobreDestino: null, categoria: null };
    dialog.value.show = true;
};

onMounted(() => {
    fetchOperations();
    fetchCatalogos();
});
</script>
