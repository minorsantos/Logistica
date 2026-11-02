/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/dashboard.js - Panel de Control Ejecutivo (Imagen 4)
 * Resumen operativo, indicadores comerciales, calendario de ocupación mensual y alertas operativas en vivo.
 */

class DashboardModule {
    static init() {
        this.selectedMonthFamily = 'carpas';
        this.recentFilter = 'todos';
    }

    static render() {
        const container = document.getElementById('module-content-area');
        if (!container) return;

        const solicitudes = StorageManager.get(STORAGE_KEYS.SOLICITUDES);

        container.innerHTML = `
            <div class="view-header">
                <div class="breadcrumbs">
                    <span>CASA MARSHALL</span>
                    <span>•</span>
                    <span>LOGÍSTICA INTEGRAL</span>
                    <span>•</span>
                    <span class="live-sync-pill">● Sincronización en vivo</span>
                </div>
                <div class="header-title-row">
                    <div>
                        <h2 class="view-main-title">Panel de Control Ejecutivo</h2>
                        <p class="view-main-subtitle">
                            Resumen operativo, disponibilidad en tiempo real e indicadores comerciales de hoy
                        </p>
                    </div>
                    <div class="header-action-buttons">
                        <button class="btn btn-outline" onclick="PagosModule.openRegisterPaymentModal()">
                            💳 + Registrar Cobro
                        </button>
                        <button class="btn btn-outline" onclick="AppRouter.navigate('reservas')">
                            📅 + Verificar Disponibilidad
                        </button>
                        <button class="btn btn-primary" onclick="AppRouter.navigate('solicitudes')">
                            📝 + Nueva Solicitud de Evento
                        </button>
                    </div>
                </div>
            </div>

            <!-- 4 Tarjetas de KPIs Principales -->
            <div class="kpi-cards-grid-4">
                <!-- KPI 1 -->
                <div class="kpi-metric-card" onclick="AppRouter.navigate('reservas')" style="cursor: pointer;">
                    <div class="kpi-header">
                        <span class="kpi-label">RESERVAS ACTIVAS</span>
                        <span class="kpi-icon-badge">📅</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">48</span>
                        <span class="kpi-unit">eventos</span>
                    </div>
                    <div class="kpi-trend text-success">
                        <span>↗ +12%</span> vs mes anterior
                    </div>
                    <div class="kpi-footnote text-warning">
                        ● 32 despachos este fin de semana
                    </div>
                </div>

                <!-- KPI 2 -->
                <div class="kpi-metric-card" onclick="AppRouter.navigate('solicitudes')" style="cursor: pointer;">
                    <div class="kpi-header">
                        <span class="kpi-label">COTIZACIONES PENDIENTES</span>
                        <span class="kpi-icon-badge">📑</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">14</span>
                        <span class="kpi-unit">por aprobar</span>
                    </div>
                    <div class="kpi-amount-sub">
                        Valor en cartera: <strong>S/ 42,850</strong>
                    </div>
                    <div class="kpi-footnote text-danger">
                        ● 4 urgentes (&lt;24h)
                    </div>
                </div>

                <!-- KPI 3 -->
                <div class="kpi-metric-card" onclick="AppRouter.navigate('mantenimiento')" style="cursor: pointer;">
                    <div class="kpi-header">
                        <span class="kpi-label">EN MANTENIMIENTO</span>
                        <span class="kpi-icon-badge">🔧</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">28</span>
                        <span class="kpi-unit">en taller</span>
                    </div>
                    <div class="kpi-amount-sub">
                        Tasa de indisponibilidad: <strong>4.2% total</strong>
                    </div>
                    <div class="kpi-footnote text-danger">
                        ● 8 con retorno crítico
                    </div>
                </div>

                <!-- KPI 4 -->
                <div class="kpi-metric-card" onclick="AppRouter.navigate('logistica')" style="cursor: pointer;">
                    <div class="kpi-header">
                        <span class="kpi-label">DESPACHOS DE HOY</span>
                        <span class="kpi-icon-badge">🚚</span>
                    </div>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">9</span>
                        <span class="kpi-unit">rutas activas</span>
                    </div>
                    <div class="kpi-progress-bar-wrap">
                        <div class="kpi-progress-fill" style="width: 78%;"></div>
                    </div>
                    <div class="kpi-footnote text-primary">
                        7 completadas • 2 en tránsito (78%)
                    </div>
                </div>
            </div>

            <!-- Sección Dividida: Disponibilidad Calendario Mensual a la izquierda, Alertas a la derecha -->
            <div class="dashboard-split-layout mt-4">
                <!-- Calendario de Demanda de Inventario Octubre 2024 -->
                <div class="demand-calendar-card">
                    <div class="demand-header">
                        <div>
                            <h4>Disponibilidad y Demanda de Inventario <small class="month-pill">Octubre 2024</small></h4>
                            <p class="text-muted">Matriz de ocupación proyectada por lote y fecha</p>
                        </div>
                        <div class="demand-legend-pills">
                            <span class="d-pill d-disp">&gt;70% Disp.</span>
                            <span class="d-pill d-ocup">30-70% Ocup.</span>
                            <span class="d-pill d-crit">&lt;30% Crítico</span>
                        </div>
                    </div>

                    <!-- Pestañas de Familia -->
                    <div class="demand-tabs-bar">
                        <button class="demand-tab ${this.selectedMonthFamily === 'carpas' ? 'active' : ''}" onclick="DashboardModule.selectFamily('carpas')">Carpas & Toldos</button>
                        <button class="demand-tab ${this.selectedMonthFamily === 'silleria' ? 'active' : ''}" onclick="DashboardModule.selectFamily('silleria')">Sillería Luxury</button>
                        <button class="demand-tab ${this.selectedMonthFamily === 'mesas' ? 'active' : ''}" onclick="DashboardModule.selectFamily('mesas')">Mesas & Banquetería</button>
                        <button class="demand-tab ${this.selectedMonthFamily === 'iluminacion' ? 'active' : ''}" onclick="DashboardModule.selectFamily('iluminacion')">Iluminación & Audio</button>
                        <button class="demand-tab ${this.selectedMonthFamily === 'menaje' ? 'active' : ''}" onclick="DashboardModule.selectFamily('menaje')">Menaje & Vajilla</button>
                    </div>

                    <!-- Matriz de Calendario Mensual -->
                    <div class="month-grid-calendar">
                        <!-- Días de la semana -->
                        <div class="month-day-head">LUN</div>
                        <div class="month-day-head">MAR</div>
                        <div class="month-day-head">MIÉ</div>
                        <div class="month-day-head">JUE</div>
                        <div class="month-day-head">VIE</div>
                        <div class="month-day-head head-weekend">SÁB</div>
                        <div class="month-day-head head-weekend">DOM</div>

                        <!-- Semana 1 -->
                        <div class="calendar-cell cell-prev">30</div>
                        <div class="calendar-cell"><span class="day-num">1</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">2</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">3</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell"><span class="day-num">4</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell cell-highlight-red"><span class="day-num">5</span><span class="cell-pct">100%</span></div>
                        <div class="calendar-cell cell-highlight-red"><span class="day-num">6</span><span class="cell-pct">95%</span></div>

                        <!-- Semana 2 -->
                        <div class="calendar-cell"><span class="day-num">7</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">8</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">9</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">10</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell"><span class="day-num">11</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell cell-highlight-red cell-bordered-tope"><span class="day-num">12</span><span class="cell-tag-tope">TOPE</span></div>
                        <div class="calendar-cell cell-highlight-red"><span class="day-num">13</span><span class="cell-pct">88%</span></div>

                        <!-- Semana 3 -->
                        <div class="calendar-cell"><span class="day-num">14</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">15</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">16</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">17</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell"><span class="day-num">18</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell cell-highlight-red"><span class="day-num">19</span><span class="cell-pct">92%</span></div>
                        <div class="calendar-cell"><span class="day-num">20</span><div class="bar-orange"></div></div>

                        <!-- Semana 4 -->
                        <div class="calendar-cell"><span class="day-num">21</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">22</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">23</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell cell-highlight-red cell-bordered-conflict"><span class="day-num">24</span><span class="cell-pct">100%</span></div>
                        <div class="calendar-cell"><span class="day-num">25</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell cell-highlight-red"><span class="day-num">26</span><span class="cell-pct">86%</span></div>
                        <div class="calendar-cell"><span class="day-num">27</span><div class="bar-orange"></div></div>

                        <!-- Semana 5 -->
                        <div class="calendar-cell"><span class="day-num">28</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">29</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell"><span class="day-num">30</span><div class="bar-orange"></div></div>
                        <div class="calendar-cell"><span class="day-num">31</span><div class="bar-blue-light"></div></div>
                        <div class="calendar-cell cell-next">1</div>
                        <div class="calendar-cell cell-next">2</div>
                        <div class="calendar-cell cell-next">3</div>
                    </div>

                    <div class="demand-footer-alert">
                        <span>ℹ️ Sábado 24 presenta bloqueo total para estructuras 20×40m y Tiffany Blancas.</span>
                        <a href="javascript:void(0)" onclick="AppRouter.navigate('reservas')">Ver reporte de ocupación →</a>
                    </div>
                </div>

                <!-- Panel Lateral de Alertas Operativas -->
                <div class="operational-alerts-panel">
                    <div class="alerts-panel-header">
                        <h4>Alertas Operativas</h4>
                        <span class="badge-history">3 HISTORIAL</span>
                    </div>

                    <!-- Alerta 1: Sobredemanda Crítica -->
                    <div class="alert-feed-item feed-critical">
                        <div class="feed-header">
                            <span class="feed-badge badge-critical">SOBREDEMANDA CRÍTICA</span>
                            <span class="feed-time">Hace 25 min</span>
                        </div>
                        <p class="feed-title">Toldo Estructural 20×40m reservado al 100% para Sábado 24.</p>
                        <p class="feed-desc">2 solicitudes en espera requieren aprobación de subarriendo externo.</p>
                        <div class="feed-actions">
                            <button class="btn btn-xs btn-outline" onclick="Toast.info('Alerta descartada')">Descartar</button>
                            <button class="btn btn-xs btn-danger" onclick="AppRouter.navigate('reservas')">Gestionar Stock</button>
                        </div>
                    </div>

                    <!-- Alerta 2: Control de Daños -->
                    <div class="alert-feed-item feed-warning">
                        <div class="feed-header">
                            <span class="feed-badge badge-warning-tag">CONTROL DE DAÑOS</span>
                            <span class="feed-time">Hace 2h</span>
                        </div>
                        <p class="feed-title">Matrimonio Barrenechea reportó 2 sillas Tiffany con daño menor.</p>
                        <p class="feed-desc">Ingresadas a taller #T-104. Fianza retenida: <strong>S/ 120.00</strong>.</p>
                        <div class="feed-actions">
                            <button class="btn btn-xs btn-dark" onclick="AppRouter.navigate('mantenimiento')">Abrir Ficha Taller</button>
                        </div>
                    </div>

                    <!-- Alerta 3: Cobranza Exitosa -->
                    <div class="alert-feed-item feed-success">
                        <div class="feed-header">
                            <span class="feed-badge badge-success-tag">COBRANZA EXITOSA</span>
                            <span class="feed-time">11:42 AM</span>
                        </div>
                        <p class="feed-title">Factura F001-0892 adelantó 50% (S/ 4,500) para Boda Las Palmeras.</p>
                        <p class="feed-desc">Pago verificado vía BCP Transferencia por Finanzas.</p>
                        <div class="feed-actions">
                            <button class="btn btn-xs btn-outline" onclick="AppRouter.navigate('pagos')">Ver Recibo</button>
                        </div>
                    </div>

                    <!-- Estado Monitoreo Almacén -->
                    <div class="feed-status-footer">
                        <span>🔄 Modo Monitoreo de Almacén Activo</span>
                        <span class="text-success"><strong>Lurín OK</strong></span>
                    </div>
                </div>
            </div>

            <!-- Tabla de Solicitudes y Alquileres Recientes -->
            <div class="section-card mt-4">
                <div class="section-card-header">
                    <div>
                        <h4 class="section-card-title">Solicitudes y Alquileres Recientes</h4>
                        <p class="section-card-subtitle">Trazabilidad de cotizaciones, despachos y contratos en curso</p>
                    </div>
                    <div class="filter-pills">
                        <button class="filter-pill ${this.recentFilter === 'todos' ? 'active' : ''}" onclick="DashboardModule.filterRecent('todos')">Todos (24)</button>
                        <button class="filter-pill ${this.recentFilter === 'Pendiente Firma' ? 'active' : ''}" onclick="DashboardModule.filterRecent('Pendiente Firma')">Pendientes (6)</button>
                        <button class="filter-pill ${this.recentFilter === 'Aprobado' ? 'active' : ''}" onclick="DashboardModule.filterRecent('Aprobado')">Aprobados (11)</button>
                        <button class="filter-pill ${this.recentFilter === 'En Ruta' ? 'active' : ''}" onclick="DashboardModule.filterRecent('En Ruta')">Despachados (7)</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO SOLICITUD</th>
                                <th>CLIENTE / EMPRESA</th>
                                <th>TIPO EVENTO</th>
                                <th>FECHAS DE ALQUILER</th>
                                <th>TOTAL COTIZADO</th>
                                <th>ESTADO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderRecentTableRows(solicitudes)}
                        </tbody>
                    </table>
                </div>

                <div class="inventory-pagination">
                    <span>Mostrando 4 de 24 registros activos</span>
                    <div class="pagination-buttons">
                        <button class="btn-page" disabled>Anterior</button>
                        <button class="btn-page active">1</button>
                        <button class="btn-page">2</button>
                        <button class="btn-page">3</button>
                        <button class="btn-page">Siguiente</button>
                    </div>
                </div>
            </div>
        `;
    }

