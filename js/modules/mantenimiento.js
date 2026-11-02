/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/mantenimiento.js - MÓDULO 5: Revisión y Mantenimiento de Artículos (CUS-05 / RF-29 a RF-35)
 * Inspección pos-recojo, control de calidad, fichas técnicas y actualización automática de stock.
 */

class MantenimientoModule {
    static init() {
        this.statusFilter = 'todos';
    }

    static render() {
        const container = document.getElementById('module-content-area');
        if (!container) return;

        const mantenimiento = StorageManager.get(STORAGE_KEYS.MANTENIMIENTO);
        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);

        const enRevision = mantenimiento.filter(m => m.estado === 'en_revision').length;
        const enTaller = mantenimiento.filter(m => m.estado === 'en_taller').length;
        const reparados = mantenimiento.filter(m => m.estado === 'reparado_operativo').length;
        const totalFianza = mantenimiento.reduce((acc, m) => acc + (m.fianzaRetenida || 0), 0);

        container.innerHTML = `
            <div class="view-header">
                <div class="breadcrumbs">
                    <span>CONTROL DE CALIDAD</span>
                    <span>•</span>
                    <span class="badge-tag">CUS-05</span>
                    <span>•</span>
                    <span>INSPECCIÓN POST-EVENTO & TALLER</span>
                </div>
                <div class="header-title-row">
                    <div>
                        <h2 class="view-main-title">Inspección de Mobiliario, Mantenimiento y Fianza</h2>
                        <p class="view-main-subtitle">
                            Protocolo técnico de peritaje pos-recojo, certificación de operatividad y cálculo de deducibles de garantía.
                        </p>
                    </div>
                    <div class="header-action-buttons">
                        <button class="btn btn-outline" onclick="MantenimientoModule.openQuickInspectionModal()">
                            🔍 Registrar Inspección Pos-Recojo
                        </button>
                        <button class="btn btn-primary" onclick="MantenimientoModule.openNewFichaModal()">
                            + Emitir Ficha de Taller (#T)
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPIs de Mantenimiento -->
            <div class="kpi-cards-grid-4">
                <div class="kpi-metric-card">
                    <span class="kpi-label">En Revisión Pos-Recojo</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${enRevision}</span>
                        <span class="kpi-unit">lotes</span>
                    </div>
                    <div class="kpi-footnote text-warning">● Cuarentena técnica obligatoria</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">En Taller de Restauración</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${enTaller}</span>
                        <span class="kpi-unit">órdenes</span>
                    </div>
                    <div class="kpi-footnote text-primary">● Laqueado y vulcanizado en curso</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Reparados y Liberados</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${reparados}</span>
                        <span class="kpi-unit">completados</span>
                    </div>
                    <div class="kpi-footnote text-success">● Reincorporados al stock disponible</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Fianza Retenida por Daños</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">S/ ${totalFianza.toFixed(2)}</span>
                        <span class="kpi-unit">PEN</span>
                    </div>
                    <div class="kpi-footnote text-danger">● Aplicado contra depósitos de garantía</div>
                </div>
            </div>

            <!-- Banner Informativo Inspección -->
            <div class="alert-box-info mt-3">
                <div class="alert-icon">🛡️</div>
                <div class="alert-content">
                    <strong>Protocolo de Control de Calidad:</strong>
                    Todo artículo retornado de un evento ingresa automáticamente al área de <em>"En Revisión"</em> 
                    para chequeo estético y estructural. Ningún artículo puede volver a ser cotizado o reservado sin la firma técnica de liberación.
                </div>
            </div>

            <!-- Tabla de Fichas de Mantenimiento -->
            <div class="section-card mt-4">
                <div class="section-card-header">
                    <div>
                        <h4 class="section-card-title">Fichas Técnicas de Mantenimiento y Reparación</h4>
                        <p class="section-card-subtitle">Historial de peritaje, retención de fianzas y trazabilidad por orden de servicio</p>
                    </div>
                    <div class="filter-pills">
                        <button class="filter-pill ${this.statusFilter === 'todos' ? 'active' : ''}" onclick="MantenimientoModule.filterStatus('todos')">Todos</button>
                        <button class="filter-pill ${this.statusFilter === 'en_revision' ? 'active' : ''}" onclick="MantenimientoModule.filterStatus('en_revision')">En Revisión</button>
                        <button class="filter-pill ${this.statusFilter === 'en_taller' ? 'active' : ''}" onclick="MantenimientoModule.filterStatus('en_taller')">En Taller</button>
                        <button class="filter-pill ${this.statusFilter === 'reparado_operativo' ? 'active' : ''}" onclick="MantenimientoModule.filterStatus('reparado_operativo')">Reparados</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO FICHA</th>
                                <th>RESERVA & CLIENTE</th>
                                <th>MOBILIARIO AFECTADO</th>
                                <th>DAÑO & DIAGNÓSTICO</th>
                                <th>SEVERIDAD</th>
                                <th>FIANZA RETENIDA</th>
                                <th>ESTADO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderMantenimientoRows(mantenimiento)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static renderMantenimientoRows(mantenimiento) {
        let list = mantenimiento;
        if (this.statusFilter !== 'todos') {
            list = list.filter(m => m.estado === this.statusFilter);
        }

        return list.map(m => `
            <tr>
                <td>
                    <strong class="text-primary">${m.codigoFicha}</strong>
                    <div class="text-muted"><small>Ingreso: ${m.fechaIngreso}</small></div>
                </td>
                <td>
                    <strong>${m.clienteNombre}</strong>
                    <div class="text-muted"><small>Reserva: ${m.reservaCodigo}</small></div>
                </td>
                <td>
                    <strong>${m.articuloNombre}</strong>
                    <div class="text-muted"><small>SKU: ${m.articuloSku} • ${m.cantidadAfectada} und</small></div>
                </td>
                <td>
                    <div class="text-secondary"><strong>${m.tipoDanioTexto || m.tipoDanio}</strong></div>
                    <div class="text-muted"><small>${m.diagnostico}</small></div>
                </td>
                <td>
                    <span class="badge-status ${m.nivelSeveridad === 'grave' || m.nivelSeveridad === 'perdida_total' ? 'badge-danger' : 'badge-warning'}">
                        ${m.nivelSeveridad.toUpperCase()}
                    </span>
                </td>
                <td>
                    <strong class="text-danger">S/ ${(m.fianzaRetenida || 0).toFixed(2)}</strong>
                    <div class="text-muted"><small>Costo: S/ ${(m.costoReparacion || 0).toFixed(2)}</small></div>
                </td>
                <td>
                    <span class="badge-status ${m.estado === 'reparado_operativo' ? 'badge-success' : (m.estado === 'en_taller' ? 'badge-primary' : 'badge-warning')}">
                        ${m.estado === 'reparado_operativo' ? 'Reparado / Operativo' : (m.estado === 'en_taller' ? 'En Taller' : 'En Revisión')}
                    </span>
                </td>
                <td>
                    <div class="action-btn-group">
                        ${m.estado !== 'reparado_operativo' ? `
                            <button class="btn btn-xs btn-success" onclick="MantenimientoModule.liberarADisponible('${m.codigoFicha}')" title="Liberar a Disponible">
                                ✓ Liberar Disponible
                            </button>
                            <button class="btn btn-xs btn-danger" onclick="MantenimientoModule.darDeBaja('${m.codigoFicha}')" title="Declarar No Reparable (Baja)">
                                ⛔ Dar de Baja
                            </button>
                        ` : `
                            <span class="text-success" style="font-size: 11px;">✓ Certificado OK</span>
                        `}
                        <button class="btn btn-xs btn-outline" onclick="MantenimientoModule.printFicha('${m.codigoFicha}')" title="Imprimir Ficha">
                            📄 Ficha
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

