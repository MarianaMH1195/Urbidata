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
    "29064": [36.781, -4.101], "29036": [36.654, -4.757], "29060": [36.370, -5.200]
};

function rng(seed) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateData() {
    const rand = rng(42);
    const allMuni = { ...MUNICIPIOS_SEV, ...MUNICIPIOS_MAL };
    const keys = Object.keys(allMuni);
    const flujos = [];
    const salidasMap = {}, entradasMap = {};

    keys.forEach(k => { salidasMap[k] = { lab: 0, fest: 0 }; entradasMap[k] = { lab: 0, fest: 0 }; });

    for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < keys.length; j++) {
            if (i === j) continue;
            const orig = keys[i], dest = keys[j];
            let base = Math.exp(rand() * 3) * 200;
            if (dest === "41091" || dest === "29067") base *= 2.8;
            if (orig === "41091" || orig === "29067") base *= 1.6;
            const interprov = orig.slice(0, 2) !== dest.slice(0, 2);
            if (interprov) base *= 0.25;

            const lab = Math.max(0, Math.round(base * 1.3 + (rand() - 0.5) * base * 0.2));
            const fest = Math.max(0, Math.round(base * 0.7 + (rand() - 0.5) * base * 0.15));

            if (lab + fest < 10) continue;
            flujos.push({
                origen: orig, destino: dest,
                nombre_origen: allMuni[orig], nombre_destino: allMuni[dest],
                provincia_origen: orig.startsWith("41") ? "Sevilla" : "Málaga",
                provincia_destino: dest.startsWith("41") ? "Sevilla" : "Málaga",
                laborable: lab, festivo: fest,
                total: lab + fest,
                interprovincial: interprov
            });
            salidasMap[orig].lab += lab; salidasMap[orig].fest += fest;
            entradasMap[dest].lab += lab; entradasMap[dest].fest += fest;
        }
    }

    flujos.sort((a, b) => b.total - a.total);

    const dormitorio = keys.map(k => ({
        codigo: k,
        nombre: allMuni[k],
        provincia: k.startsWith("41") ? "Sevilla" : "Málaga",
        salidas: salidasMap[k].lab,
        entradas: entradasMap[k].lab,
        ratio: entradasMap[k].lab > 50
            ? +(salidasMap[k].lab / (entradasMap[k].lab + 1)).toFixed(2) : 0
    })).filter(d => d.ratio > 1.0 && !["41091", "29067"].includes(d.codigo))
        .sort((a, b) => b.ratio - a.ratio);

    const comparativa = keys.map(k => ({
        codigo: k, nombre: allMuni[k],
        provincia: k.startsWith("41") ? "Sevilla" : "Málaga",
        laborable: salidasMap[k].lab,
        festivo: salidasMap[k].fest,
        variacion: salidasMap[k].fest > 0
            ? +((salidasMap[k].lab - salidasMap[k].fest) / salidasMap[k].fest * 100).toFixed(1) : 0
    })).sort((a, b) => b.laborable - a.laborable);

    return { flujos, dormitorio, comparativa, salidasMap, entradasMap, allMuni, keys };
}

const DATA = generateData();

const Api = {
    fetchMainData: async () => {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/data`);
            if (response.ok) {
                console.log("Using real data from backend");
                return await response.json();
            }
        } catch (error) {
            console.warn("Backend not available, using mock data", error);
        }
        // Fallback to mock data if backend fails or is not ready
        return DATA;
    },
    getCoords: () => COORDS
};
