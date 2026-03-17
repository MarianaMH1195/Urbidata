// ==================== DATOS DE MUNICIPIOS (AMPLIADO) ====================
// Mapeo completo de IDs INE (5 dígitos) a [nombre, lat, lng]
const MUNICIPALES_DATA = {
    // --- SEVILLA (41) ---
    "41091": ["Sevilla", 37.3891, -5.9845], "41004": ["Alcalá de Guadaíra", 37.3381, -5.8361],
    "41013": ["Aznalcóllar", 37.5686, -6.2625], "41038": ["Los Corrales", 37.135, -5.069],
    "41078": ["Pilas", 37.2769, -6.3267], "41079": ["Pruna", 36.993, -5.234],
    "41063": ["Marchena", 37.328, -5.396], "41058": ["Lora del Río", 37.6694, -5.539],
    "41039": ["El Cuervo de Sevilla", 36.839, -6.037], "41056": ["Lebrija", 36.921, -6.079],
    "41003": ["Albaida del Aljarafe", 37.382, -6.143], "41028": ["Castilblanco de los Arroyos", 37.747, -6.075],
    "41099": ["Valencina de la Concepción", 37.408, -6.108], "41017": ["Bormujos", 37.375, -6.059],
    "41049": ["Gines", 37.373, -6.078], "41094": ["Sevilla", 37.3891, -5.9845],
    "41001": ["Aguadulce", 37.243, -5.074], "41002": ["Alanís", 37.896, -5.828],
    "41005": ["Alcalá del Río", 37.514, -5.975], "41006": ["Alcolea del Río", 37.653, -5.635],
    "41007": ["La Algaba", 37.472, -6.012], "41011": ["Arahal", 37.170, -5.549],
    "41012": ["Aznalcázar", 37.321, -6.273], "41014": ["Badolatosa", 37.262, -4.808],
    "41015": ["Benacazón", 37.377, -6.208], "41016": ["Bollullos de la Mitación", 37.320, -6.151],
    "41021": ["Camas", 37.406, -6.028], "41030": ["Castilleja de la Cuesta", 37.382, -6.061],
    "41040": ["Dos Hermanas", 37.284, -5.932], "41041": ["Écija", 37.540, -5.086],
    "41043": ["Estepa", 37.307, -4.870], "41046": ["Gelves", 37.340, -6.018],
    "41051": ["Guillena", 37.584, -6.059], "41052": ["Herrera", 37.376, -5.064],
    "41054": ["Isla Mayor", 37.170, -6.230], "41055": ["La Lantejuela", 37.288, -5.230],
    "41059": ["La Luisiana", 37.568, -5.234], "41061": ["Mairena del Alcor", 37.382, -5.748],
    "41062": ["Mairena del Aljarafe", 37.352, -6.035], "41064": ["Marinaleda", 37.307, -5.048],
    "41066": ["Los Molares", 37.126, -5.688], "41067": ["Montellano", 37.065, -5.642],
    "41068": ["Morón de la Frontera", 37.118, -5.454], "41071": ["Osuna", 37.243, -5.105],
    "41072": ["Los Palacios y Villafranca", 37.126, -6.037], "41074": ["Paradas", 37.243, -5.385],
    "41075": ["Pedrera", 37.221, -4.928], "41080": ["La Puebla de Cazalla", 37.221, -5.385],
    "41082": ["La Puebla del Río", 37.221, -6.088], "41084": ["La Rinconada", 37.487, -5.955],
    "41089": ["San Juan de Aznalfarache", 37.362, -6.012], "41098": ["Utrera", 37.199, -5.772],
    "41104": ["El Viso del Alcor", 37.382, -5.748], "41025": ["Carmona", 37.472, -5.642],

    // --- MÁLAGA (29) ---
    "29067": ["Málaga", 36.7202, -4.4203], "29069": ["Marbella", 36.5100, -4.8843],
    "29070": ["Mijas", 36.5961, -4.6381], "29014": ["Alpandeire", 36.6667, -5.1853],
    "29030": ["El Borge", 36.8089, -4.2089], "29095": ["Villanueva de Algaidas", 37.2025, -4.3725],
    "29084": ["Ronda", 36.7469, -5.1625], "29043": ["Colmenar", 36.9314, -4.3214],
    "29051": ["Estepona", 36.4280, -5.1453], "29013": ["Alozaina", 36.7214, -4.8394],
    "29010": ["Almargen", 37.0750, -4.9950], "29078": ["Torremolinos", 36.6220, -4.5000],
    "29064": ["Jubrique", 36.5778, -5.2681], "29036": ["Carratraca", 36.8028, -4.9350],
    "29060": ["Igualeja", 36.6667, -5.1853], "29001": ["Alameda", 37.2025, -4.6361],
    "29002": ["Alcaucín", 36.9536, -4.0772], "29003": ["Alfarnate", 36.9814, -4.2617],
    "29004": ["Alfarnatejo", 36.9658, -4.2181], "29005": ["Algarrobo", 36.7586, -4.0556],
    "29006": ["Algatocín", 36.5778, -5.3181], "29007": ["Alhaurín de la Torre", 36.6614, -4.5519],
    "29008": ["Alhaurín el Grande", 36.6439, -4.6881], "29015": ["Antequera", 37.0208, -4.5603],
    "29016": ["Árchez", 36.8375, -4.0772], "29017": ["Archidona", 37.1039, -4.3725],
    "29025": ["Benalmádena", 36.5986, -4.5097], "29032": ["Campillos", 37.0658, -4.8703],
    "29038": ["Cártama", 36.7028, -4.6414], "29041": ["Casares", 36.4358, -5.2681],
    "29054": ["Fuengirola", 36.5394, -4.6248], "29065": ["Mijas", 36.5961, -4.6381],
    "29075": ["Nerja", 36.7450, -3.8772], "29082": ["Rincón de la Victoria", 36.7214, -4.2883],
    "29091": ["Torrox", 36.7450, -3.9875], "29094": ["Vélez-Málaga", 36.7822, -4.1020],
    "29901": ["Torremolinos", 36.6220, -4.5000], "29068": ["Manilva", 36.3883, -5.2681],
    "29023": ["Benahavís", 36.5214, -5.0500], "29042": ["Coín", 36.6614, -4.7603],
    "29038": ["Cártama", 36.7028, -4.6414]
};

