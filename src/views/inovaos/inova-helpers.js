// Helpers compartidos del módulo InovaOS (escritorio).

export const ESTATUS = [
  { key: 'capturado', label: 'Capturado', color: 'grey', icon: 'mdi-inbox-outline' },
  { key: 'delegado', label: 'Delegado', color: 'indigo', icon: 'mdi-send-outline' },
  { key: 'aceptado', label: 'Aceptado', color: 'cyan', icon: 'mdi-check' },
  { key: 'reagendado', label: 'Reagendado', color: 'deep-purple', icon: 'mdi-calendar-refresh-outline' },
  { key: 'en_progreso', label: 'En progreso', color: 'blue', icon: 'mdi-play' },
  { key: 'en_espera', label: 'En espera', color: 'orange', icon: 'mdi-pause' },
  { key: 'concluido', label: 'Concluido', color: 'teal', icon: 'mdi-flag-checkered' },
  { key: 'aprobado', label: 'Aprobado', color: 'green', icon: 'mdi-check-decagram' },
];
export const estatusMeta = (k) => ESTATUS.find((e) => e.key === k) || { label: k, color: 'grey', icon: 'mdi-circle-outline' };

// Semáforo del tablero (mismos colores que la app móvil).
export const SEMAFORO = [
  { key: 'vencido', label: 'Vencidos', color: '#ff453a' },
  { key: 'hoy', label: 'Vencen hoy', color: '#ff9f0a' },
  { key: 'manana', label: 'Vencen mañana', color: '#ffd60a' },
  { key: 'tiempo', label: 'En tiempo', color: '#30d158' },
  { key: 'concluido', label: 'Concluidos', color: '#0a84ff' },
  { key: 'espera', label: 'Esperando respuesta', color: '#bf5af2' },
];

export const colorPrioridad = (p) => ({ Alta: '#ff453a', Media: '#ff9f0a', Baja: '#30d158' }[p] || '#8a8699');

export const fdate = (iso) =>
  iso ? new Date(String(iso).slice(0, 10) + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fdatetime = (iso) =>
  iso ? new Date(String(iso).replace(' ', 'T') + 'Z').toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Monterrey' }) : '';

// Color/etiqueta de semáforo de un pendiente (equivale a colorEstatus del backend).
export const semaforo = (p) => {
  if (['concluido', 'aprobado'].includes(p.estatus)) return { c: 'success', t: 'Concluido' };
  if (p.estatus === 'en_espera') return { c: 'grey', t: 'En espera' };
  if (!p.fecha_compromiso) return { c: 'grey', t: 'Sin fecha' };
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const f = new Date(String(p.fecha_compromiso).slice(0, 10) + 'T12:00:00'); f.setHours(0, 0, 0, 0);
  const dd = Math.round((f - hoy) / 86400000);
  if (dd < 0) return { c: 'error', t: `Vencido ${Math.abs(dd)}d` };
  if (dd === 0) return { c: 'error', t: 'Hoy' };
  if (dd === 1) return { c: 'warning', t: 'Mañana' };
  return { c: 'success', t: `En ${dd}d` };
};

// Acciones de estatus permitidas según si el usuario (myId) es creador/responsable.
export const accionesEstatus = (p, myId) => {
  const out = [];
  const esCreador = myId != null && Number(p.creado_por) === myId;
  const esResp = myId != null && Number(p.responsable_id) === myId;
  const est = p.estatus;
  if (esResp) {
    if (est === 'delegado') out.push({ e: 'aceptado', t: 'Aceptar', i: 'mdi-check', c: 'success' });
    if (['aceptado', 'en_espera', 'reagendado'].includes(est)) out.push({ e: 'en_progreso', t: 'Iniciar', i: 'mdi-play', c: 'primary' });
    if (est === 'en_progreso') {
      out.push({ e: 'en_espera', t: 'En espera', i: 'mdi-pause', c: 'warning' });
      out.push({ e: 'concluido', t: 'Concluir', i: 'mdi-flag-checkered', c: 'success' });
    }
    if (['delegado', 'aceptado', 'en_progreso', 'en_espera'].includes(est)) out.push({ e: 'reagendado', t: 'Reagendar', i: 'mdi-calendar-edit', c: 'grey', fecha: true });
  }
  if (esCreador && est === 'concluido') {
    out.push({ e: 'aprobado', t: 'Aprobar', i: 'mdi-check-decagram', c: 'success' });
    out.push({ e: 'en_progreso', t: 'Devolver', i: 'mdi-undo', c: 'error' });
  }
  return out;
};

export const esCreador = (p, myId) => myId != null && Number(p.creado_por) === myId;
export const esResp = (p, myId) => myId != null && Number(p.responsable_id) === myId;

export const msgError = (err) => err?.response?.data?.error || err?.response?.data?.msg || 'Ocurrió un error';
