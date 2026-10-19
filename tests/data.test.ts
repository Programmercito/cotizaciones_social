import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTrendValue,
  parseQuoteSnapshot,
  splitQuotes,
} from '../src/data';

const fixturePath = path.resolve('data', 'social.json');
const snapshot = parseQuoteSnapshot(JSON.parse(readFileSync(fixturePath, 'utf8')));

describe('social.json quote data', () => {
  it('uses the reported direction and value for USD and USDT', () => {
    const {primary} = splitQuotes(snapshot);

    expect(primary.map(({key, trend}) => [key, trend.direction, trend.value])).toEqual([
      ['usd_oficial', 'down', -0.09],
      ['usdt', 'up', 0.16],
    ]);
  });

  it('preserves every reported trend, including the other five instruments', () => {
    expect(snapshot.quotes.map(({key, trend}) => [key, trend.direction, trend.value])).toEqual([
      ['usdt', 'up', 0.16],
      ['usd_oficial', 'down', -0.09],
      ['usd_referencial', 'down', -0.06],
      ['euro', 'up', 0.05],
      ['oro', 'down', -10],
      ['plata', 'equal', 0],
      ['ufv', 'up', 0.01],
    ]);
  });

  it('excludes USD Referencial and keeps the four requested assets', () => {
    const {other} = splitQuotes(snapshot);

    expect(other.map(({key}) => key)).toEqual([
      'euro',
      'oro',
      'plata',
      'ufv',
    ]);
    expect(other.filter(({purchase}) => purchase === 0).map(({key}) => key)).toEqual([
      'oro',
      'plata',
      'ufv',
    ]);
    expect(other.some(({key}) => key === 'usd_referencial')).toBe(false);
  });

  it('formats prices, signed changes, and source dates for Bolivian social graphics', () => {
    expect(formatCurrency(2650, 'USD')).toBe('2.650,00 USD');
    expect(formatCurrency(13.36564, 'BOB')).toBe('13,37 BOB');
    expect(formatCurrency(3.34313, 'BOB')).toBe('3,34 BOB');
    expect(formatTrendValue(-0.09, 'BOB')).toBe('−0,09 BOB');
    expect(formatTrendValue(0.16, 'BOB')).toBe('+0,16 BOB');
    expect(formatTrendValue(-10, 'USD')).toBe('−10,00 USD');
    expect(formatDate('2026-10-18 21:29:41')).toBe('18/10/2026');
    expect(formatDateTime('2026-10-18T21:29:41-04:00')).toBe('18/10/2026 · 21:29');
  });

  it('rejects a trend direction that conflicts with its signed value', () => {
    const invalid = {
      ...snapshot,
      quotes: snapshot.quotes.map((quote, index) =>
        index === 0 ? {...quote, trend: {direction: 'up', value: -0.09}} : quote,
      ),
    };

    expect(() => parseQuoteSnapshot(invalid)).toThrow('no coincide con su dirección');
  });
});
