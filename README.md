# Crewmates — sitio web

Sitio del emprendimiento **Crewmates** (Carmen de Patagones, Buenos Aires): mates, termos
y accesorios, con envíos a todo el país y showroom local.

Es un sitio **estático** (HTML + CSS + JavaScript, sin frameworks ni build). Se abre con
doble clic y se publica gratis en GitHub Pages.

---

## Cómo está organizado

Cada sección del catálogo es **una página aparte**. Así, con muchos productos, cada rubro
se ve completo y ordenado en vez de amontonarse todo en una sola pantalla.

```
index.html                → Inicio: hero, menú de secciones, cómo comprar, showroom
│
├── mates.html            → Mates (las 3 subdivisiones + todos los mates)
│   ├── mates-criollos.html
│   ├── mates-calabaza.html
│   └── mates-algarrobo.html
├── yerberas.html
├── canastas.html
├── bombillas.html
├── yerbas.html
└── termos.html           → Termos (las 2 subdivisiones + todos los termos)
    ├── termos-1-litro.html
    └── termos-stanley.html
```

Archivos de apoyo:

```
assets/css/styles.css      → estilos y paleta de colores
assets/js/products.js      → 👈 EL CATÁLOGO. Acá cargás los productos
assets/js/site.js          → arma el menú, el pie de página y las grillas
assets/img/                → fotos (ver assets/img/README.md)
```

El encabezado y el pie de página se arman solos en todas las páginas desde `site.js`,
así que los datos de contacto se cambian **una sola vez** y se actualizan en todo el sitio.

---

## Cómo cargar un producto

1. Guardá la foto en la carpeta de su categoría, por ejemplo
   `assets/img/mates/imperial-negro.jpg`.
2. Abrí `assets/js/products.js` y buscá la categoría.
3. Copiá un bloque `{ ... }` que ya esté y pegalo abajo, separado por coma.
4. Editá los campos:

```js
{
  nombre: "Mate de calabaza imperial",
  sub: "calabaza",                              // solo en mates y termos
  precio: 28000,                                // o null para "A consultar"
  desc: "Calabaza seleccionada y curada a mano.",
  img: "assets/img/mates/imperial-negro.jpg",
  etiqueta: "Nuevo",                            // opcional
  color: "green",                               // opcional: orange | green | navy
  detalles: ["Curado", "Guarda de alpaca"],     // opcional
  agotado: false                                // opcional
}
```

5. Guardá y recargá la página. El producto aparece solo en su sección, en la subdivisión
   que corresponda y en los contadores del menú.

### Subcategorías disponibles

| Sección | Valores válidos de `sub`              |
|---------|---------------------------------------|
| Mates   | `criollos`, `calabaza`, `algarrobo`   |
| Termos  | `1lt`, `stanley12`                    |

El resto de las secciones (yerberas, canastas, bombillas, yerbas) no llevan `sub`.

---

## Agregar una sección nueva

1. En `assets/js/products.js`, agregá la sección dentro de `CATEGORIAS` (nombre, `pagina`,
   `resumen` y `lead`) y creá su lista vacía en `PRODUCTOS`.
2. Duplicá cualquier archivo `.html` de sección (por ejemplo `yerbas.html`), renombralo con
   el mismo nombre que pusiste en `pagina` y cambiale el `<title>`, la descripción y el
   `data-pagina` del `<body>`.

El menú del inicio, la navegación de arriba y el pie de página se actualizan solos.

---

## Datos de contacto

Están todos juntos arriba de `assets/js/products.js`, en `CONFIG`:

```js
const CONFIG = {
  whatsapp: "5492920340402",       // formato internacional, sin + ni espacios
  whatsappVisible: "2920 340402",
  instagram: "https://www.instagram.com/crew.mattes",
  ciudad: "Carmen de Patagones",
  provincia: "Buenos Aires",
  moneda: "$"
};
```

Cambiando ahí el número, **todos** los botones de WhatsApp del sitio se actualizan solos.
Cada botón abre el chat con el nombre del producto ya escrito en el mensaje.

---

## Paleta

| Color         | Hex       | Uso                                   |
|---------------|-----------|---------------------------------------|
| Blanco crema  | `#FBF7F0` | Fondo principal                        |
| Crema medio   | `#F4EDE1` | Fondos alternados                      |
| Azul marino   | `#10365F` | Títulos, header, botones principales   |
| Azul profundo | `#0A2340` | Footer                                 |
| Naranja       | `#EE5B23` | Acentos, etiquetas, contadores         |
| Verde oscuro  | `#1E4536` | WhatsApp y sección "Cómo comprar"      |

Se definen una sola vez en `:root`, arriba de `assets/css/styles.css`.

---

## Ver el sitio localmente

Doble clic en `index.html` alcanza. Si querés levantar un servidor:

```bash
python3 -m http.server 8000
# después abrí http://localhost:8000
```

---

## Si cambiás el CSS

Los navegadores guardan `styles.css` en caché. Después de editarlo, subile el número
de versión al final del link, en las 12 páginas `.html`:

```html
<link rel="stylesheet" href="assets/css/styles.css?v=5">   <!-- pasalo a ?v=6 -->
```

Con eso el navegador lo baja de nuevo en vez de usar la copia vieja. En la terminal:

```bash
sed -i 's/styles.css?v=5/styles.css?v=6/' *.html
```

---

## Después de subir un cambio

GitHub Pages tarda **1 o 2 minutos** en publicar, y además los navegadores guardan los
archivos un rato. Si subiste productos nuevos y todavía no los ves, esperá unos minutos
y recargá — se acomoda solo.

Lo único que sí conviene forzar a mano es el CSS, con el `?v=` explicado arriba.

---

## Publicar en GitHub Pages

1. En el repo: **Settings → Pages**.
2. En *Source* elegí **Deploy from a branch**.
3. Branch: `main`, carpeta `/ (root)`.
4. Guardá. En un par de minutos queda online.

---

## Pendientes

- [ ] Subir las 32 fotos que faltan — el checklist completo, con el nombre exacto de
      cada archivo, está en `assets/img/README.md`
- [x] Bombillas y bombillones tiene sus 5 productos reales cargados, con precio
- [ ] Cargar los productos reales del resto de las secciones (mates, yerberas,
      canastas, yerbas, termos), que hoy son de ejemplo
