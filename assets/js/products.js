/* =========================================================================
   CREWMATES — CATÁLOGO DE PRODUCTOS
   -------------------------------------------------------------------------
   👉 ESTE ES EL ÚNICO ARCHIVO QUE TENÉS QUE TOCAR PARA CARGAR PRODUCTOS.

   Cómo agregar un producto:
   1. Guardá la foto en la carpeta que corresponda, por ejemplo:
        assets/img/mates/imperial-negro.jpg
   2. Copiá un bloque { ... } de los de abajo y pegalo en su categoría.
   3. Cambiá nombre, precio, descripción y la ruta de la imagen.
   4. Guardá el archivo y listo: la web se actualiza sola.

   Campos de cada producto
   -------------------------------------------------------------------------
   nombre    (texto)     Nombre del producto. OBLIGATORIO.
   sub       (texto)     Subcategoría. Solo se usa en MATES y TERMOS.
                         Mates  -> "criollos" | "calabaza" | "algarrobo"
                         Termos -> "1lt" | "stanley12"
   precio    (número)    Ej: 28000  →  se muestra "$ 28.000".
                         Poné null si preferís "Consultar precio".
   desc      (texto)     Una o dos líneas describiendo el producto.
   img       (texto)     Ruta de la foto. Si la dejás en "" se muestra
                         un placeholder con el logo hasta que la cargues.
   img2      (texto)     OPCIONAL. Una segunda foto del mismo producto.
                         Se ve al abrir la ficha (tocando la foto de la
                         tarjeta), con botones para pasar de una a otra.
   etiqueta  (texto)     OPCIONAL. Ej: "Nuevo", "Último", "Más vendido".
   color     (texto)     OPCIONAL. Color de la etiqueta:
                         "orange" (por defecto) | "green" | "navy"
   detalles  (lista)     OPCIONAL. Puntos que se ven al abrir la ficha.
   agotado   (true)      OPCIONAL. Marca el producto como sin stock.
   sinCuotas (true)      OPCIONAL. Para productos que NO tienen el 20% de
                         descuento por efectivo/transferencia (hoy: las
                         yerbas). En vez del precio con descuento, muestra
                         "No aplican cuotas". Va arriba del todo aunque el
                         producto tenga variantes (es una marca por
                         producto, no por variante ni por categoría).
   nuevo     (true)      OPCIONAL. Lo suma a la sección "Recién llegados",
                         arriba del todo del sitio, además de aparecer en
                         su categoría de siempre (no lo saca de ahí, lo
                         suma en las dos partes). Sacá el "true" (o borrá
                         la línea) cuando el producto deje de ser una
                         novedad. Va arriba del todo aunque el producto
                         tenga variantes.

   variantes (lista)     OPCIONAL. Para el mismo producto en varios colores
                         o tamaños (ej. un termo en 8 colores, una yerba en
                         1 kg y 500 g). Si lo usás, NO pongas precio/desc/
                         img/detalles/agotado arriba: van adentro de cada
                         variante. Arriba solo queda nombre/sub/etiqueta.
                         Cada variante:
                           label    (texto)   Ej: "Negro", "1 kg". OBLIGATORIO.
                           swatch   (texto)   OPCIONAL. Color hex (ej "#1c1a19").
                                    Si lo ponés, se ve como circulito de
                                    color para elegir. Si NO lo ponés, se ve
                                    como pastilla de texto con el label
                                    (para tamaños/pesos en vez de colores).
                           precio, desc, img, img2, detalles, agotado →
                           igual que en un producto normal, pero uno por
                           variante.
                         En la ficha del producto, tocar una variante
                         cambia la foto, el precio y la descripción de
                         arriba. La primera variante de la lista es la que
                         se ve por defecto en la tarjeta del catálogo.
   ========================================================================= */

