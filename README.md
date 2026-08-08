# Crewmates — sitio web

Sitio del emprendimiento **Crewmates** (Carmen de Patagones, Río Negro): mates, termos
y accesorios, con envíos a todo el país y showroom local.

Es un sitio **estático** (HTML + CSS + JavaScript, sin frameworks ni build). Se abre con
doble clic y se publica gratis en GitHub Pages.

---

## Estructura

```
index.html                 → toda la página (hero, secciones, footer)
assets/css/styles.css      → estilos y paleta de colores
assets/js/products.js      → 👈 EL CATÁLOGO. Acá cargás los productos
assets/js/main.js          → lógica (filtros, ficha de producto, menú)
assets/img/                → fotos (ver assets/img/README.md)
```

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
  precio: 28000,                                // o null para "Consultar"
  desc: "Calabaza seleccionada y curada a mano.",
  img: "assets/img/mates/imperial-negro.jpg",
  etiqueta: "Nuevo",                            // opcional
  color: "green",                               // opcional: orange | green | navy
  detalles: ["Curado", "Guarda de alpaca"],     // opcional
  agotado: false                                // opcional
}
```

5. Guardá y recargá la página. Listo.

### Subcategorías disponibles

| Sección | Valores válidos de `sub`              |
|---------|---------------------------------------|
| Mates   | `criollos`, `calabaza`, `algarrobo`   |
| Termos  | `1lt`, `stanley12`                    |

El resto de las secciones (yerberas, canastas, bombillas, yerbas) no llevan `sub`.

---

## Datos de contacto

Están todos juntos arriba de `assets/js/products.js`, en `CONFIG`:

```js
const CONFIG = {
  whatsapp: "5492920340402",       // formato internacional, sin + ni espacios
  whatsappVisible: "2920 340402",
  instagram: "https://www.instagram.com/crew.mattes",
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
| Crema medio   | `#F4EDE1` | Fondo de secciones alternadas          |
| Azul marino   | `#10365F` | Títulos, header, botones principales   |
| Azul profundo | `#0A2340` | Footer                                 |
| Naranja       | `#EE5B23` | Acentos, etiquetas, precios destacados |
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

## Publicar en GitHub Pages

1. En el repo: **Settings → Pages**.
2. En *Source* elegí **Deploy from a branch**.
3. Branch: la rama que quieras publicar, carpeta `/ (root)`.
4. Guardá. En un par de minutos queda online.

---

## Pendientes

- [ ] Subir `logo.png`, `hero-1.jpg`, `hero-2.jpg` y `showroom.jpg` a `assets/img/`
- [ ] Reemplazar los productos de ejemplo por los reales, con foto y precio
- [ ] Revisar los horarios de atención del footer en `index.html`
