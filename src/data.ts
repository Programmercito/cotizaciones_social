import type {Quote, QuoteSnapshot, TrendDirection} from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`El campo "${field}" debe ser texto no vacío.`);
  }

  return value;
};

const requiredNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`El campo "${field}" debe ser un número finito.`);
  }

  return value;
};

const parseQuote = (value: unknown, index: number): Quote => {
  const prefix = `quotes[${index}]`;
  if (!isRecord(value)) {
    throw new Error(`${prefix} debe ser un objeto.`);
  }

  const currency = requiredString(value.currency, `${prefix}.currency`);
  if (currency !== 'BOB' && currency !== 'USD') {
    throw new Error(`${prefix}.currency debe ser BOB o USD.`);
  }

  const sale = requiredNumber(value.sale, `${prefix}.sale`);
  const purchase = requiredNumber(value.purchase, `${prefix}.purchase`);
  if (sale < 0 || purchase < 0) {
    throw new Error(`${prefix}.sale y ${prefix}.purchase no pueden ser negativos.`);
  }

  if (!isRecord(value.trend)) {
    throw new Error(`${prefix}.trend debe incluir dirección y valor.`);
  }

  const direction = requiredString(value.trend.direction, `${prefix}.trend.direction`);
  if (direction !== 'up' && direction !== 'down' && direction !== 'equal') {
    throw new Error(`${prefix}.trend.direction debe ser up, down o equal.`);
  }

  const trendValue = requiredNumber(value.trend.value, `${prefix}.trend.value`);
  if (
    (direction === 'up' && trendValue <= 0) ||
    (direction === 'down' && trendValue >= 0) ||
    (direction === 'equal' && trendValue !== 0)
  ) {
    throw new Error(`${prefix}.trend.value no coincide con su dirección.`);
  }

  const updatedAt = requiredString(value.updated_at, `${prefix}.updated_at`);
  if (Number.isNaN(Date.parse(updatedAt.replace(' ', 'T')))) {
    throw new Error(`${prefix}.updated_at debe ser una fecha válida.`);
  }

  return {
    key: requiredString(value.key, `${prefix}.key`),
    label: requiredString(value.label, `${prefix}.label`),
    subtitle: requiredString(value.subtitle, `${prefix}.subtitle`),
    sale,
    purchase,
    updated_at: updatedAt,
    exchange: requiredString(value.exchange, `${prefix}.exchange`),
    currency,
    trend: {
      direction,
      value: trendValue,
    },
  };
};

export const parseQuoteSnapshot = (value: unknown): QuoteSnapshot => {
  if (!isRecord(value)) {
    throw new Error('El JSON debe ser un objeto.');
  }

  const generatedAt = requiredString(value.generated_at, 'generated_at');
  if (Number.isNaN(Date.parse(generatedAt))) {
    throw new Error('"generated_at" debe ser una fecha válida.');
  }

  if (!Array.isArray(value.quotes) || value.quotes.length === 0) {
    throw new Error('"quotes" debe ser una lista no vacía.');
  }

  const quotes = value.quotes.map(parseQuote);
  const keys = new Set(quotes.map(({key}) => key));
  if (keys.size !== quotes.length) {
    throw new Error('"quotes" no puede contener claves duplicadas.');
  }

  return {
    generated_at: generatedAt,
    title: requiredString(value.title, 'title'),
    source: requiredString(value.source, 'source'),
    quotes,
  };
};

export const splitQuotes = (snapshot: QuoteSnapshot) => {
  const primaryKeys = ['usd_oficial', 'usdt'];
  const excludedKeys = [...primaryKeys, 'usd_referencial'];
  const primary = primaryKeys
    .map((key) => snapshot.quotes.find((quote) => quote.key === key))
    .filter((quote): quote is Quote => quote !== undefined);
  if (primary.length !== primaryKeys.length) {
    throw new Error('Se requieren cotizaciones con las claves "usd_oficial" y "usdt".');
  }

  return {
    primary,
    other: snapshot.quotes.filter((quote) => !excludedKeys.includes(quote.key)),
  };
};

const numberFormatter = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (value: number): string => numberFormatter.format(value);

export const formatCurrency = (value: number, currency: Quote['currency']): string =>
  `${formatAmount(value)} ${currency}`;

export const formatTrendValue = (value: number, currency: Quote['currency']): string => {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${formatAmount(Math.abs(value))} ${currency}`;
};

export const formatDate = (value: string): string => {
  const date = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`Fecha no reconocida: ${value}`);
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
};

export const formatDateTime = (value: string): string => {
  const time = /[T ](\d{2}):(\d{2})/.exec(value);
  return time
    ? `${formatDate(value)} · ${time[1]}:${time[2]}`
    : formatDate(value);
};

export const formatQuoteUpdatedAt = (quote: Pick<Quote, 'key' | 'updated_at'>): string =>
  quote.key === 'usdt' ? formatDateTime(quote.updated_at) : formatDate(quote.updated_at);

export const trendLabel: Record<TrendDirection, string> = {
  up: 'SUBE',
  down: 'BAJA',
  equal: 'SIN CAMBIO',
};
