<template>
  <div ref="pageEl" class="chat-page" :class="{ 'is-mobile': smAndDown, 'list-mode': smAndDown && !chat.activeId }">
    <!-- ===== Lista de conversaciones ===== -->
    <div v-show="showList" class="chat-list">
      <div class="d-flex align-center justify-space-between px-4 py-3 chat-list-head">
        <span class="text-h6 font-weight-bold">Mensajes</span>
        <v-btn icon size="small" color="primary" variant="tonal" @click="openNew">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <v-divider></v-divider>

      <div v-if="!chat.conversations.length" class="text-center text-medium-emphasis py-10 px-4">
        <v-icon size="42" class="mb-2">mdi-message-text-outline</v-icon>
        <div>No tienes conversaciones</div>
        <v-btn class="mt-3" color="primary" variant="tonal" prepend-icon="mdi-plus" @click="openNew">Nuevo chat</v-btn>
      </div>

      <v-list v-else class="py-0" lines="two">
        <template v-for="(c, i) in chat.conversations" :key="c.convId">
          <v-list-item :active="c.convId === chat.activeId" @click="select(c.convId)">
            <template #prepend>
              <v-avatar color="primary" size="46">
                <v-img v-if="c.other && c.other.avatar" :src="c.other.avatar" cover />
                <span v-else class="text-white font-weight-bold">{{ ini(c.other && c.other.name) }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold d-flex justify-space-between">
              <span>{{ c.other ? c.other.name : 'Usuario' }}</span>
              <span class="text-caption text-medium-emphasis font-weight-regular">{{ c.lastMessage ? rel(c.lastMessage.createdAt) : '' }}</span>
            </v-list-item-title>
            <v-list-item-subtitle class="d-flex justify-space-between align-center">
              <span class="text-truncate">
                <span v-if="c.lastMessage && c.lastMessage.senderId === myId" class="text-medium-emphasis">Tú: </span>
                <template v-if="c.lastMessage && c.lastMessage.msgType === 'image'"><v-icon size="14" class="mb-1">mdi-image-outline</v-icon> Foto</template>
                <template v-else>{{ c.lastMessage ? c.lastMessage.body : 'Inicia la conversación' }}</template>
              </span>
              <v-badge v-if="c.unread > 0" :content="c.unread" color="error" inline class="ms-2"></v-badge>
            </v-list-item-subtitle>
          </v-list-item>
          <v-divider v-if="i < chat.conversations.length - 1"></v-divider>
        </template>
      </v-list>
    </div>

    <!-- ===== Hilo de la conversación ===== -->
    <div v-show="showThread" class="chat-thread">
      <template v-if="chat.activeId">
        <div class="d-flex align-center ga-2 px-3 py-2 chat-thread-head">
          <v-btn v-if="smAndDown" icon size="small" variant="text" @click="back"><v-icon>mdi-arrow-left</v-icon></v-btn>
          <v-avatar color="primary" size="38">
            <v-img v-if="chat.other && chat.other.avatar" :src="chat.other.avatar" cover />
            <span v-else class="text-white font-weight-bold text-body-2">{{ ini(chat.other && chat.other.name) }}</span>
          </v-avatar>
          <div class="font-weight-bold">{{ chat.other ? chat.other.name : 'Conversación' }}</div>
        </div>
        <v-divider></v-divider>

        <div ref="scrollBox" class="chat-messages">
          <div v-if="chat.loadingMsgs" class="text-center py-6"><v-progress-circular indeterminate color="primary" size="28" /></div>
          <template v-else>
            <div v-for="m in chat.messages" :key="m.msgId" class="msg-row" :class="{ mine: m.senderId === myId }">
              <div class="msg-bubble" :class="{ mine: m.senderId === myId, 'has-img': m.msgType === 'image' }">
                <v-img
                  v-if="m.msgType === 'image' && m.attachment"
                  :src="m.attachment" :max-width="220" :max-height="280"
                  cover class="msg-img rounded-lg" @click="viewImage(m.attachment)"
                />
                <div v-if="m.body" class="msg-text" :class="{ 'mt-1': m.msgType === 'image' }">{{ m.body }}</div>
                <div class="msg-meta">
                  <span class="msg-time">{{ time(m.createdAt) }}</span>
                  <v-icon v-if="m.senderId === myId" size="15" :color="isRead(m) ? '#34B7F1' : 'rgba(255,255,255,0.75)'" class="ms-1">mdi-check-all</v-icon>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="chat-input">
          <v-btn icon variant="text" size="small" color="primary" class="me-1" :loading="chat.sending" @click="pickImage">
            <v-icon>mdi-image-plus-outline</v-icon>
          </v-btn>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onImage" />
          <v-textarea
            v-model="draft" placeholder="Escribe un mensaje..." rows="1" auto-grow max-rows="5"
            variant="solo" density="comfortable" hide-details rounded="xl" bg-color="surface"
            @keydown.enter.exact.prevent="send"
          ></v-textarea>
          <v-btn icon color="primary" :loading="chat.sending" :disabled="!draft.trim()" @click="send" class="ms-2">
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>
      </template>

      <div v-else class="chat-empty">
        <v-icon size="54" color="primary" class="mb-2">mdi-send-outline</v-icon>
        <div class="text-medium-emphasis">Selecciona una conversación o inicia una nueva</div>
      </div>
    </div>

    <!-- ===== Nuevo chat: elegir usuario ===== -->
    <v-dialog v-model="newDialog" max-width="460">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">Nuevo chat</span>
          <v-btn icon size="small" variant="text" @click="newDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="userSearch" placeholder="Buscar usuario" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details class="mb-2"></v-text-field>
          <v-list class="py-0" style="max-height:360px;overflow:auto">
            <v-list-item v-for="u in usersFiltered" :key="u.userId" @click="startChat(u)">
              <template #prepend>
                <v-avatar color="primary" size="40">
                  <v-img v-if="u.avatar" :src="u.avatar" cover />
                  <span v-else class="text-white font-weight-bold text-body-2">{{ ini(u.name) }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">{{ u.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ u.email }}</v-list-item-subtitle>
            </v-list-item>
            <div v-if="!usersFiltered.length" class="text-center text-medium-emphasis py-6">Sin resultados</div>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Visor de imagen a pantalla completa -->
    <v-dialog v-model="imgViewer" max-width="96vw">
      <div class="img-viewer" @click="imgViewer = false">
        <v-img :src="viewerSrc" max-height="88vh" contain />
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';

const chat = useChatStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { smAndDown } = useDisplay();

const myId = computed(() => authStore.user?.uid);
const draft = ref('');
const newDialog = ref(false);
const userSearch = ref('');
const scrollBox = ref(null);
const pageEl = ref(null);
const fileInput = ref(null);
const imgViewer = ref(false);
const viewerSrc = ref('');
let timer = null;

const showList = computed(() => !smAndDown.value || !chat.activeId);
const showThread = computed(() => !smAndDown.value || !!chat.activeId);

const usersFiltered = computed(() => {
  const q = userSearch.value.trim().toLowerCase();
  if (!q) return chat.users;
  return chat.users.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
});

const ini = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};
const time = (iso) => iso ? new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
const rel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  if (s < 604800) return `${Math.floor(s / 86400)} d`;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};
const isRead = (m) => chat.other && chat.other.lastReadMsgId >= m.msgId;

