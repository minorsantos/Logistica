/**
 * SISTEMA WEB PARA LA GESTIÓN LOGÍSTICA DE CASA MARSHALL
 * js/data.js - Mocks iniciales y Gestor de Almacenamiento Local (LocalStorage)
 * Simula API y persistencia en tiempo real para todos los módulos.
 */

const STORAGE_KEYS = {
    USUARIOS: 'cm_usuarios',
    CURRENT_USER: 'cm_current_user',
    CLIENTES: 'cm_clientes',
    ARTICULOS: 'cm_articulos',
    INVENTARIO: 'cm_inventario',
    SOLICITUDES: 'cm_solicitudes',
    COTIZACIONES: 'cm_cotizaciones',
    RESERVAS: 'cm_reservas',
    DESPACHOS: 'cm_despachos',
    INCIDENCIAS: 'cm_incidencias',
    MANTENIMIENTO: 'cm_mantenimiento',
    ABASTECIMIENTO: 'cm_abastecimiento',
    PAGOS: 'cm_pagos'
};

// -----------------------------------------------------------------------------
// 1. USUARIOS Y ROLES (RBAC: Administrador, Ventas, Almacén, Logística, Mantenimiento, Cliente, Courier)
// -----------------------------------------------------------------------------
const INITIAL_USUARIOS = [
    {
        id: 1,
        nombre: 'Valeria Mendoza',
        cargo: 'Jefa de Operaciones',
        email: 'valeria.mendoza@casamarshall.pe',
        rol: 'administrador', // AS-06
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        telefono: '+51 987 654 321',
        sede: 'Sede Central - Almacén Lurín'
    },
    {
        id: 2,
        nombre: 'Carlos Huamán R.',
        cargo: 'Ejecutivo Comercial & Cuadrilla',
        email: 'carlos.huaman@casamarshall.pe',
        rol: 'ventas', // AS-03
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        telefono: '+51 976 543 210',
        sede: 'Sede Central - Almacén Lurín'
    },
    {
        id: 3,
        nombre: 'Jorge Salazar',
        cargo: 'Jefe de Almacén Lurín',
        email: 'jorge.salazar@casamarshall.pe',
        rol: 'almacen', // AS-04
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        telefono: '+51 965 432 109',
        sede: 'Sede Central - Almacén Lurín'
    },
    {
        id: 4,
        nombre: 'Miguel Ángel Torres',
        cargo: 'Coordinador de Rutas y Logística',
        email: 'miguel.torres@casamarshall.pe',
        rol: 'logistica', // AS-05
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        telefono: '+51 954 321 098',
        sede: 'Sede Central - Almacén Lurín'
    },
    {
        id: 5,
        nombre: 'Raúl Benítez',
        cargo: 'Técnico Especialista de Taller',
        email: 'raul.benitez@casamarshall.pe',
        rol: 'mantenimiento', // AS-10
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        telefono: '+51 943 210 987',
        sede: 'Taller & Lavado Lurín'
    },
    {
        id: 6,
        nombre: 'Rodrigo Morales',
        cargo: 'Director Creativo - Corporación Gourmet',
        email: 'rmorales@gourmeteventos.pe',
        rol: 'cliente', // AS-01 / AS-02
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        telefono: '+51 932 109 876',
        empresa: 'Corporación Gourmet & Eventos S.A.C.',
        ruc: '20549823411'
    },
    {
        id: 7,
        nombre: 'Transportes & Carga Express Sur',
        cargo: 'Conductor Asignado (Placa B2Z-891)',
        email: 'despacho@cargaexpress.pe',
        rol: 'courier', // AS-08 / AS-09
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        telefono: '+51 921 098 765',
        unidad: 'Camión Fuso 5 Tn (B2Z-891)'
    }
];

