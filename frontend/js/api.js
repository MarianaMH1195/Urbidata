// ==================== DATOS DE MUNICIPIOS (AMPLIADO) ====================
// Mapeo completo de IDs INE  →  [nombre, lat, lng]
// Cubre TODOS los IDs que devuelve el backend para que ninguna línea se pierda
const MUNICIPALES_DATA = {
    // --- SEVILLA (41) ---
    "41091": ["Sevilla",                       37.3891, -5.9845],
    "41094": ["Sevilla",                       37.3891, -5.9845],
    "41004": ["Alcalá de Guadaíra",            37.3381, -5.8361],
    "41040": ["Dos Hermanas",                  37.2847, -5.9325],
    "41038": ["Los Corrales",                  37.1350, -5.0697],
    "41068": ["Morón de la Frontera",          37.1264, -5.4592],
    "41063": ["Marchena",                      37.3281, -5.3958],
    "41058": ["Lora del Río",                  37.6694, -5.5394],
    "41056": ["Lebrija",                       36.9214, -6.0786],
    "41049": ["Gines",                         37.3739, -6.0786],
    "41017": ["Bormujos",                      37.3739, -6.0594],
    "41099": ["Valencina de la Concepción",    37.4086, -6.1086],
    "41078": ["Pilas",                         37.2769, -6.3267],
    "41079": ["Pruna",                         36.9939, -5.2342],
    "41013": ["Aznalcóllar",                   37.5686, -6.2625],
    "41039": ["El Cuervo de Sevilla",          36.8394, -6.0375],
    "41003": ["Albaida del Aljarafe",          37.3828, -6.1436],
    "41028": ["Castilblanco de los Arroyos",   37.7472, -6.0750],
    "41001": ["Aguadulce",                     37.2435, -5.0747],
    "41002": ["Alanís",                        37.8967, -5.8286],
    "41005": ["Alcalá del Río",                37.5147, -5.9750],
    "41006": ["Alcolea del Río",               37.6531, -5.6358],
    "41007": ["La Algaba",                     37.4728, -6.0125],
    "41011": ["Arahal",                        37.1706, -5.5497],
    "41012": ["Aznalcázar",                    37.3219, -6.2733],
    "41014": ["Badolatosa",                    37.2622, -4.8089],
    "41015": ["Benacazón",                     37.3775, -6.2081],
    "41016": ["Bollullos de la Mitación",      37.3203, -6.1511],
    "41018": ["Brenes",                        37.5456, -5.8672],
    "41019": ["Burguillos",                    37.5853, -5.9739],
    "41020": ["Las Cabezas de San Juan",       36.9947, -5.9381],
    "41021": ["Camas",                         37.4061, -6.0286],
    "41022": ["La Campana",                    37.5842, -5.4439],
    "41023": ["Cantillana",                    37.6183, -5.7975],
    "41024": ["Cañada Rosal",                  37.5750, -5.2342],
    "41025": ["Carmona",                       37.4725, -5.6425],
    "41026": ["Carrión de los Céspedes",       37.3714, -6.3056],
    "41027": ["Casariche",                     37.2883, -4.8217],
    "41029": ["Castilleja de Guzmán",          37.4086, -6.0689],
    "41030": ["Castilleja de la Cuesta",       37.3828, -6.0619],
    "41031": ["Castilleja del Campo",          37.3486, -6.2950],
    "41033": ["Cazalla de la Sierra",          37.8972, -5.7533],
    "41034": ["Constantina",                   37.8864, -5.5978],
    "41035": ["Coria del Río",                 37.3003, -6.0508],
    "41036": ["Coripe",                        36.9939, -5.4989],
    "41037": ["El Coronil",                    37.0658, -5.6267],
    "41041": ["Écija",                         37.5408, -5.0864],
    "41042": ["Espartinas",                    37.3756, -6.1086],
    "41043": ["Estepa",                        37.3078, -4.8703],
    "41044": ["Fuentes de Andalucía",          37.4608, -5.3853],
    "41045": ["El Garrobo",                    37.6694, -6.2083],
    "41046": ["Gelves",                        37.3400, -6.0189],
    "41047": ["Gerena",                        37.5147, -6.1772],
    "41048": ["Gilena",                        37.2606, -4.9458],
    "41050": ["Guadalcanal",                   38.0772, -5.8778],
    "41051": ["Guillena",                      37.5847, -6.0594],
    "41052": ["Herrera",                       37.3769, -5.0642],
    "41053": ["Huévar del Aljarafe",           37.3622, -6.3267],
    "41054": ["Isla Mayor",                    37.1706, -6.2306],
    "41055": ["La Lantejuela",                 37.2889, -5.2306],
    "41059": ["La Luisiana",                   37.5686, -5.2342],
    "41060": ["El Madroño",                    37.6694, -6.5750],
    "41061": ["Mairena del Alcor",             37.3828, -5.7483],
    "41062": ["Mairena del Aljarafe",          37.3525, -6.0353],
    "41064": ["Marinaleda",                    37.3078, -5.0489],
    "41065": ["Martín de la Jara",             37.1350, -4.9750],
    "41066": ["Los Molares",                   37.1264, -5.6883],
    "41067": ["Montellano",                    37.0658, -5.6425],
    "41069": ["Las Navas de la Concepción",    37.9864, -5.7083],
    "41070": ["Olivares",                      37.4086, -6.1556],
    "41071": ["Osuna",                         37.2435, -5.1056],
    "41072": ["Los Palacios y Villafranca",    37.1264, -6.0375],
    "41073": ["Palomares del Río",             37.3203, -6.0689],
    "41074": ["Paradas",                       37.2435, -5.3853],
    "41075": ["Pedrera",                       37.2217, -4.9286],
    "41076": ["El Pedroso",                    37.7472, -5.7722],
    "41077": ["Peñaflor",                      37.6694, -5.3972],
    "41080": ["La Puebla de Cazalla",          37.2217, -5.3853],
    "41081": ["La Puebla de los Infantes",     37.7853, -5.3972],
    "41082": ["La Puebla del Río",             37.2217, -6.0889],
    "41083": ["El Real de la Jara",            37.9864, -6.1367],
    "41084": ["La Rinconada",                  37.4875, -5.9556],
    "41085": ["La Roda de Andalucía",          37.2435, -4.7925],
    "41086": ["El Ronquillo",                  37.7853, -6.2083],
    "41087": ["El Rubio",                      37.2622, -5.0239],
    "41088": ["Salteras",                      37.4086, -6.1086],
    "41089": ["San Juan de Aznalfarache",      37.3622, -6.0125],
    "41090": ["San Nicolás del Puerto",        37.9864, -5.6425],
    "41092": ["Santiponce",                    37.4397, -6.0450],
    "41093": ["El Saucejo",                    37.1350, -5.0697],
    "41095": ["Tocina",                        37.6206, -5.7092],
    "41096": ["Tomares",                       37.3622, -6.0436],
    "41097": ["Umbrete",                       37.3828, -6.1556],
    "41098": ["Utrera",                        37.1997, -5.7722],
    "41100": ["Villamanrique de la Condesa",   37.2217, -6.3267],
    "41101": ["Villanueva del Ariscal",        37.3828, -6.1436],
    "41102": ["Villanueva del Río y Minas",    37.6694, -5.6425],
    "41103": ["Villaverde del Río",            37.6183, -5.8978],
    "41104": ["El Viso del Alcor",             37.3828, -5.7483],

    // --- MÁLAGA (29) ---
    "29067": ["Málaga",                        36.7202, -4.4203],
    "29069": ["Marbella",                      36.5100, -4.8843],
    "29065": ["Mijas",                         36.5961, -4.6381],
    "29070": ["Mijas",                         36.5961, -4.6381],
    "29054": ["Fuengirola",                    36.5394, -4.6248],
    "29025": ["Benalmádena",                   36.5986, -4.5097],
    "29901": ["Torremolinos",                  36.6220, -4.5000],
    "29078": ["Torremolinos",                  36.6220, -4.5000],
    "29007": ["Alhaurín de la Torre",          36.6614, -4.5519],
    "29008": ["Alhaurín el Grande",            36.6439, -4.6881],
    "29094": ["Vélez-Málaga",                  36.7822, -4.1020],
    "29082": ["Rincón de la Victoria",         36.7214, -4.2883],
    "29015": ["Antequera",                     37.0208, -4.5603],
    "29084": ["Ronda",                         36.7469, -5.1625],
    "29075": ["Nerja",                         36.7450, -3.8772],
    "29051": ["Estepona",                      36.4280, -5.1453],
    "29038": ["Cártama",                       36.7028, -4.6414],
    "29042": ["Coín",                          36.6614, -4.7603],
    "29032": ["Campillos",                     37.0658, -4.8703],
    "29017": ["Archidona",                     37.1039, -4.3725],
    "29091": ["Torrox",                        36.7450, -3.9875],
    "29005": ["Algarrobo",                     36.7586, -4.0556],
    "29001": ["Alameda",                       37.2025, -4.6361],
    "29002": ["Alcaucín",                      36.9536, -4.0772],
    "29003": ["Alfarnate",                     36.9814, -4.2617],
    "29004": ["Alfarnatejo",                   36.9658, -4.2181],
    "29006": ["Algatocín",                     36.5778, -5.3181],
    "29009": ["Almáchar",                      36.7828, -4.2089],
    "29010": ["Almargen",                      37.0750, -4.9950],
    "29011": ["Almogía",                       36.8375, -4.5497],
    "29012": ["Álora",                         36.7828, -4.7214],
    "29013": ["Alozaina",                      36.7214, -4.8394],
    "29014": ["Alpandeire",                    36.6667, -5.1853],
    "29016": ["Árchez",                        36.8375, -4.0772],
    "29018": ["Ardales",                       36.8778, -4.8703],
    "29019": ["Arenas",                        36.8089, -4.0772],
    "29020": ["Arriate",                       36.7828, -5.1500],
    "29021": ["Atajate",                       36.6333, -5.2342],
    "29022": ["Benadalid",                     36.6028, -5.2342],
    "29023": ["Benahavís",                     36.5214, -5.0500],
    "29024": ["Benalauría",                    36.5778, -5.2681],
    "29026": ["Benamargosa",                   36.8375, -4.1200],
    "29027": ["Benamocarra",                   36.8089, -4.1200],
    "29028": ["Benaoján",                      36.7028, -5.4089],
    "29029": ["Benarrabá",                     36.5778, -5.2342],
    "29030": ["El Borge",                      36.8089, -4.2089],
    "29031": ["El Burgo",                      36.8778, -4.9950],
    "29033": ["Canillas de Aceituno",          36.8828, -4.0042],
    "29034": ["Canillas de Albaida",           36.8778, -3.9875],
    "29035": ["Cañete la Real",                36.9314, -5.1500],
    "29036": ["Carratraca",                    36.8028, -4.9350],
    "29037": ["Cartajima",                     36.6667, -5.1853],
    "29039": ["Casabermeja",                   36.8778, -4.4361],
    "29040": ["Casarabonela",                  36.7828, -4.8394],
    "29041": ["Casares",                       36.4358, -5.2681],
    "29043": ["Colmenar",                      36.9314, -4.3214],
    "29044": ["Comares",                       36.8375, -4.1200],
    "29045": ["Cómpeta",                       36.8375, -3.9875],
    "29046": ["Cortes de la Frontera",         36.6333, -5.3181],
    "29047": ["Cuevas Bajas",                  37.2025, -4.6739],
    "29048": ["Cuevas del Becerro",            36.8778, -5.1056],
    "29049": ["Cuevas de San Marcos",          37.2889, -4.4361],
    "29050": ["Cútar",                         36.8375, -4.1200],
    "29052": ["Faraján",                       36.6028, -5.1853],
    "29053": ["Frigiliana",                    36.7828, -3.8772],
    "29055": ["Fuente de Piedra",              37.2025, -4.7925],
    "29056": ["Gaucín",                        36.4358, -5.2681],
    "29057": ["Genalguacil",                   36.5214, -5.2342],
    "29058": ["Guaro",                         36.6667, -4.8394],
    "29059": ["Humilladero",                   37.1039, -4.7925],
    "29060": ["Igualeja",                      36.6667, -5.1853],
    "29061": ["Istán",                         36.5778, -4.9567],
    "29062": ["Iznate",                        36.8375, -4.1200],
    "29063": ["Jimera de Líbar",               36.6667, -5.3181],
    "29064": ["Jubrique",                      36.5778, -5.2681],
    "29066": ["Macharaviaya",                  36.7828, -4.2089],
    "29068": ["Manilva",                       36.3883, -5.2681],
    "29071": ["Moclinejo",                     36.7828, -4.2089],
    "29072": ["Mollina",                       37.1039, -4.7214],
    "29073": ["Monda",                         36.6714, -4.8394],
    "29074": ["Montejaque",                    36.7028, -5.3181],
    "29076": ["Ojén",                          36.6214, -4.8394],
    "29077": ["Parauta",                       36.6667, -5.1853],
    "29079": ["Periana",                       36.9314, -4.1200],
    "29080": ["Pizarra",                       36.7828, -4.7214],
    "29081": ["Pujerra",                       36.5778, -5.2342],
    "29083": ["Riogordo",                      36.9314, -4.2883],
    "29085": ["Salares",                       36.8828, -4.0042],
    "29086": ["Sayalonga",                     36.7828, -4.0772],
    "29087": ["Sedella",                       36.8828, -4.0042],
    "29088": ["Sierra de Yeguas",              37.2025, -4.9286],
    "29089": ["Teba",                          36.9658, -4.9950],
    "29090": ["Tolox",                         36.7028, -4.9950],
    "29092": ["Totalán",                       36.7828, -4.2089],
    "29093": ["Valle de Abdalajís",            36.9314, -4.6361],
    "29095": ["Villanueva de Algaidas",        37.2025, -4.3725],
    "29096": ["Villanueva de la Concepción",   36.9658, -4.5497],
    "29097": ["Villanueva de Tapia",           37.2025, -4.3214],
    "29098": ["Villanueva del Rosario",        37.0214, -4.3725],
    "29099": ["Villanueva del Trabuco",        37.0750, -4.3725],
    "29100": ["Viñuela",                       36.8089, -4.1200],
    "29101": ["Yunquera",                      36.7028, -4.9950],
    "29903": ["Montecorto",                    36.7828, -5.3181],
    "29904": ["Serrato",                       36.8778, -5.1500]
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
