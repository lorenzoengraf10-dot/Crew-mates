/* =========================================================================
   ENVÍO — zonas geográficas + cotización (estimado, tipo Correo Argentino)
   -------------------------------------------------------------------------
   Este archivo es igual en Crewmates y en ROAR: ZONAS_ENVIO es geografía
   (qué provincias caen "cerca" o "lejos" de Carmen de Patagones/Viedma,
   que están a ~30 km entre sí), no depende de qué vende cada negocio.

   Los PRECIOS de cada zona NO están acá — cada sitio los define en su
   propio products.js (TARIFAS_ENVIO), porque cuánto cobrar de envío es
   una decisión de cada negocio, no algo fijo. Actualizarlos ahí no
   requiere tocar este archivo ni pedir ayuda.

   estimateEnvio() es la tabla de referencia — el respaldo que SIEMPRE
   funciona, sin depender de ninguna cuenta externa. Es un precio
   ESTIMADO: como cualquier tabla fija, se puede desactualizar (inflación,
   cambios de tarifa real), por eso conviene revisarla de tanto en tanto y
   por eso el sitio siempre lo aclara como "estimado", nunca como precio
   final. cotizarEnvioReal() es la cotización real contra Correo Argentino
   (MiCorreo), cuando ya se cargaron las credenciales en el servidor (ver
   api/cotizar-envio.js) y el cliente cargó su código postal. site.js
   intenta primero la real y, si no está disponible o falla, usa esta
   tabla — así el sitio nunca se rompe por una cotización real caída.
   ========================================================================= */

const ZONAS_ENVIO = {
  cercania: {
    nombre: "Buenos Aires y Río Negro",
    provincias: ["Buenos Aires", "CABA", "Río Negro"]
  },
  centroCuyo: {
    nombre: "Centro y Cuyo",
    provincias: ["Córdoba", "Santa Fe", "Entre Ríos", "La Pampa", "Mendoza", "San Luis", "San Juan"]
  },
  patagoniaSur: {
    nombre: "Patagonia sur",
    provincias: ["Neuquén", "Chubut", "Santa Cruz", "Tierra del Fuego"]
  },
  norte: {
    nombre: "Norte (NOA/NEA)",
    provincias: [
      "Formosa", "Chaco", "Misiones", "Corrientes", "Salta",
      "Jujuy", "Tucumán", "Santiago del Estero", "Catamarca", "La Rioja"
    ]
  }
};

/* Las 24 provincias, ordenadas alfabéticamente, para el <select> */
const PROVINCIAS_ENVIO = Object.values(ZONAS_ENVIO)
  .flatMap((zona) => zona.provincias)
  .sort((a, b) => a.localeCompare(b, "es"));

/* Devuelve la CLAVE de la zona (ej. "cercania"), no el objeto, para poder
   buscar tanto el nombre (acá) como el precio (en TARIFAS_ENVIO, en el
   products.js de cada sitio) con la misma clave. */
function claveZonaDeProvincia(provincia) {
  const entrada = Object.entries(ZONAS_ENVIO).find(([, zona]) => zona.provincias.includes(provincia));
  return entrada ? entrada[0] : null;
}

/* tarifas viene de products.js (TARIFAS_ENVIO): { [claveZona]: {base, porKgExtra} }.
   Cada sitio pasa el suyo — así el precio es decisión de cada negocio. */
function estimateEnvio(provincia, pesoKg, tarifas) {
  const clave = claveZonaDeProvincia(provincia);
  const zona = clave && ZONAS_ENVIO[clave];
  const tarifa = clave && tarifas && tarifas[clave];
  if (!zona || !tarifa) return Promise.resolve({ ok: false });

  const kgExtra = Math.max(0, Math.ceil(pesoKg - 1));
  const precio = tarifa.base + kgExtra * tarifa.porKgExtra;
  return Promise.resolve({ ok: true, zona: zona.nombre, precio });
}

/* Cotización real contra Correo Argentino (MiCorreo), vía la función
   serverless api/cotizar-envio.js — ahí vive la clave secreta, nunca acá.
   Si no hay credenciales cargadas todavía, o la API de Correo Argentino
   falla por lo que sea (caída, cambio de formato, sin conexión), esto
   devuelve {ok:false} sin tirar ningún error: quien la llama tiene que
   usar estimateEnvio() como respaldo en ese caso. */
function cotizarEnvioReal(cp, pesoKg) {
  return fetch("/api/cotizar-envio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cp, pesoKg })
  })
    .then((r) => (r.ok ? r.json() : { ok: false }))
    .catch(() => ({ ok: false }));
}
