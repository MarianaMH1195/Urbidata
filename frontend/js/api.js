// ==================== DATOS DE MUNICIPIOS (AMPLIADO) ====================
// Mapeo completo de IDs INE (5 dígitos) a nombres y coordenadas
const MUNICIPALES_DATA = {
    // SEVILLA (41)
    "41091": ["Sevilla", 37.389, -5.984], "41004": ["Alcalá de Guadaíra", 37.338, -5.835],
    "41013": ["Bormujos", 37.361, -6.088], "41038": ["Dos Hermanas", 37.298, -5.921],
    "41078": ["Mairena del Aljarafe", 37.352, -6.035], "41079": ["Mairena del Alcor", 37.371, -5.784],
    "41063": ["La Rinconada", 37.470, -5.975], "41058": ["Morón de la Frontera", 37.118, -5.454],
    "41039": ["Écija", 37.539, -5.082], "41056": ["Marchena", 37.333, -5.380],
    "41003": ["Albaida del Aljarafe", 37.382, -6.143], "41028": ["Coria del Río", 37.300, -6.050],
    "41099": ["Tomares", 37.381, -6.024], "41017": ["Carmona", 37.469, -5.643],
    "41049": ["Lebrija", 36.921, -6.079], "41001": ["Aguadulce", 37.243, -5.074],
    "41002": ["Alanís", 37.896, -5.828], "41005": ["Alcalá del Río", 37.514, -5.975],
    "41006": ["Alcolea del Río", 37.653, -5.635], "41007": ["La Algaba", 37.472, -6.012],
    "41011": ["Arahal", 37.170, -5.549], "41012": ["Aznalcázar", 37.321, -6.273],
    "41014": ["Badolatosa", 37.262, -4.808], "41015": ["Benacazón", 37.377, -6.208],
    "41016": ["Bollullos de la Mitación", 37.320, -6.151], "41021": ["Camas", 37.406, -6.028],
    "41030": ["Castilleja de la Cuesta", 37.382, -6.061], "41041": ["Écija", 37.540, -5.086],
    "41043": ["Estepa", 37.307, -4.870], "41046": ["Gelves", 37.340, -6.018],
    "41051": ["Guillena", 37.584, -6.059], "41052": ["Herrera", 37.376, -5.064],
    "41054": ["Isla Mayor", 37.170, -6.230], "41055": ["La Lantejuela", 37.288, -5.230],
    "41059": ["La Luisiana", 37.568, -5.234], "41061": ["Mairena del Alcor", 37.382, -5.748],
    "41064": ["Marinaleda", 37.307, -5.048], "41066": ["Los Molares", 37.126, -5.688],
    "41067": ["Montellano", 37.065, -5.642], "41071": ["Osuna", 37.243, -5.105],
    "41072": ["Los Palacios y Villafranca", 37.126, -6.037], "41074": ["Paradas", 37.243, -5.385],
    "41075": ["Pedrera", 37.221, -4.928], "41080": ["La Puebla de Cazalla", 37.221, -5.385],
    "41082": ["La Puebla del Río", 37.221, -6.088], "41084": ["La Rinconada", 37.487, -5.955],
    "41089": ["San Juan de Aznalfarache", 37.362, -6.012], "41094": ["Sevilla", 37.382, -5.973],
    "41098": ["Utrera", 37.199, -5.772], "41104": ["El Viso del Alcor", 37.382, -5.748],

    // MÁLAGA (29)
    "29067": ["Málaga", 36.720, -4.420], "29069": ["Marbella", 36.510, -4.884],
    "29065": ["Mijas", 36.598, -4.637], "29014": ["Alpandeire", 36.666, -5.185],
    "29030": ["El Borge", 36.808, -4.208], "29095": ["Ronda", 36.748, -5.166],
    "29084": ["Ronda", 36.745, -5.185], "29043": ["Colmenar", 36.931, -4.321],
    "29051": ["Estepona", 36.435, -5.120], "29013": ["Alozaina", 36.721, -4.839],
    "29010": ["Almargen", 37.075, -4.995], "29078": ["Torremolinos", 36.619, -4.500],
    "29064": ["Jubrique", 36.577, -5.268], "29036": ["Carratraca", 36.782, -4.995],
    "29060": ["Igualeja", 36.666, -5.185], "29001": ["Alameda", 37.202, -4.636],
    "29002": ["Alcaucín", 36.953, -4.077], "29003": ["Alfarnate", 36.953, -4.208],
    "29004": ["Alfarnatejo", 36.965, -4.218], "29005": ["Algarrobo", 36.782, -4.037],
    "29006": ["Algatocín", 36.577, -5.318], "29007": ["Alhaurín de la Torre", 36.671, -4.551],
    "29008": ["Alhaurín el Grande", 36.671, -4.721], "29015": ["Antequera", 37.021, -4.551],
    "29016": ["Árchez", 36.837, -4.077], "29017": ["Archidona", 37.103, -4.372],
    "29025": ["Benalmádena", 36.598, -4.509], "29032": ["Campillos", 37.065, -4.928],
    "29038": ["Cártama", 36.702, -4.673], "29041": ["Casares", 36.435, -5.234],
    "29054": ["Fuengirola", 36.521, -4.625], "29070": ["Mijas", 36.598, -4.636],
    "29075": ["Nerja", 36.745, -3.877], "29082": ["Rincón de la Victoria", 36.721, -4.288],
    "29091": ["Torrox", 36.745, -3.987], "29094": ["Vélez-Málaga", 36.782, -4.077],
    "29901": ["Torremolinos", 36.602, -4.509]
};

// Función para normalizar IDs (quitar sufijos de MITMA como _AM)
const normalizeId = (id) => String(id).split('_')[0];

const Api = {
    normalizeId,
    getName: (id) => MUNICIPALES_DATA[normalizeId(id)]?.[0] || id,
    getLat: (id) => MUNICIPALES_DATA[normalizeId(id)]?.[1],
    getLng: (id) => MUNICIPALES_DATA[normalizeId(id)]?.[2],
    
    getMunicipiosMapping: (prefix) => {
        const result = {};
        Object.keys(MUNICIPALES_DATA).forEach(id => {
            if (id.startsWith(prefix)) result[id] = MUNICIPALES_DATA[id][0];
        });
        return result;
    },

    getCoords: () => {
        const result = {};
        Object.keys(MUNICIPALES_DATA).forEach(id => {
            result[id] = [MUNICIPALES_DATA[id][1], MUNICIPALES_DATA[id][2]];
        });
        return result;
    },

    getMunicipiosSevilla: () => Api.getMunicipiosMapping('41'),
    getMunicipiosMalaga: () => Api.getMunicipiosMapping('29'),

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
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/flujos?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/flujos`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            console.warn("API Flujos returned error, using empty data");
            return [];
        } catch (e) { 
            console.error("Error fetching flujos:", e); 
            return [];
        }
    }
};
