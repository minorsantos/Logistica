# 🏛️ Casa Marshall • Event Logistics & Luxury Rentals
> **Sistema Web Centralizado para la Administración de Alquileres, Mobiliario y Flota de Eventos**

[![Version](https://img.shields.io/badge/version-1.0.0--ent-amber.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20ES6%2B-blue.svg)](#)
[![DB](https://img.shields.io/badge/Database-MySQL%208.0%20(3FN)-orange.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20SPA%20%7C%20RBAC-green.svg)](#)

---

## 📌 1. Contexto y Propósito del Proyecto

**Casa Marshall** es una empresa de alta gama dedicada a la realización de eventos y al alquiler de mobiliario exclusivo. Esta plataforma web centraliza y automatiza todo el flujo operativo para eliminar reservas duplicadas, información dispersa y falta de control de inventario:

```mermaid
flowchart LR
    A[Solicitud & Cliente] --> B[Cotizador en Vivo]
    B --> C[Disponibilidad de Flota]
    C --> D[Reserva & Bloqueo]
    D --> E[Despacho & Rutas]
    E --> F[Inspección & Taller]
    F --> G[Cobranzas & Comprobantes]
```

---

## 👥 2. Roles de Usuario y Permisos (RBAC)

El sistema incorpora control de acceso basado en roles con interfaz reactiva y adaptable:

1. **Administrador (`AS-06`)**: Supervisión general, auditoría, KPIs comerciales y aprobación de órdenes.
2. **Personal de Ventas (`AS-03`)**: Registro de solicitudes, cotizador dinámico y verificación de stock.
3. **Personal de Almacén (`AS-04`)**: Control de existencias por nave/bahía, hojas de carga y solicitudes de abastecimiento.
4. **Personal de Logística (`AS-05`)**: Planificación de rutas, asignación de cuadrillas y actas de recepción con DNI.
5. **Técnico de Mantenimiento (`AS-10`)**: Inspección pos-recojo, fichas técnicas (#T), cálculo de fianza y liberación a stock.
6. **Cliente / Empresa Contratante (`AS-01/02`)**: Catálogo en línea, consulta de cotizaciones y comprobantes.
7. **Courier / Empresa de Transporte (`AS-08/09`)**: Asignaciones de carga, confirmación de entregas y reporte de incidencias en ruta.

---

## 📦 3. Módulos de la Aplicación

| Módulo | Casos de Uso / RF | Descripción Principal |
| :--- | :---: | :--- |
| **Panel Ejecutivo** | `AS-06` | Dashboard con 4 KPIs comerciales, matriz de demanda mensual (Octubre 2024), alertas en tiempo real y trazabilidad. |
| **Módulo 1: Solicitudes y Cotizaciones** | `CUS-01 / RF-01 a RF-07` | Wizard de 3 etapas, catálogo interactivo con fotos y cálculo reactivo en vivo (subtotal, transporte S/ 650, garantía 20%, IGV 18%, total y anticipo 50%). |
| **Módulo 2: Gestión de Reservas** | `CUS-02 / RF-08 a RF-13` | Matriz Gantt de ocupación (14 días), detección de sobredemanda crítica, 3 rutas de mitigación en 1 clic y emisión de orden de despacho. |
| **Módulo 3: Control de Inventario** | `CUS-03 / RF-14 a RF-20` | 5 métricas de flota, tabla de existencias con barra multicolor por SKU, análisis Donut interactivo y órdenes a proveedores externos. |
| **Módulo 4: Despacho y Rutas** | `CUS-04 / RF-21 a RF-28` | Monitoreo de rutas, acta de entrega conforme, acta de recojo y bitácora de incidencias viales/climáticas. |
| **Módulo 5: Revisión y Mantenimiento** | `CUS-05 / RF-29 a RF-35` | Inspección pos-recojo en cuarentena, emisión de fichas (#T), aplicación de fianza retenida y liberación de stock. |
| **Módulo 6: Pagos y Comprobantes** | `CUS-06 / RF-36 a RF-42` | Trazabilidad obligatoria por reserva, verificación de transferencias y simulador membretado de Factura/Boleta SUNAT. |

---

## ⚖️ 4. Reglas de Negocio Operativas

- **Registro de Cliente**: Validación mandatoria de registro previo de clientes antes de generar cotizaciones o reservas.
- **Disponibilidad de Stock**: Validación estricta por fecha para evitar sobreventas o duplicidades.
- **Confirmación de Reserva**: Una reserva solo se confirma y bloquea tras verificar el abono del anticipo (mínimo 50%).
- **Control de Inventario**: Toda salida, devolución, reparación o baja actualiza inmediatamente los contadores de stock.
- **Registro de Entrega**: Obligatoriedad de fecha, hora real y firma/DNI del responsable de recepción en locación.
- **Revisión Pos-Recojo**: Artículos retornados ingresan a estado *"En Revisión"* antes de volver a estar *"Disponibles"*.
- **Acceso por Rol**: Interfaz y menús adaptados dinámicamente según el rol autenticado.
- **Trazabilidad de Pagos**: Todo pago está asociado de manera unívoca a un Código de Reserva (#RES).

---

## 📁 5. Estructura de Archivos

```text
Logistica/
├── index.html                  # Estructura principal SPA con sidebar y header
├── .gitignore                  # Exclusiones de archivos del sistema
├── README.md                   # Documentación técnica completa
├── css/
│   └── styles.css              # Paleta corporativa, layout CSS Grid/Flexbox y responsive
├── database/
│   └── schema.sql              # Estructura relacional completa en MySQL 8.0 (15 tablas)
└── js/
    ├── data.js                 # Persistencia en LocalStorage y mocks de datos iniciales
    ├── app.js                  # Enrutador, modales globales, toasts y comandos [Ctrl+K]
    └── modules/
        ├── auth.js             # Lógica RBAC y conmutador de perfiles de usuario
        ├── dashboard.js        # Vista del Panel Ejecutivo
        ├── solicitudes.js      # Módulo 1: Solicitudes y Cotizaciones
        ├── reservas.js         # Módulo 2: Calendario Gantt y Mitigación
        ├── inventario.js       # Módulo 3: Existencias Operativas y Abastecimiento
        ├── logistica.js        # Módulo 4: Rutas, Actas e Incidencias
        ├── mantenimiento.js    # Módulo 5: Taller, Inspección y Fianzas
        └── pagos.js            # Módulo 6: Pagos y Comprobantes Fiscales
```

---

## 💻 6. Cómo Ejecutar Localmente

No requiere Node.js ni compilación externa. Solo abre el proyecto con cualquier navegador moderno o mediante un servidor estático local:

```bash
# Opción con Python:
python -m http.server 8080

# Luego abre en tu navegador:
http://localhost:8080/index.html
```

---

## 🗄️ 7. Base de Datos Relacional (`database/schema.sql`)
Incluye 15 tablas normalizadas en MySQL 8.0:
- `usuarios`
- `clientes`
- `categorias`
- `articulos`
- `inventario_estado`
- `solicitudes`
- `cotizaciones`
- `detalle_cotizacion`
- `reservas`
- `detalle_reserva`
- `despachos_rutas`
- `incidencias_transporte`
- `inspecciones_mantenimiento`
- `abastecimiento_proveedores`
- `pagos`
