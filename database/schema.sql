-- ==============================================================================
-- SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
-- EVENT LOGISTICS & RENTALS - MODELO DE BASE DE DATOS RELACIONAL (MySQL 8.0+)
-- Arquitectura de Datos Normalizada (3FN) para Alquiler, Flota, Mantenimiento y Pagos
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS inspecciones_mantenimiento;
DROP TABLE IF EXISTS incidencias_transporte;
DROP TABLE IF EXISTS despachos_rutas;
DROP TABLE IF EXISTS detalle_reserva;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS detalle_cotizacion;
DROP TABLE IF EXISTS cotizaciones;
DROP TABLE IF EXISTS solicitudes;
DROP TABLE IF EXISTS abastecimiento_proveedores;
DROP TABLE IF EXISTS inventario_estado;
DROP TABLE IF EXISTS articulos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios (RBAC - Control de Acceso Basado en Roles)
-- ------------------------------------------------------------------------------
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM(
        'administrador', 
        'ventas', 
        'almacen', 
        'logistica', 
        'mantenimiento', 
        'cliente', 
        'courier'
    ) NOT NULL DEFAULT 'ventas',
    cargo_titulo VARCHAR(100) DEFAULT NULL,
    telefono VARCHAR(30) DEFAULT NULL,
    sede VARCHAR(80) DEFAULT 'Sede Central - Almacén Lurín',
    estado ENUM('activo', 'inactivo', 'suspendido') NOT NULL DEFAULT 'activo',
    avatar_url VARCHAR(255) DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios del sistema con roles RBAC';

-- ------------------------------------------------------------------------------
-- 2. TABLA: clientes (RN-01: Todo cliente debe estar registrado previamente)
-- ------------------------------------------------------------------------------
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('RUC', 'DNI', 'CE', 'PASAPORTE') NOT NULL DEFAULT 'RUC',
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    razon_social VARCHAR(180) NOT NULL,
    contacto_nombre VARCHAR(120) NOT NULL,
    contacto_telefono VARCHAR(40) NOT NULL,
    contacto_email VARCHAR(150) NOT NULL,
    direccion_fiscal VARCHAR(255) DEFAULT NULL,
    ciudad VARCHAR(80) DEFAULT 'Lima',
    categoria_cliente ENUM('corporativo', 'agencia_b2b', 'particular', 'institucional', 'vip') DEFAULT 'corporativo',
    limite_credito DECIMAL(12, 2) DEFAULT 0.00,
    estado ENUM('activo', 'moroso', 'bloqueado') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Directorio de clientes y empresas contratantes';

-- ------------------------------------------------------------------------------
-- 3. TABLA: categorias
-- ------------------------------------------------------------------------------
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    color_identificador VARCHAR(10) DEFAULT '#b45309',
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorías de artículos y mobiliario';

-- ------------------------------------------------------------------------------
-- 4. TABLA: articulos (Catálogo Maestro de Mobiliario y Equipamiento)
-- ------------------------------------------------------------------------------
CREATE TABLE articulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    categoria_id INT NOT NULL,
    descripcion TEXT DEFAULT NULL,
    especificaciones_tecnicas TEXT DEFAULT NULL,
    tarifa_diaria DECIMAL(10, 2) NOT NULL,
    valor_reposicion DECIMAL(10, 2) NOT NULL COMMENT='Costo en caso de pérdida o baja',
    ubicacion_almacen VARCHAR(80) DEFAULT 'Nave A - Rack 01' COMMENT='Nave, Bahía o Rack en almacén',
    tiempo_limpieza_horas DECIMAL(4, 1) DEFAULT 2.0,
    stock_total INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255) DEFAULT NULL,
    estado_operativo ENUM('activo', 'descontinuado', 'mantenimiento_temporal') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo maestro de flota y mobiliario';