// -----------------------------------------------------------------------------
// 2. CLIENTES REGISTRADOS (RN-01: Registro Mandatorio previo a solicitudes)
// -----------------------------------------------------------------------------
const INITIAL_CLIENTES = [
    {
        id: 1,
        tipoDocumento: 'RUC',
        numeroDocumento: '20549823411',
        razonSocial: 'Corporación Gourmet & Eventos S.A.C.',
        contactoNombre: 'Rodrigo Morales',
        contactoTelefono: '+51 932 109 876',
        contactoEmail: 'rmorales@gourmeteventos.pe',
        direccion: 'Av. Primavera 1280, Of. 402, Surco, Lima',
        categoria: 'corporativo',
        estado: 'activo'
    },
    {
        id: 2,
        tipoDocumento: 'RUC',
        numeroDocumento: '20601984210',
        razonSocial: 'Agencia Brand & Co S.A.C.',
        contactoNombre: 'Silvia Arana',
        contactoTelefono: '+51 998 712 345',
        contactoEmail: 'sarana@brandco.pe',
        direccion: 'Calle Los Pinos 550, Miraflores, Lima',
        categoria: 'agencia_b2b',
        estado: 'activo'
    },
    {
        id: 3,
        tipoDocumento: 'RUC',
        numeroDocumento: '20100047218',
        razonSocial: 'Grupo Credicorp S.A.',
        contactoNombre: 'Mateo Alarcón',
        contactoTelefono: '+51 945 612 890',
        contactoEmail: 'malarcon@credicorp.pe',
        direccion: 'Calle Centenario 156, La Molina, Lima',
        categoria: 'corporativo',
        estado: 'activo'
    },
    {
        id: 4,
        tipoDocumento: 'DNI',
        numeroDocumento: '44891230',
        razonSocial: 'Camila Ferrand & Matías Grau',
        contactoNombre: 'Camila Ferrand (Wedding Planner: M. Alarcón)',
        contactoTelefono: '+51 981 234 567',
        contactoEmail: 'camila.ferrand@gmail.com',
        direccion: 'Malecón Cisneros 920, Dpto 801, Miraflores',
        categoria: 'particular',
        estado: 'activo'
    },
    {
        id: 5,
        tipoDocumento: 'RUC',
        numeroDocumento: '20130635503',
        razonSocial: 'Universidad de Lima',
        contactoNombre: 'Lic. Gonzalo Barreda',
        contactoTelefono: '+51 993 456 789',
        contactoEmail: 'eventos@ulima.edu.pe',
        direccion: 'Av. Javier Prado Este 4600, Surco, Lima',
        categoria: 'institucional',
        estado: 'activo'
    },
    {
        id: 6,
        tipoDocumento: 'RUC',
        numeroDocumento: '20508934112',
        razonSocial: 'Embajada de Francia en el Perú',
        contactoNombre: 'Jean-Luc Moreau',
        contactoTelefono: '+51 977 889 900',
        contactoEmail: 'protocolo.lima@diplomatie.gouv.fr',
        direccion: 'Av. Arequipa 3415, San Isidro, Lima',
        categoria: 'vip',
        estado: 'activo'
    }
];

