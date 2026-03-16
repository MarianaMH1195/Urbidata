// ==================== MAIN MODULE ====================
let globalData;
window.mapMode = 'all';
window.rankMode = 'salidas';
window.compView = 'ambos';

document.addEventListener('DOMContentLoaded', async () => {
    await updateAllData();
    initReveal();
});

async function updateAllData(prov = null) {
    try {
        const [ranking, dormitorio, comparativa, flujosRaw] = await Promise.all([
            Api.fetchRanking(prov),
            Api.fetchDormitorio(prov),
            Api.fetchComparativa(prov),
            Api.fetchFlujos(prov)
        ]);

        // Consolidamos los metadatos de municipios según el filtro de provincia
        let allMuni;
        if (prov === 'Sevilla') {
            allMuni = Api.getMunicipiosSevilla();
        } else if (prov === 'Málaga') {
            allMuni = Api.getMunicipiosMalaga();
        } else {
            allMuni = { ...Api.getMunicipiosSevilla(), ...Api.getMunicipiosMalaga() };
        }
        const keys = Object.keys(allMuni);

        let flujos = flujosRaw || [];
        // Si hay una provincia seleccionada, filtramos flujos estrictamente (intra-provincial)
        if (prov && prov !== '' && prov !== 'Todas las provincias') {
            const codigoProv = prov === 'Sevilla' ? '41' : '29';
            flujos = flujos.filter(f => 
                String(f.origen).startsWith(codigoProv) && 
                String(f.destino).startsWith(codigoProv)
            );
        }

        globalData = { ranking, dormitorio, comparativa, flujos, allMuni, keys };
        const coords = Api.getCoords();

        UI.loadKPIs(globalData);
        UI.initMap(globalData, coords, window.mapMode);
        UI.renderRanking(globalData, window.rankMode);
        UI.renderTopFlujos(globalData);
        UI.initCharts(globalData);
        UI.renderDormitorio(globalData);
        UI.renderComparativa(globalData);
    } catch (e) {
        console.error("Error updating data:", e);
    }
}

// Funciones globales para eventos de UI
window.setMapMode = function(mode, btn) {
    try {
        const select = document.getElementById('filter-provincia');
        if (mode === 'all') select.value = "";
        else if (mode === 'sevilla') select.value = "Sevilla";
        else if (mode === 'malaga') select.value = "Málaga";
        
        window.applyFilters();
    } catch (e) { console.error("Toggle Map Region Error:", e); }
};

window.applyFilters = async function() {
    try {
        const select = document.getElementById('filter-provincia');
        if (!select) return;
        const prov = select.value;
        
        // Sincronizar botones del mapa y estado global
        const mapMode = !prov ? 'all' : (prov === 'Sevilla' ? 'sevilla' : 'malaga');
        window.mapMode = mapMode;

        document.querySelectorAll('#map-toggles .toggle-btn').forEach(b => {
            const onclick = b.getAttribute('onclick') || "";
            b.classList.toggle('active', onclick.includes(`'${mapMode}'`));
        });

        await updateAllData(prov);
    } catch (e) { console.error("Apply Filters Error:", e); }
};

window.setRankingMode = function(mode, btn) {
    if (!globalData) return;
    window.rankMode = mode;
    btn.closest('.toggle-group').querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    UI.renderRanking(globalData, window.rankMode);
};

window.setCompView = function(mode, btn) {
    if (!globalData) return;
    window.compView = mode;
    btn.closest('.toggle-group').querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    UI.initChartComparativa(globalData, window.compView);
};

window.showSection = (name) => UI.showSection(name);

window.exportCSV = () => {
    if (!globalData) return;
    const rows = [['origen', 'destino', 'viajes']];
    globalData.flujos.slice(0, 100).forEach(f => rows.push([f.origen, f.destino, f.viajes]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'urbidata_flujos.csv';
    a.click();
};

function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
