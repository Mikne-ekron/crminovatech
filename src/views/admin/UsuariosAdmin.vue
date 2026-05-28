<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';

const loading = ref(false);
const users = ref([]);
const roles = ref([]);
const search = ref('');
const showDialog = ref(false);
const savingDialog = ref(false);
const selectedUser = ref(null);

// Datos editables del diálogo
const edit = ref({ RoleID: null, IsActive: true, CanSwitchCompany: false });
// Vendedores asignados (por empresa) y disponibles (por empresa) para el usuario en edición
const assignedByCompany = ref({});      // { SBOINOVA: ['Juan', ...], SBOMIKNE: [...], SBOLOG: [...] }
const availableByCompany = ref({});     // { SBOINOVA: ['Juan','Maria',...], ... }
const loadingDialog = ref(false);

const COMPANIES = [
    { id: 'SBOINOVA', label: 'Inovatech' },
    { id: 'SBOMIKNE', label: 'Mikne (SBOMIKNE + SBOEKSAS)' },
    { id: 'SBOLOG', label: 'Log Company' }
];

const headers = [
    { title: 'Usuario', key: 'FullName', align: 'start' },
    { title: 'Email', key: 'Email', align: 'start' },
    { title: 'Rol', key: 'RoleName', align: 'start' },
    { title: 'Activo', key: 'IsActive', align: 'center' },
    { title: 'Cambia empresa', key: 'CanSwitchCompany', align: 'center' },
    { title: 'Vendedores asignados', key: 'SlpCounts', align: 'start' }
];

const filteredUsers = computed(() => {
    if (!search.value) return users.value;
    const s = search.value.toLowerCase();
    return users.value.filter(u =>
        (u.FullName || '').toLowerCase().includes(s) ||
        (u.Email || '').toLowerCase().includes(s) ||
        (u.RoleName || '').toLowerCase().includes(s)
    );
});

