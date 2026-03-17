// ==================== UI MODULE ====================
let chartFlujos, chartDorm, chartComp;
let map, flowLayers = [], markerLayers = [];

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
            if (map) { 
                UI.drawMarkers(data, coords);
                UI.drawFlows(data, coords, window.mapMode || 'all'); 
                return; 
            }

            map = L.map('map', { zoomControl: true, attributionControl: false }).setView([37.15, -4.85], 7.5);

            // Capas Base
            const voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' });
            const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
            const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' });

            // Overlays
            const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, opacity: 0.8 });

            const baseMaps = { "🗺️ Topográfico": voyager, "🛰️ Satélite": sat, "🌑 Oscuro": dark };
            const overlays = { "Etiquetas": labels };

            voyager.addTo(map);

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

            UI.drawMarkers(data, coords);
            UI.drawFlows(data, coords, window.mapMode || 'all');
        } catch (e) { console.error("Map Init Error:", e); }
    },

    drawMarkers: (data, coords) => {
        if (!map) return;
        markerLayers.forEach(l => map.removeLayer(l));
        markerLayers = [];

        const muniMap = data.allMuni || {};
        Object.keys(muniMap).forEach(k => {
            const normK = Api.normalizeId(k);
            const c = coords[normK] || coords[k]; if (!c) return;
            const isCap = normK === "41091" || normK === "29067";
            const color = normK.startsWith("41") ? '#FF6DAA' : '#00E5C8';
            const radius = isCap ? 8 : 4;
            const marker = L.circleMarker(c, { radius, color, fillColor: color, fillOpacity: 0.7, weight: isCap ? 2 : 1 });
            marker.bindTooltip(`<strong>${muniMap[k]}</strong>`, { className: 'tooltip-custom' });
            marker.addTo(map);
            markerLayers.push(marker);
        });
    },

    _bezierPoints: (c1, c2, numPoints = 30) => {
        const lat1 = c1[0], lng1 = c1[1];
        const lat2 = c2[0], lng2 = c2[1];
        const midLat = (lat1 + lat2) / 2;
        const midLng = (lng1 + lng2) / 2;
        const dLat = lat2 - lat1;
        const dLng = lng2 - lng1;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        // Curvatura muy suave — solo lo justo para no ir por el mar
        const curvature = dist * 0.18;

        // Siempre desplazamos el punto de control hacia el norte (interior)
        // nunca hacia el sur (mar)
        const ctrlLat = midLat + curvature;
        const ctrlLng = midLng;

        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const mt = 1 - t;
            const lat = mt * mt * lat1 + 2 * mt * t * ctrlLat + t * t * lat2;
            const lng = mt * mt * lng1 + 2 * mt * t * ctrlLng + t * t * lng2;
            points.push([lat, lng]);
        }
        return points;
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

        // Mostrar todos los flujos que tengan coordenadas (ya no filtramos solo capitales)
        // const ACTIVE_CAPS = ['41091', '29067'].filter(id => data.allMuni[id]);
        // filtered = filtered.filter(f =>
        //     ACTIVE_CAPS.includes(String(f.origen)) || ACTIVE_CAPS.includes(String(f.destino))
        // );

        let top = filtered.slice(0, 100); 
        // Usamos el max GLOBAL (antes del filtro) para que la escala sea consistente
        const allFlows = data.flujos || [];
        const max = allFlows[0]?.viajes || allFlows[0]?.total || top[0]?.viajes || 1;
        const muniMap = data.allMuni || {};

        top.forEach(f => {
            const nOrig = Api.normalizeId(f.origen), nDest = Api.normalizeId(f.destino);
            const c1 = coords[nOrig] || coords[f.origen];
            const c2 = coords[nDest] || coords[f.destino];
            if (!c1 || !c2) return;
            const val = f.viajes || f.total || 0;
            const norm = val / max; 

            // Umbrales calibrados con datos reales
            // Alto (>20% del máximo): flujos principales — aparecen en ROJO
            // Medio (5-20%): flujos secundarios — aparecen en NARANJA
            // Bajo (<5%): flujos menores — aparecen en VERDE punteado
            const isHigh   = norm > 0.20;
            const isMedium = norm > 0.05 && norm <= 0.20;
            
            const color = isHigh ? '#C8502A' : isMedium ? '#C9973A' : '#7A9E7E';

            // Grosores tácticos: el Alto tiene mucho peso para centrar la vista
            const weight = isHigh ? 5 : isMedium ? 3 : 1.5;
            
            // Opacidades: Altos muy sólidos, Medios claros, Bajos sutiles
            const opacity = isHigh ? 0.92 : isMedium ? 0.70 : 0.35;

            const curvePoints = UI._bezierPoints(c1, c2);

            // Capa 1 — halo suave (detrás) para dar efecto de brillo a los flujos más altos
            if (isHigh || isMedium) {
                const halo = L.polyline(curvePoints, {
                    weight: weight + 4,
                    color: color,
                    opacity: opacity * 0.3,
                    smoothFactor: 1,
                    lineCap: 'round',
                    interactive: false
                });
                flowLayers.push(halo);
                halo.addTo(map);
            }

            // Capa 2 — línea principal (encima)
            const line = L.polyline(curvePoints, {
                weight: weight,
                color: color,
                opacity: opacity,
                smoothFactor: 2,
                lineCap: 'round'
                // Ya no usamos dashArray para que todas las líneas sean claramente visibles
            });

            const n1 = muniMap[f.origen] || Api.getName(f.origen) || f.origen;
            const n2 = muniMap[f.destino] || Api.getName(f.destino) || f.destino;
            const t_lab = (f.laborable || 0).toLocaleString('es-ES');
            const t_fes = (f.festivo || 0).toLocaleString('es-ES');

            const tooltipContent = `
                <div style="padding:4px">
                    <strong style="color:#5C3D28;display:block;margin-bottom:4px">${n1} → ${n2}</strong>
                    <span style="color:#a5825d;font-size:12px">
                      Laborable: <strong style="color:#C8502A">${t_lab}</strong>
                      &nbsp;·&nbsp;
                      Festivo: <strong style="color:#C9973A">${t_fes}</strong>
                    </span>
                </div>`;

            line.bindTooltip(tooltipContent, { sticky: true, className: 'tooltip-custom' });

            line.addTo(map);
            flowLayers.push(line);
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
            const muniName = data.allMuni[String(e.origen)] || e.origen;
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
        chartComp = new Chart(ctx, { type: 'bar', data: { labels: top12.map(d => data.allMuni[String(d.origen)] || d.origen), datasets }, options: UI.chartOpts('Desplazamientos', true) });
    },

    chartOpts: (label, legend) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: legend,
                labels: {
                    color: '#a5825d',
                    font: { family: 'DM Sans', size: 11 },
                    boxWidth: 12
                }
            },
            tooltip: {
                backgroundColor: '#FDFAF6',
                titleColor: '#5C3D28',
                bodyColor: '#a5825d',
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
                    color: '#a5825d',
                    font: { family: 'DM Sans', size: 11 },
                    maxRotation: 35
                }
            },
            y: {
                grid: { color: 'rgba(60,35,10,0.05)', drawBorder: false },
                ticks: {
                    color: '#a5825d',
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
            const name = muniMap[String(d.municipio)] || d.municipio;
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
            const name = muniMap[String(d.origen)] || d.origen;
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

        const btn = document.querySelector(`.nav-btn[onclick*="'${name}'"]`);
        if (btn) btn.classList.add('active');
    },

    toggleMenu: () => {
        const nav = document.getElementById('main-nav');
        if (nav) nav.classList.toggle('active');
    },

    closeMenu: () => {
        const nav = document.getElementById('main-nav');
        if (nav) nav.classList.remove('active');
    }
};

// Global shortcuts for onclick handlers
const showSection = (name) => UI.showSection(name);
const toggleMenu = () => UI.toggleMenu();
const closeMenu = () => UI.closeMenu();

document.addEventListener('DOMContentLoaded', () => {
    UI.initReveal();
});