// -----------------------------------------------------------------------------
// 3. CATÁLOGO DE ARTÍCULOS Y MOBILIARIO
// -----------------------------------------------------------------------------
const INITIAL_ARTICULOS = [
    {
        id: 1,
        sku: 'TLD-1530',
        nombre: 'Toldo Panorámico 15×30m',
        categoria: 'carpas',
        categoriaNombre: 'Carpas & Toldos',
        descripcion: 'Estructura de aluminio anodizado reforzado, lona ignífuga impermeable traslúcida con tensores de alta resistencia.',
        tarifaDiaria: 850.00,
        valorReposicion: 14500.00,
        ubicacion: 'Nave B - Bahía 4',
        stockTotal: 4,
        imagen: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
        disponibles: 2,
        enEvento: 1,
        enTaller: 1,
        deBaja: 0,
        enRevision: 0,
        lote: 'Lote Estructural A1',
        specs: '15×30m • Capacidad ~400 personas • Resistencia viento 60 km/h'
    },
    {
        id: 2,
        sku: 'SIL-TIF-01',
        nombre: 'Silla Tiffany Dorada Clásica',
        categoria: 'sillas',
        categoriaNombre: 'Sillas & Asientos',
        descripcion: 'Madera de haya laqueada dorada metalizada al horno, incluye cojín tapizado marfil de alta densidad lavable.',
        tarifaDiaria: 3.80,
        valorReposicion: 65.00,
        ubicacion: 'Nave A - Rack 12',
        stockTotal: 800,
        imagen: 'https://images.unsplash.com/photo-1506898667547-42e22a468add?w=500&auto=format&fit=crop&q=80',
        disponibles: 250,
        enEvento: 500,
        enTaller: 35,
        deBaja: 15,
        enRevision: 0,
        lote: 'Lote Especial Bodas',
        specs: 'Madera maciza de haya • Carga máx 150 kg • Apilable x8'
    },
    {
        id: 3,
        sku: 'SIL-CB01',
        nombre: 'Silla Crossback Nogal',
        categoria: 'sillas',
        categoriaNombre: 'Sillas & Asientos',
        descripcion: 'Madera maciza de olmo tintada nogal rústico campestre, respaldo cruceta ergonómico y asiento de ratán natural tejido.',
        tarifaDiaria: 4.50,
        valorReposicion: 72.00,
        ubicacion: 'Nave A - Rack 08',
        stockTotal: 600,
        imagen: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=500&auto=format&fit=crop&q=80',
        disponibles: 150,
        enEvento: 430,
        enTaller: 15,
        deBaja: 5,
        enRevision: 0,
        lote: 'Lote Rústico Premium',
        specs: 'Madera maciza olmo • Respaldo cruz curvado • Acabado mate'
    },
    {
        id: 4,
        sku: 'MES-RD18',
        nombre: 'Mesa Banquetería 1.80m',
        categoria: 'mesas',
        categoriaNombre: 'Mesas & Banquetería',
        descripcion: 'Capacidad recomendada 10 comensales. Base de acero plegable de alta durabilidad con tablero fenólico hidrófugo.',
        tarifaDiaria: 18.00,
        valorReposicion: 280.00,
        ubicacion: 'Nave C - Pasillo 3',
        stockTotal: 120,
        imagen: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop&q=80',
        disponibles: 45,
        enEvento: 65,
        enTaller: 8,
        deBaja: 2,
        enRevision: 0,
        lote: 'Lote Banquete Central',
        specs: 'Diámetro 180cm • Altura 75cm • Carga 350 kg'
    },
    {
        id: 5,
        sku: 'MES-IMP-24',
        nombre: 'Mesa Redonda Imperial 2.40m',
        categoria: 'mesas',
        categoriaNombre: 'Mesas & Banquetería',
        descripcion: 'Mesa presidencial para 12-14 invitados con pata central tallada en caoba oscura y tablero engrosado biselado.',
        tarifaDiaria: 35.00,
        valorReposicion: 550.00,
        ubicacion: 'Nave C - Bahía 1',
        stockTotal: 40,
        imagen: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
        disponibles: 12,
        enEvento: 25,
        enTaller: 2,
        deBaja: 1,
        enRevision: 0,
        lote: 'Lote Presidencial',
        specs: 'Diámetro 240cm • Acabado Caoba Real • Para 12-14 pax'
    },
    {
        id: 6,
        sku: 'LIV-CH02',
        nombre: 'Sillón Chesterfield Cognac',
        categoria: 'lounge',
        categoriaNombre: 'Salas & Lounge Deco',
        descripcion: 'Tapicería en cuero genuino curtido color cognac encerado, capitoné profundo con tachuelas en bronce envejecido.',
        tarifaDiaria: 95.00,
        valorReposicion: 1850.00,
        ubicacion: 'Nave A - Zona Tapiz',
        stockTotal: 18,
        imagen: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
        disponibles: 6,
        enEvento: 10,
        enTaller: 2,
        deBaja: 0,
        enRevision: 0,
        lote: 'Lote Chesterfield British',
        specs: 'Cuero natural 100% • 3 cuerpos (2.20m largo) • Capitoné artesanal'
    },
    {
        id: 7,
        sku: 'ILU-MM04',
        nombre: 'Lámpara Colgante Mimbre XL',
        categoria: 'iluminacion',
        categoriaNombre: 'Iluminación Cálida & Sonido',
        descripcion: 'Tejido en fibra natural de mimbre 80cm diámetro con cable textil vintage y portalámpara E27 regulable dimmer.',
        tarifaDiaria: 28.00,
        valorReposicion: 190.00,
        ubicacion: 'Nave D - Riel Elec-04',
        stockTotal: 65,
        imagen: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&auto=format&fit=crop&q=80',
        disponibles: 24,
        enEvento: 35,
        enTaller: 5,
        deBaja: 1,
        enRevision: 0,
        lote: 'Lote Boho Chic',
        specs: 'Diámetro 80cm • Fibra trenzada • Bombillo cálido vintage 40W'
    },
    {
        id: 8,
        sku: 'CLF-HG01',
        nombre: 'Calefactor de Exterior Hongo',
        categoria: 'catering',
        categoriaNombre: 'Climatización & Equipamiento',
        descripcion: 'Acero inoxidable 48,000 BTU a gas propano con reflector térmico superior y sistema de corte antivuelco automático.',
        tarifaDiaria: 40.00,
        valorReposicion: 620.00,
        ubicacion: 'Nave B - Zona Gas',
        stockTotal: 30,
        imagen: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
        disponibles: 15,
        enEvento: 12,
        enTaller: 3,
        deBaja: 0,
        enRevision: 0,
        lote: 'Lote Invierno Térmico',
        specs: '48,000 BTU • Radio calor 5m • Ruedas de traslado'
    },
    {
        id: 9,
        sku: 'TLD-DOM10',
        nombre: 'Toldo Domo 10×10m Modular',
        categoria: 'carpas',
        categoriaNombre: 'Carpas & Toldos',
        descripcion: 'Domo estructural con lona ignífuga blanca y acople perimetral sellado, versátil para montajes en jardines y terrazas.',
        tarifaDiaria: 480.00,
        valorReposicion: 8200.00,
        ubicacion: 'Nave B - Bahía 2',
        stockTotal: 6,
        imagen: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=80',
        disponibles: 4,
        enEvento: 2,
        enTaller: 0,
        deBaja: 0,
        enRevision: 0,
        lote: 'Lote Modular Domo',
        specs: '10×10m • Superficie 100m² • Altura cúspide 5.2m'
    },
    {
        id: 10,
        sku: 'CRI-RIE-08',
        nombre: 'Copa Champagne Cristal Riedel',
        categoria: 'catering',
        categoriaNombre: 'Cristalería Fina',
        descripcion: 'Cristal soplado de precisión sin plomo, cáliz alargado para realce de perlage fino de vinos espumosos de alta gama.',
        tarifaDiaria: 1.20,
        valorReposicion: 18.00,
        ubicacion: 'Zona Lavado D-01',
        stockTotal: 1200,
        imagen: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80',
        disponibles: 240,
        enEvento: 900,
        enTaller: 0,
        deBaja: 60,
        enRevision: 0,
        lote: 'Lote Cristalería Gala',
        specs: 'Capacidad 240ml • Cristal austríaco • Cajas de 24 und'
    },
    {
        id: 11,
        sku: 'ILU-EDI-20',
        nombre: 'Guirnalda Edison Retro 20m IP65',
        categoria: 'iluminacion',
        categoriaNombre: 'Iluminación Cálida & Sonido',
        descripcion: 'Cadena de 20 metros con 25 focos LED filamento cálido vintage 2200K estancos para intemperie IP65.',
        tarifaDiaria: 15.00,
        valorReposicion: 110.00,
        ubicacion: 'Nave D - Riel Elec-04',
        stockTotal: 65,
        imagen: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=500&auto=format&fit=crop&q=80',
        disponibles: 40,
        enEvento: 20,
        enTaller: 5,
        deBaja: 0,
        enRevision: 0,
        lote: 'Lote Festoon Cálido',
        specs: '20 metros • 25 focos E27 LED filamento • Enchufe estanco'
    }
];

