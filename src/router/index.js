import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  // 1. LOGIN (Ruta raíz fuera del Layout)
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    redirect: (to) => {
      const token = localStorage.getItem('token');
      return token ? '/app/dashboard' : '/login';
    }
  },

  // 2. APLICACIÓN PRINCIPAL (Layout con Menú Lateral)
  {
    path: '/app', // Esto coincide con el inicio de tus paths en SQL
    component: MainLayout,
    meta: { requiresAuth: true }, // Protege todas las rutas internas
    children: [
      // --- DASHBOARD (ID 1) ---
      {
        path: 'dashboard', // SQL: /app/dashboard
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },

      // --- TESORERÍA ---

      // Caja Chica - Operaciones (ID 14)
      {
        path: 'tesoreria/efectivo/sobres', // SQL: /app/tesoreria/efectivo/sobres
        name: 'CajaChicaOperaciones',
        component: () => import('@/views/tesoreria/CajaChica.vue')
      },

      // Monitor de Sobres - KPIs (ID 15)
      {
        path: 'tesoreria/monitor', // SQL: /app/tesoreria/monitor
        name: 'MonitorSobres',
        component: () => import('@/views/tesoreria/Sobres.vue')
      },

      // Ingresos - Conciliación de facturas
      {
        path: 'tesoreria/ingresos',
        name: 'IngresosTes',
        component: () => import('@/views/tesoreria/Ingresos.vue')
      },

      // Egresos
      {
        path: 'tesoreria/egresos',
        name: 'EgresosTes',
        component: () => import('@/views/tesoreria/Egresos.vue')
      },

      // Reportes - Estado de cuenta
      {
        path: 'tesoreria/reportes',
        name: 'ReportesTes',
        component: () => import('@/views/tesoreria/Reportes.vue')
      },

      // --- GESTIÓN (ADMINISTRACIÓN) ---

      // Autorizaciones / Usuarios (ID 17)
      {
        path: 'admin/users', // SQL: /app/admin/users
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue')
      },
      {
        path: 'admin/usuarios', // Gestion de usuarios (rol + vendedores asignados)
        name: 'UsuariosAdmin',
        component: () => import('@/views/admin/UsuariosAdmin.vue')
      },

      // Catálogo de Sobres (ID 19)
      {
        path: 'gestion/tesoreria/sobres', // SQL: /app/gestion/tesoreria/sobres
        name: 'CatSobres',
        component: () => import('@/views/gestion/tesoreria/CatSobres.vue')
      },

      // Catálogo de Categorías (ID 20)
      {
        path: 'gestion/tesoreria/categorias', // SQL: /app/gestion/tesoreria/categorias
        name: 'CatCategorias',
        component: () => import('@/views/gestion/tesoreria/CatCategorias.vue')
      },

      // --- RECURSOS HUMANOS (ID 13) ---
      {
        path: 'rh/vacaciones/solicitar', // SQL: /app/rh/vacaciones/solicitar
        name: 'VacacionesSolicitar',
        component: () => import('@/views/rh/SolicitarVacaciones.vue')
      },
      {
        path: 'rh/vacaciones/mis-vacaciones', // SQL: /app/rh/vacaciones/mis-vacaciones
        name: 'MyVacations',
        component: () => import('@/views/rh/vacations/MyVacations.vue')
      },
      {
        path: 'rh/vacaciones/autorizaciones', // SQL: /app/rh/vacaciones/autorizaciones
        name: 'AuthorizationCenter',
        component: () => import('@/views/rh/vacations/AuthorizationCenter.vue')
      },
      {
        path: 'rh/vacaciones/calendario-equipo', // SQL: /app/rh/vacaciones/calendario-equipo
        name: 'TeamCalendar',
        component: () => import('@/views/rh/vacations/TeamCalendar.vue')
      },
      {
        path: 'rh/vacaciones/reportes', // SQL: /app/rh/vacaciones/reportes
        name: 'Reports',
        component: () => import('@/views/rh/vacations/Reports.vue')
      },
      {
        path: 'rh/vacaciones/calendario',
        name: 'AbsenceCalendar',
        component: () => import('@/views/rh/calendar/AbsenceCalendar.vue')
      },


      // --- OPERACIONES (Ruta y Flotilla IDs 8 y 9) ---
      {
        path: 'operaciones/ruta',
        name: 'Ruta',
        component: () => import('@/views/operaciones/Ruta.vue')
      },
      {
        path: 'operaciones/flotilla',
        name: 'Flotilla',
        component: () => import('@/views/operaciones/Flotilla.vue')
      },
      {
        path: 'ingenieria/helpdesk',
        name: 'Helpdesk',
        component: () => import('@/views/ingenieria/Helpdesk.vue')
      },

      // --- VENTAS & CRM (ID 9000) ---
      {
        path: 'crm/dashboard',
        name: 'CrmDashboard',
        component: () => import('@/views/crm/CrmDashboard.vue')
      },
      {
        path: 'crm/pipeline',
        name: 'PipelineManager',
        component: () => import('@/views/crm/PipelineManager.vue')
      },
      {
        path: 'crm/prospects',
        name: 'ProspectsList',
        component: () => import('@/views/crm/ProspectsList.vue')
      },
      {
        path: 'crm/commercial-management',
        name: 'CommercialManagement',
        component: () => import('@/views/crm/CommercialManagement.vue')
      },
      {
        path: 'crm/opportunities',
        name: 'OpportunityList',
        component: () => import('@/views/crm/OpportunityList.vue')
      },
      {
        path: 'crm/opportunities/:id',
        name: 'OpportunityDetail',
        component: () => import('@/views/crm/OpportunityDetail.vue')
      },
      {
        path: 'crm/backlog',
        name: 'BacklogManager',
        component: () => import('@/views/crm/BacklogManager.vue')
      }
    ]
  },

  // Vista de impresión (fuera del MainLayout para ocupar toda la pantalla)
  {
    path: '/print/quote/:folio',
    name: 'PrintQuote',
    component: () => import('@/views/crm/PrintQuote.vue'),
    meta: { requiresAuth: true }
  },

  // 3. COMODÍN (404)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guardia de Navegación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router
