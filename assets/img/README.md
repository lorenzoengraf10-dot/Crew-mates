# Imágenes del sitio

Acá va todo el material gráfico. Si un archivo todavía no existe, el sitio muestra
un placeholder con el logo — no se rompe nada.

## Archivos generales (van sueltos en esta carpeta)

| Archivo        | Dónde se usa                        | Medida sugerida |
|----------------|-------------------------------------|-----------------|
| `logo.png`     | Header (fondo transparente)         | 400 × 140 px    |
| `hero-1.jpg`   | Foto grande del inicio              | 1000 × 1000 px  |
| `hero-2.jpg`   | Foto chica del inicio               | 600 × 750 px    |
| `showroom.jpg` | Sección "Nosotros"                  | 900 × 1100 px   |
| `og.jpg`       | Miniatura al compartir el link      | 1200 × 630 px   |

## Fotos de producto

Cada categoría tiene su carpeta:

```
assets/img/mates/
assets/img/yerberas/
assets/img/canastas/
assets/img/bombillas/
assets/img/yerbas/
assets/img/termos/
```

Después, en `assets/js/products.js`, poné la ruta en el campo `img`:

```js
img: "assets/img/mates/imperial-negro.jpg"
```

## Consejos para que se vean bien

- **Formato vertical 4:5** (ej. 1000 × 1250 px). Todas las tarjetas usan esa proporción.
- Fondo parejo y claro, o el mismo fondo para toda una categoría: queda mucho más prolijo.
- Nombres de archivo sin espacios, tildes ni mayúsculas: `mate-algarrobo-tallado.jpg`.
- Achicá las fotos antes de subirlas (menos de 300 KB cada una) para que el sitio cargue rápido.