    static renderRecentTableRows(solicitudes) {
        let list = solicitudes;
        if (this.recentFilter !== 'todos') {
            list = list.filter(s => s.estado === this.recentFilter);
        }

        return list.map(s => `
            <tr>
                <td>
                    <strong class="text-primary">${s.codigo}</strong>
                </td>
                <td>
                    <strong>${s.clienteNombre}</strong>
                    <div class="text-muted"><small>Contacto: ${s.contactoNombre}</small></div>
                </td>
                <td>
                    <span>🏛️ ${s.tipoEvento}</span>
                </td>
                <td>
                    <div><strong>${s.fechaInicio} - ${s.fechaFin}</strong></div>
                    <div class="text-muted"><small>${s.dias} día(s) • Despacho: ${s.horaMontaje}</small></div>
                </td>
                <td>
                    <strong>S/ ${s.totalCotizado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                </td>
                <td>
                    <span class="badge-status ${s.estado === 'Aprobado' ? 'badge-success' : (s.estado === 'En Ruta' ? 'badge-primary' : 'badge-warning')}">
                        ● ${s.estado}
                    </span>
                </td>
                <td>
                    <button class="btn btn-xs btn-outline" onclick="SolicitudesModule.viewCotizacionDetail('${s.codigo}')">
                        Ver Detalle
                    </button>
                </td>
            </tr>
        `).join('');
    }

    static selectFamily(family) {
        this.selectedMonthFamily = family;
        this.render();
    }

    static filterRecent(filter) {
        this.recentFilter = filter;
        this.render();
    }
}

window.DashboardModule = DashboardModule;
DashboardModule.init();
