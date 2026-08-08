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

  const PAGINA = document.body.dataset.pagina || "inicio";
  const SUB    = document.body.dataset.sub || "";

  /* ---------------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------------- */

  const escapar = (txt = "") =>
    String(txt).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  const waLink = (mensaje) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;

  function activarLinksWa(ctx = document) {
    $$("[data-wa]", ctx).forEach((el) => {
      el.setAttribute("href", waLink(el.dataset.wa));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  const formatoPrecio = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

  const ICONO_WA =
    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.19h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.03-5.1-2.89-6.96A9.77 9.77 0 0 0 12.04 2Zm4.5 13.84c-.25-.13-1.46-.72-1.68-.8-.23-.08-.39-.13-.56.13-.16.24-.64.79-.78.96-.15.16-.29.18-.53.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.25-.02-.38.1-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>';

  const ICONO_IG =
    '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.98c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07Zm0 3.37a4.49 4.49 0 1 1 0 8.98 4.49 4.49 0 0 1 0-8.98Zm0 7.4a2.91 2.91 0 1 0 0-5.82 2.91 2.91 0 0 0 0 5.83Zm5.72-7.6a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0Z"/></svg>';

  const WORDMARK =
    '<span class="brand__line">crew</span><span class="brand__line">mates<i class="brand__dot"></i></span>';

  /* Cuenta de productos de una categoría / subcategoría */
  function contar(catId, subId) {
    const lista = (PRODUCTOS && PRODUCTOS[catId]) || [];
    return subId ? lista.filter((p) => p.sub === subId).length : lista.length;
  }

  const plural = (n) => (n === 1 ? "1 producto" : `${n} productos`);

  /* ---------------------------------------------------------------------
     Encabezado
     --------------------------------------------------------------------- */

  function renderHeader() {
    const cont = $("[data-header]");
    if (!cont) return;

    const items = Object.entries(CATEGORIAS)
      .map(([id, cat]) => {
        const actual = id === PAGINA ? ' class="is-current"' : "";
        const subs = Object.entries(cat.subs || {});

        const desplegable = subs.length
          ? `<ul class="drop">
               <li><a href="${cat.pagina}">Todos los ${escapar(cat.nombre.toLowerCase())}</a></li>
               ${subs
                 .map(
                   ([sid, s]) =>
                     `<li><a href="${s.pagina}"${
                       sid === SUB ? ' class="is-current"' : ""
                     }>${escapar(s.nombre)}</a></li>`
                 )
                 .join("")}
             </ul>`
          : "";

        return `<li class="nav__item${subs.length ? " nav__item--sub" : ""}">
                  <a href="${cat.pagina}"${actual}>${escapar(cat.nombre)}</a>
                  ${desplegable}
                </li>`;
      })
      .join("");

    cont.outerHTML = `
      <header class="header" id="header">
        <div class="wrap header__inner">
          <a class="brand" href="index.html" aria-label="Crewmates — inicio">
            <img class="brand__logo" src="assets/img/logo.png" alt="Crewmates" width="132" height="44">
            <span class="brand__mark" aria-hidden="true">${WORDMARK}</span>
          </a>

          <nav class="nav" id="nav" aria-label="Secciones del catálogo">
            <ul class="nav__list">
              ${items}
              <li class="nav__item"><a href="#contacto">Contacto</a></li>
            </ul>
          </nav>

          <a class="btn btn--wa header__cta" data-wa="Hola Crewmates! Quería hacer una consulta 🧉">
            ${ICONO_WA} WhatsApp
          </a>

          <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>`;
  }

  /* ---------------------------------------------------------------------
     Pie de página
     --------------------------------------------------------------------- */

  function renderFooter() {
    const cont = $("[data-footer]");
    if (!cont) return;

    const links = Object.entries(CATEGORIAS)
      .map(([, cat]) => `<li><a href="${cat.pagina}">${escapar(cat.nombre)}</a></li>`)
      .join("");

    cont.outerHTML = `
      <footer class="footer" id="contacto">
        <div class="wrap footer__inner">

          <div class="footer__col footer__brand">
            <span class="brand__mark brand__mark--light" aria-hidden="true">${WORDMARK}</span>
            <p class="footer__tag">
              Mates, termos y accesorios.<br>
              Desde ${escapar(CONFIG.ciudad)} para todo el país.
            </p>
            <div class="footer__social">
              <a href="${CONFIG.instagram}" target="_blank" rel="noopener"
                 aria-label="Instagram de Crewmates">${ICONO_IG} @crew.mattes</a>
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
      </footer>

      <a class="fab" data-wa="Hola Crewmates! Quería hacer una consulta 🧉" aria-label="Escribir por WhatsApp">
        ${ICONO_WA}<span class="fab__label">Escribinos</span>
      </a>

      <div class="modal" id="modal" hidden>
        <div class="modal__backdrop" data-close></div>
        <div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button class="modal__close" data-close aria-label="Cerrar">×</button>
          <div class="modal__media"><img id="modal-img" src="" alt=""></div>
          <div class="modal__body">
            <p class="modal__cat" id="modal-cat"></p>
            <h2 class="modal__title" id="modal-title"></h2>
            <p class="modal__price" id="modal-price"></p>
            <p class="modal__desc" id="modal-desc"></p>
            <ul class="modal__specs" id="modal-specs"></ul>
            <a class="btn btn--wa modal__cta" id="modal-wa">Consultar por WhatsApp</a>
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

  function precioHTML(producto) {
    if (producto.agotado) {
      return '<span class="card__price">Sin stock<small>Consultá reposición</small></span>';
    }
    if (typeof producto.precio === "number" && producto.precio > 0) {
      return `<span class="card__price">${CONFIG.moneda} ${formatoPrecio.format(producto.precio)}</span>`;
    }
    return '<span class="card__price">A consultar<small>Te pasamos el precio</small></span>';
  }

  function tarjeta(producto, categoria, indice) {
    const sub = producto.sub ? SUBS[producto.sub] || producto.sub : "";
    const etiqueta = producto.etiqueta
      ? `<span class="card__tag card__tag--${producto.color || "orange"}">${escapar(producto.etiqueta)}</span>`
      : "";

    const mensaje =
      `Hola Crewmates! 🧉 Me interesa: ${producto.nombre}` +
      (sub ? ` (${sub})` : "") + `. ¿Tienen stock?`;

    const art = document.createElement("article");
    art.className = "card";
    art.dataset.categoria = categoria;
    art.dataset.index = indice;

    art.innerHTML = `
      <div class="card__media" data-abrir>
        ${etiqueta}
        <img src="${escapar(producto.img || "")}" alt="${escapar(producto.nombre)}"
             loading="lazy" decoding="async">
      </div>
      <div class="card__body">
        ${sub ? `<span class="card__sub">${escapar(sub)}</span>` : ""}
        <h3 class="card__name">${escapar(producto.nombre)}</h3>
        <p class="card__desc">${escapar(producto.desc || "")}</p>
        <div class="card__foot">
          ${precioHTML(producto)}
          <a class="btn card__wa" data-wa="${escapar(mensaje)}">${ICONO_WA} Pedir</a>
        </div>
      </div>`;

    const media = $(".card__media", art);
    if (!producto.img) {
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

  function renderMenu() {
    const cont = $("[data-menu]");
    if (!cont) return;

    cont.innerHTML = Object.entries(CATEGORIAS)
      .map(([id, cat], i) => {
        const n = contar(id);
        return `
          <a class="cat" href="${cat.pagina}">
            <span class="cat__idx">${String(i + 1).padStart(2, "0")}</span>
            <span class="cat__body">
              <span class="cat__name">${escapar(cat.nombre)}</span>
              <span class="cat__desc">${escapar(cat.resumen)}</span>
              <span class="cat__meta">${plural(n)}</span>
            </span>
            <span class="cat__arrow" aria-hidden="true">→</span>
          </a>`;
      })
      .join("");
  }

  /* ---------------------------------------------------------------------
     Página de sección / subsección
     --------------------------------------------------------------------- */

  function renderCatalogo() {
    const cont = $("[data-catalogo]");
    if (!cont) return;

    const cat = CATEGORIAS[PAGINA];
    if (!cat) return;

    const sub = SUB && cat.subs ? cat.subs[SUB] : null;
    const subs = Object.entries(cat.subs || {});

    /* Migas de pan */
    const migas = `
      <nav class="migas" aria-label="Dónde estás">
        <a href="index.html">Inicio</a>
        <span aria-hidden="true">/</span>
        ${sub
          ? `<a href="${cat.pagina}">${escapar(cat.nombre)}</a>
             <span aria-hidden="true">/</span>
             <span aria-current="page">${escapar(sub.nombre)}</span>`
          : `<span aria-current="page">${escapar(cat.nombre)}</span>`}
      </nav>`;

    /* Encabezado */
    const titulo = sub ? sub.nombre : cat.nombre;
    const lead = sub ? sub.lead : cat.lead;
    const total = contar(PAGINA, SUB);

    const encabezado = `
      <header class="pagina__head">
        <p class="eyebrow"><span class="eyebrow__dot"></span> ${escapar(cat.nombre)}</p>
        <h1 class="sec-title">${escapar(titulo)}</h1>
        <p class="sec-lead">${escapar(lead)}</p>
        <p class="pagina__conteo">${plural(total)} en esta sección</p>
      </header>`;

    /* Navegación entre subsecciones */
    let navegacionSubs = "";

    if (subs.length && !sub) {
      /* Página madre: tarjetas grandes hacia cada subsección */
      navegacionSubs = `
        <div class="subs">
          ${subs
            .map(
              ([sid, s]) => `
              <a class="subcard" href="${s.pagina}">
                <span class="subcard__name">${escapar(s.nombre)}</span>
                <span class="subcard__desc">${escapar(s.resumen)}</span>
                <span class="subcard__meta">${plural(contar(PAGINA, sid))} <i aria-hidden="true">→</i></span>
              </a>`
            )
            .join("")}
        </div>`;
    } else if (subs.length && sub) {
      /* Dentro de una subsección: saltar a las hermanas */
      navegacionSubs = `
        <nav class="subnav" aria-label="Tipos de ${escapar(cat.nombre.toLowerCase())}">
          <a href="${cat.pagina}">Ver todo</a>
          ${subs
            .map(
              ([sid, s]) =>
                `<a href="${s.pagina}"${sid === SUB ? ' class="is-current" aria-current="page"' : ""}>${escapar(
                  s.corto || s.nombre
                )}</a>`
            )
            .join("")}
        </nav>`;
    }

    cont.innerHTML = `
      <section class="pagina">
        <div class="wrap">
          ${migas}
          ${encabezado}
          ${navegacionSubs}
          ${subs.length && !sub ? `<h2 class="pagina__sub">Todos los ${escapar(cat.nombre.toLowerCase())}</h2>` : ""}
          <div data-grilla></div>
        </div>
      </section>

      <section class="ayuda">
        <div class="wrap ayuda__inner">
          <div>
            <h2>¿No sabés cuál elegir?</h2>
            <p>Contanos para qué lo querés y te recomendamos el que mejor te sirve. Te mandamos fotos y videos reales del producto antes de que lo compres.</p>
          </div>
          <a class="btn btn--orange" data-wa="Hola Crewmates! Necesito ayuda para elegir ${escapar(titulo.toLowerCase())} 🧉">Pedir ayuda por WhatsApp</a>
        </div>
      </section>`;

    /* Productos, conservando el índice original para la ficha */
    const lista = ((PRODUCTOS && PRODUCTOS[PAGINA]) || [])
      .map((producto, indice) => ({ producto, indice }))
      .filter(({ producto }) => (SUB ? producto.sub === SUB : true));

    $("[data-grilla]", cont).replaceWith(grilla(lista, PAGINA, titulo));
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

    let ultimoFoco = null;

    function abrir(categoria, indice) {
      const p = PRODUCTOS[categoria] && PRODUCTOS[categoria][indice];
      if (!p) return;

      const sub = p.sub ? SUBS[p.sub] || p.sub : "";
      const nombreCat = (CATEGORIAS[categoria] && CATEGORIAS[categoria].nombre) || "";

      elCat.textContent = sub ? `${nombreCat} · ${sub}` : nombreCat;
      elTit.textContent = p.nombre;
      elDesc.textContent = p.desc || "";

      elPre.textContent = p.agotado
        ? "Sin stock por el momento"
        : typeof p.precio === "number" && p.precio > 0
        ? `${CONFIG.moneda} ${formatoPrecio.format(p.precio)}`
        : "Precio a consultar";

      elSpecs.innerHTML = (p.detalles || []).map((d) => `<li>${escapar(d)}</li>`).join("");

      media.classList.remove("is-empty");
      if (p.img) {
        elImg.src = p.img;
        elImg.alt = p.nombre;
        elImg.onerror = () => media.classList.add("is-empty");
      } else {
        elImg.removeAttribute("src");
        media.classList.add("is-empty");
      }

      elWa.dataset.wa =
        `Hola Crewmates! 🧉 Me interesa: ${p.nombre}` + (sub ? ` (${sub})` : "") + `. ¿Tienen stock?`;
      activarLinksWa(modal);

      ultimoFoco = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      $(".modal__close", modal).focus();
    }

    function cerrar() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (ultimoFoco) ultimoFoco.focus();
    }

    document.addEventListener("click", (e) => {
      const disparador = e.target.closest("[data-abrir]");
      if (disparador) {
        const card = disparador.closest(".card");
        if (card) abrir(card.dataset.categoria, Number(card.dataset.index));
        return;
      }
      if (e.target.closest("[data-close]")) cerrar();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) cerrar();
    });
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

    $$(".frame img, .about__media img").forEach((img) => {
      const cont = img.parentElement;
      const marcar = () => {
        cont.classList.add("is-empty");
        revisarHero();
      };
      if (!img.getAttribute("src")) return marcar();
      if (img.complete && img.naturalWidth === 0) marcar();
      img.addEventListener("error", marcar, { once: true });
    });
  }

  /* Si todavía no hay ninguna foto en el collage del inicio, lo marcamos como
     vacío: en el celular se oculta para no gastar una pantalla entera de scroll
     antes de llegar al catálogo. */
  function revisarHero() {
    const visual = $(".hero__visual");
    if (!visual) return;
    const marcos = $$(".frame", visual);
    const vacios = marcos.filter((f) => f.classList.contains("is-empty"));
    visual.classList.toggle("is-empty", marcos.length > 0 && vacios.length === marcos.length);
  }

  /* ---------------------------------------------------------------------
     Animación de entrada
     --------------------------------------------------------------------- */

  function initReveal() {
    const objetivos = $$(
      ".sec-head, .pagina__head, .cat, .subcard, .card, .step, .about__media, .about__copy, .hero__copy, .hero__visual, .ayuda__inner"
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
    renderMenu();
    renderCatalogo();
    renderFooter();

    activarLinksWa();
    initImagenes();
    initModal();
    initHeader();
    initReveal();
  });
})();
