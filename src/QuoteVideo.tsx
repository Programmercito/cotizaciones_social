import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import type {CSSProperties} from 'react';
import {
  formatCurrency,
  formatDate,
  formatTrendValue,
  trendLabel,
} from './data';
import type {Quote, QuoteVideoProps} from './types';

const colors = {
  ink: '#071b24',
  muted: '#9cb3bb',
  white: '#f3faf8',
  mint: '#62f2bd',
  red: '#ff7a79',
  card: 'rgba(14, 45, 53, 0.92)',
};

const Badge = ({quote}: {quote: Quote}) => {
  const isUp = quote.trend.direction === 'up';
  const isEqual = quote.trend.direction === 'equal';
  const color = isEqual ? colors.muted : isUp ? colors.mint : colors.red;
  const arrow = isEqual ? '•' : isUp ? '↗' : '↘';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: `1px solid ${color}66`,
        borderRadius: 999,
        padding: '12px 18px',
        backgroundColor: `${color}12`,
        color,
        fontSize: 21,
        fontWeight: 800,
        letterSpacing: 1.1,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{fontSize: 28, lineHeight: 0}}>{arrow}</span>
      {trendLabel[quote.trend.direction]}
      <span style={{fontWeight: 700}}>
        {formatTrendValue(quote.trend.value, quote.currency)}
      </span>
    </div>
  );
};

const QuoteCard = ({quote, index}: {quote: Quote; index: number}) => {
  const frame = useCurrentFrame();
  const start = index * 9 + 12;
  const progress = interpolate(frame, [start, start + 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const style: CSSProperties = {
    opacity: progress,
    transform: `translate3d(0, ${(1 - progress) * 48}px, 0)`,
  };
  const purchase = quote.purchase === 0 ? 'No disponible' : formatCurrency(quote.purchase, quote.currency);

  return (
    <div
      style={{
        ...style,
        flex: '1 1 0',
        minHeight: 0,
        padding: '25px 30px',
        borderRadius: 30,
        background: `linear-gradient(120deg, ${colors.card}, rgba(9, 33, 42, 0.94))`,
        border: '1px solid rgba(148, 206, 193, 0.22)',
        boxShadow: '0 18px 50px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16}}>
        <div>
          <div style={{fontSize: 37, fontWeight: 850, letterSpacing: -1.4, color: colors.white}}>
            {quote.label}
          </div>
          <div style={{fontSize: 19, marginTop: 3, color: colors.muted, letterSpacing: 1}}>
            {quote.subtitle.toUpperCase()}
          </div>
        </div>
        <Badge quote={quote} />
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 19}}>
        <div>
          <div style={{fontSize: 17, color: colors.muted, marginBottom: 4}}>VENTA</div>
          <div style={{fontSize: 39, fontWeight: 800, letterSpacing: -1.2, color: colors.white}}>
            {formatCurrency(quote.sale, quote.currency)}
          </div>
        </div>
        <div>
          <div style={{fontSize: 17, color: colors.muted, marginBottom: 4}}>COMPRA</div>
          <div
            style={{
              fontSize: purchase === 'No disponible' ? 27 : 39,
              fontWeight: 800,
              letterSpacing: -1.2,
              color: purchase === 'No disponible' ? colors.muted : colors.white,
            }}
          >
            {purchase}
          </div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 13}}>
        <div style={{fontSize: 17, color: colors.muted}}>
          ACTUALIZADO {formatDate(quote.updated_at)}
        </div>
        {quote.purchase === 0 && (
          <div style={{fontSize: 15, color: colors.muted}}>Compra no informada</div>
        )}
      </div>
    </div>
  );
};

export const QuoteVideo = ({title, subtitle, source, generatedAt, quotes}: QuoteVideoProps) => {
  const frame = useCurrentFrame();
  const titleProgress = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 92% 3%, rgba(34, 111, 102, .46), transparent 37%), radial-gradient(ellipse at 0% 98%, rgba(14, 91, 96, .34), transparent 34%), linear-gradient(145deg, #071920 0%, ${colors.ink} 55%, #092631 100%)`,
        color: colors.white,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{position: 'absolute', inset: 0, opacity: 0.1}}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#9de5ce" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '66px 58px 48px'}}>
        <Sequence from={0}>
          <div
            style={{
              opacity: titleProgress,
              transform: `translateY(${(1 - titleProgress) * 24}px)`,
            }}
          >
            <div style={{fontSize: 17, color: colors.mint, fontWeight: 800, letterSpacing: 4}}>
              BOLIVIA <span style={{color: '#63828a'}}>/</span> COTIZACIONES
            </div>
            <div
              style={{
                fontSize: 78,
                fontWeight: 900,
                letterSpacing: -4,
                lineHeight: 0.99,
                marginTop: 22,
                maxWidth: 950,
              }}
            >
              {title}
            </div>
            <div style={{fontSize: 25, color: colors.muted, marginTop: 17, lineHeight: 1.3}}>
              {subtitle}
            </div>
            <div style={{display: 'flex', gap: 12, alignItems: 'center', marginTop: 20}}>
              <div style={{width: 9, height: 9, borderRadius: 9, backgroundColor: colors.mint}} />
              <div style={{fontSize: 17, color: '#c2d3d5'}}>
                {source} <span style={{color: '#69868b'}}>•</span> CORTE {formatDate(generatedAt)}
              </div>
            </div>
          </div>
        </Sequence>

        <div style={{display: 'flex', flexDirection: 'column', flex: 1, gap: 15, marginTop: 31, minHeight: 0}}>
          {quotes.map((quote, index) => (
            <QuoteCard key={quote.key} quote={quote} index={index} />
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 17,
            borderTop: '1px solid rgba(163, 199, 195, .2)',
            color: '#91aaae',
            fontSize: 16,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <span>Tendencia reportada por la fuente; no es una proyección.</span>
          <span style={{color: '#b5c8ca', fontWeight: 700}}>BOB · USD</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
