/* =========================================================================
   ENVÍO — tabla de tarifas por zona (estimado, tipo Correo Argentino)
   -------------------------------------------------------------------------
   Este archivo es igual en Crewmates y en ROAR: es geografía y tarifas de
   Correo Argentino, no depende de qué vende cada negocio (los dos orígenes
   —Carmen de Patagones y Viedma— están a ~30 km entre sí).

   Son cifras de referencia para 2026. Conviene chequearlas de tanto en
   tanto contra el cotizador público de Correo Argentino, sobre todo por
   la inflación.

   A propósito llevan un margen de ~20-25% arriba de lo que se estima que
   sale realmente: si el número queda un poco alto, el cliente paga de más
   por el envío y no pasa nada grave; si quedara bajo, el negocio termina
   poniendo la diferencia de su bolsillo en cada pedido. Ante la duda,
   mejor pasarse que quedar corto.

   estimateEnvio() siempre devuelve una Promise, aunque hoy resuelva al
   instante desde esta tabla. El día que se quiera conectar una cotización
   real (API de MiCorreo), se reescribe solo el interior de esta función,
   sin tocar nada de lo que la usa en site.js.
   ========================================================================= */

const ZONAS_ENVIO = {
  cercania: {
    nombre: "Buenos Aires y Río Negro",
    provincias: ["Buenos Aires", "CABA", "Río Negro"],
    base: 4600,
    porKgExtra: 1050
  },
  centroCuyo: {
    nombre: "Centro y Cuyo",
    provincias: ["Córdoba", "Santa Fe", "Entre Ríos", "La Pampa", "Mendoza", "San Luis", "San Juan"],
    base: 5600,
    porKgExtra: 1150
  },
  patagoniaSur: {
    nombre: "Patagonia sur",
    provincias: ["Neuquén", "Chubut", "Santa Cruz", "Tierra del Fuego"],
    base: 6000,
    porKgExtra: 1300
  },
  norte: {
    nombre: "Norte (NOA/NEA)",
    provincias: [
      "Formosa", "Chaco", "Misiones", "Corrientes", "Salta",
      "Jujuy", "Tucumán", "Santiago del Estero", "Catamarca", "La Rioja"
    ],
    base: 7500,
    porKgExtra: 1600
  }
};

/* Las 24 provincias, ordenadas alfabéticamente, para el <select> */
const PROVINCIAS_ENVIO = Object.values(ZONAS_ENVIO)
  .flatMap((zona) => zona.provincias)
  .sort((a, b) => a.localeCompare(b, "es"));

function zonaDeProvincia(provincia) {
  return Object.values(ZONAS_ENVIO).find((zona) => zona.provincias.includes(provincia)) || null;
}

function estimateEnvio(provincia, pesoKg) {
  const zona = zonaDeProvincia(provincia);
  if (!zona) return Promise.resolve({ ok: false });

  const kgExtra = Math.max(0, Math.ceil(pesoKg - 1));
  const precio = zona.base + kgExtra * zona.porKgExtra;
  return Promise.resolve({ ok: true, zona: zona.nombre, precio });
}
