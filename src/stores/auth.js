// client/src/store/auth.js
import { defineStore } from 'pinia';
import axios from '@/utils/axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null, // Recuperar si recarga la página
        step: 1, // 1: Pedir Correo, 2: Pedir Código
        loading: false,
        error: null,
        tempEmail: '' // Guardamos el email temporalmente entre pasos
    }),

    getters: {
        isAuthenticated: (state) => !!state.token
    },

    actions: {
        // PASO 1: Solicitar Código
        async requestLoginCode(email) {
            this.loading = true;
            this.error = null;
            try {
                await axios.post('/auth/login-request', { email });
                this.tempEmail = email;
                this.step = 2; // Avanzar al paso 2
            } catch (err) {
                console.error(err);
                this.error = err.response?.data?.msg || 'Error de conexión';
            } finally {
                this.loading = false;
            }
        },

        // PASO 2: Verificar Código
        async verifyLoginCode(code) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('/auth/login-verify', {
                    email: this.tempEmail,
                    code
                });

                // Guardar sesión
                this.token = response.data.token;
                this.user = response.data.user;

                localStorage.setItem('token', this.token); // Persistencia

                return true; // Éxito
            } catch (err) {
                console.error(err);
                this.error = err.response?.data?.msg || 'Código incorrecto';
                return false;
            } finally {
                this.loading = false;
            }
        },

        // Restaurar perfil al recargar
        async restoreSession() {
            if (!this.token) return;
            try {
                const response = await axios.get('/auth/profile');
                this.user = response.data.user;
            } catch (err) {
                console.error("Error restaurando sesión", err);
                this.logout();
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            this.step = 1;
            this.tempEmail = '';
            localStorage.removeItem('token');
        }
    }
});
