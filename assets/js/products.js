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
   etiqueta  (texto)     OPCIONAL. Ej: "Nuevo", "Último", "Más vendido".
   color     (texto)     OPCIONAL. Color de la etiqueta:
                         "orange" (por defecto) | "green" | "navy"
   detalles  (lista)     OPCIONAL. Puntos que se ven al abrir la ficha.
   agotado   (true)      OPCIONAL. Marca el producto como sin stock.
   ========================================================================= */

const CONFIG = {
  /* Número de WhatsApp en formato internacional, sin + ni espacios.
     Argentina: 54 + 9 + característica sin 0 + número sin 15 */
  whatsapp: "5492920340402",
  whatsappVisible: "2920 340402",
  instagram: "https://www.instagram.com/crew.mattes",
  ciudad: "Carmen de Patagones",
  provincia: "Buenos Aires",
  moneda: "$"
};

/* =========================================================================
   ESTRUCTURA DEL SITIO
   -------------------------------------------------------------------------
   Cada sección es una página aparte. De acá salen solos el menú del inicio,
   la navegación de arriba, el footer y los títulos de cada página.
   Normalmente no hace falta tocar esto: solo si querés cambiar un título,
   un texto o agregar una sección nueva.
   ========================================================================= */
const CATEGORIAS = {
  mates: {
    nombre: "Mates",
    pagina: "mates.html",
    resumen: "Criollos · Calabaza · Algarrobo",
    lead: "Tres familias, tres experiencias distintas. Todos salen curados y con recomendaciones de cuidado.",
    subs: {
      criollos: {
        corto: "Criollos",
        nombre: "Criollos",
        pagina: "mates-criollos.html",
        resumen: "Cuero y virola, para todos los días",
        lead: "El mate de siempre: forrado en cuero, resistente y listo para el uso diario."
      },
      calabaza: {
        corto: "Calabaza",
        nombre: "Calabaza",
        pagina: "mates-calabaza.html",
        resumen: "Naturales, curados a mano",
        lead: "Calabaza natural seleccionada pieza por pieza. Cada mate es distinto al otro."
      },
      algarrobo: {
        corto: "Algarrobo",
        nombre: "Algarrobo",
        pagina: "mates-algarrobo.html",
        resumen: "Madera maciza patagónica",
        lead: "Madera maciza, terminación prolija y sabor neutro. También se pueden grabar."
      }
    }
  },

  canastas: {
    nombre: "Canastas",
    pagina: "canastas.html",
    resumen: "Para llevar el equipo completo",
    lead: "Mate, termo, yerbera y bombilla en un solo viaje. También hay formato bolso."
  },

  bombillas: {
    nombre: "Bombillas y bombillones",
    pagina: "bombillas.html",
    resumen: "Alpaca, acero y bronce",
    lead: "Desde la bombilla de acero de todos los días hasta bombillones de alpaca, rectos y curvos."
  },

  yerbas: {
    nombre: "Yerbas y yerberas",
    pagina: "yerbas.html",
    resumen: "Las bolsas y dónde guardarlas",
    lead: "Yerbas uruguayas y brasileñas, más yerberas para tenerlas siempre a mano."
  },

  termos: {
    nombre: "Termos",
    pagina: "termos.html",
    resumen: "1 lt · 1,2 lt Stanley",
    lead: "Conservación real de temperatura, tapón cebador y garantía de marca.",
    subs: {
      "1lt": {
        corto: "1 litro",
        nombre: "Termos 1 lt",
        pagina: "termos-1-litro.html",
        resumen: "La medida más práctica",
        lead: "El tamaño que entra en cualquier canasta y alcanza para una tarde de mates."
      },
      stanley12: {
        corto: "Stanley 1,2 lt",
        nombre: "Termos 1,2 lt Stanley",
        pagina: "termos-stanley.html",
        resumen: "Originales, con garantía",
        lead: "Stanley original de 1,2 litros: hasta 24 horas de temperatura y garantía de por vida."
      }
    }
  }
};

