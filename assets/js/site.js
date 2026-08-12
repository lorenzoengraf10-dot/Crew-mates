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

          <button class="cartbtn" data-cart-open type="button" aria-label="Ver mi pedido">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h-.6a1 1 0 0 1 0-2H8a1 1 0 0 1 .98.8L9.3 4H20a1 1 0 0 1 .97 1.24l-1.7 6.8A2 2 0 0 1 17.33 13.6H9.9l.3 1.4H18a1 1 0 1 1 0 2H9.4a1 1 0 0 1-.98-.8L7 4Zm2.7 2 .8 5.6h6.83l1.4-5.6H9.7ZM10 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/></svg>
            <span class="cartbtn__n" data-cart-count hidden>0</span>
          </button>

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

      <div data-carrito></div>

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
          <button class="btn card__add" data-agregar type="button">Agregar al pedido</button>
          <a class="card__consulta" data-wa="${escapar(mensaje)}">Consultar por WhatsApp</a>
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
      .map(([id, cat]) => {
        const n = contar(id);
        return `
          <a class="cat" href="${cat.pagina}">
            <span class="cat__media">
              ${cat.foto
                ? `<img src="${escapar(cat.foto)}" alt="" loading="lazy" decoding="async">`
                : ""}
              <span class="cat__meta">${plural(n)}</span>
            </span>
            <span class="cat__body">
              <span class="cat__name">${escapar(cat.nombre)}</span>
              <span class="cat__desc">${escapar(cat.resumen)}</span>
              <span class="cat__ver">Ver la sección <i aria-hidden="true">→</i></span>
            </span>
          </a>`;
      })
      .join("");

    /* Si todavía no está la foto de una sección, sacamos el hueco */
    $$(".cat__media img", cont).forEach((img) => {
      img.addEventListener("error", () => img.parentElement.classList.add("is-empty"), { once: true });
    });
  }

  /* ---------------------------------------------------------------------
     Nuestra recomendación — mix de productos de todas las secciones
     --------------------------------------------------------------------- */

  function renderRecomendados() {
    const cont = $("[data-recomendados]");
    if (!cont) return;

    const seccion = cont.closest("section");
    const lista = (typeof RECOMENDADOS !== "undefined" ? RECOMENDADOS : [])
      .map(({ seccion: cat, nombre }) => {
        const arr = (PRODUCTOS && PRODUCTOS[cat]) || [];
        const indice = arr.findIndex((p) => p.nombre === nombre);
        return indice === -1 ? null : { producto: arr[indice], indice, categoria: cat };
      })
      .filter(Boolean);

    if (!lista.length) {
      if (seccion) seccion.remove();
      return;
    }

    const frag = document.createDocumentFragment();
    lista.forEach(({ producto, indice, categoria }) =>
      frag.appendChild(tarjeta(producto, categoria, indice))
    );
    cont.appendChild(frag);
    activarLinksWa(cont);
  }

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
        /* Solo conservamos lo que todavía existe en el catálogo */
        this.items = guardado.filter(
          (it) => PRODUCTOS[it.categoria] && PRODUCTOS[it.categoria][it.indice]
        );
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

    producto(it) {
      return PRODUCTOS[it.categoria][it.indice];
    },

    agregar(categoria, indice) {
      const ya = this.items.find((it) => it.categoria === categoria && it.indice === indice);
      if (ya) ya.cantidad += 1;
      else this.items.push({ categoria, indice, cantidad: 1 });
      this.guardar();
      pintarCarrito();
    },

    cambiar(categoria, indice, delta) {
      const it = this.items.find((i) => i.categoria === categoria && i.indice === indice);
      if (!it) return;
      it.cantidad += delta;
      if (it.cantidad < 1) this.quitar(categoria, indice);
      else { this.guardar(); pintarCarrito(); }
    },

    quitar(categoria, indice) {
      this.items = this.items.filter((i) => !(i.categoria === categoria && i.indice === indice));
      this.guardar();
      pintarCarrito();
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
       se cuentan aparte para no mostrar un total que engañe. */
    total() {
      let suma = 0, aConsultar = 0;
      this.items.forEach((it) => {
        const p = this.producto(it);
        if (typeof p.precio === "number" && p.precio > 0) suma += p.precio * it.cantidad;
        else aConsultar += it.cantidad;
      });
      return { suma, aConsultar };
    },

    /* El mensaje que se abre en WhatsApp, ya con todo el detalle */
    mensaje() {
      const entrega = $('input[name="entrega"]:checked');
      const { suma, aConsultar } = this.total();

      const lineas = this.items.map((it) => {
        const p = this.producto(it);
        const precio =
          typeof p.precio === "number" && p.precio > 0
            ? `${CONFIG.moneda} ${formatoPrecio.format(p.precio * it.cantidad)}`
            : "a consultar";
        return `• ${it.cantidad} × ${p.nombre} — ${precio}`;
      });

      let txt = "Hola Crewmates! 🧉 Quiero hacer este pedido:\n\n" + lineas.join("\n");
      if (suma > 0) txt += `\n\nTotal: ${CONFIG.moneda} ${formatoPrecio.format(suma)}`;
      if (aConsultar > 0) {
        txt += suma > 0 ? `\n(+ ${aConsultar} producto(s) a consultar)` : "";
      }
      if (entrega) txt += `\n\nEntrega: ${entrega.dataset.texto}`;
      return txt;
    }
  };

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
                       data-texto="Envío a domicilio (a coordinar)">
                <span class="entrega__nombre">Envío a todo el país</span>
                <span class="entrega__precio">A coordinar</span>
              </label>
            </fieldset>

            <div class="cart__total" data-cart-total></div>

            <a class="btn btn--wa cart__cta" id="cart-wa">${ICONO_WA} Hacer el pedido</a>
            <p class="cart__nota">
              Se abre WhatsApp con el pedido ya escrito. Ahí te confirmamos stock,
              precio final y forma de pago.
            </p>
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
        const precio =
          typeof p.precio === "number" && p.precio > 0
            ? `${CONFIG.moneda} ${formatoPrecio.format(p.precio * it.cantidad)}`
            : "A consultar";
        return `
          <article class="citem" data-cat="${escapar(it.categoria)}" data-idx="${it.indice}">
            <div class="citem__media">
              ${p.img ? `<img src="${escapar(p.img)}" alt="" loading="lazy">` : ""}
            </div>
            <div class="citem__body">
              <h3 class="citem__nombre">${escapar(p.nombre)}</h3>
              <p class="citem__precio">${precio}</p>
              <div class="citem__cant">
                <button data-menos aria-label="Sacar uno de ${escapar(p.nombre)}">−</button>
                <span aria-live="polite">${it.cantidad}</span>
                <button data-mas aria-label="Sumar uno de ${escapar(p.nombre)}">+</button>
              </div>
            </div>
            <button class="citem__quitar" data-quitar aria-label="Sacar ${escapar(p.nombre)} del pedido">×</button>
          </article>`;
      })
      .join("");

    if (foot) foot.hidden = false;

    const { suma, aConsultar } = Carrito.total();
    const elTotal = $("[data-cart-total]");
    if (elTotal) {
      elTotal.innerHTML = suma > 0
        ? `<span>Total</span><strong>${CONFIG.moneda} ${formatoPrecio.format(suma)}</strong>
           ${aConsultar ? `<small>+ ${aConsultar} a consultar</small>` : ""}`
        : `<span>Total</span><strong>A consultar</strong>`;
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

    const abrir = () => { modal.hidden = false; document.body.style.overflow = "hidden"; };
    const cerrar = () => { modal.hidden = true; document.body.style.overflow = ""; };

    document.addEventListener("click", (e) => {
      /* Agregar al pedido desde una tarjeta */
      const btnAdd = e.target.closest("[data-agregar]");
      if (btnAdd) {
        e.preventDefault();
        const card = btnAdd.closest(".card");
        if (!card) return;
        Carrito.agregar(card.dataset.categoria, Number(card.dataset.index));
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

      const fila = e.target.closest(".citem");
      if (fila) {
        const cat = fila.dataset.cat, idx = Number(fila.dataset.idx);
        if (e.target.closest("[data-mas]"))    Carrito.cambiar(cat, idx, +1);
        if (e.target.closest("[data-menos]"))  Carrito.cambiar(cat, idx, -1);
        if (e.target.closest("[data-quitar]")) Carrito.quitar(cat, idx);
      }
    });

    /* Al cambiar la forma de entrega se rearma el mensaje */
    modal.addEventListener("change", (e) => {
      if (e.target.name === "entrega") pintarCarrito();
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
    renderRecomendados();
    renderTestimonios();
    renderFooter();
    renderCarrito();

    activarLinksWa();
    initImagenes();
    initModal();
    initHeader();
    initReveal();

    Carrito.cargar();
    initCarrito();
    pintarCarrito();
  });
})();
