import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseQuoteSnapshot, splitQuotes} from '../src/data';
import type {QuoteVideoProps} from '../src/types';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const currentTimestamp = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const generateAmbientAudio = async (outputPath: string) => {
  const sampleRate = 22_050;
  const durationSeconds = 20;
  const channels = 2;
  const frameCount = sampleRate * durationSeconds;
  const audio = Buffer.alloc(frameCount * channels * 2);
  const scale = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
  const chords = [
    [261.63, 329.63, 392],
    [293.66, 369.99, 440],
    [329.63, 392, 493.88],
    [261.63, 329.63, 440],
  ];
  const seed = Date.now() >>> 0;
  let random = seed;
  const nextRandom = () => {
    random = (random * 1_664_525 + 1_013_904_223) >>> 0;
    return random / 4_294_967_296;
  };
  const melody = Array.from({length: 25}, () => scale[Math.floor(nextRandom() * scale.length)]);

  for (let frame = 0; frame < frameCount; frame += 1) {
    const time = frame / sampleRate;
    const chord = chords[Math.floor(time / 5) % chords.length];
    const chordEnvelope = Math.min(1, time / 1.5, (durationSeconds - time) / 1.5);
    let value = chord.reduce((sum, frequency) => sum + Math.sin(2 * Math.PI * frequency * time) * 0.06, 0);
    const noteIndex = Math.floor(time / 0.8);
    const noteTime = time % 0.8;
    const noteEnvelope = Math.min(1, noteTime / 0.04, (0.76 - noteTime) / 0.3);
    if (noteEnvelope > 0) {
      value += Math.sin(2 * Math.PI * melody[noteIndex % melody.length] * time) * noteEnvelope * 0.1;
    }
    const sample = Math.max(-1, Math.min(1, value * chordEnvelope));
    const offset = frame * channels * 2;
    const encoded = Math.round(sample * 32_767);
    audio.writeInt16LE(encoded, offset);
    audio.writeInt16LE(encoded, offset + 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + audio.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * 2, 28);
  header.writeUInt16LE(channels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(audio.length, 40);
  await writeFile(outputPath, Buffer.concat([header, audio]));
};

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
    imageFormat: 'jpeg',
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
  const renderedAt = currentTimestamp();
  if (other.length === 0) {
    throw new Error('Se requiere al menos una cotización además de USD Oficial y USDT.');
  }

  const data: QuoteVideoProps[] = [
    {
      title: 'Dólar',
      subtitle: 'USD Oficial + USDT · cotizaciones del dólar.',
      source: snapshot.source,
      generatedAt: snapshot.generated_at,
      renderedAt,
      quotes: primary,
    },
    {
      title: 'Otras cotizaciones',
      subtitle: 'Euro · Oro · Plata · UFV.',
      source: snapshot.source,
      generatedAt: snapshot.generated_at,
      renderedAt,
      quotes: other,
      hideRedundantPurchase: true,
    },
  ];

  await mkdir(outDir, {recursive: true});
  const audioPath = path.join(projectRoot, 'public', 'ambient.wav');
  await mkdir(path.dirname(audioPath), {recursive: true});
  await generateAmbientAudio(audioPath);
  const serveUrl = await bundle({
    entryPoint: path.join(projectRoot, 'src', 'index.tsx'),
  });

  await renderVideo(serveUrl, 'usd-usdt', path.join(outDir, 'usdt.mp4'), data[0]);
  await renderVideo(serveUrl, 'otros-activos', path.join(outDir, 'resto.mp4'), data[1]);
  await renderStillImage(serveUrl, 'usd-usdt', path.join(outDir, 'usdt.jpg'), data[0]);
  await renderStillImage(serveUrl, 'otros-activos', path.join(outDir, 'resto.jpg'), data[1]);

  if (additionalOutDir) {
    const additionalOutputs: [string, string][] = [
      [path.join(outDir, 'usdt.mp4'), path.join(additionalOutDir, 'usdt.mp4')],
      [path.join(outDir, 'resto.mp4'), path.join(additionalOutDir, 'resto.mp4')],
      [path.join(outDir, 'usdt.jpg'), path.join(additionalOutDir, 'usdt.jpg')],
      [path.join(outDir, 'resto.jpg'), path.join(additionalOutDir, 'resto.jpg')],
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
