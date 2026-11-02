/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/modules/auth.js - Control de Acceso Basado en Roles (RBAC) y Permisos
 */

const ROLES_PERMISOS = {
    administrador: {
        nombre: 'Administrador (AS-06)',
        permisos: ['*'], // Acceso total
        modulosPermitidos: ['dashboard', 'solicitudes', 'reservas', 'inventario', 'logistica', 'mantenimiento', 'pagos']
    },
    ventas: {
        nombre: 'Personal de Ventas (AS-03)',
        permisos: ['crear_solicitud', 'crear_cotizacion', 'ver_disponibilidad', 'confirmar_reserva', 'registrar_pago'],
        modulosPermitidos: ['dashboard', 'solicitudes', 'reservas', 'pagos']
    },
    almacen: {
        nombre: 'Personal de Almacén (AS-04)',
        permisos: ['ver_inventario', 'bloquear_stock', 'abastecimiento', 'ver_hoja_carga'],
        modulosPermitidos: ['dashboard', 'inventario', 'reservas', 'logistica']
    },
    logistica: {
        nombre: 'Personal de Logística (AS-05)',
        permisos: ['programar_rutas', 'asignar_transporte', 'registrar_incidencia', 'confirmar_entrega', 'acta_recojo'],
        modulosPermitidos: ['dashboard', 'logistica', 'reservas']
    },
    mantenimiento: {
        nombre: 'Técnico de Mantenimiento (AS-10)',
        permisos: ['inspeccion_recojo', 'ficha_mantenimiento', 'liberar_disponible', 'dar_baja'],
        modulosPermitidos: ['dashboard', 'mantenimiento', 'inventario']
    },
    cliente: {
        nombre: 'Cliente / Empresa Contratante (AS-01/AS-02)',
        permisos: ['ver_catalogo', 'solicitar_cotizacion', 'ver_mis_reservas', 'ver_mis_pagos'],
        modulosPermitidos: ['solicitudes', 'reservas', 'pagos']
    },
    courier: {
        nombre: 'Courier / Empresa de Transporte (AS-08/AS-09)',
        permisos: ['ver_asignaciones_carga', 'confirmar_entrega_courier', 'registrar_incidencia_ruta'],
        modulosPermitidos: ['logistica']
    }
};

class AuthModule {
    static init() {
        this.renderUserSelector();
        this.applyRoleRestrictions();
        
        window.addEventListener('cm_user_changed', () => {
            this.applyRoleRestrictions();
            if (window.AppRouter) {
                window.AppRouter.refreshCurrentView();
            }
        });
    }

    static getCurrentUser() {
        return StorageManager.getCurrentUser();
    }

    static setCurrentUserById(userId) {
        const usuarios = StorageManager.get(STORAGE_KEYS.USUARIOS);
        const user = usuarios.find(u => u.id === parseInt(userId));
        if (user) {
            StorageManager.setCurrentUser(user);
            this.renderHeaderUserInfo(user);
            this.applyRoleRestrictions();
            
            // Mostrar notificación de cambio de perfil
            if (window.Toast) {
                Toast.info(`Sesión cambiada a: ${user.nombre} (${ROLES_PERMISOS[user.rol]?.nombre || user.rol})`);
            }
        }
    }

    static hasPermission(permission) {
        const user = this.getCurrentUser();
        const config = ROLES_PERMISOS[user.rol];
        if (!config) return false;
        if (config.permisos.includes('*')) return true;
        return config.permisos.includes(permission);
    }

    static canAccessModule(moduleId) {
        const user = this.getCurrentUser();
        const config = ROLES_PERMISOS[user.rol];
        if (!config) return false;
        if (config.permisos.includes('*')) return true;
        return config.modulosPermitidos.includes(moduleId);
    }

    static renderUserSelector() {
        const select = document.getElementById('role-switcher-select');
        if (!select) return;

        const usuarios = StorageManager.get(STORAGE_KEYS.USUARIOS);
        const currentUser = this.getCurrentUser();

        select.innerHTML = usuarios.map(u => `
            <option value="${u.id}" ${u.id === currentUser.id ? 'selected' : ''}>
                ${u.nombre} • ${u.rol.toUpperCase()}
            </option>
        `).join('');

        select.onchange = (e) => {
            this.setCurrentUserById(e.target.value);
        };

        this.renderHeaderUserInfo(currentUser);
    }

    static renderHeaderUserInfo(user) {
        const nameEl = document.getElementById('header-user-name');
        const roleEl = document.getElementById('header-user-role');
        const avatarEl = document.getElementById('header-user-avatar');

        if (nameEl) nameEl.textContent = user.nombre;
        if (roleEl) roleEl.textContent = user.cargo || user.rol;
        if (avatarEl) avatarEl.src = user.avatar;
    }

    static applyRoleRestrictions() {
        const user = this.getCurrentUser();
        const config = ROLES_PERMISOS[user.rol];
        if (!config) return;

        // 1. Ocultar o deshabilitar pestañas del menú lateral
        const navItems = document.querySelectorAll('.sidebar-nav-item');
        navItems.forEach(item => {
            const targetModule = item.getAttribute('data-view');
            if (targetModule) {
                const isAllowed = config.permisos.includes('*') || config.modulosPermitidos.includes(targetModule);
                if (isAllowed) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            }
        });

        // 2. Control de elementos con data-permiso en la interfaz
        document.querySelectorAll('[data-permiso]').forEach(el => {
            const perm = el.getAttribute('data-permiso');
            if (this.hasPermission(perm)) {
                el.style.display = '';
                el.removeAttribute('disabled');
            } else {
                el.style.display = 'none';
                el.setAttribute('disabled', 'true');
            }
        });

        // 3. Indicador visual del rol activo en el header
        const badgeRole = document.getElementById('header-active-role-badge');
        if (badgeRole) {
            badgeRole.textContent = user.rol.toUpperCase();
        }
    }
}

window.AuthModule = AuthModule;
