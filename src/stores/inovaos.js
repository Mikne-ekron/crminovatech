// stores/inovaos.js
// Módulo InovaOS dentro del portal. Todo pasa por el proxy /api/inovaos/* del
// backend, que reenvía a la API de InovaOS (única fuente de verdad de las reglas).
import { defineStore } from 'pinia';
import axios from '@/utils/axios';
import { useAuthStore } from '@/stores/auth';

export const useInovaosStore = defineStore('inovaos', {
  state: () => ({
    pendientes: [],
    usuarios: [],
    myId: null,          // id del usuario actual dentro de InovaOS (mapeado por correo)
    loading: false,
    detalle: null,       // { pendiente, historial, checklist, evidencias }
    loadingDetalle: false,
    verArchivados: false,
  }),
  getters: {
    // ¿El usuario actual existe en InovaOS? (si no, no puede operar)
    habilitado: (s) => s.myId != null,
  },
  actions: {
    async fetchUsuarios() {
      try {
        const { data } = await axios.get('/inovaos/usuarios');
        this.usuarios = data || [];
        const email = (useAuthStore().user?.email || '').toLowerCase();
        const me = this.usuarios.find((u) => (u.email || '').toLowerCase() === email);
        this.myId = me ? Number(me.id) : null;
      } catch (e) { /* silencioso */ }
    },
    async fetchPendientes() {
      this.loading = true;
      try {
        const { data } = await axios.get('/inovaos/pendientes', {
          params: this.verArchivados ? { archivados: 1 } : {},
        });
        this.pendientes = data || [];
      } catch (e) { this.pendientes = []; }
      finally { this.loading = false; }
    },
    async fetchDetalle(id) {
      this.loadingDetalle = true;
      try {
        const { data } = await axios.get(`/inovaos/pendientes/${id}`);
        this.detalle = data;
      } catch (e) { this.detalle = null; }
      finally { this.loadingDetalle = false; }
    },
    // --- Escrituras (dejan propagar el error para mostrar el mensaje del servidor) ---
    async crear(payload) {
      const { data } = await axios.post('/inovaos/pendientes', payload);
      await this.fetchPendientes();
      return data;
    },
    async patch(id, body) {
      const { data } = await axios.patch(`/inovaos/pendientes/${id}`, body);
      await this.fetchPendientes();
      if (this.detalle?.pendiente?.id == id) await this.fetchDetalle(id);
      return data;
    },
    cambiarEstatus(id, estatus, extra = {}) { return this.patch(id, { estatus, ...extra }); },
    editar(id, campos) { return this.patch(id, campos); },
    async archivar(id, val) {
      await axios.patch(`/inovaos/pendientes/${id}`, { archivado: val ? 1 : 0 });
      await this.fetchPendientes();
    },
    async eliminar(id) {
      await axios.delete(`/inovaos/pendientes/${id}`);
      this.detalle = null;
      await this.fetchPendientes();
    },
    async addChecklist(pendienteId, texto) {
      await axios.post('/inovaos/checklist', { pendiente_id: pendienteId, texto });
      await this.fetchDetalle(pendienteId);
    },
    async toggleChecklist(itemId, completado, pendienteId) {
      await axios.patch(`/inovaos/checklist/${itemId}`, { completado: completado ? 1 : 0 });
      await this.fetchDetalle(pendienteId);
    },
    async delChecklist(itemId, pendienteId) {
      await axios.delete(`/inovaos/checklist/${itemId}`);
      await this.fetchDetalle(pendienteId);
    },
  },
});
