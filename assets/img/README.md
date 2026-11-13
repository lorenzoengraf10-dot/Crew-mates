# Imágenes del sitio

Cada producto referencia su foto en `assets/js/products.js`. Si una foto no existe, la
tarjeta muestra el placeholder de la marca y el sitio no se rompe.

## Carpetas

| Carpeta | Qué lleva |
|---|---|
| `mates/`, `canastas/`, `bombillas/`, `yerbas/`, `termos/` | fotos de productos |
| `fondos/` | fondos de las franjas (`hero`, `separador`, `clientes`, `preguntas`, `footer`) |
| `clientes/` | capturas de los testimonios |
| raíz | `logo.png`, `logo-light.png`, `favicon.svg`, `icon-touch.png` y `og.jpg` (la imagen que se ve al compartir el link, 1200 × 630) |

## Cómo preparar una foto de producto

- Medida **750 × 1000 px** (vertical, 3:4), JPG calidad ~82. Pesa ~100 KB y carga rápido con datos móviles.
- Nombre en minúsculas y con guiones: `torpedo-rey-negro-1.jpg` (y `-2` para la segunda foto).
- En la tarjeta se ve recortada en 4:5 y en la ficha en horizontal en el celular: dejá el producto
  centrado y con aire alrededor.

## Archivos que hoy no se usan

`hero-1.jpg`, `hero-2.jpg`, `showroom.jpg`, `secciones/*.jpg` y `clientes/cynmiran.jpg` están en
la carpeta pero ninguna página los muestra. Se pueden borrar sin afectar el sitio.
