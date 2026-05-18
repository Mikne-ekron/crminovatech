// Temas Vuetify por empresa. Cada empresa expone una variante LIGHT y DARK.
// Inovatech reutiliza los colores del tema azul existente; Mikne usa azules
// referenciados de mikne.com.mx; Log Company usa verde oscuro + grises.

// === INOVATECH ===
const INOVATECH_LIGHT = {
    name: 'INOVATECH_LIGHT',
    dark: false,
    variables: { 'border-color': '#ebf1f6', 'border-opacity': 1 },
    colors: {
        primary: '#1B84FF',
        secondary: '#43CED7',
        info: '#2CABE3',
        success: '#2CD07E',
        accent: '#FFAB91',
        warning: '#F6C000',
        error: '#F8285A',
        purple: '#725AF2',
        indigo: '#6610f2',
        lightprimary: '#EDF5FD',
        lightsecondary: '#F2FCFC',
        lightsuccess: '#EDFDF2',
        lighterror: '#FFF0F4',
        lightwarning: '#FFFCF0',
        lightinfo: '#E4F5FF',
        textPrimary: '#3A4752',
        textSecondary: '#768B9E',
        borderColor: '#ebf1f6',
        inputBorder: '#DFE5EF',
        containerBg: '#ffffff',
        background: '#eef5f9',
        hoverColor: '#f6f9fc',
        surface: '#fff',
        'on-surface-variant': '#fff',
        grey100: '#F2F6FA',
        grey200: '#EAEFF4'
    }
};

const INOVATECH_DARK = {
    name: 'INOVATECH_DARK',
    dark: true,
    variables: { 'border-color': '#2a2f3a', 'border-opacity': 1 },
    colors: {
        primary: '#1B84FF',
        secondary: '#43CED7',
        info: '#2CABE3',
        success: '#2CD07E',
        accent: '#FFAB91',
        warning: '#F6C000',
        error: '#F8285A',
        purple: '#725AF2',
        indigo: '#6610f2',
        lightprimary: '#0d2238',
        lightsecondary: '#0d2828',
        lightsuccess: '#0e2818',
        lighterror: '#2c0c14',
        lightwarning: '#2c2410',
        lightinfo: '#0c1d2e',
        textPrimary: '#E6EAF2',
        textSecondary: '#9CA4B0',
        borderColor: '#2a2f3a',
        inputBorder: '#3a4252',
        containerBg: '#1a1f2b',
        background: '#0f1320',
        hoverColor: '#1c2230',
        surface: '#1a1f2b',
        'on-surface-variant': '#E6EAF2',
        grey100: '#22293a',
        grey200: '#2a3344'
    }
};

// === MIKNE ===
// Azules más oscuros y profundos (referenciados de mikne.com.mx)
const MIKNE_LIGHT = {
    name: 'MIKNE_LIGHT',
    dark: false,
    variables: { 'border-color': '#e5edf5', 'border-opacity': 1 },
    colors: {
        primary: '#0066CC',
        secondary: '#0099E5',
        info: '#0078D4',
        success: '#2CD07E',
        accent: '#5BA3F5',
        warning: '#F6C000',
        error: '#F8285A',
        purple: '#5A4FCF',
        indigo: '#4338CA',
        lightprimary: '#E6F0FA',
        lightsecondary: '#E6F5FC',
        lightsuccess: '#EDFDF2',
        lighterror: '#FFF0F4',
        lightwarning: '#FFFCF0',
        lightinfo: '#E0F0FF',
        textPrimary: '#0A2540',
        textSecondary: '#5A6F87',
        borderColor: '#e5edf5',
        inputBorder: '#D0DDE9',
        containerBg: '#ffffff',
        background: '#F4F8FC',
        hoverColor: '#f0f6fc',
        surface: '#fff',
        'on-surface-variant': '#fff',
        grey100: '#EEF3F8',
        grey200: '#E0E8F1'
    }
};

const MIKNE_DARK = {
    name: 'MIKNE_DARK',
    dark: true,
    variables: { 'border-color': '#1f2a3a', 'border-opacity': 1 },
    colors: {
        primary: '#3B8EE8',
        secondary: '#0099E5',
        info: '#0078D4',
        success: '#2CD07E',
        accent: '#5BA3F5',
        warning: '#F6C000',
        error: '#F8285A',
        purple: '#5A4FCF',
        indigo: '#4338CA',
        lightprimary: '#0a1e36',
        lightsecondary: '#0a2434',
        lightsuccess: '#0e2818',
        lighterror: '#2c0c14',
        lightwarning: '#2c2410',
        lightinfo: '#0a1f33',
        textPrimary: '#E6EEF7',
        textSecondary: '#9AB0C8',
        borderColor: '#1f2a3a',
        inputBorder: '#2e3d52',
        containerBg: '#0f1a2a',
        background: '#0a121f',
        hoverColor: '#142035',
        surface: '#0f1a2a',
        'on-surface-variant': '#E6EEF7',
        grey100: '#1a2436',
        grey200: '#222d44'
    }
};

// === LOG COMPANY ===
// Verde oscuro + grises (no tiene branding propio, se inventa coherente)
const LOG_LIGHT = {
    name: 'LOG_LIGHT',
    dark: false,
    variables: { 'border-color': '#e5e9ec', 'border-opacity': 1 },
    colors: {
        primary: '#1B4332',
        secondary: '#52B788',
        info: '#588157',
        success: '#52B788',
        accent: '#74C69D',
        warning: '#F6C000',
        error: '#D62828',
        purple: '#6B7280',
        indigo: '#4B5563',
        lightprimary: '#E8F0EC',
        lightsecondary: '#EBF7F0',
        lightsuccess: '#EBF7F0',
        lighterror: '#FBEBEB',
        lightwarning: '#FFFCF0',
        lightinfo: '#EEF2EE',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        borderColor: '#e5e9ec',
        inputBorder: '#D1D5DB',
        containerBg: '#ffffff',
        background: '#F4F6F4',
        hoverColor: '#EEF2EE',
        surface: '#fff',
        'on-surface-variant': '#fff',
        grey100: '#F2F4F2',
        grey200: '#E4E8E4'
    }
};

const LOG_DARK = {
    name: 'LOG_DARK',
    dark: true,
    variables: { 'border-color': '#283233', 'border-opacity': 1 },
    colors: {
        primary: '#52B788',
        secondary: '#74C69D',
        info: '#588157',
        success: '#52B788',
        accent: '#74C69D',
        warning: '#F6C000',
        error: '#E5544D',
        purple: '#9CA3AF',
        indigo: '#6B7280',
        lightprimary: '#0e2218',
        lightsecondary: '#0e2218',
        lightsuccess: '#0e2818',
        lighterror: '#2c0c14',
        lightwarning: '#2c2410',
        lightinfo: '#0e1f0e',
        textPrimary: '#E5E9EB',
        textSecondary: '#9CA3AF',
        borderColor: '#283233',
        inputBorder: '#374043',
        containerBg: '#181F20',
        background: '#0F1414',
        hoverColor: '#1a2122',
        surface: '#181F20',
        'on-surface-variant': '#E5E9EB',
        grey100: '#1F2628',
        grey200: '#2A3134'
    }
};

export const COMPANY_THEMES = {
    INOVATECH_LIGHT,
    INOVATECH_DARK,
    MIKNE_LIGHT,
    MIKNE_DARK,
    LOG_LIGHT,
    LOG_DARK
};
