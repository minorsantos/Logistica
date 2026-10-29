/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/app.js - Enrutador Principal, UI Helpers (Modal, Toast) y Eventos Globales
 */

// -----------------------------------------------------------------------------
// SISTEMA DE NOTIFICACIONES TOAST
// -----------------------------------------------------------------------------
class Toast {
    static show(message, type = 'info', duration = 3500) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type} animate-slide-in`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠️',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '●'}</span>
            <span class="toast-msg">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    static success(msg) { this.show(msg, 'success'); }
    static error(msg) { this.show(msg, 'error'); }
    static warning(msg) { this.show(msg, 'warning'); }
    static info(msg) { this.show(msg, 'info'); }
}

window.Toast = Toast;

// -----------------------------------------------------------------------------
// SISTEMA DE MODAL REUTILIZABLE
// -----------------------------------------------------------------------------
class Modal {
    static open(title, htmlContent, buttons = []) {
        let overlay = document.getElementById('global-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-modal-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="modal-card animate-zoom-in">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close-btn" onclick="Modal.close()">×</button>
                </div>
                <div class="modal-body">
                    ${htmlContent}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map((b, idx) => `
                            <button id="modal-btn-${idx}" class="btn ${b.class || 'btn-secondary'}">${b.text}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        buttons.forEach((b, idx) => {
            const btnEl = document.getElementById(`modal-btn-${idx}`);
            if (btnEl && b.onClick) {
                btnEl.onclick = b.onClick;
            }
        });

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Cerrar con Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                Modal.close();
                window.removeEventListener('keydown', escHandler);
            }
        };
        window.addEventListener('keydown', escHandler);
    }

    static close() {
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

window.Modal = Modal;

// -----------------------------------------------------------------------------
// ENRUTADOR PRINCIPAL (AppRouter)
// -----------------------------------------------------------------------------
class AppRouter {
    static init() {
        this.currentRoute = 'dashboard';
        this.bindSidebarEvents();
        this.bindGlobalShortcuts();
        this.bindQuickOperationMenu();
        
        // Cargar vista inicial
        this.navigate('dashboard');
    }

    static navigate(routeId) {
        // Validar permisos RBAC
        if (!AuthModule.canAccessModule(routeId)) {
            Toast.warning(`Su rol actual no tiene permisos para acceder al módulo "${routeId.toUpperCase()}".`);
            return;
        }

        this.currentRoute = routeId;

        // Actualizar active en sidebar
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            if (item.getAttribute('data-view') === routeId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Despachar vista correspondiente
        switch (routeId) {
            case 'dashboard':
                DashboardModule.render();
                break;
            case 'solicitudes':
                SolicitudesModule.render();
                break;
            case 'reservas':
                ReservasModule.render();
                break;
            case 'inventario':
                InventarioModule.render();
                break;
            case 'logistica':
                LogisticaModule.render();
                break;
            case 'mantenimiento':
                MantenimientoModule.render();
                break;
            case 'pagos':
                PagosModule.render();
                break;
            default:
                DashboardModule.render();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    static refreshCurrentView() {
        this.navigate(this.currentRoute);
    }

    static bindSidebarEvents() {
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                if (view) {
                    this.navigate(view);
                }
            });
        });
    }

    static bindGlobalShortcuts() {
        // Atajo Ctrl+K para buscar
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.openQuickCommandPalette();
            }
        });

        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                this.openQuickCommandPalette();
            });
        }
    }

    static bindQuickOperationMenu() {
        const opBtn = document.getElementById('btn-new-operation');
        const opMenu = document.getElementById('quick-operation-dropdown');

        if (opBtn && opMenu) {
            opBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                opMenu.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                opMenu.classList.remove('show');
            });
        }
    }

    static openQuickCommandPalette() {
        const content = `
            <div class="command-palette">
                <input type="text" id="palette-search" class="form-control" placeholder="Escriba para navegar o buscar (ej: Crossback, #SOL-2024, Cobro, Lurín)..." autofocus>
                <div class="palette-quick-links mt-3">
                    <span class="text-muted">Acciones Rápidas:</span>
                    <ul class="palette-list">
                        <li onclick="Modal.close(); AppRouter.navigate('solicitudes');">+ Nueva Cotización & Solicitud (CUS-01)</li>
                        <li onclick="Modal.close(); AppRouter.navigate('reservas');">📅 Ver Calendario Gantt de Disponibilidad (CUS-02)</li>
                        <li onclick="Modal.close(); AppRouter.navigate('inventario');">📦 Consultar Existencias en Almacén Lurín (CUS-03)</li>
                        <li onclick="Modal.close(); PagosModule.openRegisterPaymentModal();">💳 Registrar Cobro / Anticipo (RN-09)</li>
                        <li onclick="Modal.close(); SolicitudesModule.openNewClientModal();">👤 Registrar Nuevo Cliente (RN-01)</li>
                        <li onclick="Modal.close(); LogisticaModule.openNewIncidenciaModal();">⚠️ Reportar Incidencia en Ruta</li>
                        <li onclick="Modal.close(); MantenimientoModule.openQuickInspectionModal();">🔍 Inspección Técnica Pos-Recojo (RN-06)</li>
                    </ul>
                </div>
            </div>
        `;

        Modal.open('Búsqueda Rápida y Acciones [Ctrl+K]', content, [
            { text: 'Cerrar', class: 'btn-secondary', onClick: () => Modal.close() }
        ]);

        setTimeout(() => {
            const input = document.getElementById('palette-search');
            if (input) input.focus();
        }, 150);
    }

    static resetDataToInitial() {
        if (confirm('¿Desea restablecer todos los datos del sistema a los valores de prueba originales?')) {
            StorageManager.resetAll();
            Toast.success('Datos restablecidos a los valores predeterminados con éxito.');
            AuthModule.init();
            this.navigate('dashboard');
        }
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    AuthModule.init();
    AppRouter.init();
    console.log('🚀 Sistema Web para la Gestión Logística de Casa Marshall inicializado.');
});

window.AppRouter = AppRouter;
