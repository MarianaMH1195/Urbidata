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

    // Consolidamos los metadatos de municipios para que la UI pueda renderizar nombres y puntos
    const allMuni = { ...Api.getMunicipiosSevilla(), ...Api.getMunicipiosMalaga() };
    const keys = Object.keys(allMuni);

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

// Event Handlers
window.showSection = (name) => UI.showSection(name);

window.toggleMapMode = (btn, mode) => {
    try {
        if (!globalData) return;
        window.mapMode = mode;
        document.querySelectorAll('#mapProvToggle .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.drawFlows(globalData, Api.getCoords(), window.mapMode);
    } catch (e) { console.error("Toggle Map Region Error:", e); }
};

window.applyFilters = async () => {
    try {
        const prov = document.getElementById('filter-provincia').value;
        await updateAllData(prov);
    } catch (e) { console.error("Apply Filters Error:", e); }
};

window.updateRanking = (mode, btn) => {
    try {
        if (!globalData) return;
        window.rankMode = mode;
        document.querySelectorAll('#rankingToggle .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.renderRanking(globalData, window.rankMode);
    } catch (e) { console.error("Update Ranking Error:", e); }
};

window.setCompView = (mode, btn) => {
    try {
        if (!globalData) return;
        window.compView = mode;
        document.querySelectorAll('#compToggle .toggle-btn').forEach(b => b.classList.remove('active'));
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