/* Nombres cortos de subcategoría para las tarjetas (se arma solo) */
const SUBS = Object.values(CATEGORIAS).reduce((acc, cat) => {
  Object.entries(cat.subs || {}).forEach(([id, sub]) => { acc[id] = sub.corto || sub.nombre; });
  return acc;
}, {});

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
    texto: "Compren con los ojos cerrados. Uso y recomiendo.",
    autor: "@cynmiran_0125",
    img: "assets/img/clientes/cynmiran.jpg"
  },
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
    {
      nombre: "Mate criollo forrado en cuero",
      sub: "criollos",
      precio: null,
      desc: "Clásico de todos los días. Forrado en cuero vacuno y con virola de acero.",
      img: "assets/img/mates/criollo-cuero.jpg",
      etiqueta: "Más vendido",
      detalles: [
        "Curado y listo para usar",
        "Virola de acero inoxidable",
        "Base ancha, no se vuelca"
      ]
    },
    {
      nombre: "Mate criollo camionero",
      sub: "criollos",
      precio: null,
      desc: "Boca amplia para cebar tranquilo. Ideal para viajes largos.",
      img: "assets/img/mates/criollo-camionero.jpg",
      detalles: ["Boca ancha", "Cuero cosido a mano"]
    },
    {
      nombre: "Mate de calabaza imperial",
      sub: "calabaza",
      precio: null,
      desc: "Calabaza seleccionada, curada a mano y con guarda de alpaca.",
      img: "assets/img/mates/calabaza-imperial.jpg",
      etiqueta: "Nuevo",
      color: "green",
      detalles: [
        "Calabaza natural curada",
        "Guarda y base de alpaca",
        "Cada pieza es única"
      ]
    },
    {
      nombre: "Mate de calabaza torpedo",
      sub: "calabaza",
      precio: null,
      desc: "Forma alargada, sabor bien concentrado. Un clásico que nunca falla.",
      img: "assets/img/mates/calabaza-torpedo.jpg",
      detalles: ["Curado", "Forma torpedo"]
    },
    {
      nombre: "Mate de algarrobo con virola",
      sub: "algarrobo",
      precio: null,
      desc: "Madera maciza de algarrobo, con virola de acero y terminación lisa.",
      img: "assets/img/mates/algarrobo-virola.jpg",
      detalles: [
        "Algarrobo macizo",
        "No transmite sabor",
        "Se puede grabar con nombre"
      ]
    },
    {
      nombre: "Mate de algarrobo tallado",
      sub: "algarrobo",
      precio: null,
      desc: "Tallado a mano en la Patagonia. Un regalo que se recuerda.",
      img: "assets/img/mates/algarrobo-tallado.jpg",
      etiqueta: "Artesanal",
      color: "navy",
      detalles: ["Tallado artesanal", "Cada mate es distinto"]
    }
  ],

  /* ======================================================================
     CANASTAS
     ====================================================================== */
  canastas: [
    {
      nombre: "Canasta matera de mimbre",
      precio: null,
      desc: "Entra el termo, el mate, la yerbera y la bombilla. Todo en un viaje.",
      img: "assets/img/canastas/canasta-mimbre.jpg",
      etiqueta: "Regalo ideal",
      detalles: ["Mimbre natural", "Manija reforzada", "Interior acolchado"]
    },
    {
      nombre: "Canasta matera con tapa",
      precio: null,
      desc: "Cierre completo para que no se te vuele nada en la playa o el campo.",
      img: "assets/img/canastas/canasta-con-tapa.jpg",
      detalles: ["Tapa con broche", "Espacio para 1 termo de 1 lt"]
    },
    {
      nombre: "Bolso matero",
      precio: null,
      desc: "Formato bolso, más liviano, con correa para cruzar.",
      img: "assets/img/canastas/bolso-matero.jpg",
      detalles: ["Correa regulable", "Bolsillos internos"]
    }
  ],

  /* ======================================================================
     BOMBILLAS Y BOMBILLONES
     ====================================================================== */
  bombillas: [
    {
      nombre: "Bombilla pico de loro",
      precio: 6500,
      desc: "Bombilla pico de loro de acero inoxidable.",
      img: "assets/img/bombillas/pico-de-loro.jpg",
      detalles: [
        "Acero inoxidable 304",
        "Pico de loro"
      ]
    },
    {
      nombre: "Bombillón pico del rey",
      precio: 28000,
      desc: "Bombillón premium de alpaca, pico de rey.",
      img: "assets/img/bombillas/bombillon-pico-del-rey.jpg",
      detalles: [
        "Alpaca",
        "Terminación premium"
      ]
    },
    {
      nombre: "Bombillón recto de alpaca",
      precio: 28000,
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
      precio: 28000,
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
      precio: 28000,
      desc: "Bombillón de alpaca y bronce, pico de loro. Mide 18 cm aproximadamente.",
      img: "assets/img/bombillas/bombillon-pico-de-loro-alpaca-bronce.jpg",
      detalles: [
        "Alpaca y bronce",
        "Pico de loro",
        "18 cm aproximadamente"
      ]
    }
  ],

  /* ======================================================================
     YERBAS Y YERBERAS
     ====================================================================== */
  yerbas: [
    {
      nombre: "Verdecita 1 kg",
      precio: 7500,
      desc: "Yerba mate elaborada despalada, padrón uruguayo.",
      img: "assets/img/yerbas/verdecita-1kg.jpg",
      detalles: ["1 kg", "Elaborada despalada", "Padrón uruguayo"]
    },
    {
      nombre: "Verdecita 500 g",
      precio: 4500,
      desc: "Yerba mate elaborada despalada, padrón uruguayo.",
      img: "assets/img/yerbas/verdecita-500g.jpg",
      detalles: ["500 g", "Elaborada despalada", "Padrón uruguayo"]
    },
    {
      nombre: "Yerba Barão",
      precio: 8000,
      desc: "Erva-mate tipo uruguayo, importada de Brasil.",
      img: "assets/img/yerbas/barao.jpg",
      detalles: ["1 kg", "Tipo uruguayo", "Origen Brasil"]
    },
    {
      nombre: "Yerba Mate Latina 1 kg",
      precio: 7500,
      desc: "Mate intenso y cremoso, con molienda fina estilo uruguayo y sabor herbal bien marcado.",
      img: "assets/img/yerbas/latina-1kg.jpg",
      etiqueta: "Nuevo",
      color: "green",
      detalles: ["1 kg", "Molienda fina", "Estilo uruguayo"]
    },
    {
      nombre: "Centenaria 1 kg",
      precio: 8000,
      desc: "Yerba brasileña Seleme Centenaria Original, para un mate más intenso y diferente al argentino clásico.",
      img: "assets/img/yerbas/centenaria-1kg.jpg",
      detalles: ["1 kg", "Origen Brasil"]
    },
    {
      nombre: "Yerbera de gamuza premium negro",
      precio: 16000,
      desc: "Yerbera gamuzada para 1/2 kg, en color negro.",
      img: "assets/img/yerbas/yerbera-gamuza-negro.jpg",
      etiqueta: "Premium",
      color: "navy",
      detalles: ["Gamuza", "Capacidad 1/2 kg", "Color negro"]
    },
    {
      nombre: "Yerbera de gamuza premium suela",
      precio: 16000,
      desc: "Yerbera gamuzada para 1/2 kg, en color suela.",
      img: "assets/img/yerbas/yerbera-gamuza-suela.jpg",
      etiqueta: "Premium",
      color: "navy",
      detalles: ["Gamuza", "Capacidad 1/2 kg", "Color suela"]
    }
  ],

  /* ======================================================================
     TERMOS  ·  subcategorías: 1lt | stanley12
     ====================================================================== */
  termos: [
    {
      nombre: "Termo 1 lt con tapón cebador",
      sub: "1lt",
      precio: null,
      desc: "Mantiene el agua caliente toda la tarde. Pico cebador de precisión.",
      img: "assets/img/termos/termo-1lt-cebador.jpg",
      etiqueta: "Más vendido",
      detalles: ["1 litro", "Tapón cebador", "Acero inoxidable"]
    },
    {
      nombre: "Termo 1 lt acero mate",
      sub: "1lt",
      precio: null,
      desc: "Terminación mate antideslizante, entra en cualquier canasta.",
      img: "assets/img/termos/termo-1lt-acero-mate.jpg",
      detalles: ["1 litro", "Terminación soft touch"]
    },
    {
      nombre: "Stanley Classic 1,2 lt",
      sub: "stanley12",
      precio: null,
      desc: "El termo que todos quieren. Hasta 24 h de temperatura y garantía de por vida.",
      img: "assets/img/termos/stanley-classic-12lt.jpg",
      etiqueta: "Original",
      color: "navy",
      detalles: [
        "1,2 litros",
        "Hasta 24 h caliente",
        "Garantía de por vida",
        "Producto original"
      ]
    },
    {
      nombre: "Stanley 1,2 lt edición color",
      sub: "stanley12",
      precio: null,
      desc: "Mismo termo de siempre, en colores que se consiguen por temporada.",
      img: "assets/img/termos/stanley-color-12lt.jpg",
      detalles: ["1,2 litros", "Colores limitados", "Consultá stock"]
    }
  ]

};
