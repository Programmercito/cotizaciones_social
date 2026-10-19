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

Se guardan `usdt.mp4`, `resto.mp4`, `usdt.png` y `resto.png` en `out\`. Al indicar un JSON con `--input`, también se crean esos mismos archivos junto a ese archivo. Para cambiar la carpeta de salida:

```powershell
npm run render -- --input "C:\opt\osbo\cotiza\social.json" --out-dir "C:\ruta\de\salida"
```

Se generan solo dos videos: **Dólar** (USD Oficial y USDT) y **Otras cotizaciones** (Euro, Oro, Plata y UFV). USD Referencial se omite. En cada activo, primero aparece la tendencia animada; después se muestran los importes de compra y venta en grande y centrados. Si el JSON no trae compra, se muestra únicamente venta. Ambos videos incluyen un sello legible con la fecha y hora de `generated_at`, y terminan con un resumen en pantalla de todas sus cotizaciones durante 10 segundos. La flecha y la variación usan `trend.direction` y `trend.value` tal como los entrega la fuente.

## Despliegue

El workflow `.github/workflows/deploy.yaml` despliega al VPS al actualizar `main` o al iniciarlo manualmente. Configura los secretos `SERVER`, `USER` y `KEY` en este repositorio. El workflow copia el código al VPS, construye y publica `localhost:32000/cotizaciones_social:latest`, y aplica `cotizaciones/kub/services.yaml` desde `bot-dockers`.

El único manifiesto `cotizaciones/kub/services.yaml` define el CronJob, que conserva la frecuencia de cotizaciones (cada 15 minutos) y ejecuta ambos procesos en orden: primero genera `/opt/osbo/cotiza/social.json`; cuando cotizaciones termina correctamente, el contenedor social genera los videos e imágenes en `/opt/osbo/cotiza`. El token y la configuración del CronJob se mantienen en un solo lugar.

## Desarrollo y validación

```powershell
npm run studio
npm test
npm run typecheck
```
