// Store multi-empresa
// Maneja qué empresa SAP está activa (SBOINOVA / SBOMIKNE / SBOLOG).
// Persiste la selección en localStorage. El interceptor de axios lee
// `currentCompany` y lo envía en el header X-Company de cada request.

import { defineStore } from 'pinia';

import inovatechLogoWhite from '@/assets/images/logos/companies/inovatech-light.svg'; // logolight: BLANCO
import inovatechLogoBlue from '@/assets/images/logos/logo-blue.png';                 // AZUL (para papel)
import mikneLogoBlack from '@/assets/images/logos/companies/mikne-light.png';        // mikne "light": NEGRO
import mikneLogoWhite from '@/assets/images/logos/companies/mikne-dark.png';         // mikne "dark": BLANCO
import logLogoDarkText from '@/assets/images/logos/companies/log-light.svg';         // texto verde oscuro
import logLogoWhiteText from '@/assets/images/logos/companies/log-dark.svg';         // texto blanco

// El header (Logo.vue) siempre va sobre el app-bar de color primary → necesita
// el logo CLARO/blanco en ambos modos. El papel/impresión y el quote-paper en
// modo claro van sobre fondo blanco → necesitan el logo OSCURO (printLogo).
//   logoLight / logoDark : versión clara (header de color)
//   printLogo            : versión oscura (fondo blanco)
export const COMPANIES = [
    {
        id: 'SBOINOVA',
        label: 'Inovatech',
        shortLabel: 'Inovatech',
        themeLight: 'INOVATECH_LIGHT',
        themeDark: 'INOVATECH_DARK',
        logoLight: inovatechLogoWhite,
        logoDark: inovatechLogoWhite,
        printLogo: inovatechLogoBlue,
        color: '#1B84FF'
    },
    {
        id: 'SBOMIKNE',
        label: 'Mikne',
        shortLabel: 'Mikne',
        themeLight: 'MIKNE_LIGHT',
        themeDark: 'MIKNE_DARK',
        logoLight: mikneLogoWhite,
        logoDark: mikneLogoWhite,
        printLogo: mikneLogoBlack,
        color: '#0066CC'
    },
    {
        id: 'SBOLOG',
        label: 'Log Company',
        shortLabel: 'Log',
        themeLight: 'LOG_LIGHT',
        themeDark: 'LOG_DARK',
        logoLight: logLogoWhiteText,
        logoDark: logLogoWhiteText,
        printLogo: logLogoDarkText,
        color: '#1B4332'
    }
];

const STORAGE_KEY = 'currentCompany';
const DEFAULT_COMPANY = 'SBOINOVA';

const validateId = (id) => COMPANIES.some(c => c.id === id) ? id : DEFAULT_COMPANY;

export const useCompanyStore = defineStore('company', {
    state: () => ({
        currentCompany: validateId(localStorage.getItem(STORAGE_KEY) || DEFAULT_COMPANY)
    }),
    getters: {
        company: (state) => COMPANIES.find(c => c.id === state.currentCompany),
        companies: () => COMPANIES
    },
    actions: {
        setCompany(id) {
            const valid = validateId(id);
            if (valid !== this.currentCompany) {
                this.currentCompany = valid;
                localStorage.setItem(STORAGE_KEY, valid);
            }
        }
    }
});
