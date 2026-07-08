<template>
  <v-container class="py-5" style="max-width:840px">
    <div class="d-flex align-center justify-space-between mb-3">
      <h1 class="text-h5 font-weight-bold">Notas</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Nueva nota</v-btn>
    </div>

    <v-tabs v-model="tab" color="primary" class="mb-3">
      <v-tab value="active">Activas</v-tab>
      <v-tab value="done">Finalizadas</v-tab>
    </v-tabs>

    <div v-if="notesStore.loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <div v-if="!list.length" class="text-center text-medium-emphasis py-10">
        <v-icon size="42" class="mb-2">mdi-note-text-outline</v-icon>
        <div>{{ tab === 'active' ? 'No tienes notas activas' : 'No hay notas finalizadas' }}</div>
      </div>

      <v-card v-for="n in list" :key="n.noteId" elevation="0" border class="rounded-xl mb-3">
        <v-card-text>
          <div class="note-body mb-2">
            <span v-for="(p, i) in parts(n)" :key="i" :class="{ 'note-mention': p.m }">{{ p.t }}</span>
          </div>

          <div v-if="n.mentions && n.mentions.length" class="d-flex flex-wrap ga-1 mb-2">
            <v-chip v-for="m in n.mentions" :key="m.userId" size="x-small" color="primary" variant="tonal">
              <v-icon start size="12">mdi-account</v-icon>{{ m.name }}
            </v-chip>
          </div>

          <div class="d-flex align-center justify-space-between flex-wrap ga-2">
            <span class="text-caption text-medium-emphasis">
              <v-icon size="13">mdi-account-edit-outline</v-icon>
              {{ n.isAuthor ? 'Tú' : n.authorName }} · {{ fdate(n.updatedAt) }}
            </span>
            <div class="d-flex ga-1">
              <v-btn v-if="n.status === 'active'" size="small" variant="tonal" color="success" prepend-icon="mdi-check" @click="finish(n)">Finalizar</v-btn>
              <v-btn v-else size="small" variant="tonal" color="primary" prepend-icon="mdi-refresh" @click="reactivate(n)">Reactivar</v-btn>
              <v-btn v-if="n.isAuthor" size="small" variant="text" color="error" icon="mdi-trash-can-outline" @click="del(n)"></v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <!-- Nueva nota -->
    <v-dialog v-model="dialog" max-width="560" :fullscreen="smAndDown">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">Nueva nota</span>
          <v-btn icon size="small" variant="text" @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-2">
            Escribe la nota. Usa <strong>@</strong> para mencionar a un usuario; le llegará una notificación y la verá en sus notas.
          </div>
          <div class="mention-wrap">
            <v-textarea
              ref="ta" v-model="draft" placeholder="Escribe aquí..." rows="4" auto-grow
              variant="outlined" hide-details autofocus
              @update:model-value="detectMention" @keyup="detectMention" @click="detectMention"
            ></v-textarea>
            <v-card v-if="mentionOpen && mentionUsers.length" class="mention-menu" elevation="8">
              <v-list density="compact" class="py-1">
                <v-list-item v-for="u in mentionUsers" :key="u.userId" @click="insertMention(u)">
                  <template #prepend>
                    <v-avatar size="28" color="primary">
                      <v-img v-if="u.avatar" :src="u.avatar" cover />
                      <span v-else class="text-white text-caption">{{ ini(u.name) }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2">{{ u.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
          <div v-if="selectedMentions.length" class="d-flex flex-wrap ga-1 mt-2">
            <v-chip v-for="m in selectedMentions" :key="m.userId" size="small" color="primary" variant="tonal">
              <v-icon start size="14">mdi-at</v-icon>{{ m.name }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!draft.trim()" @click="save">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2500" location="top right">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useDisplay } from 'vuetify';
import { useNotesStore } from '@/stores/notes';

const notesStore = useNotesStore();
const { smAndDown } = useDisplay();

const tab = ref('active');
const dialog = ref(false);
const draft = ref('');
const saving = ref(false);
const ta = ref(null);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const list = computed(() => (tab.value === 'done' ? notesStore.done : notesStore.active));

// --- Menciones (@) ---
const mentionOpen = ref(false);
const mentionQuery = ref('');
const mentionStart = ref(0);
const nativeTa = () => ta.value?.$el?.querySelector('textarea');
const mentionUsers = computed(() => {
  const q = mentionQuery.value;
  return notesStore.users.filter(u => (u.name || '').toLowerCase().includes(q)).slice(0, 6);
});
const selectedMentions = computed(() =>
  notesStore.users.filter(u => draft.value.includes('@' + u.name))
);
const detectMention = () => {
  const el = nativeTa();
  const pos = el ? el.selectionStart : draft.value.length;
  const upto = draft.value.slice(0, pos);
  const m = upto.match(/@([^\s@]{0,40})$/);
  if (m) { mentionQuery.value = m[1].toLowerCase(); mentionStart.value = pos - m[0].length; mentionOpen.value = true; }
  else { mentionOpen.value = false; }
};
const insertMention = (u) => {
  const el = nativeTa();
  const pos = el ? el.selectionStart : draft.value.length;
  const before = draft.value.slice(0, mentionStart.value);
  const after = draft.value.slice(pos);
  const insert = '@' + u.name + ' ';
  draft.value = before + insert + after;
  mentionOpen.value = false;
  nextTick(() => {
    if (el) { const np = (before + insert).length; el.focus(); el.setSelectionRange(np, np); }
  });
};

const ini = (name) => (name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U');
const fdate = (iso) => iso ? new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

// Resalta las @menciones dentro del cuerpo de la nota.
const parts = (note) => {
  const names = (note.mentions || []).map(m => m.name).sort((a, b) => b.length - a.length);
  if (!names.length) return [{ t: note.body, m: false }];
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('@(' + names.map(esc).join('|') + ')', 'g');
  const out = []; let last = 0; let mt;
  while ((mt = re.exec(note.body))) {
    if (mt.index > last) out.push({ t: note.body.slice(last, mt.index), m: false });
    out.push({ t: mt[0], m: true });
    last = mt.index + mt[0].length;
  }
  if (last < note.body.length) out.push({ t: note.body.slice(last), m: false });
  return out;
};

const openNew = async () => {
  draft.value = '';
  mentionOpen.value = false;
  dialog.value = true;
  if (!notesStore.users.length) await notesStore.fetchUsers();
};
const save = async () => {
  const body = draft.value.trim();
  if (!body) return;
  saving.value = true;
  try {
    const mentions = selectedMentions.value.map(u => u.userId);
    await notesStore.create(body, mentions);
    dialog.value = false;
    notify(mentions.length ? 'Nota creada y usuarios notificados' : 'Nota creada');
    await notesStore.fetch('active');
    tab.value = 'active';
  } catch (e) { notify('No se pudo crear la nota', 'error'); }
  finally { saving.value = false; }
};

const finish = async (n) => { await notesStore.setStatus(n.noteId, 'done'); await reload(); };
const reactivate = async (n) => { await notesStore.setStatus(n.noteId, 'active'); await reload(); };
const del = async (n) => { await notesStore.remove(n.noteId); await reload(); };
const reload = async () => { await notesStore.fetch('active'); await notesStore.fetch('done'); };

watch(tab, (t) => notesStore.fetch(t));

onMounted(async () => {
  await notesStore.fetch('active');
  notesStore.fetchUsers();
});
</script>

<style scoped>
.note-body { white-space: pre-wrap; word-break: break-word; line-height: 1.4; }
.note-mention { color: rgb(var(--v-theme-primary)); font-weight: 600; }
.mention-wrap { position: relative; }
.mention-menu {
  position: absolute;
  left: 8px; right: 8px;
  top: 100%;
  margin-top: -6px;
  z-index: 30;
  max-height: 240px;
  overflow-y: auto;
  border-radius: 12px;
}
</style>
