/* =========================================================================
   Crewmates — lógica del sitio
   Renderiza el catálogo desde products.js, maneja filtros, menú, ficha
   de producto y links de WhatsApp.
   ========================================================================= */

(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     WhatsApp
     --------------------------------------------------------------------- */

  const waLink = (mensaje) =>
    `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`;

  /* Todo elemento con data-wa se convierte en link de WhatsApp */
  function activarLinksWa(ctx = document) {
    $$("[data-wa]", ctx).forEach((el) => {
      el.setAttribute("href", waLink(el.dataset.wa));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* ---------------------------------------------------------------------
     Formato de precio
     --------------------------------------------------------------------- */

  const formatoPrecio = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
  });

  function precioHTML(producto) {
    if (producto.agotado) {
      return '<span class="card__price">Sin stock<small>Consultá reposición</small></span>';
    }
    if (typeof producto.precio === "number" && producto.precio > 0) {
      return `<span class="card__price">${CONFIG.moneda} ${formatoPrecio.format(
        producto.precio
      )}</span>`;
    }
    return '<span class="card__price">A consultar<small>Te pasamos el precio</small></span>';
  }

  /* ---------------------------------------------------------------------
     Render de tarjetas
     --------------------------------------------------------------------- */

  const escapar = (txt = "") =>
    String(txt).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  function tarjeta(producto, categoria, indice) {
    const sub = producto.sub ? SUBS[producto.sub] || producto.sub : "";
    const etiqueta = producto.etiqueta
      ? `<span class="card__tag card__tag--${producto.color || "orange"}">${escapar(
          producto.etiqueta
        )}</span>`
      : "";

    const mensaje =
      `Hola Crewmates! 🧉 Me interesa: ${producto.nombre}` +
      (sub ? ` (${sub})` : "") +
      `. ¿Tienen stock?`;

    const art = document.createElement("article");
    art.className = "card reveal";
    art.dataset.sub = producto.sub || "";
    art.dataset.index = indice;
    art.dataset.categoria = categoria;

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
          <a class="btn card__wa" data-wa="${escapar(mensaje)}">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.19h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.03-5.1-2.89-6.96A9.77 9.77 0 0 0 12.04 2Zm4.5 13.84c-.25-.13-1.46-.72-1.68-.8-.23-.08-.39-.13-.56.13-.16.24-.64.79-.78.96-.15.16-.29.18-.53.06-.25-.13-1.04-.39-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.25-.02-.38.1-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>
            Pedir
          </a>
        </div>
      </div>`;

    /* Si la foto no existe todavía, mostramos el placeholder de marca */
    const media = $(".card__media", art);
    const img = $("img", media);
    if (!producto.img) {
      media.classList.add("is-empty");
    } else {
      img.addEventListener("error", () => media.classList.add("is-empty"), { once: true });
    }

    return art;
  }

  function vacio(categoria) {
    const div = document.createElement("div");
    div.className = "empty";
    div.innerHTML = `
      <strong>Estamos cargando esta sección</strong>
      Todavía no publicamos los productos de ${escapar(categoria)}.
      Escribinos y te pasamos las fotos y precios al instante.`;
    return div;
  }

  function renderCatalogo() {
    $$("[data-grid]").forEach((grid) => {
      const categoria = grid.dataset.grid;
      const lista = (typeof PRODUCTOS !== "undefined" && PRODUCTOS[categoria]) || [];

      grid.innerHTML = "";

      if (!lista.length) {
        grid.appendChild(vacio(categoria));
        return;
      }

      const frag = document.createDocumentFragment();
      lista.forEach((p, i) => frag.appendChild(tarjeta(p, categoria, i)));
      grid.appendChild(frag);
    });

    activarLinksWa();
  }

  /* ---------------------------------------------------------------------
     Filtros por subcategoría (mates y termos)
     --------------------------------------------------------------------- */

  function initTabs() {
    $$(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const seccion = tab.dataset.target;
        const filtro = tab.dataset.filter;

        $$(`.tab[data-target="${seccion}"]`).forEach((t) => {
          const activo = t === tab;
          t.classList.toggle("is-active", activo);
          t.setAttribute("aria-selected", String(activo));
        });

        $$(`[data-grid="${seccion}"] .card`).forEach((card) => {
          const visible = filtro === "todos" || card.dataset.sub === filtro;
          card.hidden = !visible;
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Ficha de producto (modal)
     --------------------------------------------------------------------- */

  function initModal() {
    const modal = $("#modal");
    if (!modal) return;

    const elImg   = $("#modal-img");
    const elCat   = $("#modal-cat");
    const elTit   = $("#modal-title");
    const elPre   = $("#modal-price");
    const elDesc  = $("#modal-desc");
    const elSpecs = $("#modal-specs");
    const elWa    = $("#modal-wa");
    const media   = $(".modal__media", modal);

    let ultimoFoco = null;

    function abrir(categoria, indice) {
      const p = PRODUCTOS[categoria] && PRODUCTOS[categoria][indice];
      if (!p) return;

      const sub = p.sub ? SUBS[p.sub] || p.sub : "";
      const nombreCat = { mates: "Mates", yerberas: "Yerberas", canastas: "Canastas",
        bombillas: "Bombillas y bombillones", yerbas: "Yerbas", termos: "Termos" }[categoria] || "";

      elCat.textContent = sub ? `${nombreCat} · ${sub}` : nombreCat;
      elTit.textContent = p.nombre;
      elDesc.textContent = p.desc || "";

      elPre.textContent = p.agotado
        ? "Sin stock por el momento"
        : typeof p.precio === "number" && p.precio > 0
        ? `${CONFIG.moneda} ${formatoPrecio.format(p.precio)}`
        : "Precio a consultar";

      elSpecs.innerHTML = (p.detalles || [])
        .map((d) => `<li>${escapar(d)}</li>`)
        .join("");

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
        `Hola Crewmates! 🧉 Me interesa: ${p.nombre}` +
        (sub ? ` (${sub})` : "") + `. ¿Tienen stock?`;
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
     Header: menú mobile, sombra al scrollear, link activo
     --------------------------------------------------------------------- */

  function initHeader() {
    const header = $("#header");
    const burger = $("#burger");
    const nav = $("#nav");

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
      if (fab) fab.classList.toggle("is-visible", window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Resalta la sección que se está mirando */
    const secciones = $$("main section[id]");
    const links = new Map(
      $$('.nav__list a[href^="#"]').map((a) => [a.getAttribute("href").slice(1), a])
    );

    if ("IntersectionObserver" in window && secciones.length) {
      const obs = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((en) => {
            const link = links.get(en.target.id);
            if (!link) return;
            if (en.isIntersecting) {
              links.forEach((l) => l.classList.remove("is-current"));
              link.classList.add("is-current");
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      secciones.forEach((s) => obs.observe(s));
    }
  }

  /* ---------------------------------------------------------------------
     Logo: si no está el archivo, usamos el wordmark en CSS
     --------------------------------------------------------------------- */

  function initLogo() {
    const brand = $(".brand");
    const logo = $(".brand__logo");
    if (!brand || !logo) return;

    const fallback = () => brand.classList.add("is-fallback");
    if (logo.complete && logo.naturalWidth === 0) fallback();
    logo.addEventListener("error", fallback, { once: true });
  }

  /* ---------------------------------------------------------------------
     Imágenes decorativas sin archivo → panel de marca
     --------------------------------------------------------------------- */

  function initImagenesOpcionales() {
    $$(".frame img, .about__media img").forEach((img) => {
      const cont = img.parentElement;
      const marcar = () => cont.classList.add("is-empty");
      if (!img.getAttribute("src")) return marcar();
      if (img.complete && img.naturalWidth === 0) marcar();
      img.addEventListener("error", marcar, { once: true });
    });
  }

  /* ---------------------------------------------------------------------
     Animación de entrada
     --------------------------------------------------------------------- */

  function initReveal() {
    const objetivos = $$(
      ".sec-head, .cat, .card, .step, .about__media, .about__copy, .hero__copy, .hero__visual"
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
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    initLogo();
    initImagenesOpcionales();
    renderCatalogo();
    initTabs();
    initModal();
    initHeader();
    initReveal();
  });
})();
