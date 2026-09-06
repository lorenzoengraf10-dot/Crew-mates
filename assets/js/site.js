/* =========================================================================
   Crewmates — lógica del sitio
   -------------------------------------------------------------------------
   Este archivo arma el encabezado y el pie de página en TODAS las páginas
   (así los datos de contacto se cambian en un solo lugar) y dibuja el
   catálogo de la sección que corresponda.

   Para cargar productos NO hace falta tocar este archivo: todo se edita
   en assets/js/products.js
   ========================================================================= */

(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */

  const escapar = (txt = "") =>
    String(txt).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  const waLink = (mensaje) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;

  /* Para armar el link directo a un producto: "Mate Galleta" -> "mate-galleta" */
  const slugify = (txt = "") =>
    String(txt)
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const linkProducto = (categoria, producto, variante) =>
    `${location.origin}${location.pathname}#producto=${categoria}:${slugify(producto.nombre)}` +
    (variante ? `:${slugify(variante.label)}` : "");

  /* Para productos con variantes (color, kilaje): la variante "de portada"
     es la primera sin agotado, o la primera de todas si no queda ninguna. */
  function varianteDefault(producto) {
    if (!producto.variantes) return null;
    return producto.variantes.find((v) => !v.agotado) || producto.variantes[0];
  }

  function activarLinksWa(ctx = document) {
    $$("[data-wa]", ctx).forEach((el) => {
      el.setAttribute("href", waLink(el.dataset.wa));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* ---------------------------------------------------------------------
     Analytics (Google Analytics 4)
     ---------------------------------------------------------------------
     Los 3 momentos que le importan al dueño para saber si el catálogo
     funciona: alguien mira la ficha de un producto (view_item), lo agrega
     al pedido (add_to_cart) y manda el pedido armado por WhatsApp
     (generate_lead — no "purchase": todavía no pagó nada, recién ahí
     empieza a hablar con el negocio). Se usan los nombres de evento
     estándar de GA4 para que aparezcan solos en sus reportes de
     ecommerce, con moneda y valor.

     evento() nunca debe romper el sitio si gtag no cargó (bloqueador de
     anuncios, sin conexión a Google, etc.): agregar al carrito o abrir
     una ficha tiene que funcionar igual aunque falle la analítica. */
  const MONEDA_GA = "ARS";

  function evento(nombre, params) {
    if (typeof gtag === "function") gtag("event", nombre, params);
  }

  function itemGA(categoria, producto, variante) {
    const precio = variante ? variante.precio : producto.precio;
    return {
      item_id: slugify(producto.nombre),
      item_name: producto.nombre,
      item_category: (CATEGORIAS[categoria] && CATEGORIAS[categoria].nombre) || categoria,
      item_variant: variante ? variante.label : undefined,
      price: typeof precio === "number" ? precio : undefined,
      quantity: 1
    };
  }

  /* ---------------------------------------------------------------------
     Cartelito de cookies
     ---------------------------------------------------------------------
     index.html arranca "Consent Mode" en denied (ver el script de gtag):
     hasta que el visitante contesta acá, no se guarda nada. La decisión
     queda en localStorage, así no se le vuelve a preguntar en su próxima
     visita. */
  const COOKIES_KEY = "crewmates-cookies";

  function actualizarConsentimiento(otorgado) {
    if (typeof gtag !== "function") return;
    const estado = otorgado ? "granted" : "denied";
    gtag("consent", "update", {
      ad_storage: estado,
      ad_user_data: estado,
      ad_personalization: estado,
      analytics_storage: estado
    });
  }

  function initCookies() {
    const bar = $("[data-cookies]");
    if (!bar) return;

    let guardado = null;
    try { guardado = localStorage.getItem(COOKIES_KEY); } catch {
      /* Sin localStorage (modo privado, etc.): mostramos el cartelito
         igual, simplemente se lo va a volver a preguntar la próxima vez. */
    }

    if (guardado === "aceptado") { actualizarConsentimiento(true); return; }
    if (guardado === "rechazado") return;

    bar.hidden = false;
    document.body.classList.add("cookies-abierto");

    bar.addEventListener("click", (e) => {
      const acepta = e.target.closest("[data-cookies-aceptar]");
      const rechaza = e.target.closest("[data-cookies-rechazar]");
      if (!acepta && !rechaza) return;

      try { localStorage.setItem(COOKIES_KEY, acepta ? "aceptado" : "rechazado"); } catch {
        /* Si no se puede guardar, no pasa nada grave: solo se le va a
           volver a preguntar antes de tiempo. */
      }
      actualizarConsentimiento(!!acepta);
      bar.hidden = true;
      document.body.classList.remove("cookies-abierto");
    });
  }

  /* Bloquear el scroll de fondo mientras el carrito o la ficha están
     abiertos. Un simple "overflow:hidden" en el body no alcanza en Safari
     de iOS (deja scrollear igual y a veces "atrapa" la pantalla): hay que
     fijar el body en su lugar y devolverlo al cerrar. Con contador, por si
     el carrito y la ficha llegaran a estar abiertos a la vez. */
  let bloqueosScroll = 0;
  let scrollGuardado = 0;
  function bloquearScroll() {
    if (bloqueosScroll === 0) {
      scrollGuardado = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollGuardado}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    }
    bloqueosScroll++;
  }
  function desbloquearScroll() {
    bloqueosScroll = Math.max(0, bloqueosScroll - 1);
    if (bloqueosScroll === 0) {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      /* El sitio usa scroll-behavior:smooth (para los links del menú), pero
         acá tiene que ser instantáneo: si no, el salto de vuelta queda
         animando un rato y da la sensación de que la pantalla no responde
         justo al cerrar. */
      const htmlEl = document.documentElement;
      const previo = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollGuardado);
      htmlEl.style.scrollBehavior = previo;
    }
  }

  const formatoPrecio = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

  /* Descuento por pagar en efectivo o transferencia (evita el costo de
     financiar las 3 cuotas sin interés con tarjeta). Se muestra como una
     segunda línea debajo del precio de lista, en tarjeta y en la ficha. */
  const DESCUENTO_EFECTIVO = 0.2;
  const precioEfectivoHTML = (precio, desde) => {
    const conDescuento = Math.round(precio * (1 - DESCUENTO_EFECTIVO));
    const monto = `${CONFIG.moneda} ${formatoPrecio.format(conDescuento)}`;
    return `<small class="oferta">${desde ? "Desde " : ""}<strong>${monto}</strong> con transferencia o efectivo</small>`;
  };
  /* Los productos con sinCuotas:true (ver products.js — hoy son las yerbas
     en sí, no las yerberas ni el resto) no entran en el descuento por
     efectivo/transferencia ni en las cuotas: en vez del precio con
     descuento, se aclara que no aplican cuotas. Es una marca por producto,
     no por categoría, porque una misma categoría puede tener productos con
     descuento y sin descuento a la vez (ej: yerbas y yerberas). */
  const lineaPrecioExtra = (precio, desde, sinCuotas) =>
    sinCuotas
      ? '<small class="sin-cuotas">No aplican cuotas</small>'
      : precioEfectivoHTML(precio, desde);
  /* El mismo 20% de precioEfectivoHTML, aplicado al total del carrito según
     el medio de pago elegido (efectivo/transferencia sí, tarjeta no). */
  const NOMBRE_PAGO = { efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta de crédito" };
  const tieneDescuentoPorPago = (metodoPago) => metodoPago === "efectivo" || metodoPago === "transferencia";
  const conDescuentoSiCorresponde = (monto, metodoPago) =>
    tieneDescuentoPorPago(metodoPago) ? Math.round(monto * (1 - DESCUENTO_EFECTIVO)) : monto;
  /* Total real a cobrar: la parte de categorías sin cuotas (yerbas) nunca
     se descuenta, el resto sí si paga en efectivo/transferencia. */
  const totalConDescuento = (suma, sumaSinDescuento, metodoPago) =>
    sumaSinDescuento + conDescuentoSiCorresponde(suma - sumaSinDescuento, metodoPago);

  const ICONO_WA =
    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.19h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.03-5.1-2.89-6.96A9.77 9.77 0 0 0 12.04 2Zm4.5 13.84c-.25-.13-1.46-.72-1.68-.8-.23-.08-.39-.13-.56.13-.16.24-.64.79-.78.96-.15.16-.29.18-.53.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.25-.02-.38.1-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>';

  const ICONO_IG =
    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.98c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 3.37a4.49 4.49 0 1 1 0 8.98 4.49 4.49 0 0 1 0-8.98Zm0 7.4a2.91 2.91 0 1 0 0-5.82 2.91 2.91 0 0 0 0 5.83Zm5.72-7.6a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0Z"/></svg>';

  const WORDMARK =
    '<span class="brand__line">crew</span><span class="brand__line">mates<i class="brand__dot"></i></span>';

  /* Cartel de cuotas: se repite varias veces en la misma franja para que,
     al hacer loop la animación, no se note el corte (ver .cuotas__track). */
  const CUOTAS_TEXTO = Array(6).fill("3 cuotas sin interés").join(" &nbsp;•&nbsp; ") + " &nbsp;•&nbsp; ";

  /* ---------------------------------------------------------------------
     Encabezado
     --------------------------------------------------------------------- */

  function renderHeader() {
    const cont = $("[data-header]");
    if (!cont) return;

    const items = Object.entries(CATEGORIAS)
      .map(([id, cat]) => `<li class="nav__item"><a href="#cat-${id}">${escapar(cat.nombre)}</a></li>`)
      .join("");

    cont.outerHTML = `
      <header class="header" id="header">
        <div class="wrap header__inner">
          <a class="brand" href="#inicio" aria-label="Crewmates — inicio">
            <img class="brand__logo" src="assets/img/logo.png" alt="Crewmates" width="160" height="180">
            <span class="brand__mark" aria-hidden="true">${WORDMARK}</span>
          </a>

          <nav class="nav" id="nav" aria-label="Secciones del catálogo">
            <ul class="nav__list">
              ${items}
              <li class="nav__item"><a href="#clientes">Clientes</a></li>
              <li class="nav__item"><a href="#contacto">Contacto</a></li>
            </ul>
          </nav>

          <button class="cartbtn" data-cart-open type="button" aria-label="Ver mi pedido">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h-.6a1 1 0 0 1 0-2H8a1 1 0 0 1 .98.8L9.3 4H20a1 1 0 0 1 .97 1.24l-1.7 6.8A2 2 0 0 1 17.33 13.6H9.9l.3 1.4H18a1 1 0 1 1 0 2H9.4a1 1 0 0 1-.98-.8L7 4Zm2.7 2 .8 5.6h6.83l1.4-5.6H9.7ZM10 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/></svg>
            <span class="cartbtn__n" data-cart-count hidden>0</span>
          </button>

          <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <nav class="catnav" id="catnav" aria-label="Filtrar el catálogo">
        <div class="wrap catnav__inner">
          <button class="pill is-active" data-filtro="todos" type="button">Todos</button>
          ${Object.entries(CATEGORIAS)
            .map(([id, cat]) => `<button class="pill" data-filtro="${id}" type="button">${escapar(cat.nombre)}</button>`)
            .join("")}
        </div>
      </nav>

      <div class="cuotas" role="note" aria-label="3 cuotas sin interés">
        <div class="cuotas__track" aria-hidden="true">
          <span>${CUOTAS_TEXTO}</span>
          <span>${CUOTAS_TEXTO}</span>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------------
     Pie de página
     --------------------------------------------------------------------- */

  function renderFooter() {
    const cont = $("[data-footer]");
    if (!cont) return;

    const links = Object.entries(CATEGORIAS)
      .map(([id, cat]) => `<li><a href="#cat-${id}">${escapar(cat.nombre)}</a></li>`)
      .join("");

    cont.outerHTML = `
      <footer class="footer bg-photo" id="contacto" style="background-image:url('assets/img/fondos/footer.jpg')">
        <div class="footer__capa">
        <div class="wrap footer__inner">

          <div class="footer__col footer__brand">
            <img class="footer__logo" src="assets/img/logo-light.png" alt="Crewmates" width="700" height="791" loading="lazy">
            <p class="footer__tag">
              Mates, termos y accesorios.<br>
              Desde ${escapar(CONFIG.ciudad)} para todo el país.
            </p>
            <div class="footer__social">
              <a href="${CONFIG.instagram}" target="_blank" rel="noopener"
                 aria-label="Instagram de Crewmates: @crew.mattes">${ICONO_IG} @crew.mattes</a>
            </div>
          </div>

          <nav class="footer__col" aria-label="Catálogo">
            <h2>Catálogo</h2>
            <ul>${links}</ul>
          </nav>

          <div class="footer__col">
            <h2>Contacto</h2>
            <ul>
              <li><a data-wa="Hola Crewmates! 🧉">WhatsApp ${escapar(CONFIG.whatsappVisible)}</a></li>
              <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram @crew.mattes</a></li>
              <li>Showroom en ${escapar(CONFIG.ciudad)}</li>
              <li>${escapar(CONFIG.provincia)}, Argentina</li>
            </ul>
          </div>

          <div class="footer__col">
            <h2>Envíos y retiro</h2>
            <ul>
              <li>Enviamos a todo el país</li>
              <li>Retiro sin cargo en el showroom</li>
              <li>Coordinamos todo por WhatsApp</li>
            </ul>
            <a class="btn btn--wa footer__wa" data-wa="Hola Crewmates! Quería hacer una consulta 🧉">Escribinos</a>
          </div>
        </div>

        <div class="wrap footer__bottom">
          <p>© <span data-anio></span> Crewmates · ${escapar(CONFIG.ciudad)}, ${escapar(CONFIG.provincia)}</p>
          <p>Mates &amp; accesorios · Hecho con ganas de compartir</p>
        </div>
        </div>
      </footer>

      <div data-carrito></div>

      <a class="fab" data-wa="Hola Crewmates! Quería hacer una consulta 🧉" aria-label="Escribir por WhatsApp">
        ${ICONO_WA}<span class="fab__label">Escribinos</span>
      </a>

      <div class="modal" id="modal" hidden>
        <div class="modal__backdrop" data-close></div>
        <div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button class="modal__close" data-close aria-label="Cerrar">×</button>
          <div class="modal__media">
            <img id="modal-img" src="" alt="">
            <div class="modal__thumbs" id="modal-thumbs" hidden></div>
          </div>
          <div class="modal__body">
            <p class="modal__cat" id="modal-cat"></p>
            <h2 class="modal__title" id="modal-title"></h2>
            <p class="modal__price" id="modal-price"></p>
            <div class="modal__variantes" id="modal-variantes" hidden></div>
            <p class="modal__desc" id="modal-desc"></p>
            <ul class="modal__specs" id="modal-specs"></ul>
            <button type="button" class="btn btn--orange modal__add" id="modal-add" hidden>Agregar al pedido</button>
            <a class="btn btn--wa modal__cta" id="modal-wa">Consultar por WhatsApp</a>
            <button type="button" class="btn btn--ghost modal__share" id="modal-share">Copiar link de este producto</button>
            <p class="modal__note">Te respondemos apenas lo vemos. Coordinamos envío o retiro en el showroom.</p>
          </div>
        </div>
      </div>`;

    const anio = $("[data-anio]");
    if (anio) anio.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     Tarjetas de producto
     --------------------------------------------------------------------- */

  function precioHTML(producto, sinCuotas = producto.sinCuotas) {
    if (producto.variantes) {
      const precios = producto.variantes
        .filter((v) => !v.agotado && typeof v.precio === "number" && v.precio > 0)
        .map((v) => v.precio);
      if (!precios.length) {
        return producto.variantes.every((v) => v.agotado)
          ? '<span class="card__price">Sin stock<small>Consultá reposición</small></span>'
          : '<span class="card__price">A consultar<small>Te pasamos el precio</small></span>';
      }
      const min = Math.min(...precios);
      const desde = min !== Math.max(...precios);
      return `<span class="card__price">${desde ? "Desde " : ""}${CONFIG.moneda} ${formatoPrecio.format(min)}${lineaPrecioExtra(min, desde, sinCuotas)}</span>`;
    }
    if (producto.agotado) {
      return '<span class="card__price">Sin stock<small>Consultá reposición</small></span>';
    }
    if (typeof producto.precio === "number" && producto.precio > 0) {
      return `<span class="card__price">${CONFIG.moneda} ${formatoPrecio.format(producto.precio)}${lineaPrecioExtra(producto.precio, false, sinCuotas)}</span>`;
    }
    return '<span class="card__price">A consultar<small>Te pasamos el precio</small></span>';
  }

  function tarjeta(producto, categoria, indice) {
    const sub = producto.sub ? SUBS[producto.sub] || producto.sub : "";
    const etiqueta = producto.etiqueta
      ? `<span class="card__tag card__tag--${producto.color || "orange"}">${escapar(producto.etiqueta)}</span>`
      : "";

    /* Para un producto con variantes (color/kilaje), la tarjeta muestra la
       de portada (varianteDefault); el color/kilaje se elige recién en la
       ficha, tocando la foto. */
    const variante = varianteDefault(producto);
    const img = variante ? variante.img : producto.img;
    const desc = variante ? variante.desc : producto.desc;

    const mensaje =
      `Hola Crewmates! 🧉 Me interesa: ${producto.nombre}` +
      (sub ? ` (${sub})` : "") + `. ¿Tienen stock?`;

    /* Si el producto tiene más de una variante, mostramos los circulitos de
       color (o pastillas, si es un kilaje en vez de un color) ya en la
       tarjeta, para que se note desde el catálogo que hay más opciones sin
       tener que entrar a la ficha. Tocar uno acá cambia la foto y el precio
       de la tarjeta, y esa es la variante que se agrega si tocás "Agregar
       al pedido" sin abrir la ficha. */
    const variantesHTML =
      producto.variantes && producto.variantes.length > 1
        ? `<div class="card__variantes" aria-label="Colores disponibles">
            ${producto.variantes
              .map((v) => {
                const activa = v === variante;
                const cls = activa ? " is-active" : "";
                const current = activa ? ' aria-current="true"' : "";
                return v.swatch
                  ? `<button type="button" class="card__swatch${cls}" data-variante="${escapar(v.label)}"
                             style="background:${escapar(v.swatch)}" aria-label="${escapar(v.label)}"${current}></button>`
                  : `<button type="button" class="pill pill--sm${cls}" data-variante="${escapar(v.label)}"${current}>${escapar(v.label)}</button>`;
              })
              .join("")}
          </div>`
        : "";

    const art = document.createElement("article");
    art.className = "card";
    art.dataset.categoria = categoria;
    art.dataset.index = indice;
    art.dataset.slug = slugify(producto.nombre);
    art.dataset.variante = variante ? variante.label : "";
    art.dataset.sub = producto.sub || "";

    art.innerHTML = `
      <div class="card__media" data-abrir>
        ${etiqueta}
        <img src="${escapar(img || "")}" alt="${escapar(producto.nombre)}"
             loading="lazy" decoding="async">
      </div>
      <div class="card__body">
        ${sub ? `<span class="card__sub">${escapar(sub)}</span>` : ""}
        <h3 class="card__name">${escapar(producto.nombre)}</h3>
        <p class="card__desc">${escapar(desc || "")}</p>
        ${variantesHTML}
        <div class="card__foot">
          ${precioHTML(producto)}
          <button class="btn card__add" data-agregar type="button">Agregar al pedido</button>
          <a class="card__consulta" data-wa="${escapar(mensaje)}">Consultar por WhatsApp</a>
        </div>
      </div>`;

    const media = $(".card__media", art);
    if (!img) {
      media.classList.add("is-empty");
    } else {
      $("img", media).addEventListener("error", () => media.classList.add("is-empty"), { once: true });
    }

    return art;
  }

  function grilla(lista, categoria, nombreSeccion) {
    const grid = document.createElement("div");
    grid.className = "grid";

    if (!lista.length) {
      grid.innerHTML = `
        <div class="empty">
          <strong>Estamos cargando esta sección</strong>
          Todavía no publicamos los productos de ${escapar(nombreSeccion)}.
          Escribinos y te pasamos fotos y precios al instante.
        </div>`;
      return grid;
    }

    const frag = document.createDocumentFragment();
    lista.forEach(({ producto, indice }) => frag.appendChild(tarjeta(producto, categoria, indice)));
    grid.appendChild(frag);
    return grid;
  }

  /* ---------------------------------------------------------------------
     Menú de secciones del inicio
     --------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------
     Clientes
     Si no hay ninguno cargado, la sección entera no se dibuja: en celular
     un bloque vacío es scroll perdido.
     --------------------------------------------------------------------- */

  function renderTestimonios() {
    const cont = $("[data-testimonios]");
    if (!cont) return;

    const lista = typeof TESTIMONIOS !== "undefined" ? TESTIMONIOS : [];
    const seccion = cont.closest("section");

    if (!lista.length) {
      if (seccion) seccion.remove();
      return;
    }

    cont.innerHTML = lista
      .map(
        (t) => `
        <figure class="testi">
          ${t.img
            ? `<div class="testi__media">
                 <img src="${escapar(t.img)}" alt="Compra de ${escapar(t.autor || "un cliente")}"
                      loading="lazy" decoding="async">
               </div>`
            : ""}
          <blockquote class="testi__texto">${escapar(t.texto)}</blockquote>
          ${t.autor ? `<figcaption class="testi__autor">${escapar(t.autor)}</figcaption>` : ""}
        </figure>`
      )
      .join("");

    /* Si una captura todavía no está subida, sacamos el hueco de la imagen */
    $$(".testi__media img", cont).forEach((img) => {
      img.addEventListener("error", () => img.parentElement.remove(), { once: true });
    });
  }

  /* ---------------------------------------------------------------------
     Catálogo completo — todas las secciones en la misma página, una
     debajo de la otra. La barra de pastillas (ver initFiltroCatalogo)
     permite mostrar solo una a la vez, o "Todos" para verlas todas.
     --------------------------------------------------------------------- */

  function renderCatalogoCompleto() {
    const cont = $("[data-catalogo]");
    if (!cont) return;

    cont.innerHTML = Object.entries(CATEGORIAS)
      .map(([id, cat]) => {
        const subs = Object.entries(cat.subs || {});

        const subtabs = subs.length
          ? `<div class="subtabs" role="group" aria-label="Tipos de ${escapar(cat.nombre.toLowerCase())}">
               <button class="pill pill--sm is-active" data-subfiltro="todos" type="button">Todos</button>
               ${subs
                 .map(
                   ([sid, s]) =>
                     `<button class="pill pill--sm" data-subfiltro="${sid}" type="button">${escapar(s.corto || s.nombre)}</button>`
                 )
                 .join("")}
             </div>`
          : "";

        return `
          <div class="catsec" id="cat-${id}" data-cat="${id}">
            <div class="wrap">
              <header class="catsec__head">
                <h2 class="sec-title">${escapar(cat.nombre)}</h2>
              </header>
              ${subtabs}
              <div class="grid" data-grilla="${id}"></div>
            </div>
          </div>`;
      })
      .join("");

    /* Cada grilla, con sus productos reales */
    Object.keys(CATEGORIAS).forEach((id) => {
      const lista = ((PRODUCTOS && PRODUCTOS[id]) || []).map((producto, indice) => ({ producto, indice }));
      $(`[data-grilla="${id}"]`, cont).replaceWith(grilla(lista, id, CATEGORIAS[id].nombre));
    });

    activarLinksWa(cont);
  }

  /* ---------------------------------------------------------------------
     Recién llegados — junta los productos marcados "nuevo: true" en
     products.js, de cualquier categoría, y los muestra en una franja
     propia arriba del catálogo. Reusa tarjeta() tal cual: cada tarjeta
     lleva su categoria/índice reales, así que agregar al pedido, elegir
     variante o abrir la ficha desde acá funciona exactamente igual que
     desde el catálogo normal (son el mismo mecanismo, no uno paralelo).
     Si no hay ningún producto marcado, la sección se oculta sola. */
  function renderRecienLlegados() {
    const seccion = $("#recien-llegados");
    const cont = $("[data-nuevos]", seccion || document);
    if (!seccion || !cont) return;

    const items = [];
    Object.keys(PRODUCTOS).forEach((categoria) => {
      (PRODUCTOS[categoria] || []).forEach((producto, indice) => {
        if (producto.nuevo) items.push({ producto, categoria, indice });
      });
    });

    if (!items.length) {
      seccion.hidden = true;
      return;
    }

    seccion.hidden = false;
    const frag = document.createDocumentFragment();
    items.forEach(({ producto, categoria, indice }) => frag.appendChild(tarjeta(producto, categoria, indice)));
    cont.innerHTML = "";
    cont.appendChild(frag);

    activarLinksWa(cont);
  }

  /* Pastillas de arriba: filtran qué sección se ve */
  function initFiltroCatalogo() {
    const barra = $("#catnav");
    const secciones = $$(".catsec");
    if (!barra || !secciones.length) return;

    barra.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filtro]");
      if (!btn) return;
      const filtro = btn.dataset.filtro;

      $$(".pill[data-filtro]", barra).forEach((p) => p.classList.toggle("is-active", p === btn));
      secciones.forEach((s) => { s.hidden = filtro !== "todos" && s.dataset.cat !== filtro; });

      $("#catalogo")?.scrollIntoView({ block: "start" });
    });
  }

  /* Pastillas chicas dentro de cada sección: filtran por subcategoría */
  function initFiltroSubs() {
    $$(".subtabs").forEach((barra) => {
      const seccion = barra.closest(".catsec");
      barra.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-subfiltro]");
        if (!btn) return;
        const filtro = btn.dataset.subfiltro;

        $$(".pill", barra).forEach((p) => p.classList.toggle("is-active", p === btn));
        $$(".card", seccion).forEach((card) => {
          card.hidden = filtro !== "todos" && card.dataset.sub !== filtro;
        });
      });
    });
  }

  /* Circulitos de color (o pastillas de kilaje) en la tarjeta del catálogo:
     tocar uno cambia la foto y el precio de esa tarjeta sin abrir la ficha,
     y queda guardado como la variante que se agrega si tocás "Agregar al
     pedido" directo desde ahí. */
  function initVariantesTarjeta() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".card__variantes [data-variante]");
      if (!btn) return;
      e.preventDefault();

      const card = btn.closest(".card");
      if (!card) return;

      const lista = PRODUCTOS[card.dataset.categoria];
      const producto = lista && lista[Number(card.dataset.index)];
      if (!producto || !producto.variantes) return;

      const variante = producto.variantes.find((v) => v.label === btn.dataset.variante);
      if (!variante) return;

      card.dataset.variante = variante.label;

      const media = $(".card__media", card);
      const img = $("img", media);
      if (img && variante.img) {
        img.src = variante.img;
        media.classList.remove("is-empty");
      } else {
        media.classList.add("is-empty");
      }

      const precioViejo = $(".card__price", card);
      if (precioViejo) precioViejo.outerHTML = precioHTML(variante, producto.sinCuotas);

      $$("[data-variante]", $(".card__variantes", card)).forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });

      const sub = producto.sub ? SUBS[producto.sub] || producto.sub : "";
      const mensaje =
        `Hola Crewmates! 🧉 Me interesa: ${producto.nombre} — ${variante.label}` +
        (sub ? ` (${sub})` : "") + `. ¿Tienen stock?`;
      const consulta = $(".card__consulta", card);
      if (consulta) {
        consulta.dataset.wa = mensaje;
        consulta.setAttribute("href", waLink(mensaje));
      }
    });
  }

  /* =====================================================================
     CARRITO
     ---------------------------------------------------------------------
     El pedido se arma acá, en el navegador del cliente, y se manda entero
     por WhatsApp. No hay pago online: el sitio es estático y el cobro lo
     coordinás vos por chat, como siempre.

     Lo que el cliente elige queda guardado en su teléfono (localStorage),
     así no pierde el pedido si cierra la página sin querer.
     ===================================================================== */

  const CARRITO_KEY = "crewmates-pedido";

  const Carrito = {
    items: [],

    cargar() {
      try {
        const guardado = JSON.parse(localStorage.getItem(CARRITO_KEY) || "[]");
        /* Solo conservamos lo que todavía existe en el catálogo, resuelto
           por slug (no por índice): así un pedido guardado sobrevive a que
           se reordenen o se unifiquen productos en variantes. Si el
           producto tiene variantes y la que estaba guardada ya no existe,
           se descarta esa línea entera en vez de reemplazarla por otra
           variante sin que el cliente lo haya pedido. */
        this.items = guardado.filter((it) => {
          if (!it || typeof it.slug !== "string" || !PRODUCTOS[it.categoria]) return false;
          const base = PRODUCTOS[it.categoria].find((p) => slugify(p.nombre) === it.slug);
          if (!base) return false;
          if (!base.variantes) return true;
          return base.variantes.some((v) => v.label === it.variante);
        });
      } catch {
        this.items = [];
      }
    },

    guardar() {
      try {
        localStorage.setItem(CARRITO_KEY, JSON.stringify(this.items));
      } catch {
        /* Si el navegador no deja guardar, el pedido igual funciona
           mientras la página esté abierta. */
      }
    },

    /* Devuelve el producto "efectivo" de una línea del carrito: si tiene
       variante, el nombre y precio son los de esa variante puntual. */
    producto(it) {
      const base = PRODUCTOS[it.categoria] &&
        PRODUCTOS[it.categoria].find((p) => slugify(p.nombre) === it.slug);
      if (!base) return null;
      if (!base.variantes) return base;
      const v = base.variantes.find((v) => v.label === it.variante) || varianteDefault(base);
      if (!v) return base;
      return { nombre: `${base.nombre} — ${v.label}`, precio: v.precio, img: v.img, agotado: v.agotado, sinCuotas: base.sinCuotas };
    },

    agregar(categoria, slug, variante) {
      variante = variante || null;
      const ya = this.items.find(
        (it) => it.categoria === categoria && it.slug === slug && it.variante === variante
      );
      if (ya) ya.cantidad += 1;
      else this.items.push({ categoria, slug, variante, cantidad: 1 });
      this.guardar();
      pintarCarrito();
      recalcularEnvioSiCorresponde();
    },

    /* Bajar a 0 NO saca el producto de la lista: queda ahí en pausa, por si
       el cliente se arrepiente y quiere volver a sumarlo sin tener que
       buscarlo de nuevo en el catálogo. Sacarlo del todo es lo que hace el
       botón "×" (quitar). Un producto en 0 no cuenta en el total ni
       aparece en el mensaje de WhatsApp (ver pintarCarrito y mensaje). */
    cambiar(categoria, slug, variante, delta) {
      variante = variante || null;
      const it = this.items.find(
        (i) => i.categoria === categoria && i.slug === slug && i.variante === variante
      );
      if (!it) return;
      it.cantidad = Math.max(0, it.cantidad + delta);
      this.guardar();
      pintarCarrito();
      recalcularEnvioSiCorresponde();
    },

    quitar(categoria, slug, variante) {
      variante = variante || null;
      this.items = this.items.filter(
        (i) => !(i.categoria === categoria && i.slug === slug && i.variante === variante)
      );
      this.guardar();
      pintarCarrito();
      recalcularEnvioSiCorresponde();
    },

    vaciar() {
      this.items = [];
      this.guardar();
      pintarCarrito();
    },

    unidades() {
      return this.items.reduce((n, it) => n + it.cantidad, 0);
    },

    /* Total de lo que tiene precio cargado. Los que están "a consultar"
       se cuentan aparte para no mostrar un total que engañe. sumaSinDescuento
       es la parte de productos con sinCuotas:true (ver products.js) que no
       entran en el 20% de efectivo/transferencia: se suma aparte para
       nunca descontarla. */
    total() {
      let suma = 0, aConsultar = 0, sumaSinDescuento = 0;
      this.items.forEach((it) => {
        const p = this.producto(it);
        if (typeof p.precio === "number" && p.precio > 0) {
          const subtotal = p.precio * it.cantidad;
          suma += subtotal;
          if (p.sinCuotas) sumaSinDescuento += subtotal;
        } else {
          aConsultar += it.cantidad;
        }
      });
      return { suma, aConsultar, sumaSinDescuento };
    },

    /* El mensaje que se abre en WhatsApp, ya con todo el detalle */
    mensaje() {
      const entrega = $('input[name="entrega"]:checked');
      const pago = $('input[name="pago"]:checked');
      const transfirio = $("#pago-hecho")?.checked;
      const { suma, aConsultar, sumaSinDescuento } = this.total();

      /* Los que quedaron en 0 (en pausa, ver cambiar()) no van en el pedido */
      const lineas = this.items
        .filter((it) => it.cantidad > 0)
        .map((it) => {
          const p = this.producto(it);
          const precio =
            typeof p.precio === "number" && p.precio > 0
              ? `${CONFIG.moneda} ${formatoPrecio.format(p.precio * it.cantidad)}`
              : "a consultar";
          return `• ${it.cantidad} × ${p.nombre} — ${precio}`;
        });

      const metodoPago = pago ? pago.value : null;
      const esTransferencia = metodoPago === "transferencia";
      const nombrePago = NOMBRE_PAGO[metodoPago] || null;

      let txt = esTransferencia
        ? "Hola Crewmates! 🧉 Quiero confirmar este pedido con *Transferencia*:\n\n"
        : nombrePago
        ? `Hola Crewmates! 🧉 Quiero hacer este pedido, pagando con *${nombrePago}*:\n\n`
        : "Hola Crewmates! 🧉 Quiero hacer este pedido:\n\n";
      txt += lineas.join("\n");

      if (suma > 0) {
        const sumaFinal = totalConDescuento(suma, sumaSinDescuento, metodoPago);
        txt += sumaFinal !== suma
          ? `\n\nTotal de lista: ${CONFIG.moneda} ${formatoPrecio.format(suma)}` +
            `\nTotal con ${nombrePago.toLowerCase()} (20% off): ${CONFIG.moneda} ${formatoPrecio.format(sumaFinal)}`
          : `\n\nTotal: ${CONFIG.moneda} ${formatoPrecio.format(suma)}`;
      }
      if (aConsultar > 0) txt += suma > 0 ? `\n(+ ${aConsultar} producto(s) a consultar)` : "";
      if (entrega) {
        txt += `\n\nEntrega: ${entrega.dataset.texto}`;
        const cp = entrega.value === "envio" ? $("#envio-cp")?.value.trim() : "";
        if (cp) txt += `\nCódigo postal: ${cp}`;
      }

      if (esTransferencia) {
        txt += transfirio
          ? "\n\nYa realicé la transferencia. ¡Muchas gracias!"
          : "\n\nTe mando el comprobante de la transferencia apenas la haga.";
      }

      return txt;
    }
  };

  /* Peso aproximado del pedido (kg), para estimar el envío */
  function pesoCarrito() {
    const EMBALAJE_KG = 0.1;
    return Carrito.items.reduce(
      (kg, it) => kg + (PESO_CATEGORIA_KG[it.categoria] || 0) * it.cantidad,
      EMBALAJE_KG
    );
  }

  /* Calcula el envío a una provincia y actualiza el precio mostrado, el
     texto que se manda por WhatsApp, y repinta el carrito. */
  /* Cada llamada saca un número propio: si el usuario cambia de provincia o
     CP antes de que llegue una cotización anterior, esa respuesta vieja se
     descarta en vez de pisar la más nueva (podía pasar con la real de
     Correo Argentino, que tarda más que la tabla local). */
  let envioSolicitudId = 0;
  function actualizarEnvio(provincia) {
    if (!provincia) return;
    const solicitudId = ++envioSolicitudId;
    const esVigente = () => solicitudId === envioSolicitudId;

    const input = $('input[name="entrega"][value="envio"]');
    const precioSpan = $("[data-envio-precio]");
    const nota = $("[data-envio-nota]");
    const cp = $("#envio-cp")?.value.trim();
    const peso = pesoCarrito();

    const pintar = (resultado, esReal) => {
      if (!resultado.ok) return false;
      const precioTexto = `${CONFIG.moneda} ${formatoPrecio.format(resultado.precio)}`;
      if (precioSpan) precioSpan.textContent = precioTexto;
      if (nota) {
        nota.hidden = false;
        nota.classList.toggle("entrega__envio-nota--real", esReal);
        nota.textContent = esReal
          ? "✓ Cotización real de Correo Argentino"
          : "Estimado — puede variar, se confirma por WhatsApp";
      }
      if (input) {
        input.dataset.texto = esReal
          ? `Envío a domicilio — ${provincia} (cotización real ${precioTexto})`
          : `Envío a domicilio — ${provincia} (estimado ${precioTexto})`;
      }
      pintarCarrito();
      return true;
    };

    const conTablaLocal = () => estimateEnvio(provincia, peso, TARIFAS_ENVIO).then((resultado) => {
      if (esVigente()) pintar(resultado, false);
    });

    if (cp && /^\d{4}$/.test(cp)) {
      cotizarEnvioReal(cp, peso).then((real) => {
        if (!esVigente()) return;
        if (!pintar(real, true)) conTablaLocal();
      });
    } else {
      conTablaLocal();
    }
  }

  /* Si ya se eligió una provincia, cada vez que cambia lo que hay en el
     carrito (agregar, sumar/restar, sacar) hay que volver a pedir el
     envío: el peso del pedido cambió y el precio de $/kg extra también
     puede cambiar. No pasa nada si todavía no se eligió ninguna. */
  function recalcularEnvioSiCorresponde() {
    const provincia = $("#envio-select")?.value;
    if (provincia) actualizarEnvio(provincia);
  }

  function renderCarrito() {
    const cont = $("[data-carrito]");
    if (!cont) return;

    cont.outerHTML = `
      <div class="cart" id="cart" hidden>
        <div class="cart__backdrop" data-cart-close></div>
        <aside class="cart__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <header class="cart__head">
            <h2 class="cart__title" id="cart-title">Tu pedido</h2>
            <button class="cart__close" data-cart-close aria-label="Cerrar el pedido">×</button>
          </header>

          <div class="cart__body" data-cart-body></div>

          <footer class="cart__foot" data-cart-foot hidden>
            <fieldset class="entrega">
              <legend class="entrega__tit">¿Cómo lo recibís?</legend>
              <label class="entrega__op">
                <input type="radio" name="entrega" value="retiro"
                       data-texto="Retiro en Carmen de Patagones" checked>
                <span class="entrega__nombre">Retiro en Carmen de Patagones</span>
                <span class="entrega__precio entrega__precio--gratis">Sin cargo</span>
              </label>
              <label class="entrega__op">
                <input type="radio" name="entrega" value="envio"
                       data-texto="Envío a domicilio (elegí tu provincia)">
                <span class="entrega__nombre">Envío a todo el país</span>
                <span class="entrega__precio" data-envio-precio>A coordinar</span>
              </label>
              <div class="entrega__provincia" data-envio-provincia hidden>
                <select id="envio-select" aria-label="Provincia de destino del envío">
                  <option value="" selected disabled>Elegí tu provincia…</option>
                  ${PROVINCIAS_ENVIO.map((p) => `<option value="${escapar(p)}">${escapar(p)}</option>`).join("")}
                </select>
                <input type="text" id="envio-cp" class="entrega__cp" inputmode="numeric"
                       pattern="[0-9]{4}" maxlength="4" placeholder="Código postal (opcional, para el precio real)"
                       aria-label="Código postal de destino">
                <small class="entrega__envio-nota" data-envio-nota hidden></small>
              </div>
            </fieldset>

            <fieldset class="entrega">
              <legend class="entrega__tit">Medio de pago</legend>
              <label class="entrega__op">
                <input type="radio" name="pago" value="efectivo" checked>
                <span class="entrega__nombre">Efectivo</span>
                <span class="entrega__precio entrega__precio--gratis">-20%</span>
              </label>
              <label class="entrega__op">
                <input type="radio" name="pago" value="transferencia">
                <span class="entrega__nombre">Transferencia</span>
                <span class="entrega__precio entrega__precio--gratis">-20%</span>
              </label>
              <label class="entrega__op">
                <input type="radio" name="pago" value="tarjeta">
                <span class="entrega__nombre">Tarjeta de crédito</span>
                <span class="entrega__precio">3 cuotas</span>
              </label>

              ${CONFIG.pago && CONFIG.pago.alias ? `
              <div class="pagobox" data-pagobox hidden>
                <p class="pagobox__tit">Datos para la transferencia</p>
                ${CONFIG.pago.titular ? `
                <div class="pagobox__fila">
                  <span>Titular</span>
                  <strong>${escapar(CONFIG.pago.titular)}</strong>
                  <button type="button" data-copiar="${escapar(CONFIG.pago.titular)}">Copiar</button>
                </div>` : ""}
                <div class="pagobox__fila">
                  <span>Alias</span>
                  <strong>${escapar(CONFIG.pago.alias)}</strong>
                  <button type="button" data-copiar="${escapar(CONFIG.pago.alias)}">Copiar</button>
                </div>
                ${CONFIG.pago.cvu ? `
                <div class="pagobox__fila">
                  <span>CVU</span>
                  <strong>${escapar(CONFIG.pago.cvu)}</strong>
                  <button type="button" data-copiar="${escapar(CONFIG.pago.cvu)}">Copiar</button>
                </div>` : ""}
                <label class="pagobox__check">
                  <input type="checkbox" id="pago-hecho">
                  Ya realicé la transferencia
                </label>
              </div>` : ""}
            </fieldset>

            <div class="cart__total" data-cart-total></div>

            <a class="btn btn--wa cart__cta" id="cart-wa">${ICONO_WA} <span data-cart-cta>Hacer el pedido</span></a>
            <p class="cart__nota">
              Se abre WhatsApp con el pedido ya escrito. Ahí te confirmamos stock,
              precio final y forma de pago.
            </p>
            <button class="btn btn--ghost cart__cerrar" data-cart-close type="button">Cerrar y seguir viendo el catálogo</button>
            <button class="cart__vaciar" data-cart-vaciar>Vaciar el pedido</button>
          </footer>
        </aside>
      </div>`;
  }

  function pintarCarrito() {
    const burbuja = $("[data-cart-count]");
    const unidades = Carrito.unidades();
    if (burbuja) {
      burbuja.textContent = unidades;
      burbuja.hidden = unidades === 0;
    }

    const body = $("[data-cart-body]");
    const foot = $("[data-cart-foot]");
    if (!body) return;

    if (!Carrito.items.length) {
      body.innerHTML = `
        <div class="cart__vacio">
          <p><strong>Todavía no agregaste nada.</strong></p>
          <p>Entrá a una sección del catálogo y sumá lo que te guste.</p>
          <a class="btn btn--primary" href="index.html#catalogo">Ver el catálogo</a>
        </div>`;
      if (foot) foot.hidden = true;
      return;
    }

    body.innerHTML = Carrito.items
      .map((it) => {
        const p = Carrito.producto(it);
        const enPausa = it.cantidad === 0;
        const precio = enPausa
          ? "En pausa — tocá + para sumarlo de nuevo"
          : typeof p.precio === "number" && p.precio > 0
          ? `${CONFIG.moneda} ${formatoPrecio.format(p.precio * it.cantidad)}`
          : "A consultar";
        return `
          <article class="citem${enPausa ? " citem--pausa" : ""}" data-cat="${escapar(it.categoria)}" data-slug="${escapar(it.slug)}" data-variante="${escapar(it.variante || "")}">
            <div class="citem__media">
              ${p.img ? `<img src="${escapar(p.img)}" alt="" loading="lazy">` : ""}
            </div>
            <div class="citem__body">
              <h3 class="citem__nombre">${escapar(p.nombre)}</h3>
              <p class="citem__precio">${precio}</p>
              <div class="citem__cant">
                <button data-menos aria-label="Sacar uno de ${escapar(p.nombre)}"${enPausa ? " disabled" : ""}>−</button>
                <span aria-live="polite">${it.cantidad}</span>
                <button data-mas aria-label="Sumar uno de ${escapar(p.nombre)}">+</button>
              </div>
            </div>
            <button class="citem__quitar" data-quitar aria-label="Sacar ${escapar(p.nombre)} del pedido">×</button>
          </article>`;
      })
      .join("");

    if (foot) foot.hidden = false;

    const { suma, aConsultar, sumaSinDescuento } = Carrito.total();
    const pago = $('input[name="pago"]:checked');
    const metodoPago = pago ? pago.value : null;
    const sumaFinal = totalConDescuento(suma, sumaSinDescuento, metodoPago);
    const hayDescuento = suma > 0 && sumaFinal !== suma;

    const elTotal = $("[data-cart-total]");
    if (elTotal) {
      elTotal.innerHTML = suma > 0
        ? `<span>Total</span><strong>${CONFIG.moneda} ${formatoPrecio.format(sumaFinal)}</strong>
           ${hayDescuento
             ? `<small class="cart__ahorro">Precio de lista ${CONFIG.moneda} ${formatoPrecio.format(suma)} · Ahorrás ${CONFIG.moneda} ${formatoPrecio.format(suma - sumaFinal)} pagando en ${NOMBRE_PAGO[metodoPago].toLowerCase()}</small>`
             : ""}
           ${aConsultar ? `<small>+ ${aConsultar} a consultar</small>` : ""}`
        : `<span>Total</span><strong>A consultar</strong>`;
    }

    /* Mostrar los datos de transferencia solo si eligió pagar así */
    const pagobox = $("[data-pagobox]");
    if (pagobox) pagobox.hidden = metodoPago !== "transferencia";

    const cta = $("[data-cart-cta]");
    if (cta) {
      cta.textContent = metodoPago === "transferencia" ? "Confirmar el pedido" : "Hacer el pedido";
    }

    const wa = $("#cart-wa");
    if (wa) {
      wa.setAttribute("href", waLink(Carrito.mensaje()));
      wa.setAttribute("target", "_blank");
      wa.setAttribute("rel", "noopener");
    }
  }

  function initCarrito() {
    const modal = $("#cart");
    if (!modal) return;

    const abrir = () => { modal.hidden = false; bloquearScroll(); };
    const cerrar = () => { modal.hidden = true; desbloquearScroll(); };

    document.addEventListener("click", (e) => {
      /* Agregar al pedido desde una tarjeta */
      const btnAdd = e.target.closest("[data-agregar]");
      if (btnAdd) {
        e.preventDefault();
        const card = btnAdd.closest(".card");
        if (!card) return;
        const categoria = card.dataset.categoria, slug = card.dataset.slug, varianteLabel = card.dataset.variante || null;
        Carrito.agregar(categoria, slug, varianteLabel);
        const base = PRODUCTOS[categoria] && PRODUCTOS[categoria].find((prod) => slugify(prod.nombre) === slug);
        if (base) {
          const variante = base.variantes ? (base.variantes.find((v) => v.label === varianteLabel) || varianteDefault(base)) : null;
          evento("add_to_cart", {
            currency: MONEDA_GA,
            value: itemGA(categoria, base, variante).price,
            items: [itemGA(categoria, base, variante)]
          });
        }
        btnAdd.classList.add("is-ok");
        const original = btnAdd.dataset.original || btnAdd.innerHTML;
        btnAdd.dataset.original = original;
        btnAdd.innerHTML = "Agregado ✓";
        setTimeout(() => {
          btnAdd.classList.remove("is-ok");
          btnAdd.innerHTML = original;
        }, 1200);
        return;
      }

      if (e.target.closest("[data-cart-open]")) { e.preventDefault(); abrir(); return; }
      if (e.target.closest("[data-cart-close]")) { cerrar(); return; }

      if (e.target.closest("[data-cart-vaciar]")) { Carrito.vaciar(); return; }

      /* Mandó el pedido armado por WhatsApp: es la conversión real del
         sitio (todavía no pagó nada, pero acá es donde el catálogo
         termina su trabajo y arranca la charla con el negocio). No
         bloqueamos el click: el link abre en pestaña nueva, así que
         medir y navegar no compiten entre sí. */
      if (e.target.closest("#cart-wa")) {
        const { suma, sumaSinDescuento } = Carrito.total();
        const pago = $('input[name="pago"]:checked');
        const metodoPago = pago ? pago.value : null;
        const valor = totalConDescuento(suma, sumaSinDescuento, metodoPago);
        const items = Carrito.items
          .filter((it) => it.cantidad > 0)
          .map((it) => {
            const p = Carrito.producto(it);
            if (!p) return null;
            return {
              item_id: it.slug,
              item_name: p.nombre,
              item_category: (CATEGORIAS[it.categoria] && CATEGORIAS[it.categoria].nombre) || it.categoria,
              item_variant: it.variante || undefined,
              price: typeof p.precio === "number" ? p.precio : undefined,
              quantity: it.cantidad
            };
          })
          .filter(Boolean);
        evento("generate_lead", { currency: MONEDA_GA, value: valor > 0 ? valor : undefined, items });
        return;
      }

      const fila = e.target.closest(".citem");
      if (fila) {
        const cat = fila.dataset.cat, slug = fila.dataset.slug, variante = fila.dataset.variante || null;
        if (e.target.closest("[data-mas]"))    Carrito.cambiar(cat, slug, variante, +1);
        if (e.target.closest("[data-menos]"))  Carrito.cambiar(cat, slug, variante, -1);
        if (e.target.closest("[data-quitar]")) Carrito.quitar(cat, slug, variante);
      }

      /* Copiar alias / CVU / titular al portapapeles */
      const btnCopiar = e.target.closest("[data-copiar]");
      if (btnCopiar) {
        const texto = btnCopiar.dataset.copiar;
        const listo = () => {
          const original = btnCopiar.textContent;
          btnCopiar.textContent = "Copiado ✓";
          setTimeout(() => { btnCopiar.textContent = original; }, 1500);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(texto).then(listo).catch(listo);
        else listo();
      }
    });

    /* El código postal no cambia el precio, pero sí el mensaje de WhatsApp:
       lo repintamos mientras el cliente escribe, sin esperar a que salga
       del campo. */
    modal.addEventListener("input", (e) => {
      if (e.target.id !== "envio-cp") return;
      const provincia = $("#envio-select")?.value;
      /* Con provincia ya elegida, un CP de 4 dígitos dispara la cotización
         real de una. Si todavía no hay provincia, no hay de dónde sacar un
         precio de respaldo si la cotización real fallara, así que esperamos
         a que se elija una (repinta igual para que el mensaje de WhatsApp
         quede al día mientras tanto). */
      if (provincia && /^\d{4}$/.test(e.target.value.trim())) actualizarEnvio(provincia);
      else pintarCarrito();
    });

    /* Al cambiar la forma de entrega o el medio de pago se rearma el mensaje */
    modal.addEventListener("change", (e) => {
      if (e.target.name === "entrega") {
        const provinciaBox = $("[data-envio-provincia]");
        if (provinciaBox) provinciaBox.hidden = e.target.value !== "envio";
      }
      if (e.target.id === "envio-select") {
        actualizarEnvio(e.target.value);
        return;
      }
      if (e.target.name === "entrega" || e.target.name === "pago" || e.target.id === "pago-hecho") {
        pintarCarrito();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) cerrar();
    });
  }

  /* ---------------------------------------------------------------------
     Ficha de producto
     --------------------------------------------------------------------- */

  function initModal() {
    const modal = $("#modal");
    if (!modal) return;

    const elImg = $("#modal-img"), elCat = $("#modal-cat"), elTit = $("#modal-title");
    const elPre = $("#modal-price"), elDesc = $("#modal-desc"), elSpecs = $("#modal-specs");
    const elWa = $("#modal-wa"), media = $(".modal__media", modal);
    const elThumbs = $("#modal-thumbs"), elShare = $("#modal-share");
    const elVariantes = $("#modal-variantes"), elAdd = $("#modal-add");

    let ultimoFoco = null;
    let fotosActuales = [];
    let categoriaAbierta = null, indiceAbierto = null, varianteActual = null;

    /* Dibuja toda la ficha (foto, precio, descripción, specs, selector de
       variantes) para el producto p con la variante elegida en ese momento
       (varianteActual). La usan tanto abrir() como el click en una opción
       del selector, para no repetir la lógica de armado. */
    function pintarFicha(p) {
      const v = p.variantes ? varianteActual : null;
      const efectivo = v
        ? { precio: v.precio, desc: v.desc, img: v.img, img2: v.img2, detalles: v.detalles, agotado: v.agotado }
        : p;

      const sub = p.sub ? SUBS[p.sub] || p.sub : "";
      const nombreCat = (CATEGORIAS[categoriaAbierta] && CATEGORIAS[categoriaAbierta].nombre) || "";

      elCat.textContent = sub ? `${nombreCat} · ${sub}` : nombreCat;
      elTit.textContent = v ? `${p.nombre} — ${v.label}` : p.nombre;
      elDesc.textContent = efectivo.desc || "";

      elPre.innerHTML = efectivo.agotado
        ? "Sin stock por el momento"
        : typeof efectivo.precio === "number" && efectivo.precio > 0
        ? `${CONFIG.moneda} ${formatoPrecio.format(efectivo.precio)}${lineaPrecioExtra(efectivo.precio, false, p.sinCuotas)}`
        : "Precio a consultar";

      elSpecs.innerHTML = (efectivo.detalles || []).map((d) => `<li>${escapar(d)}</li>`).join("");

      fotosActuales = [efectivo.img, efectivo.img2].filter(Boolean);

      media.classList.remove("is-empty");
      if (fotosActuales.length) {
        elImg.src = fotosActuales[0];
        elImg.alt = elTit.textContent;
        elImg.onerror = () => media.classList.add("is-empty");
      } else {
        elImg.removeAttribute("src");
        media.classList.add("is-empty");
      }

      /* Algunos mates tienen 2 fotos para que se aprecien mejor:
         mostramos pastillas chicas para pasar de una a otra. */
      if (fotosActuales.length > 1) {
        elThumbs.innerHTML = fotosActuales
          .map((f, i) => `<button type="button" data-foto="${i}" class="${i === 0 ? "is-active" : ""}" aria-label="Foto ${i + 1} de ${fotosActuales.length}"></button>`)
          .join("");
        elThumbs.hidden = false;
      } else {
        elThumbs.innerHTML = "";
        elThumbs.hidden = true;
      }

      /* Selector de color/kilaje: círculo de color si la variante tiene
         swatch, o pastilla de texto si no (tamaño/peso en vez de color).
         Mismo mecanismo de "tocar y cambiar la foto de arriba" que ya usan
         las pastillas de #modal-thumbs, solo que acá también puede cambiar
         precio, descripción y specs. */
      if (p.variantes && p.variantes.length > 1) {
        elVariantes.innerHTML = p.variantes
          .map((variante) => {
            const activa = variante === v;
            const cls = activa ? " is-active" : "";
            const current = activa ? ' aria-current="true"' : "";
            return variante.swatch
              ? `<button type="button" class="modal__swatch${cls}" data-variante="${escapar(variante.label)}"
                         style="background:${escapar(variante.swatch)}" aria-label="${escapar(variante.label)}"${current}></button>`
              : `<button type="button" class="pill pill--sm${cls}" data-variante="${escapar(variante.label)}"${current}>${escapar(variante.label)}</button>`;
          })
          .join("");
        elVariantes.hidden = false;
      } else {
        elVariantes.innerHTML = "";
        elVariantes.hidden = true;
      }

      if (elAdd) elAdd.hidden = !p.variantes;

      elWa.dataset.wa =
        `Hola Crewmates! 🧉 Me interesa: ${elTit.textContent}` + (sub ? ` (${sub})` : "") + `. ¿Tienen stock?`;
      activarLinksWa(modal);
    }

    function abrir(categoria, indice, varianteLabel) {
      const p = PRODUCTOS[categoria] && PRODUCTOS[categoria][indice];
      if (!p) return;

      categoriaAbierta = categoria;
      indiceAbierto = indice;
      varianteActual = p.variantes
        ? p.variantes.find((v) => v.label === varianteLabel) || varianteDefault(p)
        : null;

      pintarFicha(p);

      evento("view_item", {
        currency: MONEDA_GA,
        value: itemGA(categoria, p, varianteActual).price,
        items: [itemGA(categoria, p, varianteActual)]
      });

      ultimoFoco = document.activeElement;
      modal.hidden = false;
      bloquearScroll();
      $(".modal__close", modal).focus();
    }

    function cerrar() {
      modal.hidden = true;
      desbloquearScroll();
      if (ultimoFoco) ultimoFoco.focus();
    }

    document.addEventListener("click", (e) => {
      const disparador = e.target.closest("[data-abrir]");
      if (disparador) {
        const card = disparador.closest(".card");
        if (card) abrir(card.dataset.categoria, Number(card.dataset.index), card.dataset.variante || undefined);
        return;
      }

      const btnFoto = e.target.closest("[data-foto]");
      if (btnFoto) {
        const i = Number(btnFoto.dataset.foto);
        if (fotosActuales[i]) elImg.src = fotosActuales[i];
        $$("[data-foto]", elThumbs).forEach((b) => b.classList.toggle("is-active", b === btnFoto));
        return;
      }

      const btnVariante = e.target.closest("[data-variante]");
      if (btnVariante && elVariantes.contains(btnVariante)) {
        const p = PRODUCTOS[categoriaAbierta] && PRODUCTOS[categoriaAbierta][indiceAbierto];
        if (!p || !p.variantes) return;
        varianteActual = p.variantes.find((v) => v.label === btnVariante.dataset.variante) || varianteActual;
        pintarFicha(p);
        return;
      }

      if (e.target.closest("#modal-add")) {
        const p = PRODUCTOS[categoriaAbierta] && PRODUCTOS[categoriaAbierta][indiceAbierto];
        if (!p) return;
        Carrito.agregar(categoriaAbierta, slugify(p.nombre), varianteActual ? varianteActual.label : null);
        evento("add_to_cart", {
          currency: MONEDA_GA,
          value: itemGA(categoriaAbierta, p, varianteActual).price,
          items: [itemGA(categoriaAbierta, p, varianteActual)]
        });
        const original = elAdd.textContent;
        elAdd.textContent = "Agregado ✓";
        setTimeout(() => { elAdd.textContent = original; }, 1200);
        return;
      }

      if (e.target.closest("#modal-share")) {
        const p = PRODUCTOS[categoriaAbierta] && PRODUCTOS[categoriaAbierta][indiceAbierto];
        if (!p) return;
        const link = linkProducto(categoriaAbierta, p, varianteActual);
        const original = elShare.textContent;
        const listo = () => {
          elShare.textContent = "Copiado ✓";
          setTimeout(() => { elShare.textContent = original; }, 1500);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(link).then(listo).catch(listo);
        else listo();
        return;
      }

      if (e.target.closest("[data-close]")) cerrar();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) cerrar();
    });

    /* Si alguien entra con un link tipo #producto=categoria:slug (el que
       genera el botón "Copiar link"), abrimos esa ficha directo. Puede
       venir con la variante puntual (#producto=categoria:slug:variante) —
       si esa variante ya no existe, igual abre el producto en su variante
       por defecto. Si el hash no corresponde a ningún producto (cambió a
       otra sección, o el link está mal escrito) y la ficha estaba abierta
       por un link directo, se cierra sola en vez de quedar tapando la
       sección a la que se navegó. */
    function abrirDesdeHash() {
      const m = location.hash.match(/^#producto=([a-z0-9-]+):([^:]+)(?::(.+))?$/i);
      const [, categoriaCrudo, slugCrudo, varianteSlugCrudo] = m || [];
      /* La URL puede llegar con mayúsculas (alguien la retipeó, un corrector
         la capitalizó, etc.) — slugify() siempre da minúsculas y las claves
         de PRODUCTOS también, así que hay que bajar a minúsculas acá antes
         de comparar/buscar. */
      const categoria = categoriaCrudo && categoriaCrudo.toLowerCase();
      const slug = slugCrudo && slugCrudo.toLowerCase();
      const varianteSlug = varianteSlugCrudo && varianteSlugCrudo.toLowerCase();
      const lista = categoria && PRODUCTOS[categoria];
      const indice = lista ? lista.findIndex((p) => slugify(p.nombre) === slug) : -1;
      if (indice === -1) {
        if (!modal.hidden) cerrar();
        return;
      }
      const p = lista[indice];
      const variante = varianteSlug && p.variantes
        ? p.variantes.find((v) => slugify(v.label) === varianteSlug)
        : null;
      abrir(categoria, indice, variante ? variante.label : undefined);
    }
    abrirDesdeHash();
    window.addEventListener("hashchange", abrirDesdeHash);
  }

  /* ---------------------------------------------------------------------
     Encabezado: menú mobile, sombra al scrollear
     --------------------------------------------------------------------- */

  function initHeader() {
    const header = $("#header"), burger = $("#burger"), nav = $("#nav");
    if (!header || !burger || !nav) return;

    burger.addEventListener("click", () => {
      const abierto = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(abierto));
      burger.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });

    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });

    const onScroll = () => {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      const fab = $(".fab");
      if (fab) fab.classList.toggle("is-visible", window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Logo e imágenes opcionales
     --------------------------------------------------------------------- */

  function initImagenes() {
    const brand = $(".brand"), logo = $(".brand__logo");
    if (brand && logo) {
      const fallback = () => brand.classList.add("is-fallback");
      if (logo.complete && logo.naturalWidth === 0) fallback();
      logo.addEventListener("error", fallback, { once: true });
    }
  }

  /* ---------------------------------------------------------------------
     Animación de entrada
     --------------------------------------------------------------------- */

  function initReveal() {
    const objetivos = $$(
      ".sec-head, .catsec__head, .card, .testi, .about__copy"
    );
    objetivos.forEach((el) => el.classList.add("reveal"));

    if (!("IntersectionObserver" in window)) {
      objetivos.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const obs = new IntersectionObserver(
      (entradas, o) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          o.unobserve(en.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    objetivos.forEach((el) => obs.observe(el));
  }

  /* ---------------------------------------------------------------------
     Arranque
     --------------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderRecienLlegados();
    renderCatalogoCompleto();
    renderTestimonios();
    renderFooter();
    renderCarrito();

    activarLinksWa();
    initImagenes();
    initModal();
    initHeader();
    initFiltroCatalogo();
    initFiltroSubs();
    initVariantesTarjeta();
    initReveal();

    Carrito.cargar();
    initCarrito();
    pintarCarrito();
    initCookies();
  });
})();