    static liberarADisponible(codigoFicha) {
        const mantenimiento = StorageManager.get(STORAGE_KEYS.MANTENIMIENTO);
        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const ficha = mantenimiento.find(m => m.codigoFicha === codigoFicha);

        if (!ficha) return;

        // Actualizar stock de artículos: restar de taller y sumar a disponible
        const art = articulos.find(a => a.sku === ficha.articuloSku);
        if (art) {
            art.enTaller = Math.max(0, (art.enTaller || 0) - ficha.cantidadAfectada);
            art.disponibles = (art.disponibles || 0) + ficha.cantidadAfectada;
            StorageManager.set(STORAGE_KEYS.ARTICULOS, articulos);
        }

        ficha.estado = 'reparado_operativo';
        ficha.fechaSalida = new Date().toISOString().replace('T', ' ').substring(0, 16);
        StorageManager.set(STORAGE_KEYS.MANTENIMIENTO, mantenimiento);

        Toast.success(`✓ Ficha ${codigoFicha} liberada. ${ficha.cantidadAfectada} unidad(es) de ${ficha.articuloNombre} reincorporadas a "Disponibles".`);
        this.render();
    }

    static darDeBaja(codigoFicha) {
        const mantenimiento = StorageManager.get(STORAGE_KEYS.MANTENIMIENTO);
        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const ficha = mantenimiento.find(m => m.codigoFicha === codigoFicha);

        if (!ficha) return;

        // Actualizar stock: restar de taller y sumar a deBaja
        const art = articulos.find(a => a.sku === ficha.articuloSku);
        if (art) {
            art.enTaller = Math.max(0, (art.enTaller || 0) - ficha.cantidadAfectada);
            art.deBaja = (art.deBaja || 0) + ficha.cantidadAfectada;
            StorageManager.set(STORAGE_KEYS.ARTICULOS, articulos);
        }

        ficha.estado = 'no_reparable_baja';
        StorageManager.set(STORAGE_KEYS.MANTENIMIENTO, mantenimiento);

        Toast.warning(`⛔ Artículo dado de baja por daño irreparable. Stock actualizado en almacén.`);
        this.render();
    }