// -----------------------------------------------------------------------------
// 4. SOLICITUDES Y COTIZACIONES INICIALES (MÓDULO 1)
// -----------------------------------------------------------------------------
const INITIAL_SOLICITUDES = [
    {
        id: 1,
        codigo: '#SOL-2024-1082',
        clienteId: 3,
        clienteNombre: 'Grupo Credicorp S.A.',
        contactoNombre: 'Rodrigo Morales',
        tipoEvento: 'Corporativo Anual',
        nombreEvento: 'Convención de Finanzas Credicorp 2024',
        invitados: 450,
        fechaInicio: '2024-10-24',
        fechaFin: '2024-10-26',
        dias: 3,
        locacion: 'Sede Chorrillos - Campus Financiero',
        distrito: 'Chorrillos',
        horaMontaje: '06:00 AM',
        horaRetiro: '20:00 PM',
        supervisor: 'Carlos Huamán R.',
        totalCotizado: 12450.00,
        estado: 'Aprobado', // Aprobado / Pendiente / Rechazado / En Ruta
        notas: 'Requiere toldo de alta resistencia y sillas Crossback para auditorio central.'
    },
    {
        id: 2,
        codigo: '#SOL-2024-1081',
        clienteId: 4,
        clienteNombre: 'Camila Ferrand & Matías Grau',
        contactoNombre: 'Wedding Planner: M. Alarcón',
        tipoEvento: 'Boda Privada',
        nombreEvento: 'Boda Ferrand - Grau',
        invitados: 350,
        fechaInicio: '2024-10-18',
        fechaFin: '2024-10-20',
        dias: 3,
        locacion: 'Hacienda Mamacona - Jardín Principal',
        distrito: 'Lurín',
        horaMontaje: '14:00 PM (17 Oct)',
        horaRetiro: '08:00 AM (21 Oct)',
        supervisor: 'Carlos Huamán R.',
        totalCotizado: 18920.00,
        estado: 'Pendiente Firma',
        notas: 'Mobiliario rústico de lujo: Crossback nogal, toldo panorámico y salas lounge.'
    },
    {
        id: 3,
        codigo: '#SOL-2024-1079',
        clienteId: 5,
        clienteNombre: 'Universidad de Lima',
        contactoNombre: 'Dpto. Eventos Institucionales',
        tipoEvento: 'Graduación Magna',
        nombreEvento: 'Ceremonia de Graduación Promoción LXIV',
        invitados: 600,
        fechaInicio: '2024-10-18',
        fechaFin: '2024-10-18',
        dias: 1,
        locacion: 'Campus Central - Auditorio Abierto',
        distrito: 'Surco',
        horaMontaje: '05:00 AM',
        horaRetiro: '23:30 PM',
        supervisor: 'Miguel Ángel Torres',
        totalCotizado: 6300.00,
        estado: 'En Ruta',
        notas: 'Sillas Tiffany Doradas y toldo domo de apoyo.'
    },
    {
        id: 4,
        codigo: '#SOL-2024-1077',
        clienteId: 6,
        clienteNombre: 'Embajada de Francia',
        contactoNombre: 'Cancillería Protocolar',
        tipoEvento: 'Cena Diplomática',
        nombreEvento: 'Gala Noche de París',
        invitados: 120,
        fechaInicio: '2024-10-21',
        fechaFin: '2024-10-22',
        dias: 2,
        locacion: 'Residencia Oficial, San Isidro',
        distrito: 'San Isidro',
        horaMontaje: '09:00 AM',
        horaRetiro: '12:00 PM',
        supervisor: 'Carlos Huamán R.',
        totalCotizado: 5180.00,
        estado: 'Aprobado',
        notas: 'Mesas imperiales, cristalería Riedel y living chesterfield.'
    }
];