-- ------------------------------------------------------------------------------
-- 5. TABLA: inventario_estado (RN-04: Trazabilidad en tiempo real de unidades)
-- ------------------------------------------------------------------------------
CREATE TABLE inventario_estado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articulo_id INT NOT NULL UNIQUE,
    disponibles INT NOT NULL DEFAULT 0,
    en_evento INT NOT NULL DEFAULT 0,
    en_taller INT NOT NULL DEFAULT 0,
    de_baja INT NOT NULL DEFAULT 0,
    en_revision INT NOT NULL DEFAULT 0,
    ultima_auditoria DATETIME DEFAULT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE CASCADE,
    CONSTRAINT chk_stock_balance CHECK (disponibles + en_evento + en_taller + de_baja + en_revision >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Estado dinámico de unidades por artículo';

-- ------------------------------------------------------------------------------
-- 6. TABLA: solicitudes (CUS-01 / RF-01 a RF-04)
-- ------------------------------------------------------------------------------
CREATE TABLE solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_solicitud VARCHAR(30) NOT NULL UNIQUE COMMENT='Ej: #SOL-2024-1082',
    cliente_id INT NOT NULL,
    nombre_evento VARCHAR(150) NOT NULL,
    tipo_evento ENUM('boda', 'corporativo', 'gala_diplomatica', 'graduacion', 'privado', 'feria_comercial') NOT NULL,
    invitados_estimados INT DEFAULT 100,
    fecha_evento_inicio DATE NOT NULL,
    fecha_evento_fin DATE NOT NULL,
    dias_servicio INT AS (DATEDIFF(fecha_evento_fin, fecha_evento_inicio) + 1) STORED,
    locacion_despliegue VARCHAR(255) NOT NULL,
    distrito VARCHAR(80) DEFAULT 'Lurín',
    hora_montaje_sugerida TIME DEFAULT '10:00:00',
    hora_retiro_sugerida TIME DEFAULT '18:00:00',
    supervisor_asignado_id INT DEFAULT NULL,
    estado ENUM('borrador', 'en_evaluacion', 'cotizada', 'rechazada', 'convertida_a_reserva') NOT NULL DEFAULT 'borrador',
    notas_requerimientos TEXT DEFAULT NULL,
    registrado_por_id INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (supervisor_asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (registrado_por_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Solicitudes iniciales de eventos';

-- ------------------------------------------------------------------------------
-- 7. TABLA: cotizaciones (CUS-01 / RF-05 a RF-07)
-- ------------------------------------------------------------------------------
CREATE TABLE cotizaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_cotizacion VARCHAR(30) NOT NULL UNIQUE COMMENT='Ej: #COT-2024-0419',
    solicitud_id INT NOT NULL,
    cliente_id INT NOT NULL,
    subtotal_mobiliario DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    costo_transporte_montaje DECIMAL(12, 2) NOT NULL DEFAULT 650.00,
    deposito_garantia DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT='Reembolsable post-evento (20%)',
    igv_impuestos DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT='18% del subtotal',
    total_estimado DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    porcentaje_anticipo_requerido DECIMAL(5, 2) DEFAULT 50.00 COMMENT='50% para bloqueo de inventario',
    monto_anticipo_requerido DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    validez_horas INT DEFAULT 48 COMMENT='Reserva de inventario válida por 48 horas continuas',
    estado ENUM('borrador', 'emitida', 'aceptada_cliente', 'rechazada', 'expirada', 'procesada') NOT NULL DEFAULT 'borrador',
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cotizaciones oficiales con desglose financiero';

-- ------------------------------------------------------------------------------
-- 8. TABLA: detalle_cotizacion
-- ------------------------------------------------------------------------------
CREATE TABLE detalle_cotizacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id INT NOT NULL,
    articulo_id INT NOT NULL,
    cantidad INT NOT NULL,
    dias INT NOT NULL DEFAULT 1,
    tarifa_unitaria_diaria DECIMAL(10, 2) NOT NULL,
    subtotal_linea DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Desglose de mobiliario por cotización';

-- ------------------------------------------------------------------------------
-- 9. TABLA: reservas (CUS-02 / RN-02, RN-03: Disponibilidad y Pago Inicial)
-- ------------------------------------------------------------------------------
CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_reserva VARCHAR(30) NOT NULL UNIQUE COMMENT='Ej: #RES-2024-0884',
    cotizacion_id INT NOT NULL UNIQUE,
    cliente_id INT NOT NULL,
    codigo_orden_despacho VARCHAR(30) NOT NULL UNIQUE COMMENT='Ej: #OD-2024-884',
    fecha_evento_inicio DATE NOT NULL,
    fecha_evento_fin DATE NOT NULL,
    locacion_entrega VARCHAR(255) NOT NULL,
    anticipo_pagado DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    saldo_pendiente DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    estado_financiero ENUM('anticipo_pagado', 'saldo_completo', 'liquidado_con_garantia') DEFAULT 'anticipo_pagado',
    estado_operativo ENUM('confirmada', 'en_preparacion', 'despachada', 'en_sitio', 'devuelta_parcial', 'devuelta_total', 'completada', 'cancelada') DEFAULT 'confirmada',
    bloqueo_inventario_activo BOOLEAN DEFAULT TRUE,
    firma_digital_aprobador VARCHAR(100) DEFAULT NULL,
    fecha_confirmacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reservas confirmadas y vinculadas a orden de despacho';

-- ------------------------------------------------------------------------------
-- 10. TABLA: detalle_reserva
-- ------------------------------------------------------------------------------
CREATE TABLE detalle_reserva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reserva_id INT NOT NULL,
    articulo_id INT NOT NULL,
    cantidad_reservada INT NOT NULL,
    cantidad_entregada INT NOT NULL DEFAULT 0,
    cantidad_devuelta INT NOT NULL DEFAULT 0,
    estado_bloqueo ENUM('bloqueado', 'despachado', 'retornado', 'en_revision') DEFAULT 'bloqueado',
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Líneas de mobiliario comprometidas por reserva';

-- ------------------------------------------------------------------------------
-- 11. TABLA: despachos_rutas (CUS-04 / RF-21 a RF-28: Logística y Transporte)
-- ------------------------------------------------------------------------------
CREATE TABLE despachos_rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ruta VARCHAR(30) NOT NULL UNIQUE,
    reserva_id INT NOT NULL,
    courier_usuario_id INT DEFAULT NULL,
    vehiculo_placa VARCHAR(20) DEFAULT NULL,
    tipo_vehiculo VARCHAR(50) DEFAULT 'Camión Fuso 5 Tn',
    direccion_destino VARCHAR(255) NOT NULL,
    referencia_ubicacion VARCHAR(255) DEFAULT NULL,
    fecha_salida_programada DATETIME NOT NULL,
    fecha_retorno_programada DATETIME NOT NULL,
    fecha_entrega_real DATETIME DEFAULT NULL,
    fecha_recojo_real DATETIME DEFAULT NULL,
    responsable_recepcion VARCHAR(120) DEFAULT NULL COMMENT='RN-05: Nombre del responsable de recepción en sitio',
    dni_responsable_recepcion VARCHAR(20) DEFAULT NULL,
    firma_digital_recepcion TEXT DEFAULT NULL,
    acta_entrega_firmada BOOLEAN DEFAULT FALSE,
    acta_recojo_firmada BOOLEAN DEFAULT FALSE,
    estado_ruta ENUM('programada', 'en_carga', 'en_transito', 'entregado', 'pendiente_recojo', 'recolectado', 'en_almacen_retorno') DEFAULT 'programada',
    observaciones_logistica TEXT DEFAULT NULL,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE RESTRICT,
    FOREIGN KEY (courier_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Control de rutas, entrega y recojo logístico';

-- ------------------------------------------------------------------------------
-- 12. TABLA: incidencias_transporte (RF-27 / RF-28)
-- ------------------------------------------------------------------------------
CREATE TABLE incidencias_transporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    despacho_id INT NOT NULL,
    tipo_incidencia ENUM('retraso_trafico', 'falla_mecanica', 'clima_adverso', 'direccion_inaccesible', 'dano_en_ruta', 'faltante_en_carga', 'otro') NOT NULL,
    descripcion TEXT NOT NULL,
    nivel_gravedad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    accion_inmediata TEXT DEFAULT NULL,
    reportado_por_id INT NOT NULL,
    fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (despacho_id) REFERENCES despachos_rutas(id) ON DELETE CASCADE,
    FOREIGN KEY (reportado_por_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de incidencias en ruta o entrega';

-- ------------------------------------------------------------------------------
-- 13. TABLA: inspecciones_mantenimiento (CUS-05 / RN-06: Revisión y Taller)
-- ------------------------------------------------------------------------------
CREATE TABLE inspecciones_mantenimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ficha VARCHAR(30) NOT NULL UNIQUE COMMENT='Ej: #T-104',
    reserva_id INT NOT NULL,
    articulo_id INT NOT NULL,
    cantidad_afectada INT NOT NULL DEFAULT 1,
    tipo_danio ENUM('rasgadura_tela', 'abolladura_estructura', 'mancha_textil', 'rotura_cristaleria', 'quemadura', 'piezas_faltantes', 'desgaste_operativo') NOT NULL,
    nivel_severidad ENUM('leve', 'moderado', 'grave', 'perdida_total') NOT NULL,
    costo_reparacion_estimado DECIMAL(10, 2) DEFAULT 0.00,
    fianza_retenida DECIMAL(10, 2) DEFAULT 0.00 COMMENT='Deducible aplicado de la garantía',
    diagnostico_tecnico TEXT NOT NULL,
    acciones_realizadas TEXT DEFAULT NULL,
    tecnico_asignado_id INT NOT NULL,
    estado_ficha ENUM('en_revision', 'en_taller', 'reparado_operativo', 'no_reparable_baja') NOT NULL DEFAULT 'en_revision',
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_salida DATETIME DEFAULT NULL,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE RESTRICT,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE RESTRICT,
    FOREIGN KEY (tecnico_asignado_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Inspección pos-recojo y orden de taller de mantenimiento';

-- ------------------------------------------------------------------------------
-- 14. TABLA: abastecimiento_proveedores (CUS-03 / RF-18 a RF-20)
-- ------------------------------------------------------------------------------
CREATE TABLE abastecimiento_proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_orden_compra VARCHAR(30) NOT NULL UNIQUE COMMENT='Ej: #OC-2024-512',
    articulo_id INT NOT NULL,
    proveedor_nombre VARCHAR(150) NOT NULL,
    cantidad_solicitada INT NOT NULL,
    fecha_meta_entrega DATE NOT NULL,
    prioridad ENUM('normal', 'urgente', 'critica') DEFAULT 'urgente',
    estado ENUM('solicitada', 'en_produccion', 'en_transito_proveedor', 'recibida_almacen', 'cancelada') DEFAULT 'solicitada',
    observaciones TEXT DEFAULT NULL,
    solicitado_por_id INT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (articulo_id) REFERENCES articulos(id) ON DELETE RESTRICT,
    FOREIGN KEY (solicitado_por_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Órdenes de compra y abastecimiento externo';

-- ------------------------------------------------------------------------------
-- 15. TABLA: pagos (CUS-06 / RN-09: Trazabilidad y Comprobantes)
-- ------------------------------------------------------------------------------
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_pago VARCHAR(30) NOT NULL UNIQUE COMMENT='Ej: #PAG-2024-391',
    reserva_id INT NOT NULL COMMENT='RN-09: Todo pago debe estar asociado unívocamente a una reserva',
    cliente_id INT NOT NULL,
    tipo_pago ENUM('anticipo_50', 'saldo_restante', 'deposito_garantia', 'cobro_danos_fianza', 'reembolso_garantia') NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    metodo_pago ENUM('transferencia_bcp', 'transferencia_bbva', 'tarjeta_credito', 'cheque', 'efectivo') NOT NULL,
    operacion_bancaria VARCHAR(50) NOT NULL COMMENT='Ej: #TRF-90218-BCP',
    tipo_comprobante ENUM('factura', 'boleta', 'recibo_caja') NOT NULL,
    numero_comprobante VARCHAR(40) NOT NULL COMMENT='Ej: F001-0892 o B001-1045',
    estado ENUM('pendiente_verificacion', 'confirmado_banco', 'anulado') DEFAULT 'confirmado_banco',
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    verificado_por_id INT NOT NULL,
    archivo_voucher_url VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (verificado_por_id) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro y trazabilidad de pagos y comprobantes fiscales';

-- ------------------------------------------------------------------------------
-- ÍNDICES DE RENDIMIENTO Y OPTIMIZACIÓN
-- ------------------------------------------------------------------------------
CREATE INDEX idx_articulos_sku ON articulos(sku);
CREATE INDEX idx_reservas_fechas ON reservas(fecha_evento_inicio, fecha_evento_fin);
CREATE INDEX idx_reservas_estado ON reservas(estado_operativo);
CREATE INDEX idx_pagos_reserva ON pagos(reserva_id);
CREATE INDEX idx_despachos_fechas ON despachos_rutas(fecha_salida_programada, fecha_retorno_programada);
CREATE INDEX idx_mantenimiento_estado ON inspecciones_mantenimiento(estado_ficha);
