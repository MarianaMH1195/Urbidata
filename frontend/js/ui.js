// ==================== UI MODULE ====================
let chartFlujos, chartDorm, chartComp;
let map, flowLayers = [];

const UI = {
    animateNumber: (id, target) => {
        const el = document.getElementById(id);
        if (!el) return;
        const duration = 1200;
        const start = performance.now();
        function step(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = Math.round(ease * target);
            el.textContent = val.toLocaleString('es-ES');
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    },

    loadKPIs: (data) => {
        const total = data.flujos.reduce((s, f) => s + f.total, 0);
        UI.animateNumber('kpi-total', total);
        UI.animateNumber('kpi-municipios', 30);
        UI.animateNumber('kpi-pares', data.flujos.length);
        UI.animateNumber('kpi-dormitorio', data.dormitorio.length);
        document.getElementById('kpi-period').textContent = 'Oct 2023';
    },

    initMap: (data, coords) => {
        map = L.map('map', { zoomControl: true, attributionControl: false }).setView([37.0, -4.9], 7);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, opacity: 0.9 }).addTo(map);

        Object.keys(data.allMuni).forEach(k => {
            const c = coords[k]; if (!c) return;
            const isCap = k === "41091" || k === "29067";
            const color = k.startsWith("41") ? '#FF6B35' : '#00E5C8';
            const radius = isCap ? 10 : 5;
            L.circleMarker(c, { radius, color, fillColor: color, fillOpacity: 0.8, weight: isCap ? 3 : 1.5 }).addTo(map)
                .bindTooltip(`<strong>${data.allMuni[k]}</strong><br>${k.startsWith("41") ? "Sevilla" : "Málaga"}`, { className: 'leaflet-tooltip-dark' });
        });
        UI.drawFlows(data, coords);
    },

    drawFlows: (data, coords, mode = 'all', filtProv = '') => {
        flowLayers.forEach(l => map.removeLayer(l));
        flowLayers = [];
        const prov = filtProv.toLowerCase();
        let top = data.flujos.slice(0, 40);
        if (mode === 'sevilla') top = top.filter(f => f.provincia_origen === 'Sevilla' || f.provincia_destino === 'Sevilla');
        if (mode === 'malaga') top = top.filter(f => f.provincia_origen === 'Málaga' || f.provincia_destino === 'Málaga');
        if (prov) top = top.filter(f => f.provincia_origen.toLowerCase() === prov || f.provincia_destino.toLowerCase() === prov);

        const max = top[0]?.total || 1;
        top.forEach(f => {
            const c1 = coords[f.origen], c2 = coords[f.destino]; if (!c1 || !c2) return;
            const norm = f.total / max;
            const line = L.polyline([c1, c2], { weight: 2 + norm * 8, color: norm > 0.5 ? '#FF6B20' : norm > 0.2 ? '#F5C842' : '#7FE0A0', opacity: 0.75 + norm * 0.22, smoothFactor: 2 });
            line.bindTooltip(`<strong>${f.nombre_origen} → ${f.nombre_destino}</strong><br>Lab: ${f.laborable.toLocaleString('es-ES')} · Fest: ${f.festivo.toLocaleString('es-ES')}`);
            line.addTo(map); flowLayers.push(line);
        });
    },

    renderRanking: (data, mode) => {
        const sMap = data.salidasMap, eMap = data.entradasMap;
        const entries = data.keys.map(k => ({ nombre: data.allMuni[k], provincia: k.startsWith("41") ? "Sevilla" : "Málaga", valor: mode === 'salidas' ? sMap[k].lab : eMap[k].lab })).sort((a, b) => b.valor - a.valor).slice(0, 8);
        const container = document.getElementById('ranking-list'); if (!container) return;
        const max = entries[0].valor; container.innerHTML = '<table class="rank-table"><thead><tr><th>#</th><th>Municipio</th><th>Provincia</th><th></th><th>Viajes</th></tr></thead><tbody></tbody></table>';
        entries.forEach((e, i) => {
            const pct = (e.valor / max * 100).toFixed(0), color = e.provincia === 'Sevilla' ? 'var(--sevilla)' : 'var(--malaga)';
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="rank-num">${i + 1}</td><td class="rank-name">${e.nombre}</td><td><span class="tag-${e.provincia === 'Sevilla' ? 'sev' : 'mal'} flow-badge" style="font-size:11px">${e.provincia}</span></td><td class="rank-bar-wrap"><div class="rank-bar" style="width:${pct}%;background:${color}"></div></td><td class="rank-val" style="color:${color}">${e.valor.toLocaleString('es-ES')}</td>`;
            container.querySelector('tbody').appendChild(tr);
        });
    },

    renderTopFlujos: (data, filtProv = '') => {
        const prov = filtProv.toLowerCase(), container = document.getElementById('top-flujos-list'); if (!container) return;
        let top = data.flujos.slice(0, 10); if (prov) top = top.filter(f => f.provincia_origen.toLowerCase() === prov || f.provincia_destino.toLowerCase() === prov);
        container.innerHTML = top.map(f => {
            const isInterp = f.interprovincial;
            return `<div class="flow-row"><div class="flow-cities"><span style="color:${f.provincia_origen === 'Sevilla' ? 'var(--sevilla)' : 'var(--malaga)'}">${f.nombre_origen}</span><span class="flow-arrow"> → </span><span style="color:${f.provincia_destino === 'Sevilla' ? 'var(--sevilla)' : 'var(--malaga)'}">${f.nombre_destino}</span></div><span class="flow-badge ${isInterp ? 'tag-int' : ''}">${isInterp ? '⇿' : ''} ${f.total.toLocaleString('es-ES')}</span></div>`;
        }).join('');
    },

    initCharts: (data) => {
        UI.initChartFlujos(data);
        UI.initChartDormitorio(data);
        UI.initChartComparativa(data);
    },

    initChartFlujos: (data) => {
        const ctx = document.getElementById('chart-flujos'); if (!ctx) return;
        const top10 = data.flujos.slice(0, 10);
        chartFlujos = new Chart(ctx, { type: 'bar', data: { labels: top10.map(f => `${f.nombre_origen.split(' ')[0]}→${f.nombre_destino.split(' ')[0]}`), datasets: [{ label: 'Laborable', data: top10.map(f => f.laborable), backgroundColor: 'rgba(200,80,42,0.82)', borderRadius: 6 }, { label: 'Festivo', data: top10.map(f => f.festivo), backgroundColor: 'rgba(122,158,126,0.78)', borderRadius: 6 }] }, options: UI.chartOpts('Flujos O-D', true) });
    },

    initChartDormitorio: (data) => {
        const ctx = document.getElementById('chart-dormitorio'); if (!ctx) return;
        const top8 = data.dormitorio.slice(0, 8);
        chartDorm = new Chart(ctx, { type: 'bar', data: { labels: top8.map(d => d.nombre), datasets: [{ label: 'Ratio S/E', data: top8.map(d => d.ratio), backgroundColor: top8.map(d => d.ratio > 3 ? 'rgba(200,80,42,0.88)' : d.ratio > 2 ? 'rgba(201,151,58,0.88)' : 'rgba(122,158,126,0.82)'), borderRadius: 6 }] }, options: UI.chartOpts('Ratio Salidas/Entradas', false) });
    },

    initChartComparativa: (data, compView = 'ambos') => {
        const ctx = document.getElementById('chart-comparativa'); if (!ctx) return;
        const top12 = data.comparativa.slice(0, 12); const datasets = [];
        if (compView !== 'festivo') datasets.push({ label: 'Laborable', data: top12.map(d => d.laborable), backgroundColor: 'rgba(200,80,42,0.85)', borderRadius: 5 });
        if (compView !== 'laborable') datasets.push({ label: 'Festivo', data: top12.map(d => d.festivo), backgroundColor: 'rgba(122,158,126,0.75)', borderRadius: 5 });
        if (chartComp) chartComp.destroy();
        chartComp = new Chart(ctx, { type: 'bar', data: { labels: top12.map(d => d.nombre), datasets }, options: UI.chartOpts('Desplazamientos', true) });
    },

    chartOpts: (label, legend) => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: legend, labels: { color: '#C4A98A', font: { family: 'DM Sans' }, boxWidth: 12 } }, tooltip: { backgroundColor: '#FDFAF6', titleColor: '#5C3D28', bodyColor: '#A8917C', borderColor: 'rgba(60,35,10,0.09)', borderWidth: 1 } }, scales: { x: { grid: { color: 'rgba(60,35,10,0.04)' }, ticks: { color: '#C4A98A', font: { family: 'DM Sans', size: 11 }, maxRotation: 35 } }, y: { grid: { color: 'rgba(60,35,10,0.05)' }, ticks: { color: '#C4A98A', font: { family: 'DM Sans', size: 11 }, callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } } } }),

    renderDormitorio: (data) => {
        UI.renderDormCards(data);
    },

    renderDormCards: (data) => {
        const container = document.getElementById('dorm-cards'); if (!container) return;
        container.innerHTML = data.dormitorio.slice(0, 12).map(d => {
            const rClass = d.ratio > 3 ? 'high' : d.ratio > 2 ? 'med' : 'low', color = d.provincia === 'Sevilla' ? 'var(--sevilla)' : 'var(--malaga)';
            return `<div class="dorm-card"><div class="dorm-city">${d.nombre}</div><div class="dorm-ratio ${rClass}">${d.ratio.toFixed(2)}</div><div class="dorm-label">ratio salidas/entradas</div><div class="dorm-prov" style="background:${color}22;color:${color}">${d.provincia}</div></div>`;
        }).join('');
    },

    renderComparativa: (data) => {
        UI.renderCompTable(data);
    },

    renderCompTable: (data) => {
        const container = document.getElementById('comp-table'); if (!container) return;
        container.innerHTML = `<table class="rank-table"><thead><tr><th>Municipio</th><th>Provincia</th><th>Laborable</th><th>Festivo</th><th>Variación</th></tr></thead><tbody>${data.comparativa.slice(0, 10).map(d => {
            const v = d.variacion, col = v > 20 ? '#C8502A' : v > 0 ? '#C9973A' : '#5A8A5E';
            return `<tr><td style="font-weight:500">${d.nombre}</td><td><span class="flow-badge tag-${d.provincia === 'Sevilla' ? 'sev' : 'mal'}" style="font-size:11px">${d.provincia}</span></td><td style="font-family:'Syne',sans-serif;font-weight:700">${d.laborable.toLocaleString('es-ES')}</td><td style="color:var(--muted)">${d.festivo.toLocaleString('es-ES')}</td><td style="color:${col};font-weight:700;font-family:'Syne',sans-serif">${v > 0 ? '+' : ''}${v}%</td></tr>`;
        }).join('')}</tbody></table>`;
    },

    showSection: (name) => {
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${name}`).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.nav-btn[onclick*="${name}"]`);
        if (btn) btn.classList.add('active');
    }
};
