const CONFIG = {
    // Si estamos en local con Live Server (puerto 5500/5501), apuntamos al backend en 8000.
    // Si estamos en Render o arrancando desde el backend, usamos el origen actual.
    API_BASE_URL: (window.location.port >= '5500' && window.location.port <= '5510') 
        ? 'http://localhost:8000' 
        : window.location.origin,
    DEFAULT_PERIOD: 'Oct 2023'
};
