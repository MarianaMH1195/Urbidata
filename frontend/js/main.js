// ==================== MAIN MODULE ====================
let globalData;
let mapMode = 'all';
let rankMode = 'salidas';
let compView = 'ambos';

document.addEventListener('DOMContentLoaded', async () => {
    globalData = await Api.fetchMainData();
    const coords = Api.getCoords();

    UI.loadKPIs(globalData);
    UI.initMap(globalData, coords);
    UI.renderRanking(globalData, 'salidas');
    UI.renderTopFlujos(globalData);
    UI.initCharts(globalData);
    UI.renderDormitorio(globalData);
    UI.renderComparativa(globalData);

    initReveal();
});

// Event Handlers
window.showSection = (name) => UI.showSection(name);

window.toggleMapMode = (btn, mode) => {
    mapMode = mode;
    document.querySelectorAll('[onclick^="toggleMapMode"]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    UI.drawFlows(globalData, Api.getCoords(), mapMode, document.getElementById('filter-provincia').value);
};

window.updateRanking = (mode, btn) => {
    rankMode = mode;
    document.querySelectorAll('#rankingToggle .toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    UI.renderRanking(globalData, rankMode);
};

window.setCompView = (mode, btn) => {
    compView = mode;
    document.querySelectorAll('#compToggle .toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    UI.initChartComparativa(globalData, compView);
};

window.applyFilters = () => {
    const prov = document.getElementById('filter-provincia').value;
    UI.drawFlows(globalData, Api.getCoords(), mapMode, prov);
    UI.renderTopFlujos(globalData, prov);
    UI.renderRanking(globalData, rankMode);
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
