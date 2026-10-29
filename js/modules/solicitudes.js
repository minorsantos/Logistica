/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/solicitudes.js - MÓDULO 1: Solicitudes y Cotizaciones (CUS-01 / RF-01 a RF-07)
 * Implementa RN-01 (Registro previo de cliente), cotizador reactivo en vivo y cambio de estados.
 */

class SolicitudesModule {
    static init() {
        this.currentCotizacionItems = [
            { articuloId: 1, sku: 'TLD-1530', nombre: 'Toldo Panorámico 15×30m', cantidad: 1, tarifaDiaria: 850.00, dias: 3 },
            { articuloId: 3, sku: 'SIL-CB01', nombre: 'Silla Crossback Nogal', cantidad: 250, tarifaDiaria: 4.50, dias: 3 },
            { articuloId: 4, sku: 'MES-RD18', nombre: 'Mesa Banquetería 1.80m', cantidad: 25, tarifaDiaria: 18.00, dias: 3 },
            { articuloId: 6, sku: 'LIV-CH02', nombre: 'Sillón Chesterfield Cognac', cantidad: 4, tarifaDiaria: 95.00, dias: 3 }
        ];
        this.currentCategoryFilter = 'todo';
        this.searchQuery = '';
    }

    static render() {
        const container = document.getElementById('module-content-area');
        if (!container) return;

        const clientes = StorageManager.get(STORAGE_KEYS.CLIENTES);
        const cotizaciones = StorageManager.get(STORAGE_KEYS.COTIZACIONES);

        container.innerHTML = `
            <div class="view-header">
                <div class="breadcrumbs">
                    <span class="badge-tag">CUS-01</span>
                    <span>COTIZADOR & SOLICITUD DE MOBILIARIO</span>
                    <span class="status-pill status-pill-draft">Borrador Activo #COT-2024-0419</span>
                </div>
                <div class="header-steps-bar">
                    <div class="step-badge step-completed">
                        <span class="step-check">✓</span> 1. Información del Evento <span class="step-sub">(Completado)</span>
                    </div>
                    <div class="step-badge step-active">
                        <span class="step-number">2</span> 2. Selección de Mobiliario y Stock <span class="step-sub">(Configuración en vivo)</span>
                    </div>
                    <div class="step-badge step-pending">
                        <span class="step-number">3</span> 3. Resumen y Emisión <span class="step-sub">(Pendiente)</span>
                    </div>
                </div>
            </div>

            <!-- Banner Resumen del Evento Seleccionado -->
            <div class="event-summary-card">
                <div class="event-summary-header">
                    <div class="event-title-group">
                        <h3 class="event-title">Boda Hacienda San José <span class="badge-tag">350 Invitados</span> <span class="badge-code">EVT-7824-LIM</span></h3>
                        <p class="event-client-info"><strong>Cliente:</strong> Corporación Gourmet & Eventos S.A.C. • RUC: 20549823411 • Contacto: Rodrigo Morales</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-secondary btn-sm" onclick="SolicitudesModule.openEditEventModal()">
                            <i class="icon-edit">✎</i> Editar Datos Generales
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="SolicitudesModule.openNewClientModal()">
                            <i class="icon-plus">+</i> Nuevo Cliente (RN-01)
                        </button>
                    </div>
                </div>

                <div class="event-meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">📅 FECHAS DEL SERVICIO</span>
                        <strong class="meta-val">18 Oct - 20 Oct 2024</strong>
                        <span class="meta-hint">3 días de reserva continua</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">📍 LOCACIÓN DE DESPLIEGUE</span>
                        <strong class="meta-val">Valle de Lurín Km 28.5</strong>
                        <span class="meta-hint">Zona Campestre / Jardín Central</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">🚚 MONTAJE & LOGÍSTICA</span>
                        <strong class="meta-val">17 Octubre, 14:00</strong>
                        <span class="meta-hint">Retiro: 21 Oct, 08:00 AM</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">👷 SUPERVISOR ASIGNADO</span>
                        <strong class="meta-val">Carlos Huamán R.</strong>
                        <span class="meta-hint">Turno A / Cuadrilla 4 Almacén</span>
                    </div>
                </div>
            </div>

            <!-- Contenedor Dividido: Catálogo a la izquierda, Panel Resumen a la derecha -->
            <div class="cotizador-split-layout">
                <!-- Catálogo de Productos y Filtros -->
                <div class="catalog-section">
                    <div class="catalog-toolbar">
                        <div class="search-input-wrapper">
                            <i class="icon-search">🔍</i>
                            <input type="text" id="catalog-search-input" placeholder="Buscar carpas, toldos, vajilla, sillas tiffany o código..." 
                                value="${this.searchQuery}" oninput="SolicitudesModule.handleSearch(this.value)">
                        </div>
                        <div class="filter-pills">
                            <button class="filter-pill ${this.currentCategoryFilter === 'todo' ? 'active' : ''}" onclick="SolicitudesModule.filterCategory('todo')">Todo (128)</button>
                            <button class="filter-pill ${this.currentCategoryFilter === 'carpas' ? 'active' : ''}" onclick="SolicitudesModule.filterCategory('carpas')">Carpas y Domos (14)</button>
                            <button class="filter-pill ${this.currentCategoryFilter === 'sillas' ? 'active' : ''}" onclick="SolicitudesModule.filterCategory('sillas')">Sillas y Sillones (42)</button>
                            <button class="filter-pill ${this.currentCategoryFilter === 'mesas' ? 'active' : ''}" onclick="SolicitudesModule.filterCategory('mesas')">Mesas y Barras (28)</button>
                            <button class="filter-pill ${this.currentCategoryFilter === 'lounge' ? 'active' : ''}" onclick="SolicitudesModule.filterCategory('lounge')">Salas Lounge (18)</button>
                            <button class="filter-pill ${this.currentCategoryFilter === 'iluminacion' ? 'active' : ''}" onclick="SolicitudesModule.filterCategory('iluminacion')">Iluminación (24)</button>
                            <button class="filter-pill ${this.currentCategoryFilter === 'catering' ? 'active' : ''}" onclick="SolicitudesModule.filterCategory('catering')">Menaje & Climatización</button>
                        </div>
                    </div>

                    <!-- Grid de Mobiliario -->
                    <div class="catalog-cards-grid" id="catalog-grid-container">
                        ${this.renderCatalogItemsHTML()}
                    </div>

                    <!-- Paginación informativa -->
                    <div class="catalog-footer">
                        <span class="catalog-counter-info">
                            🛡️ Mostrando artículos con disponibilidad confirmada en Lurín para el 18-20 Oct.
                        </span>
                    </div>
                </div>

                <!-- Panel Lateral Resumen en Vivo #COT-2024-0419 -->
                <div class="cotizacion-live-panel">
                    <div class="panel-header-badge">
                        <div>
                            <span class="panel-tag">RESUMEN EN VIVO</span>
                            <h4 class="panel-code">#COT-2024-0419</h4>
                        </div>
                        <span class="badge-duration">Duración: <strong>3 Días</strong></span>
                    </div>

                    <!-- Items seleccionados -->
                    <div class="selected-items-list" id="selected-items-list">
                        ${this.renderSelectedItemsHTML()}
                    </div>

                    <!-- Totales y desglose financiero -->
                    <div class="financial-breakdown" id="financial-breakdown">
                        ${this.renderFinancialBreakdownHTML()}
                    </div>

                    <!-- Alerta de Demanda Alta -->
                    <div class="alert-box-warning">
                        <div class="alert-icon">⚠️</div>
                        <div class="alert-content">
                            <strong>Demanda Alta para Octubre 18-20</strong>
                            <p>3 cotizaciones adicionales compiten por el mismo lote de Sillas Crossback Nogal en almacén Lurín.</p>
                        </div>
                    </div>

                    <!-- Acciones de Cotización -->
                    <div class="panel-action-buttons">
                        <button class="btn btn-primary btn-block" onclick="SolicitudesModule.submitCotizacionOficial()">
                            ⚡ Generar y Enviar Cotización Oficial
                        </button>
                        <div class="btn-group-row">
                            <button class="btn btn-secondary btn-half" onclick="SolicitudesModule.saveDraft()">
                                💾 Guardar Borrador
                            </button>
                            <button class="btn btn-outline btn-half" onclick="SolicitudesModule.exportPDF()">
                                📄 Exportar PDF
                            </button>
                        </div>
                    </div>

                    <div class="security-seal">
                        <span class="seal-icon">🛡️</span> Reserva de inventario válida por 48 horas continuas.
                    </div>
                </div>
            </div>

            <!-- Historial de Cotizaciones Emitidas -->
            <div class="section-card mt-4">
                <div class="section-card-header">
                    <div>
                        <h4 class="section-card-title">Historial de Cotizaciones y Solicitudes</h4>
                        <p class="section-card-subtitle">Control de estados: Pendiente, Aceptada, Rechazada y conversión a Reserva (RN-02)</p>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>CLIENTE / EMPRESA</th>
                                <th>EVENTO</th>
                                <th>FECHAS</th>
                                <th>TOTAL ESTIMADO</th>
                                <th>ANTICIPO 50%</th>
                                <th>ESTADO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cotizaciones.map(c => `
                                <tr>
                                    <td><strong class="text-primary">${c.codigo}</strong></td>
                                    <td>${c.clienteNombre}</td>
                                    <td>${c.eventoNombre || 'Evento General'}</td>
                                    <td>${c.fechaInicio} al ${c.fechaFin}</td>
                                    <td><strong>$${(c.totalEstimado || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                                    <td><span class="text-success">$${(c.anticipoMonto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></td>
                                    <td>
                                        <span class="badge-status ${c.estado === 'Aceptada por Cliente' ? 'badge-success' : (c.estado === 'Rechazada' ? 'badge-danger' : 'badge-warning')}">
                                            ${c.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-btn-group">
                                            <button class="btn-action" title="Ver Detalle" onclick="SolicitudesModule.viewCotizacionDetail('${c.codigo}')">👁️</button>
                                            ${c.estado !== 'Aceptada por Cliente' ? `
                                                <button class="btn-action text-success" title="Aceptar Cotización" onclick="SolicitudesModule.updateCotizacionStatus('${c.codigo}', 'Aceptada por Cliente')">✓</button>
                                                <button class="btn-action text-danger" title="Rechazar" onclick="SolicitudesModule.updateCotizacionStatus('${c.codigo}', 'Rechazada')">✗</button>
                                            ` : `
                                                <button class="btn-action text-primary" title="Generar Reserva (CUS-02)" onclick="AppRouter.navigate('reservas')">📅 Reservar</button>
                                            `}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static renderCatalogItemsHTML() {
        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        let filtered = articulos;

        if (this.currentCategoryFilter !== 'todo') {
            filtered = filtered.filter(a => a.categoria === this.currentCategoryFilter);
        }

        if (this.searchQuery.trim() !== '') {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(a => 
                a.nombre.toLowerCase().includes(q) || 
                a.sku.toLowerCase().includes(q) ||
                a.categoriaNombre.toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            return `<div class="empty-state">No se encontraron artículos que coincidan con la búsqueda.</div>`;
        }

        return filtered.map(item => {
            const inCart = this.currentCotizacionItems.find(i => i.articuloId === item.id);
            const currentQty = inCart ? inCart.cantidad : (item.sku === 'TLD-1530' ? 1 : (item.sku.includes('SIL') ? 100 : 1));

            return `
                <div class="catalog-card ${inCart ? 'catalog-card-selected' : ''}">
                    <div class="card-img-wrapper">
                        <img src="${item.imagen}" alt="${item.nombre}" class="catalog-img" onerror="this.src='https://placehold.co/400x300/e2e8f0/475569?text=${item.sku}'">
                        <span class="card-sku-tag">${item.sku}</span>
                        <span class="card-stock-pill ${item.disponibles <= 5 ? 'stock-pill-low' : ''}">
                            ● ${item.disponibles} disp.
                        </span>
                    </div>
                    <div class="card-body">
                        <h4 class="card-title">${item.nombre}</h4>
                        <p class="card-desc">${item.descripcion}</p>
                        <div class="card-price-row">
                            <span class="card-rate-label">TARIFA DIARIA</span>
                            <span class="card-price"><strong>$${item.tarifaDiaria.toFixed(2)}</strong> <small>/ día</small></span>
                        </div>
                        <div class="card-action-row">
                            <div class="qty-control">
                                <button type="button" class="btn-qty" onclick="SolicitudesModule.changeQty(${item.id}, -1)">-</button>
                                <input type="number" id="qty-input-${item.id}" class="input-qty" value="${currentQty}" min="1" max="${item.stockTotal}">
                                <button type="button" class="btn-qty" onclick="SolicitudesModule.changeQty(${item.id}, 1)">+</button>
                            </div>
                            <button class="btn ${inCart ? 'btn-added' : 'btn-primary'} btn-sm" onclick="SolicitudesModule.toggleItem(${item.id})">
                                ${inCart ? `✓ Agregado (${inCart.cantidad})` : '+ Añadir'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    static renderSelectedItemsHTML() {
        if (this.currentCotizacionItems.length === 0) {
            return `<div class="empty-cart-msg">No hay mobiliario seleccionado para esta cotización.</div>`;
        }

        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);

        return this.currentCotizacionItems.map(item => {
            const art = articulos.find(a => a.id === item.articuloId) || {};
            const subtotal = item.cantidad * item.tarifaDiaria * item.dias;

            return `
                <div class="selected-item-row">
                    <img src="${art.imagen || 'https://placehold.co/80'}" class="selected-item-thumb" alt="${item.nombre}">
                    <div class="selected-item-info">
                        <div class="selected-item-title">${item.nombre}</div>
                        <div class="selected-item-calc">
                            ${item.cantidad} unid • $${item.tarifaDiaria.toFixed(2)}/día • ${item.dias}d
                        </div>
                    </div>
                    <div class="selected-item-subtotal">
                        $${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <button class="btn-remove-item" onclick="SolicitudesModule.removeItem(${item.articuloId})" title="Quitar">×</button>
                </div>
            `;
        }).join('');
    }

    static calculateTotals() {
        const subtotalMobiliario = this.currentCotizacionItems.reduce((acc, curr) => {
            return acc + (curr.cantidad * curr.tarifaDiaria * curr.dias);
        }, 0);

        const transporteMontaje = subtotalMobiliario > 0 ? 650.00 : 0.00;
        const garantia = subtotalMobiliario * 0.20; // 20% Garantía reembolsable
        const igv = (subtotalMobiliario + transporteMontaje) * 0.18; // 18% IGV
        const total = subtotalMobiliario + transporteMontaje + garantia + igv;
        const anticipo50 = total * 0.50;

        return {
            subtotalMobiliario,
            transporteMontaje,
            garantia,
            igv,
            total,
            anticipo50
        };
    }

    static renderFinancialBreakdownHTML() {
        const totals = this.calculateTotals();

        return `
            <div class="breakdown-row">
                <span>Subtotal Alquiler Mobiliario:</span>
                <strong>$${totals.subtotalMobiliario.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="breakdown-row">
                <span>Transporte & Montaje (Lurín): <i class="info-bubble" title="Calculado por zona y kilometraje">ℹ</i></span>
                <strong>$${totals.transporteMontaje.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="breakdown-row">
                <span>Depósito de Garantía (20%): <span class="tag-refundable">Reembolsable</span></span>
                <strong>$${totals.garantia.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="breakdown-row">
                <span>I.G.V. / Impuestos (18%):</span>
                <strong>$${totals.igv.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div class="breakdown-total-row">
                <div>
                    <div class="total-label">TOTAL GENERAL ESTIMADO</div>
                    <small class="total-hint">Incluye seguro e impuestos de ley</small>
                </div>
                <div class="total-amount">$${totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} <small>USD</small></div>
            </div>
            <div class="anticipo-switch-box">
                <div class="switch-info">
                    <strong>Anticipo Requerido (50%):</strong>
                    <span class="text-success">$${totals.anticipo50.toLocaleString('en-US', { minimumFractionDigits: 2 })} para bloqueo de stock</span>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" checked disabled>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
    }

    static changeQty(articuloId, delta) {
        const input = document.getElementById(`qty-input-${articuloId}`);
        if (!input) return;
        let val = parseInt(input.value) + delta;
        if (val < 1) val = 1;
        input.value = val;

        const existing = this.currentCotizacionItems.find(i => i.articuloId === articuloId);
        if (existing) {
            existing.cantidad = val;
            this.refreshCartAndBreakdown();
        }
    }

    static toggleItem(articuloId) {
        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const art = articulos.find(a => a.id === articuloId);
        if (!art) return;

        const input = document.getElementById(`qty-input-${articuloId}`);
        const qty = input ? parseInt(input.value) : 1;

        const index = this.currentCotizacionItems.findIndex(i => i.articuloId === articuloId);
        if (index > -1) {
            // Ya estaba, actualizamos cantidad
            this.currentCotizacionItems[index].cantidad = qty;
            Toast.info(`Actualizada cantidad de ${art.nombre}: ${qty} unidades.`);
        } else {
            this.currentCotizacionItems.push({
                articuloId: art.id,
                sku: art.sku,
                nombre: art.nombre,
                cantidad: qty,
                tarifaDiaria: art.tarifaDiaria,
                dias: 3
            });
            Toast.success(`Agregado al presupuesto: ${art.nombre} (${qty} und).`);
        }

        this.refreshCartAndBreakdown();
        this.renderCatalogGridOnly();
    }

    static removeItem(articuloId) {
        this.currentCotizacionItems = this.currentCotizacionItems.filter(i => i.articuloId !== articuloId);
        Toast.info('Artículo retirado de la cotización actual.');
        this.refreshCartAndBreakdown();
        this.renderCatalogGridOnly();
    }

    static refreshCartAndBreakdown() {
        const listContainer = document.getElementById('selected-items-list');
        const breakdownContainer = document.getElementById('financial-breakdown');
        if (listContainer) listContainer.innerHTML = this.renderSelectedItemsHTML();
        if (breakdownContainer) breakdownContainer.innerHTML = this.renderFinancialBreakdownHTML();
    }

    static renderCatalogGridOnly() {
        const grid = document.getElementById('catalog-grid-container');
        if (grid) grid.innerHTML = this.renderCatalogItemsHTML();
    }

    static filterCategory(cat) {
        this.currentCategoryFilter = cat;
        this.render();
    }

    static handleSearch(q) {
        this.searchQuery = q;
        this.renderCatalogGridOnly();
    }

    static submitCotizacionOficial() {
        if (this.currentCotizacionItems.length === 0) {
            Toast.warning('Debe seleccionar al menos un artículo antes de emitir la cotización.');
            return;
        }

        const totals = this.calculateTotals();
        const cotizaciones = StorageManager.get(STORAGE_KEYS.COTIZACIONES);
        
        const newCot = {
            id: Date.now(),
            codigo: `#COT-2024-0${Math.floor(420 + Math.random() * 80)}`,
            solicitudCodigo: '#SOL-2024-1081',
            clienteId: 1,
            clienteNombre: 'Corporación Gourmet & Eventos S.A.C.',
            eventoNombre: 'Boda Hacienda San José',
            fechaInicio: '2024-10-18',
            fechaFin: '2024-10-20',
            dias: 3,
            locacion: 'Valle de Lurín Km 28.5 (Zona Campestre / Jardín)',
            items: [...this.currentCotizacionItems],
            subtotalMobiliario: totals.subtotalMobiliario,
            transporteMontaje: totals.transporteMontaje,
            garantia: totals.garantia,
            igv: totals.igv,
            totalEstimado: totals.total,
            anticipoRequeridoPorcentaje: 50,
            anticipoMonto: totals.anticipo50,
            estado: 'Emitida',
            validezHoras: 48,
            fechaEmision: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        cotizaciones.unshift(newCot);
        StorageManager.set(STORAGE_KEYS.COTIZACIONES, cotizaciones);

        Toast.success(`¡Cotización Oficial ${newCot.codigo} generada exitosamente y enviada al cliente!`);
        this.render();
    }

    static saveDraft() {
        Toast.info('Borrador de cotización guardado automáticamente en memoria local.');
    }

    static exportPDF() {
        const totals = this.calculateTotals();
        const modalContent = `
            <div class="print-preview-card">
                <div class="print-header">
                    <div class="print-logo">
                        <h2>CASA MARSHALL</h2>
                        <span>EVENT LOGISTICS & RENTALS</span>
                    </div>
                    <div class="print-title-doc">
                        <h3>COTIZACIÓN OFICIAL #COT-2024-0419</h3>
                        <p>Fecha de Emisión: 18 de Octubre 2024 • Validez: 48 Horas</p>
                    </div>
                </div>

                <div class="print-client-box">
                    <p><strong>Cliente:</strong> Corporación Gourmet & Eventos S.A.C. (RUC 20549823411)</p>
                    <p><strong>Evento:</strong> Boda Hacienda San José • 350 Invitados</p>
                    <p><strong>Fechas de Servicio:</strong> 18 Octubre al 20 Octubre 2024 (3 Días)</p>
                    <p><strong>Lugar de Entrega:</strong> Valle de Lurín Km 28.5</p>
                </div>

                <table class="print-items-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Descripción Mobiliario</th>
                            <th>Cant.</th>
                            <th>Tarifa Diaria</th>
                            <th>Días</th>
                            <th>Total USD</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.currentCotizacionItems.map(i => `
                            <tr>
                                <td>${i.sku}</td>
                                <td>${i.nombre}</td>
                                <td>${i.cantidad}</td>
                                <td>$${i.tarifaDiaria.toFixed(2)}</td>
                                <td>${i.dias}</td>
                                <td>$${(i.cantidad * i.tarifaDiaria * i.dias).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="print-totals-summary">
                    <p>Subtotal Alquiler: <strong>$${totals.subtotalMobiliario.toFixed(2)}</strong></p>
                    <p>Transporte & Montaje Lurín: <strong>$${totals.transporteMontaje.toFixed(2)}</strong></p>
                    <p>Garantía Reembolsable (20%): <strong>$${totals.garantia.toFixed(2)}</strong></p>
                    <p>IGV (18%): <strong>$${totals.igv.toFixed(2)}</strong></p>
                    <h3 class="print-grand-total">TOTAL: $${totals.total.toFixed(2)} USD</h3>
                    <p class="text-success"><strong>Anticipo para Bloqueo (50%): $${totals.anticipo50.toFixed(2)}</strong></p>
                </div>
            </div>
        `;

        Modal.open('Simulación de Cotización Oficial PDF', modalContent, [
            { text: 'Imprimir / Guardar PDF', class: 'btn-primary', onClick: () => window.print() },
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }

    static updateCotizacionStatus(codigo, nuevoEstado) {
        const cotizaciones = StorageManager.get(STORAGE_KEYS.COTIZACIONES);
        const cot = cotizaciones.find(c => c.codigo === codigo);
        if (cot) {
            cot.estado = nuevoEstado;
            StorageManager.set(STORAGE_KEYS.COTIZACIONES, cotizaciones);
            Toast.success(`Cotización ${codigo} actualizada a estado: "${nuevoEstado}"`);
            this.render();
        }
    }

    static viewCotizacionDetail(codigo) {
        const cotizaciones = StorageManager.get(STORAGE_KEYS.COTIZACIONES);
        const cot = cotizaciones.find(c => c.codigo === codigo);
        if (!cot) return;

        const content = `
            <div class="detail-box">
                <h4>Cotización ${cot.codigo}</h4>
                <p><strong>Cliente:</strong> ${cot.clienteNombre}</p>
                <p><strong>Evento:</strong> ${cot.eventoNombre || 'Evento Particular'}</p>
                <p><strong>Total Estimado:</strong> $${(cot.totalEstimado || 0).toFixed(2)}</p>
                <p><strong>Anticipo 50%:</strong> $${(cot.anticipoMonto || 0).toFixed(2)}</p>
                <p><strong>Estado Actual:</strong> <span class="badge-status badge-success">${cot.estado}</span></p>
                <h5 class="mt-3">Mobiliario Solicitado:</h5>
                <ul>
                    ${(cot.items || []).map(i => `<li>${i.cantidad}x ${i.nombre} (${i.sku}) - $${i.subtotal ? i.subtotal.toFixed(2) : ''}</li>`).join('')}
                </ul>
            </div>
        `;

        Modal.open(`Detalle de ${cot.codigo}`, content, [
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }

    static openNewClientModal() {
        const formHtml = `
            <form id="new-client-form" onsubmit="SolicitudesModule.saveNewClient(event)">
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Tipo Documento *</label>
                        <select id="nc-tipo-doc" class="form-control" required>
                            <option value="RUC">RUC</option>
                            <option value="DNI">DNI</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Número Documento *</label>
                        <input type="text" id="nc-num-doc" class="form-control" placeholder="Ej: 20601984210" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Razón Social / Nombre Completo *</label>
                    <input type="text" id="nc-razon-social" class="form-control" placeholder="Ej: Productora Platinum Events S.A.C." required>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Persona de Contacto *</label>
                        <input type="text" id="nc-contacto" class="form-control" placeholder="Ej: Marcela Vega" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono Celular *</label>
                        <input type="tel" id="nc-telefono" class="form-control" placeholder="+51 988 123 456" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Correo Electrónico *</label>
                    <input type="email" id="nc-email" class="form-control" placeholder="contacto@empresa.com" required>
                </div>
                <div class="form-group">
                    <label>Dirección Fiscal *</label>
                    <input type="text" id="nc-direccion" class="form-control" placeholder="Av. Pardo 830, Miraflores, Lima" required>
                </div>
                <div class="modal-footer-btns mt-3">
                    <button type="submit" class="btn btn-primary">Registrar Cliente (RN-01)</button>
                </div>
            </form>
        `;

        Modal.open('Registrar Nuevo Cliente (RN-01 Obligatoria)', formHtml);
    }

    static saveNewClient(event) {
        event.preventDefault();
        const tipoDoc = document.getElementById('nc-tipo-doc').value;
        const numDoc = document.getElementById('nc-num-doc').value.trim();
        const razonSocial = document.getElementById('nc-razon-social').value.trim();
        const contacto = document.getElementById('nc-contacto').value.trim();
        const telefono = document.getElementById('nc-telefono').value.trim();
        const email = document.getElementById('nc-email').value.trim();
        const direccion = document.getElementById('nc-direccion').value.trim();

        const clientes = StorageManager.get(STORAGE_KEYS.CLIENTES);
        
        // Validar unicidad de documento
        if (clientes.some(c => c.numeroDocumento === numDoc)) {
            Toast.error('Ya existe un cliente registrado con este número de documento.');
            return;
        }

        const newClient = {
            id: Date.now(),
            tipoDocumento: tipoDoc,
            numeroDocumento: numDoc,
            razonSocial: razonSocial,
            contactoNombre: contacto,
            contactoTelefono: telefono,
            contactoEmail: email,
            direccion: direccion,
            categoria: 'corporativo',
            estado: 'activo'
        };

        clientes.unshift(newClient);
        StorageManager.set(STORAGE_KEYS.CLIENTES, clientes);

        Modal.close();
        Toast.success(`Cliente "${razonSocial}" registrado exitosamente según RN-01.`);
    }

    static openEditEventModal() {
        const formHtml = `
            <div class="form-group">
                <label>Nombre del Evento</label>
                <input type="text" class="form-control" value="Boda Hacienda San José" id="edit-ev-nombre">
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Fecha Inicio</label>
                    <input type="date" class="form-control" value="2024-10-18" id="edit-ev-inicio">
                </div>
                <div class="form-group">
                    <label>Fecha Fin</label>
                    <input type="date" class="form-control" value="2024-10-20" id="edit-ev-fin">
                </div>
            </div>
            <div class="form-group">
                <label>Locación / Lugar</label>
                <input type="text" class="form-control" value="Valle de Lurín Km 28.5 (Zona Campestre)" id="edit-ev-locacion">
            </div>
            <div class="modal-footer-btns mt-3">
                <button type="button" class="btn btn-primary" onclick="Toast.success('Datos del evento actualizados'); Modal.close();">Guardar Cambios</button>
            </div>
        `;
        Modal.open('Editar Datos del Evento', formHtml);
    }
}

window.SolicitudesModule = SolicitudesModule;
SolicitudesModule.init();
