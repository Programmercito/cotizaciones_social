# Cotizaciones de Bolivia: videos sociales

Generador de videos MP4 verticales (1080 × 1920, 30 fps, H.264) con TypeScript, React y Remotion. No usa IA ni necesita pistas de audio.

## Preparar y generar

Requiere Node.js 20 o posterior. Instala dependencias una vez:

```powershell
npm install
```

Genera los dos videos con el JSON de ejemplo:

```powershell
npm run render
```

Para procesar el JSON actualizado desde el proyecto cotiza:

```powershell
npm run render -- --input "C:\opt\osbo\cotiza\social.json"
```

Se guardan `usd-usdt.mp4` y `otros-activos.mp4` en `out\`. Para cambiar la carpeta de salida:

```powershell
npm run render -- --input "C:\opt\osbo\cotiza\social.json" --out-dir "C:\ruta\de\salida"
```

El primer video destaca USD Oficial y USDT; el segundo incluye las otras cotizaciones del archivo. La flecha y la variación usan `trend.direction` y `trend.value` tal como los entrega la fuente. El valor de compra cero se muestra como no disponible, no como una cotización real de cero.

## Desarrollo y validación

```powershell
npm run studio
npm test
npm run typecheck
```
