<template>
  <div class="pa-0 h-screen overflow-hidden">
    <v-row class="ma-0 fill-height auth">
      <!-- Panel Izquierdo: Formulario -->
      <v-col cols="12" lg="5" xl="4" class="d-flex align-center justify-center bg-surface">
        <div class="pa-10 w-100 mw-500">
          <div class="mb-10">
             <h1 class="text-h3 font-weight-black text-primary">Inovatech</h1>
             <div class="text-subtitle-1 text-grey-darken-1">Portal Corporativo</div>
          </div>

          <h2 class="text-h4 font-weight-bold mb-2">¡Bienvenido!</h2>
          <p class="text-body-1 text-grey-darken-1 mb-8">
            {{ step === 1 ? 'Ingresa tu correo para recibir un código.' : 'Ingresa el código que enviamos a tu correo.' }}
          </p>

          <v-window v-model="step" style="overflow: visible;">
            <!-- PASO 1: Email -->
            <v-window-item :value="1">
              <v-label class="text-subtitle-1 font-weight-medium mb-2">Correo Electrónico</v-label>
              <v-text-field
                v-model="email"
                prepend-inner-icon="mdi-email-outline"
                placeholder="ejemplo@inovatech.com"
                variant="outlined"
                color="primary"
                :error-messages="authStore.error"
                @keyup.enter="enviarCodigo"
                class="mb-6"
                hide-details="auto"
              ></v-text-field>
              
              <v-btn
                block
                color="primary"
                size="large"
                variant="elevated"
                :loading="authStore.loading"
                @click="enviarCodigo"
                class="rounded-lg py-6 h-auto font-weight-bold"
              >
                Enviar Código
              </v-btn>
            </v-window-item>

            <!-- PASO 2: Código -->
            <v-window-item :value="2">
              <div class="bg-grey-lighten-4 pa-4 rounded-lg mb-6 d-flex align-center">
                <v-icon color="grey" class="mr-3">mdi-information-outline</v-icon>
                <div>
                   <div class="text-caption text-grey">Código enviado a:</div>
                   <div class="font-weight-bold text-body-2">{{ authStore.tempEmail }}</div>
                </div>
              </div>

              <v-label class="text-subtitle-1 font-weight-medium mb-2">Código de Verificación</v-label>
              <v-text-field
                v-model="code"
                prepend-inner-icon="mdi-lock-outline"
                placeholder="000000"
                variant="outlined"
                color="primary"
                class="text-center-input mb-4"
                maxlength="6"
                :error-messages="authStore.error"
                @keyup.enter="verificarCodigo"
                hide-details="auto"
              ></v-text-field>

              <div class="d-flex flex-column gap-3">
                <v-btn
                  block
                  color="primary"
                  size="large"
                  variant="elevated"
                  :loading="authStore.loading"
                  @click="verificarCodigo"
                  class="rounded-lg py-6 h-auto font-weight-bold"
                >
                  Iniciar Sesión
                </v-btn>
                
                <v-btn
                  variant="text"
                  color="primary"
                  class="text-none"
                  @click="authStore.step = 1"
                >
                  ¿Correo incorrecto? Cambiar
                </v-btn>
              </div>
            </v-window-item>
          </v-window>

          <div class="mt-10 text-center text-caption text-grey">
            &copy; {{ new Date().getFullYear() }} Inovatech Systems. Todos los derechos reservados.
          </div>
        </div>
      </v-col>

      <!-- Panel Derecho: Background -->
      <v-col cols="12" lg="7" xl="8" class="d-none d-lg-flex align-center justify-center bg-grey-lighten-4 position-relative">
        <div class="login-decoration position-absolute"></div>
        <div class="pa-16 text-center z-index-1">
          <v-img
            src="@/assets/images/backgrounds/login-bg.png"
            max-width="600"
            class="mx-auto floating-img"
          ></v-img>
          
          <div class="mt-10">
            <h2 class="text-h3 font-weight-black text-black mb-4">Eficiencia y Control</h2>
            <p class="text-h6 text-grey-darken-2 font-weight-medium max-w-600 mx-auto">
              Gestiona todas tus operaciones corporativas en una sola plataforma unificada con la mayor seguridad.
            </p>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const code = ref('');

const step = computed(() => authStore.step);

const enviarCodigo = async () => {
    if(!email.value) return;
    await authStore.requestLoginCode(email.value);
};

const verificarCodigo = async () => {
    if(!code.value) return;
    const success = await authStore.verifyLoginCode(code.value);
    
    if (success) {
        router.push('/app/dashboard'); 
    }
};
</script>

<style scoped>
.h-screen {
  height: 100vh;
}
.mw-500 {
  max-width: 500px;
}
.max-w-600 {
  max-width: 600px;
}
.z-index-1 {
  z-index: 1;
}

/* Decoración para el panel derecho */
.login-decoration {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: radial-gradient(circle at 70% 30%, rgba(var(--v-theme-primary), 0.05) 0%, transparent 60%);
}

.floating-img {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

:deep(.text-center-input .v-field__input) {
  text-align: center !important;
  font-size: 1.5rem !important;
  letter-spacing: 0.5rem !important;
  padding-left: 1.5rem !important; /* Compensar letter-spacing */
}

/* Centrar placeholders */
:deep(.text-center-input .v-field__input::placeholder) {
  letter-spacing: normal !important;
  font-size: 1rem !important;
}
</style>
