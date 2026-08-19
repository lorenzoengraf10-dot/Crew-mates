/* =========================================================================
   COTIZAR ENVÍO — cotización real contra Correo Argentino (API MiCorreo)
   -------------------------------------------------------------------------
   Esto corre en el servidor (función serverless de Vercel), nunca en el
   navegador del cliente: acá es el único lugar donde viven las claves de
   MiCorreo, que nunca deben aparecer en el código del sitio.

   Para activar la cotización real hay que cargar, en Vercel → Project →
   Settings → Environment Variables:
     MICORREO_USER_TOKEN
     MICORREO_PASSWORD_TOKEN
   (te las da Correo Argentino cuando te registrás gratis en MiCorreo con
   tu CUIT o DNI). Mientras no estén cargadas, o si la API de Correo
   Argentino falla por lo que sea, esta función devuelve { ok: false } y
   el sitio sigue mostrando la tabla de tarifas estimada de siempre — no
   hace falta ningún cambio de código para activarlo más adelante, alcanza
   con cargar las dos claves.

   Referencia de la API: https://www.correoargentino.com.ar/MiCorreo
   ========================================================================= */

const MICORREO_TOKEN_URL = "https://api.correoargentino.com.ar/micorreo/v1/token";
const MICORREO_VALIDATE_URL = "https://api.correoargentino.com.ar/micorreo/v1/users/validate";
const MICORREO_RATES_URL = "https://api.correoargentino.com.ar/micorreo/v1/rates";

const CP_ORIGEN = "8504"; // Carmen de Patagones, Buenos Aires
const PAQUETE_CM = { alto: 15, ancho: 20, largo: 30 }; // caja chica genérica

/* Igual que la tabla de shipping.js: mejor cobrar de más que de menos. */
const MARGEN = 1.1;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const { cp, pesoKg } = req.body || {};
  const userToken = process.env.MICORREO_USER_TOKEN;
  const passwordToken = process.env.MICORREO_PASSWORD_TOKEN;

  if (!cp || !pesoKg || !userToken || !passwordToken) {
    res.status(200).json({ ok: false });
    return;
  }

  try {
    const auth = Buffer.from(`${userToken}:${passwordToken}`).toString("base64");

    const tokenResp = await fetch(MICORREO_TOKEN_URL, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }
    });
    if (!tokenResp.ok) throw new Error("No se pudo obtener el token de MiCorreo");
    const { token } = await tokenResp.json();

    const validateResp = await fetch(MICORREO_VALIDATE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });
    if (!validateResp.ok) throw new Error("No se pudo validar la cuenta de MiCorreo");
    const { customerId } = await validateResp.json();

    const pesoGramos = Math.min(25000, Math.max(1, Math.round(pesoKg * 1000)));

    const ratesResp = await fetch(MICORREO_RATES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        postalCodeOrigin: CP_ORIGEN,
        postalCodeDestination: String(cp),
        deliveredType: "D",
        dimensions: [
          {
            weight: pesoGramos,
            height: PAQUETE_CM.alto,
            width: PAQUETE_CM.ancho,
            length: PAQUETE_CM.largo,
            quantity: 1
          }
        ]
      })
    });
    if (!ratesResp.ok) throw new Error("No se pudo cotizar en MiCorreo");
    const data = await ratesResp.json();

    const tarifaDomicilio = (data.rates || [])
      .filter((r) => r.deliveredType === "D" && typeof r.price === "number")
      .sort((a, b) => a.price - b.price)[0];
    if (!tarifaDomicilio) throw new Error("MiCorreo no devolvió tarifas a domicilio para ese CP");

    res.status(200).json({
      ok: true,
      precio: Math.round(tarifaDomicilio.price * MARGEN),
      servicio: tarifaDomicilio.productName || "Correo Argentino"
    });
  } catch (err) {
    res.status(200).json({ ok: false });
  }
};
