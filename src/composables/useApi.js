// Composable para obtener la URL base de la API dinámicamente
import config from '@/config';

export function useApi() {
    const API_BASE_URL = config.API_BASE_URL;

    return {
        API_BASE_URL
    };
}
