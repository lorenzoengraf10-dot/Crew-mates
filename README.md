# Crewmates — sitio web

Sitio del emprendimiento **Crewmates** (Carmen de Patagones, Buenos Aires): mates, termos,
canastas, bombillas y yerbas, con envíos a todo el país y showroom local. Toda la venta se
cierra por WhatsApp.

Es un sitio **estático** (HTML + CSS + JavaScript, sin frameworks ni build). Se publica en
Vercel: cada vez que se sube un cambio a la rama `main` de GitHub, se actualiza solo.

---

## Cómo está organizado

Todo el catálogo vive en **una sola página** (`index.html`). Una barra de pastillas fija
filtra las secciones sin recargar. Las URLs viejas por sección (`mates.html`,
`termos-stanley.html`, etc.) siguen existiendo solo como redirects a `index.html#cat-<sección>`,
para no romper links guardados o compartidos.

```
index.html               → la página (hero, recién llegados, catálogo, clientes, preguntas, historia)
assets/js/products.js    → 👈 EL CATÁLOGO: contacto, secciones y productos
assets/js/site.js        → arma encabezado, pie, catálogo, ficha, pedido y mediciones
assets/css/styles.css    → estilos y paleta
assets/img/              → fotos (una carpeta por sección)
vercel.json              → caché de los archivos
sitemap.xml, robots.txt  → para Google
```

---

## Cómo cargar un producto

1. Guardá la foto en `assets/img/<sección>/` (por ejemplo `assets/img/mates/mi-mate-1.jpg`).
   Medida recomendada: **750 × 1000 px**, JPG calidad ~82, para que pese poco en el celular.
2. Abrí `assets/js/products.js`, buscá la sección y copiá un bloque `{ ... }` parecido.
3. Editá los campos (el detalle de cada uno está en el comentario de arriba de ese archivo).
4. **Subí en 1 el número de versión** del link a `products.js` en `index.html`
   (`products.js?v=N`). Si no, los celulares que ya entraron siguen viendo la copia vieja
   hasta por 24 horas. Lo mismo vale para `site.js` y `styles.css` cuando se cambian.

```js
{
  nombre: "Imperial cuero crudo cincelado",
  sub: "criollos",                 // solo en mates y termos
  precio: 65000,                   // precio de LISTA (tarjeta / 3 cuotas)
  efectivo: 50000,                 // precio de EFECTIVO / TRANSFERENCIA
  etiqueta: "Premium", color: "navy",
  nuevo: 1,                        // lo suma a "Lo último que sumamos" (1 = el más nuevo)
  desc: "Imperial criollo en cuero crudo, con virola ancha cincelada.",
  img: "assets/img/mates/imperial-cuero-crudo-cincelado-1.jpg",
  img2: "assets/img/mates/imperial-cuero-crudo-cincelado-2.jpg",   // opcional: 2da foto
  detalles: ["Cuero crudo", "Virola ancha cincelada"]
}
```

Productos en varios colores o tamaños usan `variantes: [ { label, swatch, precio, img, ... } ]`
(mirá "Ranchero" o "Torpedo rey" como ejemplo).

### Precios

Cada producto (o variante) lleva **los dos precios tal cual los pasa el dueño**:

- `precio`: el de lista (tarjeta / 3 cuotas).
- `efectivo`: el de efectivo o transferencia.

El sitio muestra el de lista arriba y el de efectivo abajo, y el pedido por WhatsApp suma
cada producto con su precio de efectivo si el cliente paga en efectivo o transferencia.
Los productos viejos que no tienen `efectivo` se calculan como la lista ÷ 1,3.
Las yerbas llevan `sinCuotas: true`: no tienen precio de efectivo y muestran "No aplican cuotas".

### "Lo último que sumamos"

Los productos con `nuevo: N` aparecen arriba del catálogo, ordenados por `N` (1 primero), y
también en su sección. Al cargar uno nuevo ponele `nuevo: 1` y subile 1 al `nuevo` de todos
los que ya lo tenían; sacá la línea `nuevo` cuando deje de ser novedad.

---

## Contacto y pago

Están arriba de `assets/js/products.js`, en `CONFIG` (WhatsApp, Instagram, ciudad y los datos
de transferencia: titular, alias y CVU). Cambiando ahí el número, **todos** los botones de
WhatsApp del sitio se actualizan.

---

## Mediciones (Google Analytics 4)

El sitio mide, con el aviso de cookies y "Consent Mode" de Google (no guarda nada hasta que
el visitante acepta):

| Evento | Cuándo ocurre |
|---|---|
| `view_item` | alguien abre la ficha de un producto |
| `add_to_cart` | agrega un producto al pedido |
| `generate_lead` | toca "Hacer el pedido" (manda el pedido por WhatsApp) |
| `consulta_whatsapp` | toca cualquier "Consultar por WhatsApp" (con `ubicacion` y `producto`) |

En GA4 conviene marcar `generate_lead` y `consulta_whatsapp` como **eventos clave** y crear
las dimensiones personalizadas `ubicacion`, `producto`, `variante` y `metodo_pago`.

---

## Paleta

| Color         | Hex       | Uso                                   |
|---------------|-----------|---------------------------------------|
| Blanco crema  | `#FBF7F0` | Fondo principal                        |
| Crema medio   | `#F4EDE1` | Fondos alternados                      |
| Azul marino   | `#10365F` | Títulos, header, botones principales   |
| Azul profundo | `#0A2340` | Footer, aviso de cookies               |
| Naranja       | `#EE5B23` | Acento, etiquetas, botón de agregar    |
| Verde oscuro  | `#1E4536` | WhatsApp, ahorro                       |

---

## Probarlo en tu compu

No hace falta instalar nada: abrí `index.html` con doble clic, o levantá un servidor local
(`python3 -m http.server 8150` y entrá a `http://localhost:8150`). Para ver cómo queda en
el celular, usá las herramientas del navegador en tamaño **390 × 844**.
