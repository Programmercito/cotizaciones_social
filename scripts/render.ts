import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {copyFile, mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseQuoteSnapshot, splitQuotes} from '../src/data';
import type {QuoteVideoProps} from '../src/types';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const readArguments = (args: string[]) => {
  let input = path.join(projectRoot, 'data', 'social.json');
  let outDir = path.join(projectRoot, 'out');
  let explicitInput = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--input' || arg === '--out-dir') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Falta el valor para ${arg}.`);
      }

      if (arg === '--input') {
        input = path.resolve(value);
        explicitInput = true;
      } else {
        outDir = path.resolve(value);
      }

      index += 1;
      continue;
    }

    throw new Error(`Argumento no reconocido: ${arg}`);
  }

  return {input, outDir, additionalOutDir: explicitInput ? path.dirname(input) : null};
};

const renderVideo = async (
  serveUrl: string,
  id: string,
  outputLocation: string,
  inputProps: QuoteVideoProps,
) => {
  const composition = await selectComposition({serveUrl, id, inputProps});
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps,
    concurrency: 2,
    chromiumOptions: {enableMultiProcessOnLinux: true},
  });
  console.log(`Video generado: ${outputLocation}`);
};

const renderStillImage = async (
  serveUrl: string,
  id: string,
  outputLocation: string,
  inputProps: QuoteVideoProps,
) => {
  const composition = await selectComposition({serveUrl, id, inputProps});
  await renderStill({
    composition,
    serveUrl,
    output: outputLocation,
    frame: composition.durationInFrames - 1,
    inputProps,
    chromiumOptions: {enableMultiProcessOnLinux: true},
  });
  console.log(`Imagen final generada: ${outputLocation}`);
};

const main = async () => {
  const {input, outDir, additionalOutDir} = readArguments(process.argv.slice(2));
  let raw: string;
  try {
    raw = await readFile(input, 'utf8');
  } catch (error) {
    throw new Error(`No se pudo leer el JSON de entrada "${input}".`, {cause: error});
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`El archivo "${input}" no contiene JSON válido.`, {cause: error});
  }

  const snapshot = parseQuoteSnapshot(parsed);
  const {primary, other} = splitQuotes(snapshot);
  if (other.length === 0) {
    throw new Error('Se requiere al menos una cotización además de USD Oficial y USDT.');
  }

  const data: QuoteVideoProps[] = [
    {
      title: 'Dólar',
      subtitle: 'USD Oficial + USDT · cotizaciones del dólar.',
      source: snapshot.source,
      generatedAt: snapshot.generated_at,
      quotes: primary,
    },
    {
      title: 'Otras cotizaciones',
      subtitle: 'Euro · Oro · Plata · UFV.',
      source: snapshot.source,
      generatedAt: snapshot.generated_at,
      quotes: other,
    },
  ];

  await mkdir(outDir, {recursive: true});
  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, 'src', 'index.tsx'),
  });

  await renderVideo(serveUrl, 'usd-usdt', path.join(outDir, 'usdt.mp4'), data[0]);
  await renderVideo(serveUrl, 'otros-activos', path.join(outDir, 'resto.mp4'), data[1]);
  await renderStillImage(serveUrl, 'usd-usdt', path.join(outDir, 'usdt.png'), data[0]);
  await renderStillImage(serveUrl, 'otros-activos', path.join(outDir, 'resto.png'), data[1]);

  if (additionalOutDir) {
    const additionalOutputs: [string, string][] = [
      [path.join(outDir, 'usdt.mp4'), path.join(additionalOutDir, 'usdt.mp4')],
      [path.join(outDir, 'resto.mp4'), path.join(additionalOutDir, 'resto.mp4')],
      [path.join(outDir, 'usdt.png'), path.join(additionalOutDir, 'usdt.png')],
      [path.join(outDir, 'resto.png'), path.join(additionalOutDir, 'resto.png')],
    ];
    await Promise.all(
      additionalOutputs.map(async ([source, destination]) => {
        if (path.resolve(source) === path.resolve(destination)) {
          return;
        }

        await copyFile(source, destination);
        console.log(`Copia adicional generada: ${destination}`);
      }),
    );
  }
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
