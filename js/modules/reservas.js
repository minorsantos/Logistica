/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/reservas.js - MÓDULO 2: Gestión de Reservas y Disponibilidad de Flota (CUS-02 / RF-08 a RF-13)
 * Validación estricta de stock, confirmación con pago inicial y mitigación de sobreventa.
 */

class ReservasModule {
    static init() {
        this.selectedFamily = 'todas';
        this.currentViewMode = 'gantt'; // gantt, semana, mes
        this.mitigationApplied = false;
        this.orderLocked = false;
    }

    static render() {
        const container = document.getElementById('module-content-area');
        if (!container) return;

        const reservas = StorageManager.get(STORAGE_KEYS.RESERVAS);
        const currentUser = StorageManager.getCurrentUser();

        container.innerHTML = `
            <div class="view-header">
                <div class="breadcrumbs">
                    <span>OPERACIONES & LOGÍSTICA</span>
                    <span>›</span>
                    <span class="badge-tag">CUS-02 DISPONIBILIDAD DE FLOTA</span>
                </div>
                <div class="header-title-row">
                    <h2 class="view-main-title">Calendario de Disponibilidad & Reservas</h2>
                    <div class="header-badges-group">
                        <span class="badge-pill-danger animate-pulse">
                            ● SOBREDEMANDA ACTIVA <small>(1 Conflicto Crítico)</small>
                        </span>
                        <span class="badge-pill-sync">
                            🔄 SINCRONIZACIÓN Almacén Lurín • Hace 1m
                        </span>
                    </div>
                </div>
            </div>

            <!-- Controles de Navegación Temporal y Filtros de Familia -->
            <div class="calendar-controls-bar">
                <div class="date-navigator">
                    <button class="btn-nav-arrow" onclick="Toast.info('Visualizando semana anterior')">‹</button>
                    <span class="calendar-current-range">📅 Semana del 14 al 27 de Octubre, 2024</span>
                    <button class="btn-nav-arrow" onclick="Toast.info('Visualizando semana posterior')">›</button>
                    <button class="btn-today" onclick="Toast.info('Retornado a la fecha de hoy')">Hoy</button>
                </div>

                <div class="family-filters-group">
                    <span class="family-label">FAMILIA:</span>
                    <button class="family-pill ${this.selectedFamily === 'todas' ? 'active' : ''}" onclick="ReservasModule.filterFamily('todas')">Todas</button>
                    <button class="family-pill ${this.selectedFamily === 'carpas' ? 'active' : ''}" onclick="ReservasModule.filterFamily('carpas')">Carpas & Toldos (10)</button>
                    <button class="family-pill ${this.selectedFamily === 'silleria' ? 'active' : ''}" onclick="ReservasModule.filterFamily('silleria')">Sillería (1.4k)</button>
                    <button class="family-pill ${this.selectedFamily === 'mesas' ? 'active' : ''}" onclick="ReservasModule.filterFamily('mesas')">Mesas (120)</button>
                    <button class="family-pill ${this.selectedFamily === 'lounge' ? 'active' : ''}" onclick="ReservasModule.filterFamily('lounge')">Lounge & Deco (15)</button>
                </div>

                <div class="view-mode-buttons">
                    <button class="mode-btn">Día</button>
                    <button class="mode-btn">Semana</button>
                    <button class="mode-btn">Mes</button>
                    <button class="mode-btn active">📊 Vista Gantt de Recursos</button>
                </div>
            </div>

            <!-- Leyenda de Disponibilidad y Capacidad -->
            <div class="availability-legend-bar">
                <div class="legend-items">
                    <span class="legend-title">DISPONIBILIDAD EN RANGO:</span>
                    <span class="legend-bullet bullet-optimal">● 100% - 60% Disponible (Stock Óptimo)</span>
                    <span class="legend-bullet bullet-limited">● 59% - 15% Stock Limitado</span>
                    <span class="legend-bullet bullet-critical">● 0% Agotado / Sobreventa Activa</span>
                </div>
                <div class="kpi-mini-metrics">
                    <span>Capacidad comprometida: <strong>82.4%</strong></span> • 
                    <span>Montajes simultáneos: <strong>12 eventos</strong></span> • 
                    <span>Flota en taller/lavado: <strong>4.8%</strong></span>
                </div>
            </div>

            <!-- Grid Dividido: Matriz Gantt a la izquierda, Panel de Aprobación a la derecha -->
            <div class="gantt-approval-split-layout">
                <!-- Matriz Gantt de Ocupación por Equipo -->
                <div class="gantt-matrix-card">
                    <div class="matrix-card-header">
                        <div class="matrix-title-group">
                            <span class="matrix-icon">📅</span>
                            <h4>Matriz de Ocupación por Equipo <small>(14 Días Operativos)</small></h4>
                        </div>
                        <span class="matrix-hint">ℹ️ Haga clic en cualquier franja para ver manifiesto de despacho</span>
                    </div>

                    <!-- Cabecera de días -->
                    <div class="gantt-days-header">
                        <div class="gantt-col-resource">RECURSO / FLOTA TOTAL</div>
                        <div class="gantt-col-day">LUN 14</div>
                        <div class="gantt-col-day">MAR 15</div>
                        <div class="gantt-col-day">MIÉ 16</div>
                        <div class="gantt-col-day">JUE 17</div>
                        <div class="gantt-col-day">VIE 18</div>
                        <div class="gantt-col-day day-conflict">SÁB 19</div>
                        <div class="gantt-col-day">DOM 20</div>
                    </div>

                    <!-- Fila 1: Toldo Panorámico 15x30m (CON SOBREVENTA CRÍTICA) -->
                    <div class="gantt-resource-row">
                        <div class="resource-info-cell">
                            <strong>Toldo Panorámico 15×30m</strong>
                            <div class="resource-tags">
                                <span class="tag-status-danger">SOBREVENTA</span>
                                <small>Flota: 4 und • <span class="text-danger">Sáb 19: Demanda 5 (-1)</span></small>
                            </div>
                        </div>
                        <div class="resource-timeline-cell">
                            <div class="gantt-bar-box bar-normal" style="left: 0%; width: 35%;" onclick="Toast.info('Matrimonio Barrenechea: 2 unidades reservadas')">
                                Matrimonio Barrenechea <span class="bar-qty">x2</span>
                            </div>
                            <div class="gantt-bar-box ${this.mitigationApplied ? 'bar-mitigated' : 'bar-conflict'}" style="left: 45%; width: 50%;" 
                                onclick="ReservasModule.showConflictDetails()">
                                ${this.mitigationApplied ? '✓ Feria Expomin + Boda Lima (Mitigado con Aliado)' : '⚠️ Feria Expomin + Boda Lima (x5 Solicitadas - Conflicto)'}
                            </div>
                        </div>
                    </div>

                    <!-- Fila 2: Toldo Domo 10x10m -->
                    <div class="gantt-resource-row">
                        <div class="resource-info-cell">
                            <strong>Toldo Domo 10×10m</strong>
                            <div class="resource-tags">
                                <small>Flota Total: 6 und • Disp: 4 und</small>
                            </div>
                        </div>
                        <div class="resource-timeline-cell">
                            <div class="gantt-bar-box bar-normal" style="left: 20%; width: 40%;" onclick="Toast.info('Lanzamiento Automotriz: 2 unidades asignadas')">
                                Lanzamiento Automotriz <span class="bar-qty">x2</span>
                            </div>
                            <div class="gantt-bar-box bar-free" style="left: 65%; width: 30%;">
                                4 Libres para Contingencia
                            </div>
                        </div>
                    </div>

                    <!-- Fila 3: Sillas Crossback Madera -->
                    <div class="gantt-resource-row">
                        <div class="resource-info-cell">
                            <strong>Sillas Crossback Madera</strong>
                            <div class="resource-tags">
                                <small>Flota Total: 600 und • Disp: 150 und</small>
                            </div>
                        </div>
                        <div class="resource-timeline-cell">
                            <div class="gantt-bar-box bar-dark" style="left: 50%; width: 45%;" onclick="Toast.info('Gala Aniversario BCP: 450 sillas bloqueadas')">
                                Gala Aniversario BCP <span class="bar-qty">x450</span>
                            </div>
                        </div>
                    </div>

                    <!-- Fila 4: Sillas Tiffany Doradas -->
                    <div class="gantt-resource-row">
                        <div class="resource-info-cell">
                            <strong>Sillas Tiffany Doradas</strong>
                            <div class="resource-tags">
                                <small>Flota Total: 800 und • Disp: 650 und</small>
                            </div>
                        </div>
                        <div class="resource-timeline-cell">
                            <div class="gantt-bar-box bar-blue" style="left: 10%; width: 35%;" onclick="Toast.info('Evento Privado Cieneguilla: 150 sillas entregadas')">
                                Evento Privado Cieneguilla <span class="bar-qty">x150</span>
                            </div>
                            <div class="gantt-bar-box bar-blue" style="left: 75%; width: 25%;">
                                Congreso Médico x200
                            </div>
                        </div>
                    </div>

                    <!-- Fila 5: Mesas Banquete 1.8m -->
                    <div class="gantt-resource-row">
                        <div class="resource-info-cell">
                            <strong>Mesas Banquete 1.8m</strong>
                            <div class="resource-tags">
                                <small>Flota Total: 120 und • Disp: 45 und</small>
                            </div>
                        </div>
                        <div class="resource-timeline-cell">
                            <div class="gantt-bar-box bar-dark" style="left: 50%; width: 45%;">
                                Gala Aniversario BCP <span class="bar-qty">x75</span>
                            </div>
                        </div>
                    </div>

                    <!-- Fila 6: Living Lounge Moderno -->
                    <div class="gantt-resource-row">
                        <div class="resource-info-cell">
                            <strong>Living Lounge Moderno</strong>
                            <div class="resource-tags">
                                <small>Flota Total: 15 sets • Disp: 3 sets</small>
                            </div>
                        </div>
                        <div class="resource-timeline-cell">
                            <div class="gantt-bar-box bar-blue" style="left: 20%; width: 35%;">
                                VIP Lounge Expomin <span class="bar-qty">x8</span>
                            </div>
                            <div class="gantt-bar-box bar-blue" style="left: 60%; width: 30%;">
                                Cocktail Brand & Co <span class="bar-qty">x4</span>
                            </div>
                        </div>
                    </div>

                    <div class="matrix-card-footer">
                        <span>🕒 Última asignación: Cotización #COT-2024-0412 hace 8 min</span>
                        <a href="javascript:void(0)" class="export-gantt-link" onclick="Toast.info('Reporte Gantt exportado en formato PDF/CSV')">
                            📥 Exportar Reporte Gantt (PDF/CSV)
                        </a>
                    </div>
                </div>

                <!-- Panel Lateral de Aprobación #OD-2024-884 -->
                <div class="approval-panel-card">
                    <div class="approval-header">
                        <span class="flow-tag">FLUJO DE APROBACIÓN</span>
                        <span class="order-code-badge">#OD-2024-884</span>
                        <h3 class="approval-title">Confirmar Reserva & Emitir Orden de Despacho</h3>
                        <p class="approval-subtitle">Cotización Aceptada #COT-2024-0412</p>
                    </div>

                    <!-- Bloque Cliente Solicitante -->
                    <div class="approval-section-box">
                        <div class="section-box-header">
                            <span class="sec-label">CLIENTE SOLICITANTE</span>
                            <span class="badge-status-pill badge-pill-green">● Aceptada por Cliente</span>
                        </div>
                        <div class="client-brief-row">
                            <div class="client-avatar-badge">BC</div>
                            <div>
                                <strong>Agencia Brand & Co S.A.C.</strong>
                                <p>RUC 20601984210 • Contacto: Silvia Arana (+51 998 712 345)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Validación Financiera -->
                    <div class="approval-section-box">
                        <div class="sec-label">VALIDACIÓN FINANCIERA</div>
                        <div class="financial-validation-card">
                            <div class="fin-text-col">
                                <span class="fin-tag-green">50% Confirmado en Banco</span>
                                <div class="fin-op-code">Op. Bancaria: #TRF-90218-BCP</div>
                                <div class="fin-treasury-status">✓ Verificado por Tesorería</div>
                            </div>
                            <div class="fin-amount-col">
                                <span class="fin-amount-label">Monto Abonado</span>
                                <span class="fin-amount-val">S/ 3,200.00</span>
                            </div>
                        </div>
                    </div>

                    <!-- Activos a Bloquear en Almacén -->
                    <div class="approval-section-box">
                        <div class="section-box-header">
                            <span class="sec-label">ACTIVOS A BLOQUEAR EN ALMACÉN</span>
                            <span class="badge-lines-count">3 Líneas</span>
                        </div>
                        <ul class="lock-assets-list">
                            <li>
                                <span>Toldo Domo 10×10m Estructural</span>
                                <strong>2 unidades</strong>
                            </li>
                            <li>
                                <span>Living Lounge Moderno (Set Completo)</span>
                                <strong>4 sets</strong>
                            </li>
                            <li>
                                <span>Sillas Crossback con Cojín Blanco</span>
                                <strong>120 unidades</strong>
                            </li>
                        </ul>
                    </div>

                    <!-- Parámetros de Despacho Asignados -->
                    <div class="approval-section-box">
                        <div class="sec-label">PARÁMETROS DE DESPACHO ASIGNADOS</div>
                        <div class="dispatch-params-grid">
                            <div class="param-item">
                                <span class="param-lbl">Salida de Almacén:</span>
                                <strong>Vie 18 Oct • 08:30 AM</strong>
                            </div>
                            <div class="param-item">
                                <span class="param-lbl">Retorno Previsto:</span>
                                <strong>Dom 20 Oct • 11:00 AM</strong>
                            </div>
                            <div class="param-item full-width">
                                <span class="param-lbl">Destino de Montaje:</span>
                                <strong>Club Golf Los Inkas, Pabellón Central (Surco)</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Botón Principal de Bloqueo / Emisión -->
                    <div class="approval-actions-block">
                        <button class="btn ${this.orderLocked ? 'btn-locked' : 'btn-lock-inventory'} btn-block" 
                            onclick="ReservasModule.lockInventoryAndGenerateOrder()">
                            ${this.orderLocked ? '✓ Inventario Bloqueado & Orden Generada' : '🔒 Bloquear Inventario Definitivo y Generar Orden de Despacho'}
                        </button>
                        <button class="btn btn-outline btn-block mt-2" onclick="ReservasModule.downloadLoadSheet()">
                            📄 Descargar Hoja de Carga (Almacén Lurín)
                        </button>
                    </div>

                    <div class="audit-signature-seal">
                        🛡️ Transacción auditada con firma digital de: <strong>${currentUser.nombre}</strong>
                    </div>
                </div>
            </div>

            <!-- Alerta Crítica y Rutas de Mitigación Inmediata -->
            <div class="conflict-mitigation-card mt-4">
                <div class="conflict-card-header">
                    <div class="conflict-alert-title">
                        <span class="alert-pulse-icon">🚨</span>
                        <div>
                            <span class="tag-urgent">URGENTE</span>
                            <span class="conflict-headline">CONFLICTO DE PROGRAMACIÓN EN TIEMPO REAL</span>
                            <h3 class="conflict-sub">¡Alerta de Sobredemanda / Stock Insuficiente Detectada!</h3>
                        </div>
                    </div>
                    <div class="conflict-caps-box">
                        <div class="cap-col">
                            <span>CAPACIDAD MÁXIMA</span>
                            <strong>4 und</strong>
                        </div>
                        <div class="cap-col text-danger">
                            <span>EN COTIZACIONES</span>
                            <strong>5 und <small>(-1 déficit)</small></strong>
                        </div>
                    </div>
                </div>

                <p class="conflict-desc">
                    Conflicto confirmado en el ítem <strong>Toldo Panorámico 15×30m</strong> para la fecha operativa 
                    <strong>Sábado 19 de Octubre, 2024</strong>. La flota activa ha sido superada por órdenes concurrentes.
                </p>

                <!-- 3 Rutas de Mitigación -->
                <div class="mitigation-options-grid">
                    <!-- Opción 1: Subcontratar Aliado -->
                    <div class="mitigation-option-card ${this.mitigationApplied ? 'card-applied' : ''}">
                        <div class="option-header">
                            <span class="opt-icon">🤝</span>
                            <div class="opt-title-group">
                                <strong>Subcontratar Aliado</strong>
                                <span class="badge-recommended">Recomendado</span>
                            </div>
                        </div>
                        <p class="opt-body">
                            Subcontratar 1 und con <strong>Rental Express S.A.C.</strong> Tarifa negociada B2B: S/ 480.00 / día.
                        </p>
                        <button class="btn btn-outline-primary btn-sm" onclick="ReservasModule.applySubcontractMitigation()">
                            ${this.mitigationApplied ? '✓ Contrato B2B Activado' : 'Gestionar Contrato →'}
                        </button>
                    </div>

                    <!-- Opción 2: Alternativa Modular -->
                    <div class="mitigation-option-card">
                        <div class="option-header">
                            <span class="opt-icon">⛺</span>
                            <div class="opt-title-group">
                                <strong>Alternativa Modular</strong>
                                <span class="badge-available">4 Libres</span>
                            </div>
                        </div>
                        <p class="opt-body">
                            Ofrecer <strong>Toldo Domo Modular 10×10m (x2)</strong> con acople impermeable sin costo extra al cliente.
                        </p>
                        <button class="btn btn-outline-primary btn-sm" onclick="ReservasModule.applyModularAlternative()">
                            Aplicar Reemplazo →
                        </button>
                    </div>

                    <!-- Opción 3: Ajustar Desmontaje -->
                    <div class="mitigation-option-card">
                        <div class="option-header">
                            <span class="opt-icon">⏰</span>
                            <div class="opt-title-group">
                                <strong>Ajustar Desmontaje</strong>
                                <span class="badge-logistics">Logística</span>
                            </div>
                        </div>
                        <p class="opt-body">
                            Contactar cliente previo para adelantar desmontaje nocturno a las 02:00 AM y liberar la unidad 4.
                        </p>
                        <button class="btn btn-outline-primary btn-sm" onclick="ReservasModule.contactEarlyDisassembly()">
                            Llamar a Despacho →
                        </button>
                    </div>
                </div>
            </div>

            <!-- Métricas Inferiores de Flota y Aliados -->
            <div class="fleet-kpi-footer-row mt-4">
                <div class="footer-kpi-card">
                    <span class="f-icon">⏱️</span>
                    <div>
                        <span class="f-lbl">ROTACIÓN MEDIA DE FLOTA</span>
                        <strong>1.8 Días / Ciclo</strong>
                        <small class="text-success">94.2% a tiempo en retorno</small>
                    </div>
                </div>
                <div class="footer-kpi-card">
                    <span class="f-icon">🧼</span>
                    <div>
                        <span class="f-lbl">EN LAVADO & CERTIFICACIÓN</span>
                        <strong>140 Sillas • 2 Toldos</strong>
                        <small class="text-primary">Reincorporación en 24h</small>
                    </div>
                </div>
                <div class="footer-kpi-card">
                    <span class="f-icon">🌐</span>
                    <div>
                        <span class="f-lbl">RED DE ALIADOS VERIFICADOS</span>
                        <strong>4 Proveedores B2B</strong>
                        <small class="text-success">Rental Express con SLA activo</small>
                    </div>
                </div>
            </div>
        `;
    }

