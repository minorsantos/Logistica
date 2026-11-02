/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/inventario.js - MÓDULO 3: Control de Inventario y Cadena de Suministro (CUS-03 / RF-14 a RF-20)
 * Implementa control de existencias en tiempo real, desglose visual por SKU, análisis Donut y órdenes de abastecimiento.
 */

class InventarioModule {
    static init() {
        this.selectedSku = 'SIL-TIF-01';
        this.searchQuery = '';
        this.selectedCategory = 'todas';
        this.selectedWarehouse = 'lurin';
    }

    static render() {
        const container = document.getElementById('module-content-area');
        if (!container) return;

        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const abastecimiento = StorageManager.get(STORAGE_KEYS.ABASTECIMIENTO);
        const currentItem = articulos.find(a => a.sku === this.selectedSku) || articulos[1];

        // Calcular totales de flota
        const totalFlota = articulos.reduce((acc, a) => acc + a.stockTotal, 0);
        const totalEnEvento = articulos.reduce((acc, a) => acc + (a.enEvento || 0), 0);
        const totalDisponibles = articulos.reduce((acc, a) => acc + (a.disponibles || 0), 0);
        const totalTaller = articulos.reduce((acc, a) => acc + (a.enTaller || 0), 0);
        const totalBaja = articulos.reduce((acc, a) => acc + (a.deBaja || 0), 0);

        container.innerHTML = `
            <div class="view-header">
                <div class="breadcrumbs">
                    <span>LOGÍSTICA DE OPERACIONES</span>
                    <span>•</span>
                    <span class="badge-tag">CUS-03</span>
                    <span>•</span>
                    <span>FLOTA ALMACÉN CENTRAL</span>
                </div>
                <div class="header-title-row">
                    <div>
                        <h2 class="view-main-title">Control de Inventario y Cadena de Suministro</h2>
                        <p class="view-main-subtitle">
                            Monitorización de disponibilidad en tiempo real, trazabilidad de piezas de alta gama por SKU y abastecimiento programado.
                        </p>
                    </div>
                    <div class="header-action-buttons">
                        <button class="btn btn-outline" onclick="InventarioModule.exportInventoryReport()">
                            📥 Exportar Reporte
                        </button>
                        <button class="btn btn-primary" onclick="InventarioModule.auditPhysicalStock()">
                            🔄 Auditar Stock Físico
                        </button>
                    </div>
                </div>
            </div>

            <!-- 5 Tarjetas de Métricas de Flota -->
            <div class="kpi-cards-grid-5">
                <div class="kpi-metric-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Total en Flota</span>
                        <span class="kpi-icon-badge">📦</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${totalFlota.toLocaleString()}</span>
                        <span class="kpi-unit">unidades</span>
                    </div>
                    <div class="kpi-footnote text-muted">
                        ● 100% inventariado activo
                    </div>
                </div>

                <div class="kpi-metric-card">
                    <div class="kpi-header">
                        <span class="kpi-label">En Eventos / Ruta</span>
                        <span class="kpi-icon-badge">🚚</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${totalEnEvento.toLocaleString()}</span>
                        <span class="kpi-pill-percent">${((totalEnEvento / totalFlota) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="kpi-footnote text-primary">
                        ● 38 órdenes en curso
                    </div>
                </div>

                <div class="kpi-metric-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Disponibles Almacén</span>
                        <span class="kpi-icon-badge">🏢</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${totalDisponibles.toLocaleString()}</span>
                        <span class="kpi-pill-percent">${((totalDisponibles / totalFlota) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="kpi-footnote text-success">
                        ● Listos para despacho
                    </div>
                </div>

                <div class="kpi-metric-card">
                    <div class="kpi-header">
                        <span class="kpi-label">En Taller / Reparación</span>
                        <span class="kpi-icon-badge">🔧</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${totalTaller.toLocaleString()}</span>
                        <span class="kpi-pill-percent">${((totalTaller / totalFlota) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="kpi-footnote text-warning">
                        ● TTR promedio: 3.2 días
                    </div>
                </div>

                <div class="kpi-metric-card">
                    <div class="kpi-header">
                        <span class="kpi-label">De Baja / Merma</span>
                        <span class="kpi-icon-badge">⛔</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${totalBaja.toLocaleString()}</span>
                        <span class="kpi-pill-percent">${((totalBaja / totalFlota) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="kpi-footnote text-danger">
                        ● Dictamen pericial pendiente
                    </div>
                </div>
            </div>

            <!-- Barra de Filtros del Inventario -->
            <div class="inventory-filters-bar mt-3">
                <div class="search-input-wrapper flex-grow">
                    <i class="icon-search">🔍</i>
                    <input type="text" placeholder="Filtrar por SKU, nombre técnico o etiqueta..." 
                        value="${this.searchQuery}" oninput="InventarioModule.handleSearch(this.value)">
                </div>
                <div class="filter-dropdown-group">
                    <select class="form-select-sm" onchange="InventarioModule.handleCategoryFilter(this.value)">
                        <option value="todas">Categoría: Todas (Carpas, Sillas, Cristalería)</option>
                        <option value="carpas">Carpas & Toldos</option>
                        <option value="sillas">Sillas & Asientos</option>
                        <option value="mesas">Mesas & Banquetería</option>
                        <option value="lounge">Salas Lounge</option>
                        <option value="catering">Menaje & Cristalería</option>
                        <option value="iluminacion">Iluminación Cálida</option>
                    </select>
                    <select class="form-select-sm">
                        <option>Almacén: Almacén Principal Lurín</option>
                        <option>Almacén: Sede Secundaria Chorrillos</option>
                    </select>
                    <select class="form-select-sm">
                        <option>Estado: Cualquier Estado</option>
                        <option>Con stock disponible</option>
                        <option>Con unidades en taller</option>
                        <option>Con merma registrada</option>
                    </select>
                </div>
            </div>

            <!-- Layout Dividido: Tabla de Existencias a la izquierda y Panel Donut a la derecha -->
            <div class="inventory-split-layout mt-3">
                <!-- Tabla Matriz de Existencias Operativas -->
                <div class="inventory-matrix-card">
                    <div class="matrix-table-header">
                        <div>
                            <h4>Matriz de Existencias Operativas</h4>
                            <span class="text-muted">Haga clic en una fila para inspeccionar el análisis crítico en tiempo real</span>
                        </div>
                        <div class="matrix-legend-indicators">
                            <span class="ind-dot dot-disp">● Disponible</span>
                            <span class="ind-dot dot-event">● En Evento</span>
                            <span class="ind-dot dot-maint">● Mantenimiento</span>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="inventory-table">
                            <thead>
                                <tr>
                                    <th>SKU & MOBILIARIO</th>
                                    <th>CATEGORÍA</th>
                                    <th>UBICACIÓN</th>
                                    <th>STOCK</th>
                                    <th>DESGLOSE EN VIVO</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderTableRowsHTML(articulos)}
                            </tbody>
                        </table>
                    </div>

                    <div class="inventory-pagination">
                        <span>Mostrando 1 a ${articulos.length} referencias en catálogo</span>
                        <div class="pagination-buttons">
                            <button class="btn-page" disabled>Anterior</button>
                            <button class="btn-page active">1</button>
                            <button class="btn-page">2</button>
                            <button class="btn-page">Siguiente</button>
                        </div>
                    </div>
                </div>

                <!-- Panel Lateral Derecho: Análisis de Disponibilidad Crítica -->
                <div class="critical-analysis-panel">
                    <div class="critical-panel-header">
                        <div class="crit-tag-row">
                            <span class="crit-label">📊 ANÁLISIS DE DISPONIBILIDAD CRÍTICA</span>
                            <span class="badge-total-unds">${currentItem.stockTotal} Unds</span>
                        </div>
                        <h3 class="crit-item-name">${currentItem.nombre}</h3>
                        <p class="crit-item-sku">SKU: <strong>${currentItem.sku}</strong> • ${currentItem.lote || 'Lote Estándar'}</p>
                    </div>

                    <!-- Gráfico Donut SVG Dinámico -->
                    <div class="donut-chart-container">
                        ${this.renderDonutChartSVG(currentItem)}
                    </div>

                    <!-- Desglose numérico y porcentual -->
                    <div class="donut-breakdown-list">
                        <div class="donut-item-row">
                            <span class="donut-bullet bullet-warehouse">■ En Almacén Principal</span>
                            <strong>${currentItem.disponibles} <small>(${((currentItem.disponibles / currentItem.stockTotal) * 100).toFixed(1)}%)</small></strong>
                        </div>
                        <div class="donut-item-row">
                            <span class="donut-bullet bullet-events">■ Asignadas a Eventos (Fin de Semana)</span>
                            <strong>${currentItem.enEvento} <small>(${((currentItem.enEvento / currentItem.stockTotal) * 100).toFixed(1)}%)</small></strong>
                        </div>
                        <div class="donut-item-row">
                            <span class="donut-bullet bullet-cleaning">■ En Limpieza & Pulido</span>
                            <strong>${currentItem.enTaller} <small>(${((currentItem.enTaller / currentItem.stockTotal) * 100).toFixed(1)}%)</small></strong>
                        </div>
                        <div class="donut-item-row">
                            <span class="donut-bullet bullet-damage">■ En Reparación Estructural / Merma</span>
                            <strong>${currentItem.deBaja || 0} <small>(${(((currentItem.deBaja || 0) / currentItem.stockTotal) * 100).toFixed(1)}%)</small></strong>
                        </div>
                    </div>

                    <!-- Recomendación del Despachador -->
                    <div class="dispatcher-recommendation-box">
                        <div class="disp-title">💡 Recomendación del Despachador</div>
                        <p class="disp-text">
                            El stock disponible para el sábado 19 es solo de <strong>${currentItem.disponibles} unidades</strong>. 
                            Existe una solicitud adicional en borrador compitiendo por este lote en Lurín.
                        </p>
                        <div class="disp-buttons-group">
                            <button class="btn btn-dark btn-sm" onclick="Toast.success('Stock bloqueado preventivamente para eventos de alta prioridad.')">
                                🔒 Bloquear Stock
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="InventarioModule.openTechnicalSheet('${currentItem.sku}')">
                                📋 Ficha Técnica
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección Inferior: Solicitud de Reabastecimiento a Proveedores Externos -->
            <div class="reorder-section-card mt-4">
                <div class="reorder-header">
                    <div class="reorder-title-group">
                        <span class="reorder-icon">🚚</span>
                        <div>
                            <h4>Solicitud de Reabastecimiento a Proveedores Externos</h4>
                            <p>Generación directa de órdenes de compra con homologación de proveedores autorizados.</p>
                        </div>
                    </div>
                    <span class="edi-status-pill">● Conexión EDI Activa (ERP Proveedores)</span>
                </div>

                <!-- Formulario de Reabastecimiento -->
                <form class="reorder-form-grid" onsubmit="InventarioModule.submitReorder(event)">
                    <div class="form-group">
                        <label>Código SKU / Mobiliario Requerido *</label>
                        <select id="reorder-sku" class="form-control" required>
                            ${articulos.map(a => `
                                <option value="${a.sku}" ${a.sku === this.selectedSku ? 'selected' : ''}>
                                    ${a.sku}: ${a.nombre}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Cantidad a Comprar / Fabricar *</label>
                        <input type="number" id="reorder-qty" class="form-control" value="2" min="1" required>
                    </div>

                    <div class="form-group">
                        <label>Proveedor Homologado *</label>
                        <select id="reorder-supplier" class="form-control" required>
                            <option value="Carpas Industriales del Perú S.A.C.">Carpas Industriales del Perú S.A.C.</option>
                            <option value="Mobiliario & Estructuras B2B">Mobiliario & Estructuras B2B</option>
                            <option value="Importaciones Riedel Glassware">Importaciones Riedel Glassware</option>
                            <option value="Muebles Chesterfield Lima">Muebles Chesterfield Lima</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Fecha Meta de Entrega *</label>
                        <input type="date" id="reorder-date" class="form-control" value="2024-12-04" required>
                    </div>

                    <div class="form-group">
                        <label>Prioridad</label>
                        <select id="reorder-priority" class="form-control">
                            <option value="Urgente">Urgente</option>
                            <option value="Normal">Normal</option>
                            <option value="Crítica">Crítica</option>
                        </select>
                    </div>

                    <div class="form-group form-btn-align">
                        <button type="submit" class="btn btn-dark btn-block">
                            ➔ Enviar Orden
                        </button>
                    </div>
                </form>

                <!-- Órdenes de Abastecimiento en Curso -->
                <div class="table-responsive mt-3">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO OC</th>
                                <th>ARTÍCULO / SKU</th>
                                <th>PROVEEDOR</th>
                                <th>CANTIDAD</th>
                                <th>FECHA META</th>
                                <th>PRIORIDAD</th>
                                <th>ESTADO</th>
                                <th>SOLICITADO POR</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${abastecimiento.map(oc => `
                                <tr>
                                    <td><strong class="text-primary">${oc.codigoOC}</strong></td>
                                    <td>${oc.articuloNombre} (${oc.articuloSku})</td>
                                    <td>${oc.proveedor}</td>
                                    <td><strong>${oc.cantidad} unds</strong></td>
                                    <td>${oc.fechaMeta}</td>
                                    <td>
                                        <span class="badge-status ${oc.prioridad === 'Urgente' ? 'badge-danger' : 'badge-warning'}">
                                            ${oc.prioridad}
                                        </span>
                                    </td>
                                    <td><span class="badge-status badge-success">${oc.estado}</span></td>
                                    <td>${oc.solicitadoPor}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static renderTableRowsHTML(articulos) {
        let filtered = articulos;
        if (this.selectedCategory !== 'todas') {
            filtered = filtered.filter(a => a.categoria === this.selectedCategory);
        }
        if (this.searchQuery.trim() !== '') {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(a => a.nombre.toLowerCase().includes(q) || a.sku.toLowerCase().includes(q));
        }

        return filtered.map(item => {
            const isSelected = item.sku === this.selectedSku;
            const pctDisp = (item.disponibles / item.stockTotal) * 100;
            const pctEvent = (item.enEvento / item.stockTotal) * 100;
            const pctMaint = ((item.enTaller || 0) / item.stockTotal) * 100;
            const pctMerma = ((item.deBaja || 0) / item.stockTotal) * 100;

            return `
                <tr class="inventory-row ${isSelected ? 'row-active' : ''}" onclick="InventarioModule.selectItem('${item.sku}')">
                    <td class="col-sku-mob">
                        <img src="${item.imagen}" class="inv-thumb" alt="${item.nombre}">
                        <div>
                            <strong class="inv-item-title">${item.nombre}</strong>
                            <div class="inv-item-sku-tag">${item.sku}</div>
                        </div>
                    </td>
                    <td><span class="category-text">${item.categoriaNombre}</span></td>
                    <td><span class="badge-location">${item.ubicacion}</span></td>
                    <td><strong>${item.stockTotal}</strong></td>
                    <td class="col-breakdown">
                        <div class="progress-segmented-bar">
                            <div class="seg seg-disp" style="width: ${pctDisp}%;" title="Disponibles: ${item.disponibles}"></div>
                            <div class="seg seg-event" style="width: ${pctEvent}%;" title="En Eventos: ${item.enEvento}"></div>
                            <div class="seg seg-maint" style="width: ${pctMaint}%;" title="Mantenimiento: ${item.enTaller}"></div>
                            <div class="seg seg-merma" style="width: ${pctMerma}%;" title="Merma: ${item.deBaja || 0}"></div>
                        </div>
                        <div class="seg-numbers-legend">
                            <span>${item.disponibles} Disp</span>
                            <span>${item.enEvento} Evt</span>
                            <span>${item.enTaller || 0} Mant</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    static renderDonutChartSVG(item) {
        const total = item.stockTotal || 1;
        const comprometido = item.enEvento + (item.enTaller || 0) + (item.deBaja || 0);
        const percentComprometido = Math.round((comprometido / total) * 100);

        // Donut SVG con dasharray y dashoffset para animación circular pura
        const radius = 60;
        const circumference = 2 * Math.PI * radius; // ~377
        const offset = circumference - (percentComprometido / 100) * circumference;

        return `
            <div class="donut-svg-wrapper">
                <svg width="180" height="180" viewBox="0 0 160 160" class="donut-svg">
                    <circle cx="80" cy="80" r="${radius}" class="donut-ring-bg"></circle>
                    <circle cx="80" cy="80" r="${radius}" class="donut-ring-fill"
                        stroke-dasharray="${circumference}" 
                        stroke-dashoffset="${offset}" 
                        transform="rotate(-90 80 80)"></circle>
                </svg>
                <div class="donut-inner-content">
                    <span class="donut-percentage">${percentComprometido}%</span>
                    <span class="donut-label">COMPROMETIDO</span>
                </div>
            </div>
        `;
    }

    static selectItem(sku) {
        this.selectedSku = sku;
        this.render();
    }

    static handleSearch(q) {
        this.searchQuery = q;
        this.render();
    }

    static handleCategoryFilter(cat) {
        this.selectedCategory = cat;
        this.render();
    }

    static exportInventoryReport() {
        Toast.success('Reporte de existencias de flota exportado en formato CSV/Excel.');
    }

    static auditPhysicalStock() {
        Toast.info('Sesión de auditoría física de almacén Lurín iniciada con escáner de códigos de barra.');
    }

    static openTechnicalSheet(sku) {
        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const art = articulos.find(a => a.sku === sku);
        if (!art) return;

        const content = `
            <div class="tech-sheet-modal">
                <div class="tech-img-box">
                    <img src="${art.imagen}" class="img-fluid" style="border-radius: 8px; max-height: 220px; object-fit: cover;">
                </div>
                <h3 class="mt-3">${art.nombre} (${art.sku})</h3>
                <p><strong>Categoría:</strong> ${art.categoriaNombre}</p>
                <p><strong>Ubicación Almacén:</strong> ${art.ubicacion}</p>
                <p><strong>Tarifa Diaria:</strong> S/ ${art.tarifaDiaria.toFixed(2)}</p>
                <p><strong>Valor de Reposición (Merma):</strong> S/ ${art.valorReposicion.toFixed(2)}</p>
                <p><strong>Especificaciones:</strong> ${art.specs || 'N/A'}</p>
                <p><strong>Descripción de Mantenimiento:</strong> Revisión de tornillería, pulido de barniz y lavado textil pos-evento.</p>
            </div>
        `;

        Modal.open(`Ficha Técnica - ${art.sku}`, content, [
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }

    static submitReorder(event) {
        event.preventDefault();
        const sku = document.getElementById('reorder-sku').value;
        const qty = parseInt(document.getElementById('reorder-qty').value);
        const supplier = document.getElementById('reorder-supplier').value;
        const date = document.getElementById('reorder-date').value;
        const priority = document.getElementById('reorder-priority').value;

        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const art = articulos.find(a => a.sku === sku);
        const currentUser = StorageManager.getCurrentUser();

        const ocCode = `#OC-2024-0${Math.floor(513 + Math.random() * 50)}`;
        const newOC = {
            id: Date.now(),
            codigoOC: ocCode,
            articuloSku: sku,
            articuloNombre: art ? art.nombre : sku,
            cantidad: qty,
            proveedor: supplier,
            fechaMeta: date,
            prioridad: priority,
            estado: 'Solicitada',
            solicitadoPor: `${currentUser.nombre} (${currentUser.cargo || currentUser.rol})`,
            fecha: new Date().toISOString().substring(0, 10)
        };

        const abastecimiento = StorageManager.get(STORAGE_KEYS.ABASTECIMIENTO);
        abastecimiento.unshift(newOC);
        StorageManager.set(STORAGE_KEYS.ABASTECIMIENTO, abastecimiento);

        Toast.success(`¡Orden de Compra ${ocCode} enviada al proveedor ${supplier} por ${qty} unidades!`);
        this.render();
    }
}

window.InventarioModule = InventarioModule;
InventarioModule.init();
