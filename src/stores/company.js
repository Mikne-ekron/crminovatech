// Store multi-empresa
// Maneja qué empresa SAP está activa (SBOINOVA / SBOMIKNE / SBOLOG).
// Persiste la selección en localStorage. El interceptor de axios lee
// `currentCompany` y lo envía en el header X-Company de cada request.

import { defineStore } from 'pinia';

import inovatechLogoLight from '@/assets/images/logos/companies/inovatech-light.svg';
import inovatechLogoDark from '@/assets/images/logos/companies/inovatech-dark.svg';
import mikneLogoLight from '@/assets/images/logos/companies/mikne-light.png';
import mikneLogoDark from '@/assets/images/logos/companies/mikne-dark.png';
import logLogoLight from '@/assets/images/logos/companies/log-light.svg';
import logLogoDark from '@/assets/images/logos/companies/log-dark.svg';

// printLogo = logo apropiado para fondo BLANCO (documentos impresos / quote-paper).
// Difiere de logoLight cuando la empresa fuerza un logo claro en el header (Mikne).
export const COMPANIES = [
    {
        id: 'SBOINOVA',
        label: 'Inovatech',
        shortLabel: 'Inovatech',
        themeLight: 'INOVATECH_LIGHT',
        themeDark: 'INOVATECH_DARK',
        logoLight: inovatechLogoLight,
        logoDark: inovatechLogoDark,
        printLogo: inovatechLogoLight,
        color: '#1B84FF'
    },
    {
        id: 'SBOMIKNE',
        label: 'Mikne',
        shortLabel: 'Mikne',
        themeLight: 'MIKNE_LIGHT',
        themeDark: 'MIKNE_DARK',
        // Mikne usa el mismo logo blanco en ambos modos del header por preferencia de marca.
        logoLight: mikneLogoDark,
        logoDark: mikneLogoDark,
        // Pero para impresión sobre papel blanco usa el logo negro.
        printLogo: mikneLogoLight,
        color: '#0066CC'
    },
    {
        id: 'SBOLOG',
        label: 'Log Company',
        shortLabel: 'Log',
        themeLight: 'LOG_LIGHT',
        themeDark: 'LOG_DARK',
        logoLight: logLogoLight,
        logoDark: logLogoDark,
        printLogo: logLogoLight,
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