const scrollBottom = () => nextTick(() => { if (scrollBox.value) scrollBox.value.scrollTop = scrollBox.value.scrollHeight; });

const select = (convId) => router.push(`/app/chat/${convId}`);
const back = () => { chat.clearActive(); router.push('/app/chat'); };

const openNew = async () => { newDialog.value = true; userSearch.value = ''; await chat.fetchUsers(); };
const startChat = async (u) => {
  try {
    const convId = await chat.startWith(u.userId);
    newDialog.value = false;
    await chat.fetchConversations();
    router.push(`/app/chat/${convId}`);
  } catch (e) { /* noop */ }
};

const send = async () => {
  const text = draft.value.trim();
  if (!text) return;
  draft.value = '';
  await chat.sendMessage(text);
  scrollBottom();
};

// --- Adjuntar imagen (usa la cámara / galería del teléfono) ---
const pickImage = () => fileInput.value?.click();
const resizeImage = (file, maxDim = 1024, quality = 0.6) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (Math.max(width, height) > maxDim) {
        const s = maxDim / Math.max(width, height);
        width = Math.round(width * s); height = Math.round(height * s);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});
const onImage = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  try {
    const dataUrl = await resizeImage(file);
    const caption = draft.value.trim();
    draft.value = '';
    await chat.sendMessage(caption, dataUrl);
    scrollBottom();
  } catch (err) { /* noop */ }
};
const viewImage = (src) => { viewerSrc.value = src; imgViewer.value = true; };

const loadFromRoute = async () => {
  const id = route.params.id;
  if (id) { await chat.openConversation(id); applyChatHeight(); scrollBottom(); }
  else chat.clearActive();
  applyChatHeight();
};

