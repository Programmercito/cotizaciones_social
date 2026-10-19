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

Se generan solo dos videos: **Dólar** (USD Oficial y USDT) y **Otras cotizaciones** (Euro, Oro, Plata y UFV). USD Referencial se omite. En cada activo, primero aparece la tendencia animada; después se muestran los importes de compra y venta en grande y centrados. Si el JSON no trae compra, se muestra únicamente venta. Ambos videos incluyen un sello legible con la fecha y hora de `generated_at`, y terminan con un resumen en pantalla de todas sus cotizaciones durante 10 segundos. La flecha y la variación usan `trend.direction` y `trend.value` tal como los entrega la fuente.

## Desarrollo y validación

```powershell
npm run studio
npm test
npm run typecheck
```