const CONFIG = {
  /* Número de WhatsApp en formato internacional, sin + ni espacios.
     Argentina: 54 + 9 + característica sin 0 + número sin 15 */
  whatsapp: "5492920340402",
  whatsappVisible: "2920 340402",
  instagram: "https://www.instagram.com/crew.mattes",
  ciudad: "Carmen de Patagones",
  provincia: "Buenos Aires",
  origenCP: "8504",
  moneda: "$",

  /* Datos para que el cliente te transfiera. Se muestran en el último paso
     del pedido, con botón para copiar.

     Si los dejás vacíos, ese paso no aparece: el sitio le dice al cliente
     que el pago se coordina por WhatsApp, y el pedido llega igual. */
  pago: {
    titular: "",
    alias: "",
    cvu: ""
  }
};

/* =========================================================================
   ESTRUCTURA DEL SITIO
   -------------------------------------------------------------------------
   Cada categoría es una sección del catálogo (todas viven en la misma
   página, index.html). De acá salen solos la barra de filtros, la
   navegación de arriba, el footer y los títulos de cada sección.
   Normalmente no hace falta tocar esto: solo si querés cambiar un título,
   un texto o agregar una sección nueva.
   ========================================================================= */
const CATEGORIAS = {
  mates: {
    nombre: "Mates",
    subs: {
      criollos: { corto: "Criollos", nombre: "Criollos" },
      calabaza: { corto: "Calabaza", nombre: "Calabaza" },
      algarrobo: { corto: "Algarrobo", nombre: "Algarrobo" }
    }
  },

  canastas: {
    nombre: "Canastas"
  },

  bombillas: {
    nombre: "Bombillas y bombillones"
  },

  yerbas: {
    nombre: "Yerbas"
  },

  termos: {
    nombre: "Termos",
    subs: {
      "1lt": { corto: "1 litro", nombre: "Termos 1 lt" },
      stanley12: { corto: "Stanley 1,2 lt", nombre: "Termos 1,2 lt Stanley" }
    }
  }
};

/* Nombres cortos de subcategoría para las tarjetas (se arma solo) */
const SUBS = Object.values(CATEGORIAS).reduce((acc, cat) => {
  Object.entries(cat.subs || {}).forEach(([id, sub]) => { acc[id] = sub.corto || sub.nombre; });
  return acc;
}, {});

/* Peso promedio por categoría (kg), para estimar el costo de envío.
   Son cifras de referencia con embalaje incluido — no hace falta pesar
   cada producto, y se pueden ajustar acá si algo queda mal calculado. */
const PESO_CATEGORIA_KG = {
  mates: 0.35,
  canastas: 0.5,
  bombillas: 0.08,
  yerbas: 0.85,
  termos: 0.6
};

/* Cuánto cobrar de envío por zona (estimado, hasta que esté conectada la
   cotización real de Correo Argentino — ver assets/js/shipping.js).
   "base" es el precio hasta 1 kg. "porKgExtra" se suma por cada kg que
   pasa de eso.

   Esto NO sale de ningún lado fijo: son números de referencia. Es
   PERFECTAMENTE VÁLIDO tocarlos cuando quieras — si cambiaron las
   tarifas reales de Correo Argentino, o simplemente porque preferís
   cobrar más o menos de envío. Es tu decisión, no la de nadie más, y no
   hace falta pedir ayuda para editar estos números.

   Las provincias de cada zona están en assets/js/shipping.js (ZONAS_ENVIO):
     cercania     → Buenos Aires, CABA, Río Negro
     centroCuyo   → Córdoba, Santa Fe, Entre Ríos, La Pampa, Mendoza, San Luis, San Juan
     patagoniaSur → Neuquén, Chubut, Santa Cruz, Tierra del Fuego
     norte        → Formosa, Chaco, Misiones, Corrientes, Salta, Jujuy, Tucumán, Santiago del Estero, Catamarca, La Rioja */
const TARIFAS_ENVIO = {
  cercania: { base: 4600, porKgExtra: 1050 },
  centroCuyo: { base: 5600, porKgExtra: 1150 },
  patagoniaSur: { base: 6000, porKgExtra: 1300 },
  norte: { base: 7500, porKgExtra: 1600 }
};