    static openQuickInspectionModal() {
        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const reservas = StorageManager.get(STORAGE_KEYS.RESERVAS);

        const formHtml = `
            <form onsubmit="MantenimientoModule.saveInspection(event)">
                <div class="alert-box-warning mb-3">
                    <strong>Protocolo:</strong> Ingrese el resultado de la inspección técnica de los artículos retornados.
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Reserva Asociada *</label>
                        <select id="insp-reserva" class="form-control" required>
                            ${reservas.map(r => `<option value="${r.codigoReserva}">${r.codigoReserva} - ${r.clienteNombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mobiliario Inspeccionado *</label>
                        <select id="insp-sku" class="form-control" required>
                            ${articulos.map(a => `<option value="${a.sku}">${a.sku}: ${a.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Cantidad Afectada con Daño</label>
                        <input type="number" id="insp-qty" class="form-control" value="1" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Nivel de Severidad *</label>
                        <select id="insp-severidad" class="form-control" required>
                            <option value="leve">Leve (Mancha o raspadura superficial)</option>
                            <option value="moderado">Moderado (Fisura o rasgadura menor)</option>
                            <option value="grave">Grave (Abolladura estructural)</option>
                            <option value="perdida_total">Pérdida Total / Destruido</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Monto Fianza a Retener (S/) *</label>
                        <input type="number" step="0.01" id="insp-fianza" class="form-control" value="65.00" required>
                    </div>
                    <div class="form-group">
                        <label>Costo Estimado de Reparación (S/)</label>
                        <input type="number" step="0.01" id="insp-costo" class="form-control" value="45.00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Diagnóstico Técnico Detallado *</label>
                    <textarea id="insp-diag" class="form-control" rows="2" placeholder="Detalle el daño encontrado y piezas a sustituir..." required></textarea>
                </div>
                <div class="modal-footer-btns mt-3">
                    <button type="submit" class="btn btn-primary btn-block">Emitir Ficha de Taller y Actualizar Inventario</button>
                </div>
            </form>
        `;

        Modal.open('Inspección Pos-Recojo y Apertura de Ficha Técnica', formHtml);
    }

    static saveInspection(event) {
        event.preventDefault();
        const reservaCodigo = document.getElementById('insp-reserva').value;
        const sku = document.getElementById('insp-sku').value;
        const qty = parseInt(document.getElementById('insp-qty').value);
        const severidad = document.getElementById('insp-severidad').value;
        const fianza = parseFloat(document.getElementById('insp-fianza').value);
        const costo = parseFloat(document.getElementById('insp-costo').value);
        const diag = document.getElementById('insp-diag').value.trim();

        const articulos = StorageManager.get(STORAGE_KEYS.ARTICULOS);
        const art = articulos.find(a => a.sku === sku);
        const reservas = StorageManager.get(STORAGE_KEYS.RESERVAS);
        const res = reservas.find(r => r.codigoReserva === reservaCodigo);
        const currentUser = StorageManager.getCurrentUser();

        // Actualizar inventario: sumar a enTaller
        if (art) {
            art.enTaller = (art.enTaller || 0) + qty;
            art.disponibles = Math.max(0, (art.disponibles || 0) - qty);
            StorageManager.set(STORAGE_KEYS.ARTICULOS, articulos);
        }

        const fichaCode = `#T-${Math.floor(106 + Math.random() * 50)}`;
        const mantenimiento = StorageManager.get(STORAGE_KEYS.MANTENIMIENTO);
        mantenimiento.unshift({
            id: Date.now(),
            codigoFicha: fichaCode,
            reservaCodigo: reservaCodigo,
            clienteNombre: res ? res.clienteNombre : 'Cliente Registrado',
            articuloSku: sku,
            articuloNombre: art ? art.nombre : sku,
            cantidadAfectada: qty,
            tipoDanio: 'danio_pos_evento',
            tipoDanioTexto: 'Daño detectado en peritaje de recepción',
            nivelSeveridad: severidad,
            fianzaRetenida: fianza,
            costoReparacion: costo,
            diagnostico: diag,
            tecnicoAsignado: currentUser.nombre,
            estado: 'en_taller',
            fechaIngreso: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });

        StorageManager.set(STORAGE_KEYS.MANTENIMIENTO, mantenimiento);
        Modal.close();
        Toast.success(`¡Ficha ${fichaCode} creada! Unidades transferidas a taller y fianza registrada.`);
        this.render();
    }

    static openNewFichaModal() {
        this.openQuickInspectionModal();
    }

    static printFicha(codigoFicha) {
        const mantenimiento = StorageManager.get(STORAGE_KEYS.MANTENIMIENTO);
        const f = mantenimiento.find(m => m.codigoFicha === codigoFicha);
        if (!f) return;

        const content = `
            <div class="print-preview-card">
                <div class="print-header">
                    <div>
                        <h2>CASA MARSHALL - TALLER Y MANTENIMIENTO</h2>
                        <h4 class="text-primary">FICHA TÉCNICA DE CONTROL DE DAÑOS ${f.codigoFicha}</h4>
                    </div>
                    <div>
                        <strong>Fecha Ingreso: ${f.fechaIngreso}</strong>
                        <p>Técnico: ${f.tecnicoAsignado}</p>
                    </div>
                </div>

                <div class="print-client-box mt-3">
                    <p><strong>Cliente:</strong> ${f.clienteNombre} • <strong>Reserva:</strong> ${f.reservaCodigo}</p>
                    <p><strong>Artículo:</strong> ${f.articuloNombre} (${f.articuloSku}) • Cantidad: ${f.cantidadAfectada} und</p>
                    <p><strong>Nivel Severidad:</strong> ${f.nivelSeveridad.toUpperCase()}</p>
                    <p><strong>Diagnóstico:</strong> ${f.diagnostico}</p>
                    <p class="text-danger"><strong>Fianza Aplicada al Depósito:</strong> S/ ${(f.fianzaRetenida || 0).toFixed(2)}</p>
                </div>

                <div class="dispatch-signature-box mt-4">
                    <div class="sig-line">
                        <p>_____________________________________</p>
                        <small>Firma Especialista Taller (${f.tecnicoAsignado})</small>
                    </div>
                    <div class="sig-line">
                        <p>_____________________________________</p>
                        <small>Vº Bº Jefe Operaciones (Valeria Mendoza)</small>
                    </div>
                </div>
            </div>
        `;

        Modal.open(`Ficha Técnica ${f.codigoFicha}`, content, [
            { text: 'Imprimir Ficha', class: 'btn-primary', onClick: () => window.print() },
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }
}

window.MantenimientoModule = MantenimientoModule;
MantenimientoModule.init();
