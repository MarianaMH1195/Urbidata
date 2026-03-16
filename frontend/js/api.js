// ==================== DATOS DE MUNICIPIOS ====================
const MUNICIPIOS_SEV = {
    "41091": "Sevilla", "41004": "Alcalá de Guadaíra", "41013": "Bormujos",
    "41038": "Dos Hermanas", "41078": "Mairena del Aljarafe", "41079": "Mairena del Alcor",
    "41063": "La Rinconada", "41058": "Morón de la Frontera", "41039": "Écija",
    "41056": "Marchena", "41003": "Alcalá del Río", "41028": "Coria del Río",
    "41099": "Tomares", "41017": "Carmona", "41049": "Lebrija"
};
const MUNICIPIOS_MAL = {
    "29067": "Málaga", "29069": "Marbella", "29065": "Mijas", "29014": "Antequera",
    "29030": "Benalmádena", "29095": "Ronda", "29084": "Nerja", "29043": "Estepona",
    "29051": "Fuengirola", "29013": "Alhaurín de la Torre", "29010": "Álora",
    "29078": "Torremolinos", "29064": "Vélez-Málaga", "29036": "Coín", "29060": "Manilva"
};

const COORDS = {
    "41091": [37.389, -5.984], "41004": [37.338, -5.835], "41013": [37.361, -6.088],
    "41038": [37.298, -5.921], "41078": [37.375, -6.068], "41079": [37.371, -5.784],
    "41063": [37.470, -5.975], "41058": [37.118, -5.454], "41039": [37.539, -5.082],
    "41056": [37.333, -5.380], "41003": [37.516, -5.977], "41028": [37.289, -6.059],
    "41099": [37.381, -6.024], "41017": [37.469, -5.643], "41049": [36.921, -6.079],
    "29067": [36.717, -4.417], "29069": [36.510, -4.884], "29065": [36.598, -4.637],
    "29014": [37.020, -4.560], "29030": [36.596, -4.516], "29095": [36.748, -5.166],
    "29084": [36.738, -3.879], "29043": [36.424, -5.145], "29051": [36.536, -4.625],
    "29013": [36.666, -4.557], "29010": [36.818, -4.699], "29078": [36.619, -4.500],
    "29064": [36.781, -4.101],    "29036": [36.654, -4.757], "29060": [36.412, -5.246]
};

const Api = {
    fetchRanking: async (provincia = null) => {
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/ranking?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/ranking`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            return [];
        } catch (e) { 
            console.error("Error fetching ranking:", e); 
            return [];
        }
    },

    fetchDormitorio: async (provincia = null) => {
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/pueblos_dormitorio?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/pueblos_dormitorio`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            return [];
        } catch (e) { 
            console.error("Error fetching dormitorio:", e); 
            return [];
        }
    },

    fetchComparativa: async (provincia = null) => {
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/comparativa?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/comparativa`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            return [];
        } catch (e) { 
            console.error("Error fetching comparativa:", e); 
            return [];
        }
    },

    fetchFlujos: async (provincia = null) => {
        // Para este requerimiento específico, utilizaremos los datos simulados refinados
        return Api.generateData(provincia);
    },

    // Generador de datos simulados para pruebas de flujo y dependencia
    generateData: (prov = null) => {
        const seed = 123;
        let s = seed;
        const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        
        const flujos = [];
        const mSevilla = Object.keys(MUNICIPIOS_SEV);
        const mMalaga = Object.keys(MUNICIPIOS_MAL);
        const allKeys = [...mSevilla, ...mMalaga];

        const altaDependencia = ['29051', '29078', '29030', '29013', '29065', 
                                 '41038', '41004', '41078', '41063', '41013'];

        allKeys.forEach(orig => {
            allKeys.forEach(dest => {
                if (orig === dest) return;
                
                // Filtro por provincia seleccionada
                const oProv = mSevilla.includes(orig) ? 'Sevilla' : 'Málaga';
                const dProv = mSevilla.includes(dest) ? 'Sevilla' : 'Málaga';
                if (prov && prov !== 'Todas las provincias' && oProv !== prov && dProv !== prov) return;

                const interprov = (oProv !== dProv);
                let base = Math.exp(rand() * 2) * 100;

                // Lógica de flujos realistas (Problema 1 y 2)
                // Si el destino es una capital, el flujo es mucho mayor
                if (dest === '41091' || dest === '29067') base *= 4.5;
                // Si el origen es una capital, también hay flujo de retorno importante
                if (orig === '41091' || orig === '29067') base *= 2.0;
                // Municipios dormitorio tienen flujo especialmente alto hacia la capital
                if (altaDependencia.includes(orig) && (dest === '41091' || dest === '29067')) base *= 2.5;
                // Flujos interprovinciales son marginales
                if (interprov) base *= 0.08;

                flujos.push({
                    origen: orig,
                    destino: dest,
                    laborable: Math.round(base * (0.7 + rand() * 0.3)),
                    festivo: Math.round(base * (0.3 + rand() * 0.2)),
                    viajes: Math.round(base)
                });
            });
        });

        return flujos.sort((a, b) => b.viajes - a.viajes);
    },

    getCoords: () => COORDS,
    getMunicipiosSevilla: () => MUNICIPIOS_SEV,
    getMunicipiosMalaga: () => MUNICIPIOS_MAL
};