// --- Ajuste con el teclado (solo se ajusta el chat, no los encabezados) ---
// En iOS, al abrir el teclado el "visual viewport" se desplaza (offsetTop) y los
// elementos position:fixed (barra superior) se ven arrastrados. Solución robusta:
// anclar el contenedor raíz de la app (#app) exactamente al área visible usando
// visualViewport (alto + translateY(offsetTop)). Así la barra superior y el
// encabezado de la conversación quedan fijos y solo el área de mensajes se ajusta.
const appBarH = () => (document.getElementById('top')?.offsetHeight || 60);
const rootEl = () => document.getElementById('app');
const applyChatHeight = () => {
  const el = pageEl.value;
  const root = rootEl();
  const active = smAndDown.value && chat.activeId;
  if (active && root) {
    const vv = window.visualViewport;
    const vh = vv ? vv.height : window.innerHeight;
    const off = vv ? vv.offsetTop : 0;
    Object.assign(root.style, {
      position: 'fixed', top: '0', left: '0', right: '0', width: '100%',
      height: vh + 'px', transform: `translateY(${off}px)`, overflow: 'hidden',
    });
    document.body.style.overflow = 'hidden';
    if (el) el.style.height = Math.max(220, vh - appBarH()) + 'px';
    scrollBottom();
  } else {
    if (root) {
      Object.assign(root.style, {
        position: '', top: '', left: '', right: '', width: '',
        height: '', transform: '', overflow: '',
      });
    }
    document.body.style.overflow = '';
    if (el) el.style.height = '';
  }
};

watch(() => route.params.id, loadFromRoute);
watch(() => chat.messages.length, scrollBottom);
watch(() => chat.activeId, applyChatHeight);
watch(smAndDown, applyChatHeight);

onMounted(async () => {
  await chat.fetchConversations();
  await loadFromRoute();
  const vv = window.visualViewport;
  if (vv) { vv.addEventListener('resize', applyChatHeight); vv.addEventListener('scroll', applyChatHeight); }
  window.addEventListener('resize', applyChatHeight);
  timer = setInterval(() => {
    chat.fetchUnread();
    if (chat.activeId) chat.refreshActive();
    else chat.fetchConversations();
  }, 4000);
});
const resetRoot = () => {
  const root = rootEl();
  if (root) Object.assign(root.style, { position: '', top: '', left: '', right: '', width: '', height: '', transform: '', overflow: '' });
  document.body.style.overflow = '';
};
onUnmounted(() => {
  if (timer) clearInterval(timer);
  const vv = window.visualViewport;
  if (vv) { vv.removeEventListener('resize', applyChatHeight); vv.removeEventListener('scroll', applyChatHeight); }
  window.removeEventListener('resize', applyChatHeight);
  resetRoot();
});
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100dvh - 60px);
  overflow: hidden;
}
/* En móvil con conversación abierta la barra inferior se oculta → alto completo.
   En la lista (sin conversación) se descuenta la barra flotante. */
.chat-page.is-mobile { height: calc(100dvh - 60px); }
.chat-page.is-mobile.list-mode { height: calc(100dvh - 60px - 92px - env(safe-area-inset-bottom)); }

/* App instalada (standalone): la barra superior crece con el notch
   (60px + safe-area-inset-top), así que hay que descontarlo también. */
@media all and (display-mode: standalone) {
  .chat-page.is-mobile { height: calc(100dvh - 60px - env(safe-area-inset-top)); }
  .chat-page.is-mobile.list-mode { height: calc(100dvh - 60px - env(safe-area-inset-top) - 92px - env(safe-area-inset-bottom)); }
}
.chat-list {
  width: 340px;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.chat-page.is-mobile .chat-list { width: 100%; border-right: none; }
.chat-list-head { position: sticky; top: 0; background: rgb(var(--v-theme-surface)); z-index: 1; }
.chat-thread { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.chat-thread-head { background: rgb(var(--v-theme-surface)); }
.chat-messages { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
.chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; }
.msg-row { display: flex; }
.msg-row.mine { justify-content: flex-end; }
.msg-bubble {
  max-width: 76%;
  padding: 8px 12px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface-variant, var(--v-theme-surface)));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-bottom-left-radius: 4px;
}
.msg-bubble.mine {
  background: rgb(var(--v-theme-primary));
  color: #fff;
  border: none;
  border-radius: 16px;
  border-bottom-right-radius: 4px;
}
.msg-bubble.has-img { padding: 4px; }
.msg-bubble.has-img .msg-text { padding: 0 6px; }
.msg-bubble.has-img .msg-meta { padding: 0 6px 2px; }
.msg-img { cursor: pointer; display: block; }
.msg-text { white-space: pre-wrap; word-break: break-word; font-size: 0.95rem; line-height: 1.35; }
.img-viewer { display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
.msg-meta { display: flex; align-items: center; justify-content: flex-end; gap: 2px; margin-top: 2px; }
.msg-time { font-size: 0.68rem; opacity: 0.7; }
.chat-input {
  display: flex;
  align-items: flex-end;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
}
</style>
