/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/logistica.js - MÓDULO 4: Gestión Logística de Entregas y Recojos (CUS-04 / RF-21 a RF-28)
 * Implementa RN-05 (Registro de Entrega con responsable), Actas de Entrega/Recojo e Incidencias en Ruta.
 */

class LogisticaModule {
    static init() {
        this.statusFilter = 'todos';
    }

    static render() {
        const container = document.getElementById('module-content-area');
        if (!container) return;

        const despachos = StorageManager.get(STORAGE_KEYS.DESPACHOS);
        const incidencias = StorageManager.get(STORAGE_KEYS.INCIDENCIAS);

        const rutasActivas = despachos.filter(d => d.estado !== 'Retornado').length;
        const rutasCompletadas = despachos.filter(d => d.estado === 'Retornado').length;

        container.innerHTML = `
            <div class="view-header">
                <div class="breadcrumbs">
                    <span>OPERACIONES</span>
                    <span>•</span>
                    <span class="badge-tag">CUS-04</span>
                    <span>•</span>
                    <span>DESPACHO & RUTAS LOGÍSTICAS</span>
                </div>
                <div class="header-title-row">
                    <div>
                        <h2 class="view-main-title">Programación de Rutas, Entregas y Recojos</h2>
                        <p class="view-main-subtitle">
                            Trazabilidad satelital de transportes, cuadrillas de montaje y formalización de actas de recepción en sitio.
                        </p>
                    </div>
                    <div class="header-action-buttons">
                        <button class="btn btn-outline" onclick="LogisticaModule.openNewIncidenciaModal()">
                            ⚠️ Registrar Incidencia
                        </button>
                        <button class="btn btn-primary" onclick="LogisticaModule.openNewRutaModal()">
                            + Programar Nueva Ruta
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPIs de Logística -->
            <div class="kpi-cards-grid-4">
                <div class="kpi-metric-card">
                    <span class="kpi-label">Rutas Activas Hoy</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${rutasActivas}</span>
                        <span class="kpi-unit">en curso</span>
                    </div>
                    <div class="kpi-footnote text-primary">● 2 unidades en tránsito hacia Surco / Lurín</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Despachos Entregados</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${despachos.filter(d => d.estado === 'Entregado').length}</span>
                        <span class="kpi-unit">eventos</span>
                    </div>
                    <div class="kpi-footnote text-success">● Actas firmadas con recepción conforme</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Recojos Pendientes</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">3</span>
                        <span class="kpi-unit">programados</span>
                    </div>
                    <div class="kpi-footnote text-warning">● Fin de fiesta programado domingo 20</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Incidencias en Ruta</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${incidencias.length}</span>
                        <span class="kpi-unit">reportadas</span>
                    </div>
                    <div class="kpi-footnote text-danger">● 1 mitigada por congestión vehicular</div>
                </div>
            </div>

            <!-- Tabla de Rutas Programadas -->
            <div class="section-card mt-4">
                <div class="section-card-header">
                    <div>
                        <h4 class="section-card-title">Manifiesto de Rutas de Despacho y Recojo</h4>
                        <p class="section-card-subtitle">Seguimiento en tiempo real y cumplimiento de la regla RN-05</p>
                    </div>
                    <div class="filter-pills">
                        <button class="filter-pill ${this.statusFilter === 'todos' ? 'active' : ''}" onclick="LogisticaModule.filterStatus('todos')">Todos</button>
                        <button class="filter-pill ${this.statusFilter === 'En Tránsito' ? 'active' : ''}" onclick="LogisticaModule.filterStatus('En Tránsito')">En Tránsito</button>
                        <button class="filter-pill ${this.statusFilter === 'Entregado' ? 'active' : ''}" onclick="LogisticaModule.filterStatus('Entregado')">Entregados</button>
                        <button class="filter-pill ${this.statusFilter === 'Retornado' ? 'active' : ''}" onclick="LogisticaModule.filterStatus('Retornado')">Retornados</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO RUTA</th>
                                <th>CLIENTE & DESTINO</th>
                                <th>TRANSPORTE / CUADRILLA</th>
                                <th>HORARIOS PROGRAMADOS</th>
                                <th>ESTADO</th>
                                <th>RECEPCIÓN (RN-05)</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderRutasTableRows(despachos)}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Sección de Incidencias Durante el Transporte -->
            <div class="section-card mt-4">
                <div class="section-card-header">
                    <div>
                        <h4 class="section-card-title">Bitácora de Incidencias Operativas en Ruta (RF-27 / RF-28)</h4>
                        <p class="section-card-subtitle">Registro de eventualidades de tráfico, climáticas o mecánicas con respuesta inmediata</p>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="LogisticaModule.openNewIncidenciaModal()">
                        + Registrar Nueva Incidencia
                    </button>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>RUTA ASOCIADA</th>
                                <th>TIPO INCIDENCIA</th>
                                <th>GRAVEDAD</th>
                                <th>DESCRIPCIÓN DE LO OCURRIDO</th>
                                <th>ACCIÓN INMEDIATA TOMADA</th>
                                <th>REPORTADO POR</th>
                                <th>HORA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${incidencias.map(inc => `
                                <tr>
                                    <td><strong class="text-primary">${inc.despachoCodigo}</strong></td>
                                    <td>${inc.tipoTexto || inc.tipo}</td>
                                    <td>
                                        <span class="badge-status ${inc.gravedad === 'critica' || inc.gravedad === 'alta' ? 'badge-danger' : 'badge-warning'}">
                                            ${inc.gravedad.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>${inc.descripcion}</td>
                                    <td><strong class="text-success">${inc.accionInmediata || 'En evaluación'}</strong></td>
                                    <td>${inc.reportadoPor}</td>
                                    <td>${inc.fecha}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static renderRutasTableRows(despachos) {
        let list = despachos;
        if (this.statusFilter !== 'todos') {
            list = list.filter(d => d.estado === this.statusFilter);
        }

        return list.map(d => `
            <tr>
                <td>
                    <strong class="text-primary">${d.codigoRuta}</strong>
                    <div class="text-muted"><small>${d.ordenDespacho}</small></div>
                </td>
                <td>
                    <strong>${d.cliente}</strong>
                    <div class="text-muted"><small>📍 ${d.direccion}</small></div>
                    <div class="text-secondary"><small>📦 ${d.itemsResumen || 'Mobiliario asignado'}</small></div>
                </td>
                <td>
                    <div>🚚 ${d.conductor}</div>
                    <div class="text-muted"><small>👷 ${d.cuadrilla}</small></div>
                </td>
                <td>
                    <div>Salida: <strong>${d.salidaProgramada}</strong></div>
                    <div class="text-muted">Retorno: ${d.retornoProgramado}</div>
                </td>
                <td>
                    <span class="badge-status ${d.estado === 'Entregado' ? 'badge-success' : (d.estado === 'En Tránsito' ? 'badge-primary' : 'badge-secondary')}">
                        ${d.estado}
                    </span>
                </td>
                <td>
                    ${d.responsableRecepcion ? `
                        <div class="text-success"><strong>✓ ${d.responsableRecepcion}</strong></div>
                        <div class="text-muted"><small>DNI: ${d.dniRecepcion || 'Verificado'}</small></div>
                        <div class="text-muted"><small>${d.horaEntregaReal || ''}</small></div>
                    ` : `
                        <span class="badge-status badge-warning">Pendiente Entrega</span>
                    `}
                </td>
                <td>
                    <div class="action-btn-group">
                        ${d.estado !== 'Entregado' && d.estado !== 'Retornado' ? `
                            <button class="btn btn-xs btn-success" onclick="LogisticaModule.openConfirmDeliveryModal('${d.codigoRuta}')" title="Confirmar Entrega">
                                ✓ Entregar (RN-05)
                            </button>
                        ` : ''}
                        ${d.estado === 'Entregado' ? `
                            <button class="btn btn-xs btn-primary" onclick="LogisticaModule.openPickupModal('${d.codigoRuta}')" title="Generar Acta de Recojo">
                                📦 Recojo Almacén
                            </button>
                        ` : ''}
                        <button class="btn btn-xs btn-outline" onclick="LogisticaModule.viewActaDocument('${d.codigoRuta}')" title="Ver Acta">
                            📄 Ver Acta
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    static filterStatus(status) {
        this.statusFilter = status;
        this.render();
    }

    static openConfirmDeliveryModal(codigoRuta) {
        const despachos = StorageManager.get(STORAGE_KEYS.DESPACHOS);
        const ruta = despachos.find(d => d.codigoRuta === codigoRuta);
        if (!ruta) return;

        const formHtml = `
            <form onsubmit="LogisticaModule.confirmDelivery(event, '${codigoRuta}')">
                <div class="alert-box-warning mb-3">
                    <strong>Regla de Negocio RN-05:</strong> Cada entrega debe registrar obligatoriamente la fecha, hora exacta y datos del responsable de recepción en la locación.
                </div>
                <div class="form-group">
                    <label>Ruta / Orden</label>
                    <input type="text" class="form-control" value="${ruta.codigoRuta} - ${ruta.cliente}" disabled>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Nombre y Apellidos del Responsable de Recepción *</label>
                        <input type="text" id="rn05-responsable" class="form-control" placeholder="Ej: Mateo Alarcón" required>
                    </div>
                    <div class="form-group">
                        <label>DNI del Responsable *</label>
                        <input type="text" id="rn05-dni" class="form-control" placeholder="Ej: 09812456" required>
                    </div>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Fecha y Hora Real de Entrega *</label>
                        <input type="datetime-local" id="rn05-fecha" class="form-control" value="2024-10-18T07:15" required>
                    </div>
                    <div class="form-group">
                        <label>Estado Físico en Descarga</label>
                        <select id="rn05-estado-descarga" class="form-control">
                            <option value="conforme">100% Conforme y sin novedades</option>
                            <option value="con_observacion">Con observación menor en embalaje</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Firma Digital / Observaciones de Conformidad</label>
                    <textarea id="rn05-firma" class="form-control" rows="2" placeholder="Recepción conforme en sitio con verificación de cantidades y estado estético."></textarea>
                </div>
                <div class="modal-footer-btns mt-3">
                    <button type="submit" class="btn btn-success btn-block">Confirmar Entrega y Emitir Acta (RN-05)</button>
                </div>
            </form>
        `;

        Modal.open(`Confirmación de Entrega en Sitio - ${ruta.codigoRuta}`, formHtml);
    }

    static confirmDelivery(event, codigoRuta) {
        event.preventDefault();
        const responsable = document.getElementById('rn05-responsable').value.trim();
        const dni = document.getElementById('rn05-dni').value.trim();
        const fechaHora = document.getElementById('rn05-fecha').value.replace('T', ' ');

        const despachos = StorageManager.get(STORAGE_KEYS.DESPACHOS);
        const ruta = despachos.find(d => d.codigoRuta === codigoRuta);

        if (ruta) {
            ruta.estado = 'Entregado';
            ruta.responsableRecepcion = responsable;
            ruta.dniRecepcion = dni;
            ruta.horaEntregaReal = fechaHora;
            ruta.actaEntregaFirmada = true;

            StorageManager.set(STORAGE_KEYS.DESPACHOS, despachos);
            Modal.close();
            Toast.success(`¡Entrega de ${ruta.codigoRuta} confirmada conforme a RN-05 a cargo de ${responsable}!`);
            this.render();
        }
    }

    static openPickupModal(codigoRuta) {
        const despachos = StorageManager.get(STORAGE_KEYS.DESPACHOS);
        const ruta = despachos.find(d => d.codigoRuta === codigoRuta);
        if (!ruta) return;

        const formHtml = `
            <form onsubmit="LogisticaModule.confirmPickup(event, '${codigoRuta}')">
                <div class="alert-box-warning mb-3">
                    <strong>Regla de Negocio RN-06:</strong> Todo artículo recolectado post-evento debe ingresar al sistema en estado <em>"En Revisión"</em> antes de volver a estar disponible.
                </div>
                <p>¿Confirmar que la cuadrilla ha cargado y transportado el mobiliario de <strong>${ruta.cliente}</strong> de vuelta al Almacén Lurín?</p>
                <div class="form-group">
                    <label>Observaciones del Recojo</label>
                    <textarea id="pickup-obs" class="form-control" placeholder="Desmontaje nocturno finalizado. Todo el lote cargado al camión Fuso."></textarea>
                </div>
                <div class="modal-footer-btns mt-3">
                    <button type="submit" class="btn btn-primary btn-block">Confirmar Retorno a Almacén e Iniciar Inspección</button>
                </div>
            </form>
        `;

        Modal.open(`Acta de Recojo y Retorno - ${ruta.codigoRuta}`, formHtml);
    }

    static confirmPickup(event, codigoRuta) {
        event.preventDefault();
        const despachos = StorageManager.get(STORAGE_KEYS.DESPACHOS);
        const ruta = despachos.find(d => d.codigoRuta === codigoRuta);

        if (ruta) {
            ruta.estado = 'Retornado';
            ruta.actaRecojoFirmada = true;
            ruta.horaRecojoReal = new Date().toISOString().replace('T', ' ').substring(0, 16);
            StorageManager.set(STORAGE_KEYS.DESPACHOS, despachos);

            Modal.close();
            Toast.success(`¡Recojo registrado! Los artículos ingresaron al Almacén Lurín en estado 'En Revisión' (RN-06).`);
            this.render();
        }
    }

    static openNewIncidenciaModal() {
        const despachos = StorageManager.get(STORAGE_KEYS.DESPACHOS);
        const currentUser = StorageManager.getCurrentUser();

        const formHtml = `
            <form onsubmit="LogisticaModule.saveIncidencia(event)">
                <div class="form-group">
                    <label>Ruta / Despacho Afectado *</label>
                    <select id="inc-ruta" class="form-control" required>
                        ${despachos.map(d => `<option value="${d.codigoRuta}">${d.codigoRuta} - ${d.cliente}</option>`).join('')}
                    </select>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Tipo de Eventualidad *</label>
                        <select id="inc-tipo" class="form-control" required>
                            <option value="retraso_trafico">Congestión Vehicular / Cierre Vial</option>
                            <option value="falla_mecanica">Falla Mecánica de Transporte</option>
                            <option value="clima_adverso">Condiciones Climáticas Extremas</option>
                            <option value="direccion_inaccesible">Dificultad de Acceso / Pendiente</option>
                            <option value="dano_en_ruta">Daño Menor Durante Traslado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nivel de Severidad *</label>
                        <select id="inc-gravedad" class="form-control" required>
                            <option value="media">Media (Afecta horario en < 1 hora)</option>
                            <option value="baja">Baja (Sin impacto en montaje)</option>
                            <option value="alta">Alta (Riesgo de retraso crítico)</option>
                            <option value="critica">Crítica (Intervención de jefatura)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción Detallada *</label>
                    <textarea id="inc-desc" class="form-control" rows="3" placeholder="Detalle qué ocurrió en la vía o locación..." required></textarea>
                </div>
                <div class="form-group">
                    <label>Acción Inmediata Tomada *</label>
                    <input type="text" id="inc-accion" class="form-control" placeholder="Ej: Se activó vehículo de soporte y estibadores adicionales." required>
                </div>
                <div class="modal-footer-btns mt-3">
                    <button type="submit" class="btn btn-danger btn-block">Registrar Incidencia Operativa</button>
                </div>
            </form>
        `;

        Modal.open('Registrar Incidencia de Transporte (RF-27)', formHtml);
    }

    static saveIncidencia(event) {
        event.preventDefault();
        const ruta = document.getElementById('inc-ruta').value;
        const tipo = document.getElementById('inc-tipo').value;
        const gravedad = document.getElementById('inc-gravedad').value;
        const desc = document.getElementById('inc-desc').value.trim();
        const accion = document.getElementById('inc-accion').value.trim();
        const currentUser = StorageManager.getCurrentUser();

        const incidencias = StorageManager.get(STORAGE_KEYS.INCIDENCIAS);
        incidencias.unshift({
            id: Date.now(),
            despachoCodigo: ruta,
            tipo: tipo,
            tipoTexto: tipo === 'retraso_trafico' ? 'Congestión Vial' : (tipo === 'falla_mecanica' ? 'Falla Mecánica' : 'Incidencia Operativa'),
            gravedad: gravedad,
            descripcion: desc,
            accionInmediata: accion,
            reportadoPor: `${currentUser.nombre} (${currentUser.cargo || currentUser.rol})`,
            fecha: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });

        StorageManager.set(STORAGE_KEYS.INCIDENCIAS, incidencias);
        Modal.close();
        Toast.warning('Incidencia registrada y notificada al centro de control logístico.');
        this.render();
    }

    static viewActaDocument(codigoRuta) {
        const despachos = StorageManager.get(STORAGE_KEYS.DESPACHOS);
        const ruta = despachos.find(d => d.codigoRuta === codigoRuta);
        if (!ruta) return;

        const content = `
            <div class="print-preview-card">
                <div class="print-header">
                    <div>
                        <h2>CASA MARSHALL - LOGÍSTICA INTEGRAL</h2>
                        <p class="text-primary">ACTA OFICIAL DE ENTREGA Y RECEPCIÓN EN SITIO</p>
                    </div>
                    <div>
                        <strong>Ruta: ${ruta.codigoRuta}</strong>
                        <p>Orden: ${ruta.ordenDespacho}</p>
                    </div>
                </div>

                <div class="print-client-box mt-3">
                    <p><strong>Cliente:</strong> ${ruta.cliente}</p>
                    <p><strong>Locación:</strong> ${ruta.direccion}</p>
                    <p><strong>Transporte:</strong> ${ruta.conductor}</p>
                    <p><strong>Responsable de Recepción (RN-05):</strong> ${ruta.responsableRecepcion || 'Pendiente'}</p>
                    <p><strong>DNI Responsable:</strong> ${ruta.dniRecepcion || 'N/A'}</p>
                    <p><strong>Fecha/Hora Real de Entrega:</strong> ${ruta.horaEntregaReal || 'En tránsito'}</p>
                </div>

                <div class="alert-box-info mt-3">
                    Se deja constancia de la recepción conforme de la totalidad del mobiliario y accesorios estipulados en la orden de carga.
                </div>

                <div class="dispatch-signature-box mt-4">
                    <div class="sig-line">
                        <p>_____________________________________</p>
                        <small>Firma Responsable de Entrega (Conductor Casa Marshall)</small>
                    </div>
                    <div class="sig-line">
                        <p>_____________________________________</p>
                        <small>Firma y DNI Responsable de Recepción (${ruta.responsableRecepcion || 'Cliente'})</small>
                    </div>
                </div>
            </div>
        `;

        Modal.open(`Acta de Recepción - ${ruta.codigoRuta}`, content, [
            { text: 'Imprimir Acta', class: 'btn-primary', onClick: () => window.print() },
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }

    static openNewRutaModal() {
        Toast.info('Formulario de nueva ruta: Seleccione la reserva aprobada para programar el despacho.');
    }
}

window.LogisticaModule = LogisticaModule;
LogisticaModule.init();
