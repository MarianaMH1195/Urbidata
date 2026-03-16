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
    const [ranking, dormitorio, comparativa, flujos] = await Promise.all([
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

    // Si hay una provincia seleccionada, filtramos flujos estrictamente (intra-provincial)
    if (prov && prov !== '' && prov !== 'Todas las provincias') {
        const codigoProv = prov === 'Sevilla' ? '41' : '29';
        flujos = (flujos || []).filter(f => 
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
}


window.showSection = (name) => UI.showSection(name);

window.setMapMode = (mode, btn) => {
    try {
        const select = document.getElementById('filter-provincia');
        if (mode === 'all') select.value = "";
        else if (mode === 'sevilla') select.value = "Sevilla";
        else if (mode === 'malaga') select.value = "Málaga";
        
        applyFilters();
    } catch (e) { console.error("Toggle Map Region Error:", e); }
};

window.applyFilters = async () => {
    try {
        const prov = document.getElementById('filter-provincia').value;
        
        // Sincronizar botones del mapa y estado global
        const mapMode = !prov ? 'all' : prov.toLowerCase().replace('á', 'a');
        window.mapMode = mapMode;

        document.querySelectorAll('#map-toggles .toggle-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('onclick').includes(`'${mapMode}'`));
        });

        await updateAllData(prov);
    } catch (e) { console.error("Apply Filters Error:", e); }
};

window.setRankingMode = (mode, btn) => {
    try {
        if (!globalData) return;
        window.rankMode = mode;
        // Buscamos el contenedor padre del botón para resetear activos en ese grupo específico
        btn.closest('.toggle-group').querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.renderRanking(globalData, window.rankMode);
    } catch (e) { console.error("Update Ranking Error:", e); }
};

window.setCompView = (mode, btn) => {
    try {
        if (!globalData) return;
        window.compView = mode;
        btn.closest('.toggle-group').querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.initChartComparativa(globalData, window.compView);
    } catch (e) { console.error("Set Comp View Error:", e); }
};

window.exportCSV = () => {
    const rows = [['origen', 'destino', 'nombre_origen', 'nombre_destino', 'provincia_origen', 'provincia_destino', 'laborable', 'festivo', 'total']];
    globalData.flujos.slice(0, 100).forEach(f => rows.push([f.origen, f.destino, f.nombre_origen, f.nombre_destino, f.provincia_origen, f.provincia_destino, f.laborable, f.festivo, f.total]));
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
