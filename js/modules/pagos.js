/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/pagos.js - MÓDULO 6: Gestión de Pagos y Comprobantes Fiscales (CUS-06 / RF-36 a RF-42)
 * Implementa RN-09 (Trazabilidad unívoca a Código de Reserva), simulación de Facturas/Boletas y validación de cobros.
 */

class PagosModule {
    static init() {
        this.filterType = 'todos';
    }

    static render() {
        const container = document.getElementById('module-content-area');
        if (!container) return;

        const pagos = StorageManager.get(STORAGE_KEYS.PAGOS);
        const totalCobrado = pagos.reduce((acc, p) => acc + (p.monto || 0), 0);
        const totalAnticipos = pagos.filter(p => p.tipoPago.includes('Anticipo')).reduce((acc, p) => acc + (p.monto || 0), 0);
        const totalFianzas = pagos.filter(p => p.tipoPago.includes('Fianza')).reduce((acc, p) => acc + (p.monto || 0), 0);

        container.innerHTML = `
            <div class="view-header">
                <div class="breadcrumbs">
                    <span>FINANZAS & TESORERÍA</span>
                    <span>•</span>
                    <span class="badge-tag">CUS-06</span>
                    <span>•</span>
                    <span>COBRANZAS & FACTURACIÓN ELECTRÓNICA</span>
                </div>
                <div class="header-title-row">
                    <div>
                        <h2 class="view-main-title">Control de Pagos, Anticipos y Comprobantes</h2>
                        <p class="view-main-subtitle">
                            Trazabilidad bancaria de anticipos del 50%, saldos de liquidación y comprobantes homologados SUNAT.
                        </p>
                    </div>
                    <div class="header-action-buttons">
                        <button class="btn btn-primary" onclick="PagosModule.openRegisterPaymentModal()">
                            + Registrar Nuevo Cobro (RN-09)
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPIs de Tesorería -->
            <div class="kpi-cards-grid-4">
                <div class="kpi-metric-card">
                    <span class="kpi-label">Total Recaudado en Banco</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">$${totalCobrado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span class="kpi-unit">USD</span>
                    </div>
                    <div class="kpi-footnote text-success">● Conciliación bancaria BCP al día</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Anticipos 50% de Bloqueo</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">$${totalAnticipos.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span class="kpi-unit">USD</span>
                    </div>
                    <div class="kpi-footnote text-primary">● Garantizan bloqueo firme de flota</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Fianzas Retenidas por Taller</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">$${totalFianzas.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span class="kpi-unit">USD</span>
                    </div>
                    <div class="kpi-footnote text-danger">● Descontadas por incidencias técnicas</div>
                </div>

                <div class="kpi-metric-card">
                    <span class="kpi-label">Comprobantes Emitidos</span>
                    <div class="kpi-number-row">
                        <span class="kpi-main-number">${pagos.length}</span>
                        <span class="kpi-unit">facturas/boletas</span>
                    </div>
                    <div class="kpi-footnote text-success">● 100% asociadas a código de reserva</div>
                </div>
            </div>

            <!-- Regla RN-09 Notificación -->
            <div class="alert-box-info mt-3">
                <div class="alert-icon">💳</div>
                <div class="alert-content">
                    <strong>Regla de Negocio RN-09 (Trazabilidad de Pagos):</strong>
                    Todo pago, depósito o retención debe estar obligatoriamente vinculado a un <strong>Código de Reserva unívoco</strong> 
                    para garantizar la auditoría cruzada con el inventario y la emisión del comprobante electrónico.
                </div>
            </div>

            <!-- Historial de Pagos y Comprobantes -->
            <div class="section-card mt-4">
                <div class="section-card-header">
                    <div>
                        <h4 class="section-card-title">Registro de Transacciones y Comprobantes Fiscales</h4>
                        <p class="section-card-subtitle">Auditoría con número de operación bancaria y verificación contable</p>
                    </div>
                    <div class="filter-pills">
                        <button class="filter-pill ${this.filterType === 'todos' ? 'active' : ''}" onclick="PagosModule.filterStatus('todos')">Todos</button>
                        <button class="filter-pill ${this.filterType === 'Factura' ? 'active' : ''}" onclick="PagosModule.filterStatus('Factura')">Facturas</button>
                        <button class="filter-pill ${this.filterType === 'Boleta' ? 'active' : ''}" onclick="PagosModule.filterStatus('Boleta')">Boletas</button>
                        <button class="filter-pill ${this.filterType === 'Recibo' ? 'active' : ''}" onclick="PagosModule.filterStatus('Recibo')">Recibos Caja</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>CÓDIGO PAGO</th>
                                <th>RESERVA (RN-09)</th>
                                <th>CLIENTE</th>
                                <th>CONCEPTO</th>
                                <th>MONTO (USD)</th>
                                <th>OPERACIÓN BANCARIA</th>
                                <th>COMPROBANTE</th>
                                <th>ESTADO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderPagosRows(pagos)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static renderPagosRows(pagos) {
        let list = pagos;
        if (this.filterType !== 'todos') {
            list = list.filter(p => p.tipoComprobante.includes(this.filterType));
        }

        return list.map(p => `
            <tr>
                <td>
                    <strong class="text-primary">${p.codigoPago}</strong>
                    <div class="text-muted"><small>${p.fechaPago}</small></div>
                </td>
                <td>
                    <strong class="text-dark">${p.reservaCodigo}</strong>
                </td>
                <td>
                    <strong>${p.clienteNombre}</strong>
                </td>
                <td>
                    <span class="text-secondary">${p.tipoPago}</span>
                    <div class="text-muted"><small>Método: ${p.metodo}</small></div>
                </td>
                <td>
                    <strong class="text-success">$${(p.monto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </td>
                <td>
                    <span class="badge-op-code">${p.operacionBancaria}</span>
                    <div class="text-muted"><small>${p.verificadoPor || 'Tesorería'}</small></div>
                </td>
                <td>
                    <div><strong>${p.tipoComprobante}</strong></div>
                    <div class="text-primary"><small>${p.numeroComprobante}</small></div>
                </td>
                <td>
                    <span class="badge-status badge-success">${p.estado}</span>
                </td>
                <td>
                    <button class="btn btn-xs btn-outline" onclick="PagosModule.viewInvoice('${p.codigoPago}')" title="Ver Comprobante">
                        🧾 Ver Factura/Recibo
                    </button>
                </td>
            </tr>
        `).join('');
    }

    static filterStatus(status) {
        this.filterType = status;
        this.render();
    }

    static openRegisterPaymentModal() {
        const reservas = StorageManager.get(STORAGE_KEYS.RESERVAS);
        const clientes = StorageManager.get(STORAGE_KEYS.CLIENTES);

        const formHtml = `
            <form onsubmit="PagosModule.savePayment(event)">
                <div class="alert-box-warning mb-3">
                    <strong>RN-09:</strong> Seleccione la reserva correspondiente a este abono. El pago se registrará con código único y comprobante electrónico.
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Código de Reserva Asociado (RN-09) *</label>
                        <select id="pay-reserva" class="form-control" required onchange="PagosModule.onReservaSelectChange(this.value)">
                            ${reservas.map(r => `<option value="${r.codigoReserva}">${r.codigoReserva} - ${r.clienteNombre} (${r.eventoNombre})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Concepto de Cobro *</label>
                        <select id="pay-concepto" class="form-control" required>
                            <option value="Anticipo 50% (Bloqueo Inventario)">Anticipo 50% (Bloqueo Inventario)</option>
                            <option value="Saldo Restante 50%">Saldo Restante 50%</option>
                            <option value="Depósito de Garantía (20%)">Depósito de Garantía (20%)</option>
                            <option value="Cobro por Daños / Fianza">Cobro por Daños / Fianza</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Monto a Registrar (USD) *</label>
                        <input type="number" step="0.01" id="pay-monto" class="form-control" value="3200.00" required>
                    </div>
                    <div class="form-group">
                        <label>Método de Pago *</label>
                        <select id="pay-metodo" class="form-control" required>
                            <option value="Transferencia BCP">Transferencia Bancaria BCP</option>
                            <option value="Transferencia BBVA">Transferencia BBVA</option>
                            <option value="Tarjeta de Crédito Corporativa">Tarjeta de Crédito Corporativa</option>
                            <option value="Cheque de Gerencia">Cheque de Gerencia</option>
                        </select>
                    </div>
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label>Nº de Operación Bancaria *</label>
                        <input type="text" id="pay-op-bancaria" class="form-control" placeholder="Ej: #TRF-90218-BCP" required>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Comprobante Fiscal *</label>
                        <select id="pay-tipo-comprobante" class="form-control" required>
                            <option value="Factura Electrónica">Factura Electrónica (RUC)</option>
                            <option value="Boleta Electrónica">Boleta de Venta (DNI)</option>
                            <option value="Recibo de Caja / Fianza">Recibo de Caja / Depósito</option>
                        </select>
                    </div>
                </div>

                <div class="modal-footer-btns mt-3">
                    <button type="submit" class="btn btn-primary btn-block">Registrar Pago y Emitir Comprobante (RN-09)</button>
                </div>
            </form>
        `;

        Modal.open('Registrar Nuevo Pago / Cobro (RN-09)', formHtml);
    }

    static onReservaSelectChange(reservaCodigo) {
        // Autocompletar sugerencia de monto si se requiere
    }

    static savePayment(event) {
        event.preventDefault();
        const reservaCodigo = document.getElementById('pay-reserva').value;
        const concepto = document.getElementById('pay-concepto').value;
        const monto = parseFloat(document.getElementById('pay-monto').value);
        const metodo = document.getElementById('pay-metodo').value;
        const opBancaria = document.getElementById('pay-op-bancaria').value.trim();
        const tipoComp = document.getElementById('pay-tipo-comprobante').value;

        const reservas = StorageManager.get(STORAGE_KEYS.RESERVAS);
        const res = reservas.find(r => r.codigoReserva === reservaCodigo);
        const currentUser = StorageManager.getCurrentUser();

        const numComp = tipoComp.includes('Factura') 
            ? `F001-0${Math.floor(893 + Math.random() * 50)}` 
            : `B001-0${Math.floor(1046 + Math.random() * 50)}`;

        const payCode = `#PAG-2024-0${Math.floor(392 + Math.random() * 50)}`;

        const pagos = StorageManager.get(STORAGE_KEYS.PAGOS);
        const newPayment = {
            id: Date.now(),
            codigoPago: payCode,
            reservaCodigo: reservaCodigo,
            clienteNombre: res ? res.clienteNombre : 'Cliente Registrado',
            tipoPago: concepto,
            monto: monto,
            metodo: metodo,
            operacionBancaria: opBancaria,
            tipoComprobante: tipoComp,
            numeroComprobante: numComp,
            estado: 'Confirmado por Banco',
            fechaPago: new Date().toISOString().replace('T', ' ').substring(0, 16),
            verificadoPor: currentUser.nombre
        };

        pagos.unshift(newPayment);
        StorageManager.set(STORAGE_KEYS.PAGOS, pagos);

        Modal.close();
        Toast.success(`¡Pago ${payCode} registrado exitosamente para la reserva ${reservaCodigo}! Comprobante ${numComp} emitido.`);
        this.render();
    }

    static viewInvoice(codigoPago) {
        const pagos = StorageManager.get(STORAGE_KEYS.PAGOS);
        const p = pagos.find(pay => pay.codigoPago === codigoPago);
        if (!p) return;

        const subtotal = p.monto / 1.18;
        const igv = p.monto - subtotal;

        const content = `
            <div class="print-preview-card">
                <div class="invoice-box-header">
                    <div class="inv-brand">
                        <h2>CASA MARSHALL S.A.C.</h2>
                        <p>EVENT LOGISTICS & LUXURY RENTALS</p>
                        <small>R.U.C. 20512345678 • Panamericana Sur Km 30.5, Lurín, Lima</small>
                    </div>
                    <div class="inv-badge-doc">
                        <h3>${p.tipoComprobante.toUpperCase()}</h3>
                        <h2 class="text-primary">${p.numeroComprobante}</h2>
                        <small>Fecha: ${p.fechaPago}</small>
                    </div>
                </div>

                <div class="print-client-box mt-3">
                    <p><strong>Señor(es):</strong> ${p.clienteNombre}</p>
                    <p><strong>Código de Reserva (RN-09):</strong> ${p.reservaCodigo}</p>
                    <p><strong>Forma de Pago:</strong> ${p.metodo} • Operación: ${p.operacionBancaria}</p>
                    <p><strong>Validado por:</strong> ${p.verificadoPor || 'Valeria Mendoza (Jefa de Operaciones)'}</p>
                </div>

                <table class="print-items-table mt-3">
                    <thead>
                        <tr>
                            <th>Cant.</th>
                            <th>Descripción / Concepto</th>
                            <th>Valor Unit.</th>
                            <th>Importe USD</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>${p.tipoPago} correspondiente al servicio de alquiler para la reserva ${p.reservaCodigo}</td>
                            <td>$${subtotal.toFixed(2)}</td>
                            <td>$${subtotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="print-totals-summary mt-3">
                    <p>Op. Gravada: <strong>$${subtotal.toFixed(2)} USD</strong></p>
                    <p>I.G.V. (18%): <strong>$${igv.toFixed(2)} USD</strong></p>
                    <h3 class="print-grand-total">TOTAL PAGADO: $${p.monto.toFixed(2)} USD</h3>
                    <div class="stamp-verified">✓ CONCILIADO EN BANCO</div>
                </div>
            </div>
        `;

        Modal.open(`Comprobante Oficial ${p.numeroComprobante}`, content, [
            { text: 'Imprimir Comprobante', class: 'btn-primary', onClick: () => window.print() },
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);
    }
}

window.PagosModule = PagosModule;
PagosModule.init();