const INITIAL_COTIZACIONES = [
    {
        id: 1,
        codigo: '#COT-2024-0419',
        solicitudCodigo: '#SOL-2024-1081',
        clienteId: 1,
        clienteNombre: 'Corporación Gourmet & Eventos S.A.C.',
        eventoNombre: 'Boda Hacienda San José',
        fechaInicio: '2024-10-18',
        fechaFin: '2024-10-20',
        dias: 3,
        locacion: 'Valle de Lurín Km 28.5 (Zona Campestre / Jardín)',
        items: [
            { articuloId: 1, sku: 'TLD-1530', nombre: 'Toldo Panorámico 15×30m', cantidad: 1, tarifaDiaria: 850.00, dias: 3, subtotal: 2550.00 },
            { articuloId: 3, sku: 'SIL-CB01', nombre: 'Silla Crossback Nogal', cantidad: 250, tarifaDiaria: 4.50, dias: 3, subtotal: 3375.00 },
            { articuloId: 4, sku: 'MES-RD18', nombre: 'Mesa Banquetería 1.80m', cantidad: 25, tarifaDiaria: 18.00, dias: 3, subtotal: 1350.00 },
            { articuloId: 6, sku: 'LIV-CH02', nombre: 'Sillón Chesterfield Cognac', cantidad: 4, tarifaDiaria: 95.00, dias: 3, subtotal: 1140.00 }
        ],
        subtotalMobiliario: 8415.00,
        transporteMontaje: 650.00,
        garantia: 1683.00, // 20% reembolsable
        igv: 1631.70, // 18% del subtotal
        totalEstimado: 12379.70,
        anticipoRequeridoPorcentaje: 50,
        anticipoMonto: 6189.85,
        estado: 'Borrador Activo', // Borrador Activo, Aceptada por Cliente, Rechazada, Facturada
        validezHoras: 48,
        fechaEmision: '2024-10-16 09:30:00'
    },
    {
        id: 2,
        codigo: '#COT-2024-0412',
        solicitudCodigo: '#SOL-2024-1080',
        clienteId: 2,
        clienteNombre: 'Agencia Brand & Co S.A.C.',
        eventoNombre: 'Cocktail & Lanzamiento Automotriz',
        fechaInicio: '2024-10-18',
        fechaFin: '2024-10-20',
        dias: 3,
        locacion: 'Club Golf Los Inkas, Pabellón Central',
        items: [
            { articuloId: 9, sku: 'TLD-DOM10', nombre: 'Toldo Domo 10×10m Modular', cantidad: 2, tarifaDiaria: 480.00, dias: 3, subtotal: 2880.00 },
            { articuloId: 6, sku: 'LIV-CH02', nombre: 'Living Lounge Moderno (Set)', cantidad: 4, tarifaDiaria: 95.00, dias: 3, subtotal: 1140.00 },
            { articuloId: 3, sku: 'SIL-CB01', nombre: 'Sillas Crossback con Cojín', cantidad: 120, tarifaDiaria: 4.50, dias: 3, subtotal: 1620.00 }
        ],
        subtotalMobiliario: 5640.00,
        transporteMontaje: 650.00,
        garantia: 1128.00,
        igv: 1132.20,
        totalEstimado: 8550.20,
        anticipoRequeridoPorcentaje: 50,
        anticipoMonto: 4275.10,
        anticipoPagado: 3200.00,
        operacionBancaria: '#TRF-90218-BCP',
        estado: 'Aceptada por Cliente',
        validezHoras: 48,
        fechaEmision: '2024-10-15 11:20:00'
    }
];

