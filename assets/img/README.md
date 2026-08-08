# Imágenes del sitio

Acá va todo el material gráfico. Mientras un archivo no exista, el sitio muestra el
placeholder de la marca — no se rompe nada. **Todos los productos ya tienen su nombre
de archivo asignado en el código:** para cargar una foto no hay que tocar
`products.js`, alcanza con subir el archivo a la carpeta que corresponde, con el
nombre exacto de esta lista.

## Estado actual: 9 de 32 fotos cargadas

Las 5 de bombillas y bombillones, más 4 generales (los dos del hero, el showroom y
la del cliente 32luceeroo). Faltan 23 — este archivo es el checklist para ir tachando
a medida que subís cada una.

---

## 1. Imágenes generales — 5 archivos (4 listas ✅)

Van sueltas en `assets/img/`, no en una subcarpeta.

| Archivo | Qué foto va | Medida sugerida |
|---|---|---|
| ✅ `hero-1.jpg` | La del mate en el auto con el termo de stickers | listo |
| ✅ `hero-2.jpg` | La del puesto en la Feria Municipal | listo |
| ✅ `showroom.jpg` | La de los pedidos para Viedma, con las bombillas atrás | listo |
| `logo.png` | El logo con fondo transparente | 400 × 140 px |
| `og.jpg` | La que se ve al compartir el link por WhatsApp | 1200 × 630 px |

El collage del inicio y la foto de "Nosotros" ya se muestran, porque `hero-1.jpg`,
`hero-2.jpg` y `showroom.jpg` están cargadas.

## 2. Clientes — 3 archivos (1 lista ✅)

En `assets/img/clientes/`.

| Archivo | Qué foto va |
|---|---|
| ✅ `32luceeroo.jpg` | La de la bolsa de la marca con el mate y la bombilla (@32luceeroo) |
| `cynmiran.jpg` | La del termo con el logo y el puesto de la feria (@cynmiran_0125) |
| `josias.jpg` | La del mate con bombillón en la cancha (@josias_cevalles_9) |

## 3. Mates — 6 archivos

En `assets/img/mates/`.

| Archivo | Producto |
|---|---|
| `criollo-cuero.jpg` | Mate criollo forrado en cuero |
| `criollo-camionero.jpg` | Mate criollo camionero |
| `calabaza-imperial.jpg` | Mate de calabaza imperial |
| `calabaza-torpedo.jpg` | Mate de calabaza torpedo |
| `algarrobo-virola.jpg` | Mate de algarrobo con virola |
| `algarrobo-tallado.jpg` | Mate de algarrobo tallado |

## 4. Yerberas — 3 archivos

En `assets/img/yerberas/`.

| Archivo | Producto |
|---|---|
| `set-yerbera-azucarera.jpg` | Set yerbera + azucarera |
| `yerbera-acero.jpg` | Yerbera de acero inoxidable |
| `yerbera-dosificador.jpg` | Yerbera con dosificador |

## 5. Canastas — 3 archivos

En `assets/img/canastas/`.

| Archivo | Producto |
|---|---|
| `canasta-mimbre.jpg` | Canasta matera de mimbre |
| `canasta-con-tapa.jpg` | Canasta matera con tapa |
| `bolso-matero.jpg` | Bolso matero |

## 6. Bombillas y bombillones — 5 archivos ✅ listo

En `assets/img/bombillas/`. Estos cinco productos ya tienen precio real y foto
cargados.

| Archivo | Producto |
|---|---|
| `pico-de-loro.jpg` | Bombilla pico de loro — $ 6.500 |
| `bombillon-pico-del-rey.jpg` | Bombillón pico del rey — $ 28.000 |
| `bombillon-recto-alpaca.jpg` | Bombillón recto de alpaca — $ 28.000 |
| `bombillon-premium-curvo.jpg` | Bombillón premium curvo — $ 28.000 |
| `bombillon-pico-de-loro-alpaca-bronce.jpg` | Bombillón pico de loro de alpaca y bronce — $ 28.000 |

## 7. Yerbas — 3 archivos

En `assets/img/yerbas/`.

| Archivo | Producto |
|---|---|
| `tradicional-1kg.jpg` | Yerba tradicional 1 kg |
| `suave-1kg.jpg` | Yerba suave 1 kg |
| `compuesta-hierbas.jpg` | Yerba compuesta con hierbas |

## 8. Termos — 4 archivos

En `assets/img/termos/`.

| Archivo | Producto |
|---|---|
| `termo-1lt-cebador.jpg` | Termo 1 lt con tapón cebador |
| `termo-1lt-acero-mate.jpg` | Termo 1 lt acero mate |
| `stanley-classic-12lt.jpg` | Stanley Classic 1,2 lt |
| `stanley-color-12lt.jpg` | Stanley 1,2 lt edición color |

---

## Cómo sacarlas para que queden parejas

Esto es lo que más hace que el sitio se vea profesional y no armado a las apuradas.

- **Vertical, proporción 4:5** (ej. 1000 × 1250 px). Todas las tarjetas usan esa medida.
- **Siempre el mismo fondo y la misma distancia.** Un fondo liso y claro —una tela, un
  cartón crudo, una pared blanca— con el celular cerca de una ventana alcanza y sobra.
  No hace falta cámara ni estudio. Las fotos de los bombillones sobre el soporte negro
  con el logo, contra la pared de ladrillo, son un buen ejemplo a repetir.
- Nada de fondos distintos entre un producto y otro: con 60 productos, eso es lo que
  hace que una tienda se vea desprolija.

## Peso de los archivos

**Menos de 300 KB cada una.** La diferencia entre fotos de 3 MB y de 300 KB es que el
sitio cargue en 2 segundos o en 20 con datos móviles. Más del 85% de los clientes
entran desde el celular, muchos con señal floja.

Para achicarlas sin instalar nada: [squoosh.app](https://squoosh.app) — arrastrás la
foto, bajás la calidad a 75% y la descargás.

## Cómo subirlas

Desde el celular, sin necesidad de computadora:

1. Entrá al repositorio en GitHub.
2. Andá a la carpeta que corresponda (por ejemplo `assets/img/mates`).
3. **Add file → Upload files**.
4. Elegí la foto desde el carrete y confirmá que el nombre coincida exactamente con
   el de esta lista (minúscula, sin tildes, sin espacios).
5. Repetí para cada foto. GitHub Pages tarda 1 o 2 minutos en publicar el cambio.

No hace falta editar `assets/js/products.js` para nada de esto: los productos ya
están esperando cada archivo por su nombre.

## Consejo

Antes de sacar las 32, probá con **3 o 4** de una misma sección y subilas. Si el
resultado te convence, seguís con el resto sin tener que repetir nada.
