<template>
  <v-container fluid class="fill-height bg-dark-canvas pa-0">
    <v-row no-gutters class="fill-height">
      
      <!-- Panel Izquierdo: Roles -->
      <v-col cols="12" md="3" class="border-e border-b-dark d-flex flex-column bg-dark-canvas">
        <div class="pa-4 border-b-dark">
          <div class="d-flex align-center gap-2 mb-2">
            <v-icon class="text-primary" size="large">mdi-shield-lock</v-icon>
            <h2 class="text-h6 font-weight-bold ml-2">Roles y Accesos</h2>
          </div>
          <p class="text-caption text-light-muted">Selecciona un rol para gestionar sus permisos.</p>
        </div>

        <v-list class="flex-grow-1 overflow-y-auto pa-2 bg-transparent">
          <v-list-subheader class="text-medium-emphasis">ROLES DISPONIBLES</v-list-subheader>
          
          <v-list-item
            v-for="role in roles"
            :key="role.RoleID"
            :value="role"
            @click="selectRole(role)"
            rounded="lg"
            class="mb-1"
            :active="selectedRole?.RoleID === role.RoleID"
            color="primary"
            variant="text"
          >
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" size="32" class="mr-3">
                <v-icon size="small">mdi-account-cog</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">
              {{ role.RoleName }}
            </v-list-item-title>
            <template v-slot:append>
               <v-icon size="small" icon="mdi-chevron-right" color="grey"></v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Panel Derecho: Permisos -->
      <v-col cols="12" md="9" class="d-flex flex-column fill-height overflow-hidden bg-dark-canvas">
        
        <div class="pa-4 border-b-dark d-flex align-center justify-space-between header-dark-blue" style="min-height: 72px;">
          <div v-if="selectedRole">
            <h3 class="text-h6">
              Editando: <span class="text-primary">{{ selectedRole.RoleName }}</span>
            </h3>
            <span class="text-caption text-medium-emphasis">
              {{ selectedMenuIds.length }} permisos activos
            </span>
          </div>
          <div v-else class="text-light-muted">
            <v-icon class="mr-2">mdi-cursor-default-click</v-icon>
            Selecciona un rol para comenzar
          </div>

          <v-btn 
            v-if="selectedRole"
            color="primary" 
            prepend-icon="mdi-content-save" 
            @click="savePermissions" 
            :loading="saving"
            elevation="0"
            class="text-capitalize"
          >
            Guardar Cambios
          </v-btn>
        </div>

        <div class="flex-grow-1 overflow-y-auto pa-6">
          
          <v-alert v-if="!selectedRole" type="info" variant="tonal" icon="mdi-information" color="primary">
            Selecciona un rol del menú izquierdo para ver y modificar los módulos a los que tiene acceso.
          </v-alert>

          <v-row v-else>
            <v-col cols="12" xl="4" lg="6" md="12" v-for="module in menuTree" :key="module.MenuID">
              <v-card elevation="0" class="h-100 d-flex flex-column card-dark-blue">
                
                <v-toolbar density="compact" class="border-b-dark pr-2 header-dark-blue">
                  <v-checkbox
                    v-model="selectedMenuIds"
                    :value="module.MenuID"
                    hide-details
                    density="compact"
                    class="ml-2"
                    color="primary"
                  ></v-checkbox>
                  <v-icon class="ml-2 mr-3 text-primary">{{ module.Icon || 'mdi-circle-small' }}</v-icon>
                  <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                    {{ module.Title }}
                  </v-toolbar-title>
                </v-toolbar>

                <v-card-text class="pa-0 flex-grow-1">
                  <div v-if="!module.children.length" class="pa-4 text-center text-light-muted">
                    <small>Módulo de acceso directo</small>
                  </div>

                  <v-list v-else density="compact" class="pa-0 bg-transparent">
                    <template v-for="child in module.children" :key="child.MenuID">
                      
                      <v-list-group v-if="child.children && child.children.length" :value="child.Title">
                        <template v-slot:activator="{ props }">
                          <v-list-item v-bind="props" class="hover-item">
                            <template v-slot:prepend>
                               <v-checkbox
                                  v-model="selectedMenuIds"
                                  :value="child.MenuID"
                                  hide-details
                                  density="compact"
                                  @click.stop
                                  color="primary"
                                ></v-checkbox>
                            </template>
                            <v-list-item-title class="font-weight-medium">{{ child.Title }}</v-list-item-title>
                             <template v-slot:append>
                                <v-icon size="small" :icon="child.Icon || 'mdi-folder'" class="text-light-muted"></v-icon>
                            </template>
                          </v-list-item>
                        </template>

                        <v-list-item v-for="grandchild in child.children" :key="grandchild.MenuID" class="pl-10 hover-item">
                          <template v-slot:prepend>
                            <v-checkbox
                              v-model="selectedMenuIds"
                              :value="grandchild.MenuID"
                              hide-details
                              density="compact"
                              color="primary"
                            ></v-checkbox>
                          </template>
                          <v-list-item-title>{{ grandchild.Title }}</v-list-item-title>
                           <template v-slot:append>
                                <v-icon size="small" :icon="grandchild.Icon || 'mdi-circle-small'"></v-icon>
                            </template>
                        </v-list-item>
                      </v-list-group>

                      <v-list-item v-else class="hover-item">
                         <template v-slot:prepend>
                            <v-checkbox
                              v-model="selectedMenuIds"
                              :value="child.MenuID"
                              hide-details
                              density="compact"
                              color="primary"
                            ></v-checkbox>
                          </template>
                        <v-list-item-title>{{ child.Title }}</v-list-item-title>
                        <template v-slot:append>
                            <v-icon size="small" :icon="child.Icon || 'mdi-circle-small'"></v-icon>
                        </template>
                      </v-list-item>
                      
                      <v-divider v-if="child !== module.children[module.children.length-1]" class="border-opacity-50"></v-divider>
                    </template>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/utils/axios';

