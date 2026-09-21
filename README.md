# valentien 💛🌻

Réplica de la animación del video: **flores amarillas** con galaxia dorada,
corazón de glitter y carta de amor. Pensada para verse en el **celular**.

## La secuencia, fase por fase

| Tiempo | Qué pasa |
|--------|----------|
| 0.0s  | Cielo estrellado; florecitas amarillas caen con estela |
| 2.8s  | Estalla la **galaxia dorada**: disco de polvo y brazos espirales girando |
| 4.2s  | Nace el **corazón de glitter** y va creciendo |
| 5.0s  | **Florecen** los ramos de girasoles, uno por uno |
| 5.8s  | Aparecen las **frases de amor** escalonadas |
| 6.0s  | Fuente de partículas del centro hacia el corazón |
| 12.0s | Se abre la **carta de amor** con su botón *Cerrar* |

Después la escena sigue viva; el botón 💌 vuelve a abrir la carta y
tocando la pantalla sueltas un estallido de destellos.

Todo con HTML + CSS + JavaScript puro (canvas), sin dependencias.

## Optimizado para móvil

- Pantalla completa real, sin scroll, sin rebote ni zoom accidental.
- Respeta el *notch* con `env(safe-area-inset-*)`.
- Se reajusta al girar el teléfono.
- Baja la densidad de partículas en pantallas pequeñas para ir fluido.
- Se puede añadir a la pantalla de inicio como app.

## Cómo verlo

Abre `index.html`, o levanta un servidor local:

```bash
python3 -m http.server 8000
```

Para verlo desde el celular en la misma red WiFi, busca la IP de tu
computadora y entra a `http://TU_IP:8000` desde el teléfono.

## Archivos

| Archivo      | Descripción                                                  |
|--------------|--------------------------------------------------------------|
| `index.html` | Escena, nubes, ramos y la carta de amor.                     |
| `style.css`  | Paleta, fases de aparición y animaciones CSS.                |
| `script.js`  | Motor de partículas: estrellas, galaxia espiral y corazón.   |