// Función para normalizar IDs de MITMA (quitar sufijos como _AM)
const normalizeId = (id) => String(id).split('_')[0];

const Api = {
    normalizeId,
    getName: (id) => MUNICIPALES_DATA[normalizeId(id)]?.[0] || null,
    getLat:  (id) => MUNICIPALES_DATA[normalizeId(id)]?.[1],
    getLng:  (id) => MUNICIPALES_DATA[normalizeId(id)]?.[2],

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
    getMunicipiosMalaga:  () => Api.getMunicipiosMapping('29'),

    fetchRanking: async (provincia = null) => {
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/ranking?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/ranking`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            return [];
        } catch (e) { console.error("Error fetching ranking:", e); return []; }
    },

    fetchDormitorio: async (provincia = null) => {
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/pueblos_dormitorio?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/pueblos_dormitorio`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            return [];
        } catch (e) { console.error("Error fetching dormitorio:", e); return []; }
    },

    fetchComparativa: async (provincia = null) => {
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/comparativa?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/comparativa`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            return [];
        } catch (e) { console.error("Error fetching comparativa:", e); return []; }
    },

    fetchFlujos: async (provincia = null) => {
        try {
            const url = provincia ? `${CONFIG.API_BASE_URL}/flujos?provincia=${provincia}` : `${CONFIG.API_BASE_URL}/flujos`;
            const response = await fetch(url);
            if (response.ok) return await response.json();
            console.warn("API Flujos returned error, using empty data");
            return [];
        } catch (e) { console.error("Error fetching flujos:", e); return []; }
    }
};