// --- ESTADO ---
const roles = ref([]);
const allMenus = ref([]); 
const existingPermissions = ref([]); // Todos los permisos traídos de la BD
const selectedRole = ref(null);
const selectedMenuIds = ref([]);
const saving = ref(false);


// --- COMPUTED: Transformar lista plana a Árbol ---
const menuTree = computed(() => {
  if (!allMenus.value.length) return [];
  
  const buildBranch = (parentId) => {
    return allMenus.value
      .filter(menu => menu.ParentID === parentId)
      .sort((a, b) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0))
      .map(menu => ({
        ...menu,
        children: buildBranch(menu.MenuID)
      }));
  };

  return buildBranch(null);
});

// --- API & LOGICA ---

const loadData = async () => {
    try {
        const res = await axios.get('/admin/config-data');
        
        roles.value = res.data.roles;
        allMenus.value = res.data.menus;
        existingPermissions.value = res.data.permissions || [];
        
    } catch (e) {
        console.error("Error cargando datos", e);
    }
};

const selectRole = (role) => {
    selectedRole.value = role;
    
    // FILTRAR: Buscamos en la lista de todos los permisos, los que coinciden con este RoleID
    const rolePerms = existingPermissions.value.filter(p => p.RoleID === role.RoleID);
    
    // Mapeamos solo los MenuID al array de selección
    selectedMenuIds.value = rolePerms.map(p => p.MenuID);
};

const savePermissions = async () => {
    if(!selectedRole.value) return;
    saving.value = true;
    try {
        await axios.post('/admin/update-permissions', {
            roleId: selectedRole.value.RoleID,
            menuIds: selectedMenuIds.value
        });
        
        existingPermissions.value = existingPermissions.value.filter(p => p.RoleID !== selectedRole.value.RoleID);
        const newPerms = selectedMenuIds.value.map(menuId => ({
            RoleID: selectedRole.value.RoleID,
            MenuID: menuId
        }));
        existingPermissions.value.push(...newPerms);

        alert('Permisos actualizados correctamente');
        
    } catch (e) {
        alert('Error guardando');
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.v-list-item--active {
    background-color: var(--hover-bg) !important;
    border-right: 3px solid rgb(var(--v-theme-primary));
}

.hover-item:hover {
    background-color: var(--hover-bg);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--canvas-bg);
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
</style>