// -----------------------------------------------------------------------------
// 5. RESERVAS Y ÓRDENES DE DESPACHO (MÓDULO 2 - RN-02, RN-03)
// -----------------------------------------------------------------------------
const INITIAL_RESERVAS = [
    {
        id: 1,
        codigoReserva: '#RES-2024-0884',
        ordenDespacho: '#OD-2024-884',
        cotizacionCodigo: '#COT-2024-0412',
        clienteId: 2,
        clienteNombre: 'Agencia Brand & Co S.A.C.',
        eventoNombre: 'Cocktail & Lanzamiento Automotriz',
        fechaInicio: '2024-10-18',
        fechaFin: '2024-10-20',
        dias: 3,
        locacion: 'Club Golf Los Inkas, Pabellón Central',
        salidaProgramada: 'Vie 18 Oct • 08:30 AM',
        retornoPrevisto: 'Dom 20 Oct • 11:00 AM',
        montoTotal: 8550.20,
        anticipoConfirmado: 3200.00,
        saldoPendiente: 5350.20,
        estadoFinanciero: '50% Confirmado en Banco',
        operacionBancaria: '#TRF-90218-BCP',
        verificadoPor: 'Tesorería & Valeria Mendoza',
        estadoOperativo: 'Pendiente de Bloqueo Almacén', // Pendiente de Bloqueo Almacén, Bloqueado / Despacho Emitido, En Ruta, Concluido
        items: [
            { articuloId: 9, sku: 'TLD-DOM10', nombre: 'Toldo Domo 10×10m Modular', cantidad: 2 },
            { articuloId: 6, sku: 'LIV-CH02', nombre: 'Living Lounge Moderno (Set)', cantidad: 4 },
            { articuloId: 3, sku: 'SIL-CB01', nombre: 'Sillas Crossback con Cojín', cantidad: 120 }
        ],
        fechaCreacion: '2024-10-16 14:00:00'
    },
    {
        id: 2,
        codigoReserva: '#RES-2024-0880',
        ordenDespacho: '#OD-2024-880',
        cotizacionCodigo: '#COT-2024-0401',
        clienteId: 3,
        clienteNombre: 'Grupo Credicorp S.A.',
        eventoNombre: 'Gala Aniversario BCP',
        fechaInicio: '2024-10-19',
        fechaFin: '2024-10-20',
        dias: 2,
        locacion: 'The Westin Lima Hotel & Convention Center',
        salidaProgramada: 'Sáb 19 Oct • 07:00 AM',
        retornoPrevisto: 'Dom 20 Oct • 14:00 PM',
        montoTotal: 15400.00,
        anticipoConfirmado: 7700.00,
        saldoPendiente: 7700.00,
        estadoFinanciero: 'Pagado 100%',
        operacionBancaria: '#TRF-88123-BCP',
        verificadoPor: 'Tesorería',
        estadoOperativo: 'Bloqueado / Despacho Emitido',
        items: [
            { articuloId: 3, sku: 'SIL-CB01', nombre: 'Sillas Crossback Madera', cantidad: 450 },
            { articuloId: 4, sku: 'MES-RD18', nombre: 'Mesas Banquete 1.8m', cantidad: 75 }
        ],
        fechaCreacion: '2024-10-14 10:15:00'
    }
];

// -----------------------------------------------------------------------------
// 6. RUTAS DE DESPACHO Y RECOJO (MÓDULO 4 - RN-05: Responsable de Recepción)
// -----------------------------------------------------------------------------
const INITIAL_DESPACHOS = [
    {
        id: 1,
        codigoRuta: '#DSP-2024-061',
        ordenDespacho: '#OD-2024-880',
        reservaCodigo: '#RES-2024-0880',
        cliente: 'Grupo Credicorp S.A.',
        direccion: 'The Westin Lima Hotel - Calle Las Begonias 450, San Isidro',
        conductor: 'Transportes & Carga Express Sur (B2Z-891)',
        cuadrilla: 'Cuadrilla 2 (Montaje Especial)',
        salidaProgramada: '2024-10-19 07:00',
        retornoProgramado: '2024-10-20 14:00',
        estado: 'En Tránsito', // Programada, En Carga, En Tránsito, Entregado, Retornado
        responsableRecepcion: 'Mateo Alarcón',
        dniRecepcion: '09812456',
        horaEntregaReal: null,
        actaEntregaFirmada: false,
        actaRecojoFirmada: false,
        itemsResumen: '450 Sillas Crossback, 75 Mesas 1.8m'
    },
    {
        id: 2,
        codigoRuta: '#DSP-2024-060',
        ordenDespacho: '#OD-2024-878',
        reservaCodigo: '#RES-2024-0878',
        cliente: 'Universidad de Lima',
        direccion: 'Campus Central - Av. Javier Prado Este 4600, Surco',
        conductor: 'Carga Rápida Lima (A8W-912)',
        cuadrilla: 'Cuadrilla 1',
        salidaProgramada: '2024-10-18 05:00',
        retornoProgramado: '2024-10-18 23:30',
        estado: 'Entregado',
        responsableRecepcion: 'Gonzalo Barreda (Coordinador U.Lima)',
        dniRecepcion: '10293847',
        horaEntregaReal: '2024-10-18 06:45',
        actaEntregaFirmada: true,
        actaRecojoFirmada: false,
        itemsResumen: '500 Sillas Tiffany, 1 Toldo Domo'
    },
    {
        id: 3,
        codigoRuta: '#DSP-2024-059',
        ordenDespacho: '#OD-2024-872',
        reservaCodigo: '#RES-2024-0872',
        cliente: 'Matrimonio Barrenechea',
        direccion: 'Fundo El Haras, Pachacámac',
        conductor: 'Transportes & Carga Express Sur (B2Z-891)',
        cuadrilla: 'Cuadrilla 3',
        salidaProgramada: '2024-10-15 08:00',
        retornoProgramado: '2024-10-17 11:00',
        estado: 'Retornado',
        responsableRecepcion: 'Esteban Barrenechea',
        dniRecepcion: '41209384',
        horaEntregaReal: '2024-10-15 09:30',
        horaRecojoReal: '2024-10-17 12:15',
        actaEntregaFirmada: true,
        actaRecojoFirmada: true,
        itemsResumen: '2 Toldos Panorámicos, 180 Sillas Tiffany, 15 Mesas'
    }
];

