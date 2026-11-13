# Crewmates — contexto del proyecto

## Regla principal: esto se diseña para el celular

**Más del 85% del tráfico entra desde el teléfono.** El celular no es "la versión
adaptada": es la versión real. La pantalla de escritorio es el caso secundario.

En la práctica, para cada cambio:

- Probarlo primero en **390 × 844** (celular común) antes que en escritorio.
- Nada de scroll horizontal, nunca. Verificar que `scrollWidth === clientWidth`.
- Zonas tocables de **44 × 44 px como mínimo** (botones, links del menú, cerrar).
- No gastar pantalla al pepe: si un bloque decorativo está vacío, se oculta en celular.
- Lo importante (el catálogo y el botón de WhatsApp) tiene que estar **cerca del
  pulgar** y a pocos scrolls.
- Texto legible sin hacer zoom: nunca por debajo de 15 px en el cuerpo.
- Cuidar el peso: muchos clientes entran con datos móviles y señal floja. Nada que
  bloquee el dibujado de la página.

## Sobre el negocio

- Crewmates vende mates, termos y accesorios. **Carmen de Patagones, Buenos Aires**
  (no Río Negro).
- Envíos a todo el país y showroom en Patagones.
- **No tienen horarios de atención publicados.** No inventar ninguno.
- Toda la venta se cierra por WhatsApp: **2920 340402**.
- Instagram: @crew.mattes

## Cómo está hecho el sitio

Sitio estático, sin frameworks ni build. Todo el catálogo vive en una sola
página (`index.html`), con una barra de pastillas fija que filtra las
categorías sin recargar. Las viejas URLs por sección (`mates.html`,
`bombillas.html`, etc.) quedan como redirects a `index.html#cat-<id>`, para
no romper links guardados.

- `assets/js/products.js` — datos: contacto, estructura de secciones y productos.
  Es el único archivo que toca el dueño para cargar productos.
- `assets/js/site.js` — arma encabezado, pie, la barra de filtros y el
  catálogo completo.
- `assets/css/styles.css` — estilos. La paleta se define en `:root`.

Al modificar el CSS o el JS hay que subir el `?v=` del link correspondiente en
`index.html` (`styles.css`, `products.js`, `site.js`; los redirects no cargan
nada de eso), si no los navegadores siguen usando la copia vieja en caché
(`vercel.json` cachea `/assets/` por 24 hs).

## Precios

- En `products.js` va el precio de **lista** (tarjeta / 3 cuotas) = efectivo × 1,3.
- El sitio calcula el efectivo/transferencia como lista ÷ 1,3 (redondeado a $100).
  Nunca "lista − 20%".
- Productos nuevos: `nuevo: 1` y subirle 1 a todos los demás `nuevo`.

## Probar

`python3 -m http.server 8150` y revisar en 390 × 844: sin scroll horizontal, nada
de texto < 15 px (salvo etiquetas en mayúscula), zonas tocables ≥ 44 px, sin
errores en consola. Fotos de producto: 750 × 1000 JPG (~q82).

## Estilo

Paleta: blanco crema, azul marino, naranja y verde oscuro. Estética profesional y
cálida, que no parezca plantilla genérica. Los textos van en español rioplatense
(voseo), como habla el emprendimiento.
