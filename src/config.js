const getApiBaseUrl = () => {
    if (import.meta.env.PROD) {
        return (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
    }
    return 'http://localhost:8099/api';
};

export default {
    Sidebar_drawer: true,
    Customizer_drawer: false,
    mini_sidebar: true, // arranca colapsado (rail) en desktop
    setHorizontalLayout: false, // Horizontal layout
    setRTLLayout: false, // RTL layout
    actTheme: 'BLUE_THEME',
    inputBg: false,
    boxed: false,
    setBorderCard: false,
    API_BASE_URL: getApiBaseUrl()
};