const INITIAL_INCIDENCIAS = [
    {
        id: 1,
        despachoCodigo: '#DSP-2024-061',
        tipo: 'retraso_trafico',
        tipoTexto: 'Retraso por Congestión Vehicular',
        gravedad: 'media', // baja, media, alta, critica
        descripcion: 'Cierre parcial en Vía Expresa Paseo de la República causó retraso de 35 minutos en la llegada al hotel.',
        accionInmediata: 'Se notificó a Mateo Alarcón (Credicorp) y se reforzó la cuadrilla de descarga con 2 estibadores de relevo.',
        reportadoPor: 'Miguel Ángel Torres (Logística)',
        fecha: '2024-10-19 07:45'
    }
];

// -----------------------------------------------------------------------------
// 7. INSPECCIÓN Y MANTENIMIENTO (MÓDULO 5 - RN-06: Revisión y Taller)
// -----------------------------------------------------------------------------
const INITIAL_MANTENIMIENTO = [
    {
        id: 1,
        codigoFicha: '#T-104',
        reservaCodigo: '#RES-2024-0872',
        clienteNombre: 'Matrimonio Barrenechea',
        articuloSku: 'SIL-TIF-01',
        articuloNombre: 'Silla Tiffany Dorada Clásica',
        cantidadAfectada: 2,
        tipoDanio: 'abolladura_estructura',
        tipoDanioTexto: 'Fisura en travesaño inferior y raspadura de pintura',
        nivelSeveridad: 'moderado',
        fianzaRetenida: 120.00,
        costoReparacion: 95.00,
        diagnostico: 'Dos sillas presentaron fisuras menores tras el desmontaje. Ingresan al taller de ebanistería y laqueado al horno.',
        accionesRealizadas: 'Pintura y laqueado térmico programado para el 20 de Octubre.',
        tecnicoAsignado: 'Raúl Benítez',
        estado: 'en_taller', // en_revision, en_taller, reparado_operativo, no_reparable_baja
        fechaIngreso: '2024-10-17 14:30',
        fechaEstimadaLiberacion: '2024-10-20 18:00'
    },
    {
        id: 2,
        codigoFicha: '#T-105',
        reservaCodigo: '#RES-2024-0870',
        clienteNombre: 'Agencia Brand & Co S.A.C.',
        articuloSku: 'TLD-1530',
        articuloNombre: 'Toldo Panorámico 15×30m',
        cantidadAfectada: 1,
        tipoDanio: 'rasgadura_tela',
        tipoDanioTexto: 'Rasgadura de lona de 15cm por viento y tensor externo',
        nivelSeveridad: 'leve',
        fianzaRetenida: 350.00,
        costoReparacion: 280.00,
        diagnostico: 'Parche térmico vulcanizado sellado de alta resistencia en cara lateral.',
        accionesRealizadas: 'Termosellado con vulcanizadora industrial y prueba de estanqueidad completada.',
        tecnicoAsignado: 'Raúl Benítez',
        estado: 'reparado_operativo',
        fechaIngreso: '2024-10-14 09:00',
        fechaEstimadaLiberacion: '2024-10-16 16:00'
    }
];

// -----------------------------------------------------------------------------
// 8. SOLICITUDES DE REABASTECIMIENTO EXTERNO (MÓDULO 3)
// -----------------------------------------------------------------------------
const INITIAL_ABASTECIMIENTO = [
    {
        id: 1,
        codigoOC: '#OC-2024-512',
        articuloSku: 'TLD-1530',
        articuloNombre: 'Toldo Estructural 15×30m',
        cantidad: 2,
        proveedor: 'Carpas Industriales del Perú S.A.C.',
        fechaMeta: '2024-12-04',
        prioridad: 'Urgente',
        estado: 'En Producción',
        solicitadoPor: 'Jorge Salazar (Almacén)',
        fecha: '2024-10-15'
    },
    {
        id: 2,
        codigoOC: '#OC-2024-511',
        articuloSku: 'SIL-CB01',
        articuloNombre: 'Silla Crossback Nogal',
        cantidad: 150,
        proveedor: 'Mobiliario & Estructuras B2B',
        fechaMeta: '2024-11-10',
        prioridad: 'Normal',
        estado: 'Solicitada',
        solicitadoPor: 'Jorge Salazar (Almacén)',
        fecha: '2024-10-12'
    }
];