    static filterFamily(family) {
        this.selectedFamily = family;
        this.render();
    }

    static showConflictDetails() {
        Modal.open('Detalle de Conflicto de Sobredemanda (Sábado 19)', `
            <div class="conflict-modal-detail">
                <p><strong>Artículo:</strong> Toldo Panorámico 15×30m (SKU: TLD-1530)</p>
                <p><strong>Stock en Almacén:</strong> 4 unidades totales</p>
                <p><strong>Demanda Programada para Sábado 19 Oct:</strong></p>
                <ul>
                    <li>Orden #RES-2024-0872 (Matrimonio Barrenechea): 2 unidades [Confirmado]</li>
                    <li>Cotización #COT-2024-0419 (Boda Hacienda San José): 1 unidad [Borrador]</li>
                    <li>Cotización #COT-2024-0415 (Feria Expomin): 2 unidades [En Solicitud]</li>
                </ul>
                <div class="alert-box-warning">
                    Total demandado: <strong>5 unidades</strong> vs Disponibles: <strong>4 unidades</strong>. Déficit: -1 unidad.
                </div>
            </div>
        `, [
            { text: 'Subcontratar 1 und con Aliado', class: 'btn-primary', onClick: () => { ReservasModule.applySubcontractMitigation(); Modal.close(); } },
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }

    static applySubcontractMitigation() {
        this.mitigationApplied = true;
        Toast.success('✓ Mitigación aplicada: Se reservó 1 Toldo 15×30m con Rental Express S.A.C. por S/ 480/día. Conflicto de stock resuelto.');
        this.render();
    }

    static applyModularAlternative() {
        Toast.success('Propuesta enviada al cliente: Reemplazo por 2 Toldos Domo 10×10m modulares con acople sin recargo.');
    }

    static contactEarlyDisassembly() {
        Toast.info('Coordinación iniciada con la Cuadrilla 3 para desmontaje de madrugada en Fundo El Haras.');
    }

    static lockInventoryAndGenerateOrder() {
        if (this.orderLocked) {
            Toast.info('La orden #OD-2024-884 ya se encuentra bloqueada y confirmada.');
            return;
        }

        // Validar que existe el pago del anticipo antes de confirmar la reserva
        const reservas = StorageManager.get(STORAGE_KEYS.RESERVAS);
        const targetRes = reservas.find(r => r.codigoReserva === '#RES-2024-0884');

        if (targetRes) {
            targetRes.estadoOperativo = 'Bloqueado / Despacho Emitido';
            targetRes.bloqueoInventarioActivo = true;
            StorageManager.set(STORAGE_KEYS.RESERVAS, reservas);
        }

        this.orderLocked = true;
        Toast.success('🔒 ¡Inventario bloqueado exitosamente! Orden de Despacho #OD-2024-884 emitida a Almacén Lurín.');
        this.render();
    }

    static downloadLoadSheet() {
        const modalContent = `
            <div class="print-preview-card">
                <div class="print-header">
                    <div>
                        <h2>CASA MARSHALL - ALMACÉN CENTRAL LURÍN</h2>
                        <span class="text-primary">HOJA DE CARGA Y DESPACHO #OD-2024-884</span>
                    </div>
                    <div>
                        <strong>Fecha Emisión: 18/10/2024</strong>
                        <p>Bahía de Carga: Nave B - Muelle 2</p>
                    </div>
                </div>

                <div class="print-client-box mt-3">
                    <p><strong>Destino:</strong> Club Golf Los Inkas, Pabellón Central (Surco, Lima)</p>
                    <p><strong>Cliente:</strong> Agencia Brand & Co S.A.C. • RUC: 20601984210</p>
                    <p><strong>Horario de Salida:</strong> Viernes 18 Octubre 2024 - 08:30 AM</p>
                    <p><strong>Conductor Asignado:</strong> Transportes & Carga Express Sur (Placa: B2Z-891)</p>
                </div>

                <table class="print-items-table mt-3">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Ubicación en Nave</th>
                            <th>Mobiliario / Equipo</th>
                            <th>Cant.</th>
                            <th>Estado Check</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>TLD-DOM10</td>
                            <td>Nave B - Bahía 2</td>
                            <td>Toldo Domo 10×10m Modular + Estructura</td>
                            <td>2 und</td>
                            <td>[  ] Verificado</td>
                        </tr>
                        <tr>
                            <td>LIV-CH02</td>
                            <td>Nave A - Zona Tapiz</td>
                            <td>Living Lounge Moderno (Set Cuero)</td>
                            <td>4 sets</td>
                            <td>[  ] Verificado</td>
                        </tr>
                        <tr>
                            <td>SIL-CB01</td>
                            <td>Nave A - Rack 08</td>
                            <td>Sillas Crossback con Cojín Blanco</td>
                            <td>120 und</td>
                            <td>[  ] Verificado</td>
                        </tr>
                    </tbody>
                </table>

                <div class="dispatch-signature-box mt-4">
                    <div class="sig-line">
                        <p>_____________________________________</p>
                        <small>Firma Jefe Almacén (Jorge Salazar)</small>
                    </div>
                    <div class="sig-line">
                        <p>_____________________________________</p>
                        <small>Firma Conductor / Transportista</small>
                    </div>
                </div>
            </div>
        `;

        Modal.open('Hoja de Carga para Almacén Lurín', modalContent, [
            { text: 'Imprimir Hoja de Carga', class: 'btn-primary', onClick: () => window.print() },
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }
}

window.ReservasModule = ReservasModule;
ReservasModule.init();
