<script setup>
import { ref, watch, computed } from 'vue';
import axios from '@/utils/axios';
import { stageOptions } from '@/config/crmStages';

const props = defineProps({
    modelValue: Boolean,
    cardCode: String,
    customerName: String,
    initialFolio: [Number, String],
    opportunityId: { type: [Number, String], default: null }
});
const emit = defineEmits(['update:modelValue', 'created']);

const internal = ref(props.modelValue);
watch(() => props.modelValue, v => internal.value = v);
watch(internal, v => emit('update:modelValue', v));

const loading = ref(false);
const saving = ref(false);
const availableQuotes = ref([]);
const selectedFolios = ref([]);
const name = ref('');
const fechaCierre = ref(null);
const notas = ref('');
const error = ref(null);

const etapa = ref(stageOptions[0]);

const totalSum = computed(() => {
    return availableQuotes.value
        .filter(q => selectedFolios.value.includes(q.Folio))
        .reduce((acc, q) => acc + (q.Monto || 0), 0);
});

const formatCurrency = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX') : '';

const loadAvailable = async () => {
    if (!props.cardCode) return;
    loading.value = true;
    error.value = null;
    try {
        const res = await axios.get(`/crm/opportunities/customer/${props.cardCode}/available-quotes`, {
            params: props.opportunityId ? { opportunityId: props.opportunityId } : {}
        });
        availableQuotes.value = res.data;
        // Por defecto preseleccionar el folio desde el que se abrió la creación
        if (props.initialFolio) {
            const folioNum = Number(props.initialFolio);
            if (availableQuotes.value.some(q => q.Folio === folioNum)) {
                selectedFolios.value = [folioNum];
            }
        }
        // Nombre sugerido
        if (!name.value && props.customerName) {
            name.value = `Oportunidad ${props.customerName} ${new Date().toLocaleDateString('es-MX')}`;
        }
    } catch (e) {
        error.value = e.response?.data?.msg || 'Error cargando cotizaciones disponibles';
    } finally {
        loading.value = false;
    }
};

watch(internal, (v) => {
    if (v) {
        selectedFolios.value = [];
        name.value = '';
        fechaCierre.value = null;
        notas.value = '';
        etapa.value = stageOptions[0];
        error.value = null;
        loadAvailable();
    }
});

const canSubmit = computed(() => name.value && selectedFolios.value.length > 0);

const submit = async () => {
    if (!canSubmit.value) return;
    saving.value = true;
    error.value = null;
    try {
        const res = await axios.post('/crm/opportunities', {
            CardCode: props.cardCode,
            CustomerName: props.customerName,
            Name: name.value,
            Etapa: etapa.value,
            FechaCierre: fechaCierre.value,
            Notas: notas.value,
            Folios: selectedFolios.value
        });
        emit('created', res.data);
        internal.value = false;
    } catch (e) {
        error.value = e.response?.data?.msg || 'Error creando oportunidad';
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <v-dialog v-model="internal" max-width="780" scrollable>
        <v-card>
            <v-toolbar color="primary" density="comfortable">
                <v-toolbar-title class="font-weight-bold">
                    <v-icon start>mdi-target</v-icon>
                    Crear Oportunidad
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-close" variant="text" color="white" @click="internal = false"></v-btn>
            </v-toolbar>

            <v-card-text class="pa-4">
                <div class="text-caption text-medium-emphasis mb-1">Cliente</div>
                <div class="text-subtitle-1 font-weight-bold mb-4">
                    {{ customerName || cardCode }}
                </div>

                <v-row dense>
                    <v-col cols="12" md="8">
                        <v-text-field
                            v-model="name"
                            label="Nombre de la oportunidad"
                            variant="outlined"
                            density="compact"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field
                            v-model="fechaCierre"
                            type="date"
                            label="Fecha de Cierre"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-calendar-check"
                            clearable
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="etapa"
                            :items="stageOptions"
                            label="Etapa Inicial"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-trending-up"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="notas"
                            label="Notas (opcional)"
                            variant="outlined"
                            density="compact"
                        ></v-text-field>
                    </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-file-document-multiple</v-icon>
                    <span class="font-weight-bold">Cotizaciones a Unificar</span>
                    <v-spacer></v-spacer>
                    <v-chip size="small" color="primary" variant="tonal" v-if="selectedFolios.length > 0">
                        {{ selectedFolios.length }} seleccionada(s) · {{ formatCurrency(totalSum) }}
                    </v-chip>
                </div>

                <v-alert
                    v-if="!loading && availableQuotes.length === 0"
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mb-2"
                >
                    No hay cotizaciones abiertas disponibles para este cliente.
                </v-alert>

                <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-2">
                    {{ error }}
                </v-alert>

                <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

                <v-list density="compact" v-if="!loading && availableQuotes.length > 0" lines="three">
                    <v-list-item
                        v-for="q in availableQuotes"
                        :key="q.Folio"
                        @click="selectedFolios = selectedFolios.includes(q.Folio)
                            ? selectedFolios.filter(f => f !== q.Folio)
                            : [...selectedFolios, q.Folio]"
                    >
                        <template v-slot:prepend>
                            <v-checkbox
                                :model-value="selectedFolios.includes(q.Folio)"
                                hide-details
                                density="compact"
                                color="primary"
                                @click.stop
                                @update:model-value="(v) => v
                                    ? (selectedFolios = [...selectedFolios, q.Folio])
                                    : (selectedFolios = selectedFolios.filter(f => f !== q.Folio))"
                            ></v-checkbox>
                        </template>
                        <v-list-item-title class="font-weight-bold">
                            #{{ q.Folio }}
                            <v-chip size="x-small" variant="tonal" class="ml-2">{{ q.Etapa }}</v-chip>
                            <span class="ml-2 text-medium-emphasis text-body-2 font-weight-regular">
                                {{ formatDate(q.Fecha) }} · {{ formatCurrency(q.Monto) }}
                            </span>
                        </v-list-item-title>
                        <v-list-item-subtitle v-if="q.Referencia" class="text-body-2 mt-1">
                            <v-icon size="14" class="mr-1">mdi-tag-outline</v-icon>
                            <span class="font-weight-medium">Ref:</span> {{ q.Referencia }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle v-if="q.Comentarios" class="text-body-2 mt-1 quote-comments">
                            <v-icon size="14" class="mr-1">mdi-comment-text-outline</v-icon>
                            {{ q.Comentarios }}
                        </v-list-item-subtitle>
                    </v-list-item>
                </v-list>
            </v-card-text>

            <v-divider></v-divider>
            <v-card-actions class="pa-3">
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="internal = false">Cancelar</v-btn>
                <v-btn
                    color="primary"
                    variant="flat"
                    :disabled="!canSubmit"
                    :loading="saving"
                    @click="submit"
                >
                    Crear Oportunidad
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.quote-comments {
    white-space: normal !important;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    overflow: hidden;
}
</style>