const fetchUsers = async () => {
    loading.value = true;
    try {
        const [u, r] = await Promise.all([
            axios.get('/admin/users-admin'),
            axios.get('/admin/users-admin/roles')
        ]);
        users.value = u.data;
        roles.value = r.data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const openEdit = async (user) => {
    selectedUser.value = user;
    edit.value = {
        RoleID: user.RoleID,
        IsActive: !!user.IsActive,
        CanSwitchCompany: !!user.CanSwitchCompany
    };
    assignedByCompany.value = {};
    availableByCompany.value = {};
    showDialog.value = true;
    loadingDialog.value = true;
    try {
        const ass = await axios.get(`/admin/users-admin/${user.UserID}/salespeople`);
        assignedByCompany.value = ass.data;
        // Cargar disponibles para cada empresa en paralelo
        const reqs = await Promise.all(COMPANIES.map(c =>
            axios.get(`/admin/users-admin/company-salespeople/${c.id}`)
                .then(r => [c.id, r.data])
                .catch(() => [c.id, []])
        ));
        availableByCompany.value = Object.fromEntries(reqs);
    } catch (e) {
        console.error(e);
    } finally {
        loadingDialog.value = false;
    }
};

const save = async () => {
    if (!selectedUser.value) return;
    savingDialog.value = true;
    try {
        // 1. Actualizar usuario (rol + flags)
        await axios.put(`/admin/users-admin/${selectedUser.value.UserID}`, edit.value);
        // 2. Actualizar vendedores por cada empresa
        for (const c of COMPANIES) {
            await axios.put(`/admin/users-admin/${selectedUser.value.UserID}/salespeople`, {
                Company: c.id,
                SlpNames: assignedByCompany.value[c.id] || []
            });
        }
        showDialog.value = false;
        await fetchUsers();
    } catch (e) {
        console.error(e);
        alert(e.response?.data?.msg || 'Error guardando');
    } finally {
        savingDialog.value = false;
    }
};

const totalAssigned = (user) => {
    if (!user.SlpCounts) return 0;
    return Object.values(user.SlpCounts).reduce((a, n) => a + n, 0);
};

onMounted(fetchUsers);
</script>

<template>
    <v-container fluid class="page-wrapper">
        <v-row class="mb-4">
            <v-col cols="12" class="d-flex align-center justify-space-between">
                <div>
                    <h2 class="text-h4 font-weight-bold">
                        <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
                        Gestión de Usuarios
                    </h2>
                    <p class="text-subtitle-1 text-medium-emphasis">
                        Rol y restricciones de vendedores visibles por empresa
                    </p>
                </div>
                <v-btn color="primary" prepend-icon="mdi-refresh" elevation="0" @click="fetchUsers" :loading="loading">
                    Actualizar
                </v-btn>
            </v-col>
        </v-row>

        <v-alert type="info" variant="tonal" density="compact" class="mb-4" icon="mdi-information">
            Si un usuario NO tiene vendedores asignados en una empresa, no verá datos en
            esa empresa (Pipeline, Oportunidades, Backlog, Gestión Comercial, Dashboard).
            Los usuarios con rol <strong>ADMIN</strong> ignoran esta restricción y ven todo.
        </v-alert>

        <v-card elevation="0" class="border">
            <v-card-text class="pb-0">
                <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    label="Buscar (nombre, email, rol)"
                    density="comfortable"
                    variant="solo"
                    hide-details
                    clearable
                ></v-text-field>
            </v-card-text>

            <v-data-table
                :headers="headers"
                :items="filteredUsers"
                :loading="loading"
                hover
                class="elevation-0"
                @click:row="(_, { item }) => openEdit(item)"
            >
                <template v-slot:item.FullName="{ item }">
                    <span class="font-weight-medium">{{ item.FullName }}</span>
                </template>
                <template v-slot:item.RoleName="{ item }">
                    <v-chip size="x-small" :color="item.RoleName === 'ADMIN' ? 'error' : 'primary'" variant="tonal" class="font-weight-bold">
                        {{ item.RoleName }}
                    </v-chip>
                </template>
                <template v-slot:item.IsActive="{ item }">
                    <v-icon :color="item.IsActive ? 'success' : 'grey'" size="20">
                        {{ item.IsActive ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                </template>
                <template v-slot:item.CanSwitchCompany="{ item }">
                    <v-icon :color="item.CanSwitchCompany ? 'primary' : 'grey-lighten-1'" size="20">
                        {{ item.CanSwitchCompany ? 'mdi-domain' : 'mdi-minus' }}
                    </v-icon>
                </template>
                <template v-slot:item.SlpCounts="{ item }">
                    <v-chip
                        v-for="c in COMPANIES"
                        :key="c.id"
                        size="x-small"
                        :color="(item.SlpCounts && item.SlpCounts[c.id]) ? 'primary' : 'grey-lighten-2'"
                        variant="tonal"
                        class="mr-1"
                    >
                        {{ c.label.split(' ')[0] }}: {{ (item.SlpCounts && item.SlpCounts[c.id]) || 0 }}
                    </v-chip>
                </template>
            </v-data-table>
        </v-card>

        <!-- Dialog de edición -->
        <v-dialog v-model="showDialog" max-width="900" scrollable>
            <v-card v-if="selectedUser">
                <v-toolbar color="primary" density="comfortable">
                    <v-toolbar-title class="font-weight-bold">
                        <v-icon start>mdi-account-edit</v-icon>
                        {{ selectedUser.FullName }}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon="mdi-close" variant="text" color="white" @click="showDialog = false"></v-btn>
                </v-toolbar>

                <v-card-text class="pa-4">
                    <div class="text-caption text-medium-emphasis">{{ selectedUser.Email }}</div>

                    <v-row dense class="mt-2">
                        <v-col cols="12" md="4">
                            <v-select
                                v-model="edit.RoleID"
                                :items="roles"
                                item-title="RoleName"
                                item-value="RoleID"
                                label="Rol"
                                variant="outlined"
                                density="compact"
                                prepend-inner-icon="mdi-shield-account"
                            ></v-select>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-switch v-model="edit.IsActive" label="Usuario activo" color="success" density="compact" hide-details></v-switch>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-switch v-model="edit.CanSwitchCompany" label="Puede cambiar de empresa" color="primary" density="compact" hide-details></v-switch>
                        </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <div class="d-flex align-center mb-3">
                        <v-icon color="primary" class="mr-2">mdi-account-tie</v-icon>
                        <span class="text-subtitle-1 font-weight-bold">Vendedores visibles por empresa</span>
                    </div>
                    <p class="text-caption text-medium-emphasis mb-3">
                        Sin vendedores asignados = el usuario no verá nada en esa empresa
                        (excepto si su rol es ADMIN).
                    </p>

                    <v-progress-linear v-if="loadingDialog" indeterminate color="primary"></v-progress-linear>

                    <v-row v-else dense>
                        <v-col cols="12" md="6" v-for="c in COMPANIES" :key="c.id">
                            <v-card variant="outlined" class="pa-3">
                                <div class="text-caption font-weight-bold text-uppercase mb-2 text-primary">
                                    {{ c.label }}
                                </div>
                                <v-autocomplete
                                    v-model="assignedByCompany[c.id]"
                                    :items="availableByCompany[c.id] || []"
                                    label="Asignar vendedores"
                                    multiple
                                    chips
                                    closable-chips
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    clearable
                                ></v-autocomplete>
                                <div class="text-caption text-medium-emphasis mt-1">
                                    {{ (assignedByCompany[c.id] || []).length }} de {{ (availableByCompany[c.id] || []).length }}
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions class="pa-3">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="showDialog = false">Cancelar</v-btn>
                    <v-btn color="primary" variant="flat" :loading="savingDialog" @click="save">
                        Guardar cambios
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
