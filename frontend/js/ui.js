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
        const total = data.flujos.reduce((s, f) => s + (f.viajes || f.total || 0), 0);
        UI.animateNumber('kpi-total', total);
        UI.animateNumber('kpi-municipios', data.keys.length);
        UI.animateNumber('kpi-pares', data.flujos.length);
        UI.animateNumber('kpi-dormitorio', data.dormitorio.length);
        document.getElementById('kpi-period').textContent = 'Oct 2023';
    },

    initMap: (data, coords) => {
        try {
            const container = document.getElementById('map');
            if (!container) return;
            if (map) { UI.drawFlows(data, coords, window.mapMode || 'all'); return; }

            map = L.map('map', { zoomControl: true, attributionControl: false }).setView([37.15, -4.85], 7.5);

            // Capas Base
            const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
            const topo = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 });
            const terr = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });

            // Overlays
            const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, opacity: 0.8 });

            const baseMaps = { "Satélite": sat, "Topográfico": topo, "Terreno": terr };
            const overlays = { "Etiquetas": labels };

            sat.addTo(map);
            labels.addTo(map);

            // Control de capas (estilo nativo Leaflet posicionado arriba a la derecha)
            L.control.layers(baseMaps, overlays, { collapsed: false, position: 'topright' }).addTo(map);

            // Leyenda Personalizada para Flujos
            const legend = L.control({ position: 'bottomright' });
            legend.onAdd = function () {
                const div = L.DomUtil.create('div', 'map-legend');
                div.innerHTML = `
                    <div class="legend-title">Intensidad de Flujo</div>
                    <div class="legend-item">
                        <span class="legend-line" style="background:#C8502A;height:2.5px"></span>
                        <span class="legend-text">Alto</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-line" style="background:#C9973A;height:1.8px"></span>
                        <span class="legend-text">Medio</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-line" style="background:#7A9E7E;height:1.2px;background-image:linear-gradient(90deg,#7A9E7E 50%,transparent 50%);background-size:6px 100%"></span>
                        <span class="legend-text">Bajo</span>
                    </div>
                `;
                return div;
            };
            legend.addTo(map);

            const muniMap = data.allMuni || {};
            Object.keys(muniMap).forEach(k => {
                const c = coords[k]; if (!c) return;
                const isCap = String(k) === "41091" || String(k) === "29067";
                const color = String(k).startsWith("41") ? '#FF6DAA' : '#00E5C8';
                const radius = isCap ? 8 : 4;
                L.circleMarker(c, { radius, color, fillColor: color, fillOpacity: 0.7, weight: isCap ? 2 : 1 }).addTo(map)
                    .bindTooltip(`<strong>${muniMap[k]}</strong>`, { className: 'tooltip-custom' });
            });
            UI.drawFlows(data, coords, window.mapMode || 'all');
        } catch (e) { console.error("Map Init Error:", e); }
    },

    drawFlows: (data, coords, mode = 'all') => {
        if (!map) return;
        flowLayers.forEach(l => map.removeLayer(l));
        flowLayers = [];

        let filtered = data.flujos || [];
        if (mode === 'sevilla') {
            filtered = filtered.filter(f => String(f.origen).startsWith('41') || String(f.destino).startsWith('41'));
        } else if (mode === 'malaga') {
            filtered = filtered.filter(f => String(f.origen).startsWith('29') || String(f.destino).startsWith('29'));
        }

        let top = filtered.slice(0, 30);
        const max = (top[0]?.viajes || top[0]?.total || 1);
        const muniMap = data.allMuni || {};

        top.forEach(f => {
            const c1 = coords[f.origen], c2 = coords[f.destino]; if (!c1 || !c2) return;
            const val = f.viajes || f.total || 0;
            const norm = val / max;

            // Usamos una escala progresiva (raíz cuadrada) para que los flujos bajos tengan más presencia
            const pNorm = Math.sqrt(norm);

            // Colores solicitados
            const color = norm > 0.5 ? '#C8502A' : norm > 0.2 ? '#C9973A' : '#7A9E7E';

            // Grosor ajustado: mínimo 1.2px para visibilidad, máximo 2.8px (un poco más que 2.5 pero proporcional)
            const weight = 1.0 + pNorm * 1.8;

            // Capa 1 — halo suave (detrás) - Reforzado para contraste
            const halo = L.polyline([c1, c2], {
                weight: weight + 3.5,
                color: color,
                opacity: 0.15 + pNorm * 0.12,
                smoothFactor: 2,
                lineCap: 'round',
                interactive: false
            });

            // Capa 2 — línea principal (encima) - Opacidad base aumentada
            const line = L.polyline([c1, c2], {
                weight: weight,
                color: color,
                opacity: 0.55 + pNorm * 0.35,
                smoothFactor: 2,
                lineCap: 'round',
                dashArray: norm < 0.12 ? '5, 10' : undefined
            });

            const n1 = muniMap[f.origen] || f.origen, n2 = muniMap[f.destino] || f.destino;
            const t_lab = (f.laborable || 0).toLocaleString('es-ES');
            const t_fes = (f.festivo || 0).toLocaleString('es-ES');

            const tooltipContent = `
                <div style="padding:4px">
                    <strong style="color:#5C3D28;display:block;margin-bottom:4px">${n1} → ${n2}</strong>
                    <span style="color:#A8917C;font-size:12px">
                      Laborable: <strong style="color:#C8502A">${t_lab}</strong>
                      &nbsp;·&nbsp;
                      Festivo: <strong style="color:#C9973A">${t_fes}</strong>
                    </span>
                </div>`;

            line.bindTooltip(tooltipContent, { sticky: true, className: 'tooltip-custom' });

            halo.addTo(map);
            line.addTo(map);
            flowLayers.push(halo, line);
        });
    },

    renderRanking: (data, mode = 'salidas') => {
        const entries = data.ranking.slice(0, 8);
        const container = document.getElementById('ranking-list'); if (!container) return;
        const colName = mode === 'salidas' ? 'Viajes (Salida)' : 'Viajes (Entrada)';
        const max = entries[0]?.viajes || 1;
        container.innerHTML = `<table class="rank-table"><thead><tr><th>#</th><th>Municipio</th><th>Provincia</th><th></th><th>${colName}</th></tr></thead><tbody></tbody></table>`;
        entries.forEach((e, i) => {
            const val = e.viajes;
            const pct = (val / max * 100).toFixed(0);
            const provName = String(e.origen).startsWith('41') ? 'Sevilla' : 'Málaga';
            const color = provName === 'Sevilla' ? 'var(--sevilla)' : 'var(--malaga)';
            const muniName = data.allMuni[e.origen] || e.origen;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="rank-num">${i + 1}</td><td class="rank-name">${muniName}</td><td><span class="tag-${provName === 'Sevilla' ? 'sev' : 'mal'} flow-badge" style="font-size:11px">${provName}</span></td><td class="rank-bar-wrap"><div class="rank-bar" style="width:${pct}%;background:${color}"></div></td><td class="rank-val" style="color:${color}">${val.toLocaleString('es-ES')}</td>`;
            container.querySelector('tbody').appendChild(tr);
        });
    },

    renderTopFlujos: (data) => {
        const container = document.getElementById('top-flujos-list'); if (!container) return;
        let top = data.flujos.slice(0, 10);
        container.innerHTML = top.map(f => {
            const val = f.viajes || f.total || 0;
            const prov1 = String(f.origen).startsWith('41') ? 'Sevilla' : 'Málaga';
            const prov2 = String(f.destino).startsWith('41') ? 'Sevilla' : 'Málaga';
            const name1 = data.allMuni[f.origen] || f.origen;
            const name2 = data.allMuni[f.destino] || f.destino;
            return `<div class="flow-row"><div class="flow-cities"><span style="color:${prov1 === 'Sevilla' ? 'var(--sevilla)' : 'var(--malaga)'}">${name1}</span><span class="flow-arrow"> → </span><span style="color:${prov2 === 'Sevilla' ? 'var(--sevilla)' : 'var(--malaga)'}">${name2}</span></div><span class="flow-badge">${val.toLocaleString('es-ES')}</span></div>`;
        }).join('');
    },

    initCharts: (data) => {
        UI.initChartFlujos(data);
        UI.initChartDormitorio(data);
        UI.initChartComparativa(data, window.compView || 'ambos');
    },

    initChartFlujos: (data) => {
        const ctx = document.getElementById('chart-flujos'); if (!ctx) return;
        const top10 = (data.flujos || []).slice(0, 10);
        const muniMap = data.allMuni || {};
        const labels = top10.map(f => {
            const n1 = String(muniMap[f.origen] || f.origen), n2 = String(muniMap[f.destino] || f.destino);
            return `${n1.split(' ')[0]}→${n2.split(' ')[0]}`;
        });
        if (chartFlujos) chartFlujos.destroy();
        chartFlujos = new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ label: 'Viajes', data: top10.map(f => f.viajes || f.total || 0), backgroundColor: 'rgba(200,80,42,0.85)', borderRadius: 6 }] }, options: UI.chartOpts('Flujos Principales', true) });
    },

    initChartDormitorio: (data) => {
        const ctx = document.getElementById('chart-dormitorio'); if (!ctx) return;
        const top8 = (data.dormitorio || []).slice(0, 8);
        const muniMap = data.allMuni || {};
        const labels = top8.map(d => String(muniMap[d.municipio] || d.municipio).split(' ')[0]);
        if (chartDorm) chartDorm.destroy();
        chartDorm = new Chart(ctx, { type: 'bar', data: { labels, datasets: [{ label: '% Dependencia', data: top8.map(d => d.pct_dependencia || 0), backgroundColor: 'rgba(201,151,58,0.88)', borderRadius: 6 }] }, options: UI.chartOpts('% Dependencia Capital', false) });
    },

    initChartComparativa: (data, compView = 'ambos') => {
        const ctx = document.getElementById('chart-comparativa'); if (!ctx) return;
        const top12 = data.comparativa.slice(0, 12); const datasets = [];
        if (compView !== 'festivo') datasets.push({ label: 'Laborable', data: top12.map(d => d.laborable), backgroundColor: 'rgba(200,80,42,0.85)', borderRadius: 5 });
        if (compView !== 'laborable') datasets.push({ label: 'Festivo', data: top12.map(d => d.festivo), backgroundColor: 'rgba(122,158,126,0.75)', borderRadius: 5 });
        if (chartComp) chartComp.destroy();
        chartComp = new Chart(ctx, { type: 'bar', data: { labels: top12.map(d => data.allMuni[d.origen] || d.origen), datasets }, options: UI.chartOpts('Desplazamientos', true) });
    },

    chartOpts: (label, legend) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: legend,
                labels: {
                    color: '#C4A98A',
                    font: { family: 'DM Sans', size: 11 },
                    boxWidth: 12
                }
            },
            tooltip: {
                backgroundColor: '#FDFAF6',
                titleColor: '#5C3D28',
                bodyColor: '#A8917C',
                borderColor: 'rgba(60,35,10,0.09)',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: 'DM Sans', size: 13, weight: 600 },
                bodyFont: { family: 'DM Sans', size: 12 }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(60,35,10,0.04)', drawBorder: false },
                ticks: {
                    color: '#C4A98A',
                    font: { family: 'DM Sans', size: 11 },
                    maxRotation: 35
                }
            },
            y: {
                grid: { color: 'rgba(60,35,10,0.05)', drawBorder: false },
                ticks: {
                    color: '#C4A98A',
                    font: { family: 'DM Sans', size: 11 },
                    callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v
                }
            }
        }
    }),

    initReveal: () => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    },

    renderDormitorio: (data) => {
        UI.renderDormCards(data);
    },

    renderDormCards: (data) => {
        const container = document.getElementById('dorm-cards'); if (!container) return;
        const muniMap = data.allMuni || {};
        container.innerHTML = (data.dormitorio || []).slice(0, 12).map(d => {
            const p = d.pct_dependencia || 0;
            const rClass = p > 25 ? 'high' : p > 15 ? 'med' : 'low';
            const prov = String(d.municipio).startsWith('41') ? 'Sevilla' : 'Málaga';
            const name = muniMap[d.municipio] || d.municipio;
            return `<div class="dorm-card reveal"><div class="dorm-city">${name}</div><div class="dorm-ratio ${rClass}">${p.toFixed(1)}%</div><div class="dorm-label">dependencia</div><div class="dorm-prov" style="color:var(--${prov.toLowerCase()})">${prov}</div></div>`;
        }).join('');
        UI.initReveal();
    },

    renderComparativa: (data) => {
        UI.renderCompTable(data);
    },

    renderCompTable: (data) => {
        const container = document.getElementById('comp-table'); if (!container) return;
        const muniMap = data.allMuni || {};
        container.innerHTML = `<table class="rank-table"><thead><tr><th>Municipio</th><th>Provincia</th><th>Laborable</th><th>Festivo</th></tr></thead><tbody>${(data.comparativa || []).slice(0, 10).map(d => {
            const name = muniMap[d.origen] || d.origen;
            const prov = String(d.origen).startsWith('41') ? 'Sevilla' : 'Málaga';
            return `<tr><td>${name}</td><td class="rank-num">${prov}</td><td style="font-family:'Syne';font-weight:700">${(d.laborable || 0).toLocaleString()}</td><td style="font-family:'Syne'">${(d.festivo || 0).toLocaleString()}</td></tr>`;
        }).join('')}</tbody></table>`;
    },

    showSection: (name) => {
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`section-${name}`);
        if (target) {
            target.classList.add('active');
            // Trigger animation for reveal elements inside the section
            const reveals = target.querySelectorAll('.reveal');
            reveals.forEach(r => r.classList.remove('visible'));
            setTimeout(() => UI.initReveal(), 50);
        }

        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.nav-btn[onclick*="'${name}'"]`);
        if (btn) btn.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UI.initReveal();
});