/* =========================================================================
   CLIENTES
   -------------------------------------------------------------------------
   Lo que dicen los que ya compraron. Es lo que más ayuda a que alguien de
   otra provincia se anime a transferirte.

   texto  → la frase, cortita. Tal cual la dijo.
   autor  → el usuario de Instagram o el nombre de pila.
   img    → captura de la historia o foto que mandó. Opcional: si no hay,
            la tarjeta se muestra igual, solo con la frase.

   Si dejás la lista vacía, la sección entera no aparece en el sitio.
   ========================================================================= */
const TESTIMONIOS = [
  {
    texto: "Increíble el bombillón.",
    autor: "@josias_cevalles_9",
    img: "assets/img/clientes/josias.jpg"
  },
  {
    texto: "Un lujo, amigo.",
    autor: "@32luceeroo",
    img: "assets/img/clientes/32luceeroo.jpg"
  }
];

const PRODUCTOS = {

  /* ======================================================================
     MATES  ·  subcategorías: criollos | calabaza | algarrobo
     ====================================================================== */
  mates: [
    /* --- Recién llegados: se muestran primero --- */
    {
      nombre: "Torpedo rey",
      sub: "calabaza",
      etiqueta: "Premium",
      color: "navy",
      nuevo: true,
      variantes: [
        {
          label: "Negro",
          swatch: "#1c1a19",
          precio: 67600,
          desc: "Torpedo calabaza lustrada negra, con virola ancha y base de estrella en alpaca.",
          img: "assets/img/mates/torpedo-rey-negro-1.jpg",
          img2: "assets/img/mates/torpedo-rey-negro-2.jpg",
          detalles: ["Calabaza lustrada negra", "Virola ancha de alpaca", "Base de estrella de alpaca"]
        },
        {
          label: "Marrón",
          swatch: "#a35a2e",
          precio: 67600,
          desc: "Torpedo calabaza lustrada marrón claro, con virola ancha y base de estrella en alpaca.",
          img: "assets/img/mates/torpedo-rey-marron-1.jpg",
          img2: "assets/img/mates/torpedo-rey-marron-2.jpg",
          detalles: ["Calabaza lustrada marrón claro", "Virola ancha de alpaca", "Base de estrella de alpaca"]
        }
      ]
    },
    {
      nombre: "Torpedo base bolitas",
      sub: "calabaza",
      etiqueta: "Premium",
      color: "navy",
      nuevo: true,
      variantes: [
        {
          label: "Negro",
          swatch: "#1c1a19",
          precio: 65000,
          desc: "Torpedo calabaza lustrada negra, con virola ancha y base de bolitas en alpaca.",
          img: "assets/img/mates/torpedo-base-bolitas-negro-1.jpg",
          img2: "assets/img/mates/torpedo-base-bolitas-negro-2.jpg",
          detalles: ["Calabaza lustrada negra", "Virola ancha de alpaca", "Base de bolitas de alpaca"]
        },
        {
          label: "Marrón",
          swatch: "#a35a2e",
          precio: 65000,
          desc: "Torpedo calabaza lisa marrón, con virola ancha y base de bolitas en alpaca.",
          img: "assets/img/mates/torpedo-base-bolitas-marron-1.jpg",
          img2: "assets/img/mates/torpedo-base-bolitas-marron-2.jpg",
          detalles: ["Calabaza lisa marrón", "Virola ancha de alpaca", "Base de bolitas de alpaca"]
        }
      ]
    },
    {
      nombre: "Imperial repujado base bolitas",
      sub: "calabaza",
      precio: 65000,
      etiqueta: "Premium",
      color: "navy",
      nuevo: true,
      desc: "Imperial en cuero negro repujado, con virola cincelada y base de bolitas en alpaca.",
      img: "assets/img/mates/imperial-repujado-base-bolitas-negro-1.jpg",
      img2: "assets/img/mates/imperial-repujado-base-bolitas-negro-2.jpg",
      detalles: ["Cuero repujado negro", "Virola cincelada de alpaca", "Base de bolitas de alpaca"]
    },

    /* --- Criollos: calabaza forma criolla, base de cuero --- */
    {
      nombre: "Mate Galleta",
      sub: "criollos",
      precio: 28600,
      desc: "Mate de calabaza criolla con base de cuero crudo y costura en tiento de potro.",
      img: "assets/img/mates/mate-galleta.jpg",
      detalles: ["Calabaza criolla", "Base de cuero crudo", "Costura en tiento de potro"]
    },
    {
      nombre: "Criollo coquito",
      sub: "criollos",
      precio: 23400,
      desc: "Mate de calabaza criollo con base de cuero con costura trenzada.",
      img: "assets/img/mates/criollo-coquito.jpg",
      detalles: ["Calabaza criolla", "Base de cuero", "Costura trenzada"]
    },
    {
      nombre: "Camionero criollo",
      sub: "criollos",
      precio: 23400,
      desc: "Mate de calabaza criollo con base de cuero con costura trenzada.",
      img: "assets/img/mates/camionero-criollo.jpg",
      detalles: ["Calabaza criolla", "Base de cuero", "Costura trenzada"]
    },

    /* --- Algarrobo: madera maciza --- */
    {
      nombre: "Imperial algarrobo",
      sub: "algarrobo",
      precio: 28600,
      desc: "Mate de algarrobo, con bombilla de regalo.",
      img: "assets/img/mates/imperial-algarrobo.jpg",
      detalles: ["Algarrobo macizo", "Bombilla de regalo"]
    },
    {
      nombre: "Ranchero Blanco",
      sub: "algarrobo",
      precio: 44200,
      desc: "Mate ranchero de algarrobo, cruz con puntos de alpaca. Viene con bombilla de regalo.",
      img: "assets/img/mates/ranchero-blanco.jpg",
      etiqueta: "Nuevo",
      color: "green",
      detalles: ["Algarrobo macizo", "Cruz con puntos de alpaca", "Bombilla de regalo"]
    },
    {
      nombre: "Camionero algarrobo",
      sub: "algarrobo",
      precio: 18200,
      desc: "Camionero de algarrobo, con bombilla de regalo.",
      img: "assets/img/mates/camionero-algarrobo.jpg",
      detalles: ["Algarrobo macizo", "Bombilla de regalo"]
    },
    {
      nombre: "Imperial algarrobo cincelado",
      sub: "algarrobo",
      precio: 32500,
      desc: "Imperial de algarrobo cincelado, con bombilla de regalo.",
      img: "assets/img/mates/imperial-algarrobo-cincelado.jpg",
      detalles: ["Algarrobo macizo", "Virola cincelada", "Bombilla de regalo"]
    },

    /* --- Calabaza: distintos cueros y virolas, cada pieza es única --- */
    {
      nombre: "Imperial cincelado",
      sub: "calabaza",
      variantes: [
        {
          label: "Negro",
          swatch: "#1c1a19",
          precio: 41600,
          desc: "Calabaza forrada en cuero negro, con virola cincelada.",
          img: "assets/img/mates/imperial-cincelado-negro-1.jpg",
          img2: "assets/img/mates/imperial-cincelado-negro-2.jpg",
          detalles: ["Cuero negro", "Virola cincelada"]
        },
        {
          label: "Borravino",
          swatch: "#5c2030",
          precio: 41600,
          desc: "Calabaza forrada en cuero borravino, con virola cincelada.",
          img: "assets/img/mates/imperial-cincelado-borravino-1.jpg",
          img2: "assets/img/mates/imperial-cincelado-borravino-2.jpg",
          detalles: ["Cuero borravino", "Virola cincelada"]
        }
      ]
    },
    {
      nombre: "Torpedo clásico",
      sub: "calabaza",
      precio: 39000,
      desc: "Torpedo forrado en cuero negro, con bombilla de regalo.",
      img: "assets/img/mates/torpedo-clasico.jpg",
      detalles: ["Cuero negro", "Bombilla de regalo"]
    },
    {
      nombre: "Mate imperial",
      sub: "calabaza",
      precio: 39000,
      desc: "Imperial forrado en cuero negro, con guarda de acero y bombilla de regalo.",
      img: "assets/img/mates/imperial-negro.jpg",
      detalles: ["Cuero negro", "Guarda de acero", "Bombilla de regalo"]
    },
    {
      nombre: "Imperial liso borravino",
      sub: "calabaza",
      precio: 39000,
      desc: "Calabaza forrada en cuero liso borravino, con virola cincelada.",
      img: "assets/img/mates/imperial-liso-borravino.jpg",
      detalles: ["Cuero liso borravino", "Virola cincelada"]
    },
    {
      nombre: "Torpedo croco",
      sub: "calabaza",
      etiqueta: "Premium",
      color: "navy",
      variantes: [
        {
          label: "Borravino",
          swatch: "#5c2030",
          precio: 49400,
          desc: "Torpedo en cuero croco borravino, con virola de alpaca cincelada y bombilla de regalo.",
          img: "assets/img/mates/torpedo-croco-borravino.jpg",
          detalles: ["Cuero croco borravino", "Virola de alpaca cincelada", "Bombilla de regalo"]
        },
        {
          label: "Negro",
          swatch: "#1c1a19",
          precio: 49400,
          desc: "Torpedo en cuero croco negro, con bombilla de regalo.",
          img: "assets/img/mates/torpedo-croco-negro.jpg",
          detalles: ["Cuero croco negro", "Bombilla de regalo"]
        }
      ]
    },
    {
      nombre: "Imperial croco negro",
      sub: "calabaza",
      precio: 49400,
      desc: "Imperial en cuero croco negro, con bombilla de regalo.",
      img: "assets/img/mates/imperial-croco-negro.jpg",
      etiqueta: "Premium",
      color: "navy",
      detalles: ["Cuero croco negro", "Bombilla de regalo"]
    },
    {
      nombre: "Imperial croco cincelado",
      sub: "calabaza",
      precio: 49400,
      desc: "Imperial en cuero croco, con virola cincelada y bombilla de regalo.",
      img: "assets/img/mates/imperial-croco-cincelado-1.jpg",
      img2: "assets/img/mates/imperial-croco-cincelado-2.jpg",
      etiqueta: "Premium",
      color: "navy",
      detalles: ["Cuero croco", "Virola cincelada", "Bombilla de regalo"]
    },
    {
      nombre: "Camionero repujado",
      sub: "calabaza",
      variantes: [
        {
          label: "Negro",
          swatch: "#1c1a19",
          precio: 33800,
          desc: "Camionero repujado, virola de acero inoxidable, con bombilla de regalo.",
          img: "assets/img/mates/camionero-repujado-negro.jpg",
          detalles: ["Cuero repujado negro", "Virola de acero inoxidable", "Bombilla de regalo"]
        },
        {
          label: "Borravino",
          swatch: "#5c2030",
          precio: 33800,
          desc: "Camionero repujado, virola de acero inoxidable, con bombilla de regalo.",
          img: "assets/img/mates/camionero-repujado-borravino.jpg",
          detalles: ["Cuero repujado borravino", "Virola de acero inoxidable", "Bombilla de regalo"]
        }
      ]
    }
  ],

  /* ======================================================================
     CANASTAS
     ====================================================================== */
  canastas: [
    {
      nombre: "Matera 2 compartimentos",
      etiqueta: "Premium",
      color: "navy",
      nuevo: true,
      variantes: [
        {
          label: "Avejentada",
          swatch: "#5a3a24",
          precio: 65000,
          desc: "Matera de cuero vacuno avejentado con dos compartimentos, correa ajustable y grabado de sol.",
          img: "assets/img/canastas/matera-2-comp-avejentada-1.jpg",
          detalles: ["100% cuero vacuno avejentado", "Dos compartimentos", "Correa ajustable con hebilla", "Grabado de sol"]
        },
        {
          label: "Negra",
          swatch: "#1c1a19",
          precio: 65000,
          desc: "Matera de cuero vacuno con dos compartimentos, correa ajustable y grabado de sol.",
          img: "assets/img/canastas/matera-2-comp-negra-1.jpg",
          img2: "assets/img/canastas/matera-2-comp-negra-2.jpg",
          detalles: ["100% cuero vacuno", "Dos compartimentos", "Correa ajustable con hebilla", "Grabado de sol"]
        }
      ]
    },
    {
      nombre: "Canasta de cuerina",
      precio: 15000,
      desc: "Canasta matera de cuerina, con dos manijas y divisiones internas.",
      img: "assets/img/canastas/canasta-cuerina.jpg",
      detalles: ["Cuerina", "Dos manijas", "Divisiones internas"]
    },
    {
      nombre: "Canasta 100% cuero",
      precio: 41600,
      desc: "Canasta matera 100% cuero, con dos manijas y divisiones internas.",
      img: "assets/img/canastas/canasta-100-cuero.jpg",
      etiqueta: "Premium",
      color: "navy",
      detalles: ["100% cuero", "Dos manijas", "Divisiones internas"]
    }
  ],

  /* ======================================================================
     BOMBILLAS Y BOMBILLONES
     ====================================================================== */
  bombillas: [
    {
      nombre: "Bombillón recto Purinox",
      precio: 36400,
      desc: "Bombillón recto de acero inoxidable Purinox, con filtro grande.",
      img: "assets/img/bombillas/bombillon-recto-purinox-1.jpg",
      img2: "assets/img/bombillas/bombillon-recto-purinox-2.jpg",
      etiqueta: "Nuevo",
      nuevo: true,
      detalles: [
        "Acero inoxidable Purinox",
        "Caña recta",
        "Filtro grande"
      ]
    },
    {
      nombre: "Bombilla pico de loro",
      precio: 8500,
      desc: "Bombilla pico de loro de acero inoxidable.",
      img: "assets/img/bombillas/pico-de-loro.jpg",
      detalles: [
        "Acero inoxidable 304",
        "Pico de loro"
      ]
    },
    {
      nombre: "Bombillón pico del rey",
      precio: 36400,
      desc: "Bombillón premium de alpaca, pico de rey.",
      img: "assets/img/bombillas/bombillon-pico-del-rey.jpg",
      detalles: [
        "Alpaca",
        "Terminación premium"
      ]
    },
    {
      nombre: "Bombillón recto de alpaca",
      precio: 36400,
      desc: "Bombillón de alpaca con caña recta. Mide 18 cm aproximadamente.",
      img: "assets/img/bombillas/bombillon-recto-alpaca.jpg",
      detalles: [
        "Alpaca",
        "Caña recta",
        "18 cm aproximadamente"
      ]
    },
    {
      nombre: "Bombillón premium curvo",
      precio: 36400,
      desc: "Bombillón de alpaca y bronce, con caña curva.",
      img: "assets/img/bombillas/bombillon-premium-curvo.jpg",
      detalles: [
        "Alpaca y bronce",
        "Caña curva",
        "Terminación premium"
      ]
    },
    {
      nombre: "Bombillón pico de loro de alpaca y bronce",
      precio: 36400,
      desc: "Bombillón de alpaca y bronce, pico de loro. Mide 18 cm aproximadamente.",
      img: "assets/img/bombillas/bombillon-pico-de-loro-alpaca-bronce.jpg",
      detalles: [
        "Alpaca y bronce",
        "Pico de loro",
        "18 cm aproximadamente"
      ]
    },
  ],

  /* ======================================================================
     YERBAS Y YERBERAS
     ====================================================================== */
  yerbas: [
    {
      nombre: "Yerbera de gamuza premium 500g",
      etiqueta: "Premium",
      color: "navy",
      nuevo: true,
      variantes: [
        {
          label: "Negra",
          swatch: "#1c1a19",
          precio: 18200,
          desc: "Yerbera de gamuza premium, cierre con cremallera. Capacidad 500 g.",
          img: "assets/img/yerbas/yerbera-gamuza-negra.jpg",
          detalles: ["Gamuza premium", "Cierre con cremallera", "Capacidad 500 g"]
        },
        {
          label: "Camel",
          swatch: "#c9a15a",
          precio: 18200,
          desc: "Yerbera de gamuza premium, cierre con cremallera. Capacidad 500 g.",
          img: "assets/img/yerbas/yerbera-gamuza-camel.jpg",
          detalles: ["Gamuza premium", "Cierre con cremallera", "Capacidad 500 g"]
        }
      ]
    },
    {
      nombre: "Verdecita",
      sinCuotas: true,
      variantes: [
        {
          label: "1 kg",
          precio: 7500,
          desc: "Yerba mate elaborada despalada, padrón uruguayo.",
          img: "assets/img/yerbas/verdecita-1kg.jpg",
          detalles: ["1 kg", "Elaborada despalada", "Padrón uruguayo"]
        },
        {
          label: "500 g",
          precio: 4500,
          desc: "Yerba mate elaborada despalada, padrón uruguayo.",
          img: "assets/img/yerbas/verdecita-500g.jpg",
          detalles: ["500 g", "Elaborada despalada", "Padrón uruguayo"]
        }
      ]
    },
    {
      nombre: "Yerba Barão",
      precio: 8000,
      sinCuotas: true,
      desc: "Erva-mate tipo uruguayo, importada de Brasil.",
      img: "assets/img/yerbas/barao.jpg",
      detalles: ["1 kg", "Tipo uruguayo", "Origen Brasil"]
    },
    {
      nombre: "Yerba Mate Latina 1 kg",
      precio: 7500,
      sinCuotas: true,
      desc: "Mate intenso y cremoso, con molienda fina estilo uruguayo y sabor herbal bien marcado.",
      img: "assets/img/yerbas/latina-1kg.jpg",
      etiqueta: "Nuevo",
      color: "green",
      detalles: ["1 kg", "Molienda fina", "Estilo uruguayo"]
    },
    {
      nombre: "Centenaria 1 kg",
      precio: 8000,
      sinCuotas: true,
      desc: "Yerba brasileña Seleme Centenaria Original, para un mate más intenso y diferente al argentino clásico.",
      img: "assets/img/yerbas/centenaria-1kg.jpg",
      detalles: ["1 kg", "Origen Brasil"]
    }
  ],

  /* ======================================================================
     TERMOS  ·  subcategorías: 1lt | stanley12
     ====================================================================== */
  termos: [
    {
      nombre: "Termo media manija acero inox",
      sub: "1lt",
      precio: 26000,
      desc: "Termo media manija de acero inoxidable, terminación natural.",
      img: "assets/img/termos/media-manija-acero.jpg",
      detalles: ["Acero inoxidable", "Con manija", "Pico cebador"]
    },
    {
      nombre: "Termo media manija negro",
      sub: "1lt",
      precio: 28600,
      desc: "Termo media manija de acero inox, color negro.",
      img: "assets/img/termos/media-manija-negro.jpg",
      detalles: ["Acero inoxidable", "Color negro", "Con manija", "Pico cebador"]
    },
    /* Stanley System 1,2 lt: mismo termo, cambia solo el color */
    {
      nombre: "Stanley System",
      sub: "stanley12",
      etiqueta: "Original",
      color: "navy",
      variantes: [
        {
          label: "Negro",
          swatch: "#1c1a19",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color negro.",
          img: "assets/img/termos/stanley-negro.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        },
        {
          label: "Blanco",
          swatch: "#f2f0eb",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color blanco.",
          img: "assets/img/termos/stanley-blanco.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        },
        {
          label: "Rosa",
          swatch: "#e8a7b8",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color rosa.",
          img: "assets/img/termos/stanley-rosa.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        },
        {
          label: "Naranja",
          swatch: "#e2631f",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color naranja.",
          img: "assets/img/termos/stanley-naranja.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        },
        {
          label: "Gris",
          swatch: "#8a8d90",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color gris.",
          img: "assets/img/termos/stanley-gris.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        },
        {
          label: "Menta",
          swatch: "#a8d5c8",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color menta.",
          img: "assets/img/termos/stanley-menta.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        },
        {
          label: "Turquesa",
          swatch: "#3e9aa8",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color turquesa.",
          img: "assets/img/termos/stanley-turquesa.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        },
        {
          label: "Cobre",
          swatch: "#b56f47",
          precio: 39000,
          desc: "Termo Stanley System 1,2 litros, pico cebador, color cobre.",
          img: "assets/img/termos/stanley-cobre.jpg",
          detalles: ["1,2 litros", "Pico cebador", "Producto original Stanley"]
        }
      ]
    }
  ]

};
