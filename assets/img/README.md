# Imágenes del sitio

Acá va todo el material gráfico. Si un archivo todavía no existe, el sitio muestra
un placeholder o directamente oculta el bloque — no se rompe nada.

## Archivos que faltan ahora mismo

Estos son los que ya tienen lugar reservado en el sitio. Guardalos con **este nombre
exacto**, en minúscula y sin tildes:

| Archivo | Qué foto va | Medida sugerida |
|---|---|---|
| `logo.png` | El logo con fondo transparente | 400 × 140 px |
| `hero-1.jpg` | La del mate en el auto con el termo de stickers | 1000 × 1000 px |
| `hero-2.jpg` | La del puesto en la feria de Patagones | 600 × 750 px |
| `showroom.jpg` | La de los pedidos para Viedma, con las bombillas atrás | 900 × 1100 px |
| `og.jpg` | La que se ve al compartir el link por WhatsApp | 1200 × 630 px |
| `clientes/cynmiran.jpg` | La del termo con el logo y el puesto de la feria | 800 × 1000 px |
| `clientes/josias.jpg` | La del mate con bombillón en la cancha | 800 × 1000 px |
| `clientes/32luceeroo.jpg` | La de la bolsa de la marca con el mate y la bombilla | 800 × 1000 px |

Cuando cargues `hero-1.jpg` y `hero-2.jpg`, el collage del inicio aparece solo
(hoy está oculto en celular justamente porque está vacío). Lo mismo con `showroom.jpg`.

## Fotos de producto

Cada categoría tiene su carpeta:

```
assets/img/mates/
assets/img/yerberas/
assets/img/canastas/
assets/img/bombillas/
assets/img/yerbas/
assets/img/termos/
assets/img/clientes/     ← capturas de historias de clientes
```

### Fotos que ya están esperadas por su nombre

Los bombillones y la bombilla ya están cargados en el catálogo con estos nombres de
archivo. Apenas los subas, aparecen solos en la sección:

```
assets/img/bombillas/pico-de-loro.jpg
assets/img/bombillas/bombillon-pico-del-rey.jpg
assets/img/bombillas/bombillon-recto-alpaca.jpg
assets/img/bombillas/bombillon-premium-curvo.jpg
```

Después, en `assets/js/products.js`, poné la ruta en el campo `img`:

```js
img: "assets/img/mates/imperial-negro.jpg"
```

## Cómo sacarlas para que queden parejas

Esto es lo que más hace que el sitio se vea profesional y no armado a las apuradas.

- **Vertical, proporción 4:5** (ej. 1000 × 1250 px). Todas las tarjetas usan esa medida.
- **Siempre el mismo fondo y la misma distancia.** Un fondo liso y claro —una tela, un
  cartón crudo, una pared blanca— con el celular cerca de una ventana alcanza y sobra.
  No hace falta cámara ni estudio.
- Nada de fondos distintos entre un producto y otro: con 60 productos, eso es lo que
  hace que una tienda se vea desprolija.
- Nombres de archivo sin espacios, tildes ni mayúsculas: `mate-algarrobo-tallado.jpg`.

## Peso de los archivos

**Menos de 300 KB cada una.** Con 60 productos, la diferencia entre fotos de 3 MB y de
300 KB es que el sitio cargue en 2 segundos o en 20 con datos móviles. Más del 85% de
los clientes entran desde el celular, muchos con señal floja.

Para achicarlas sin instalar nada: [squoosh.app](https://squoosh.app) — arrastrás la
foto, bajás la calidad a 75% y la descargás.