// -----------------------------------------------------------------------------
// 9. PAGOS Y COMPROBANTES (MÓDULO 6 - RN-09: Trazabilidad por Reserva)
// -----------------------------------------------------------------------------
const INITIAL_PAGOS = [
    {
        id: 1,
        codigoPago: '#PAG-2024-391',
        reservaCodigo: '#RES-2024-0884',
        clienteNombre: 'Agencia Brand & Co S.A.C.',
        tipoPago: 'Anticipo 50% (Bloqueo Inventario)',
        monto: 3200.00,
        metodo: 'Transferencia BCP',
        operacionBancaria: '#TRF-90218-BCP',
        tipoComprobante: 'Factura Electrónica',
        numeroComprobante: 'F001-0892',
        estado: 'Confirmado por Banco',
        fechaPago: '2024-10-16 11:42',
        verificadoPor: 'Tesorería & Valeria Mendoza'
    },
    {
        id: 2,
        codigoPago: '#PAG-2024-390',
        reservaCodigo: '#RES-2024-0880',
        clienteNombre: 'Grupo Credicorp S.A.',
        tipoPago: 'Saldo Restante 50%',
        monto: 7700.00,
        metodo: 'Transferencia BCP',
        operacionBancaria: '#TRF-88123-BCP',
        tipoComprobante: 'Factura Electrónica',
        numeroComprobante: 'F001-0888',
        estado: 'Confirmado por Banco',
        fechaPago: '2024-10-14 16:30',
        verificadoPor: 'Tesorería'
    },
    {
        id: 3,
        codigoPago: '#PAG-2024-389',
        reservaCodigo: '#RES-2024-0872',
        clienteNombre: 'Matrimonio Barrenechea',
        tipoPago: 'Retención de Fianza por Daño Menor',
        monto: 120.00,
        metodo: 'Deducción de Garantía',
        operacionBancaria: '#RET-GAR-0872',
        tipoComprobante: 'Recibo de Caja / Deducible',
        numeroComprobante: 'REC-00219',
        estado: 'Confirmado por Banco',
        fechaPago: '2024-10-17 15:10',
        verificadoPor: 'Raúl Benítez (Taller)'
    }
];

// -----------------------------------------------------------------------------
// GESTOR DE ALMACENAMIENTO CENTRALIZADO (StorageManager)
// -----------------------------------------------------------------------------
class StorageManager {
    static init() {
        if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
            this.resetAll();
        }
        // Asegurar usuario activo por defecto (Administrador: Valeria Mendoza)
        if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
            const admin = INITIAL_USUARIOS[0];
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(admin));
        }
    }

    static resetAll() {
        localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USUARIOS[0]));
        localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(INITIAL_CLIENTES));
        localStorage.setItem(STORAGE_KEYS.ARTICULOS, JSON.stringify(INITIAL_ARTICULOS));
        localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(INITIAL_SOLICITUDES));
        localStorage.setItem(STORAGE_KEYS.COTIZACIONES, JSON.stringify(INITIAL_COTIZACIONES));
        localStorage.setItem(STORAGE_KEYS.RESERVAS, JSON.stringify(INITIAL_RESERVAS));
        localStorage.setItem(STORAGE_KEYS.DESPACHOS, JSON.stringify(INITIAL_DESPACHOS));
        localStorage.setItem(STORAGE_KEYS.INCIDENCIAS, JSON.stringify(INITIAL_INCIDENCIAS));
        localStorage.setItem(STORAGE_KEYS.MANTENIMIENTO, JSON.stringify(INITIAL_MANTENIMIENTO));
        localStorage.setItem(STORAGE_KEYS.ABASTECIMIENTO, JSON.stringify(INITIAL_ABASTECIMIENTO));
        localStorage.setItem(STORAGE_KEYS.PAGOS, JSON.stringify(INITIAL_PAGOS));
        console.log('✅ Base de datos simulada en LocalStorage inicializada exitosamente.');
    }

    static get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error al leer ${key} de localStorage:`, e);
            return [];
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            // Disparar evento personalizado de sincronización
            window.dispatchEvent(new CustomEvent('cm_storage_update', { detail: { key, value } }));
            return true;
        } catch (e) {
            console.error(`Error al guardar en ${key}:`, e);
            return false;
        }
    }

    static getCurrentUser() {
        try {
            const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return user ? JSON.parse(user) : INITIAL_USUARIOS[0];
        } catch (e) {
            return INITIAL_USUARIOS[0];
        }
    }

    static setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        window.dispatchEvent(new CustomEvent('cm_user_changed', { detail: user }));
    }
}

// Inicialización automática
StorageManager.init();
