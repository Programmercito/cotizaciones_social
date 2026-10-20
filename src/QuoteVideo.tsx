import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Quote, QuoteVideoProps} from './types';
import {formatCurrency, formatQuoteUpdatedAt, formatTrendValue, trendLabel} from './data';

export const INTRO_FRAMES = 45;
export const QUOTE_FRAMES = 150;
export const RECAP_FRAMES = 300;

const palette = {
  background: '#07171e',
  surface: '#102b34',
  text: '#f5fbfa',
  muted: '#a6bdc2',
  green: '#54f0ae',
  red: '#ff777a',
  gold: '#f0c777',
};

const accentFor = (quote: Quote) =>
  quote.trend.direction === 'equal'
    ? palette.gold
    : quote.trend.direction === 'up'
      ? palette.green
      : palette.red;

const shouldShowPurchase = (quote: Quote, hideRedundantPurchase: boolean) =>
  quote.purchase !== 0 && (!hideRedundantPurchase || quote.purchase !== quote.sale);

const amountFontSize = (value: string, spacious: boolean) =>
  spacious ? 104 : value.length > 11 ? 50 : value.length > 9 ? 58 : 68;

const QuoteTimestamp = ({timestamp, compact = false}: {timestamp: string; compact?: boolean}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: compact ? 18 : 20,
      padding: compact ? '18px 24px' : '20px 26px',
      borderRadius: 18,
      border: '1px solid rgba(240, 199, 119, .45)',
      background: 'linear-gradient(110deg, rgba(240, 199, 119, .12), rgba(240, 199, 119, .04))',
      boxShadow: '0 8px 30px rgba(0, 0, 0, .14)',
      whiteSpace: 'nowrap',
    }}
  >
    <div style={{width: 11, height: 11, borderRadius: '50%', background: palette.gold}} />
    <div style={{fontSize: compact ? 24 : 26, fontWeight: 900, letterSpacing: compact ? 1 : 1.5, color: palette.gold}}>
      ACTUALIZADO
    </div>
    <div style={{fontSize: compact ? 62 : 72, fontWeight: 800, color: palette.text}}>
      {timestamp}
    </div>
  </div>
);

const Intro = ({title, subtitle, source}: Pick<QuoteVideoProps, 'title' | 'subtitle' | 'source'>) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '100px 92px',
        opacity: entrance,
        transform: `translateY(${(1 - entrance) * 34}px)`,
      }}
    >
      <div style={{fontSize: 22, fontWeight: 800, letterSpacing: 6, color: palette.green}}>
        BOLIVIA <span style={{color: '#76939b'}}>·</span> COTIZACIONES
      </div>
      <div
        style={{
          marginTop: 32,
          maxWidth: 880,
          fontSize: title.length > 16 ? 82 : 104,
          fontWeight: 900,
          lineHeight: 0.98,
          letterSpacing: -3.5,
          color: palette.text,
          textWrap: 'balance',
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 28,
          maxWidth: 750,
          fontSize: 30,
          lineHeight: 1.35,
          color: palette.muted,
        }}
      >
        {subtitle}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 56}}>
        <div style={{width: 11, height: 11, borderRadius: '50%', background: palette.green}} />
        <div style={{fontSize: 21, color: palette.text, letterSpacing: 1}}>
          DATOS DE {source.toUpperCase()}
        </div>
      </div>
      <div
        style={{
          width: 138,
          height: 7,
          marginTop: 48,
          borderRadius: 10,
          background: `linear-gradient(90deg, ${palette.green}, ${palette.gold})`,
        }}
      />
    </div>
  );
};

const Tendency = ({quote, frame}: {quote: Quote; frame: number}) => {
  const accent = accentFor(quote);
  const reveal = interpolate(frame, [0, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const isUp = quote.trend.direction === 'up';
  const isDown = quote.trend.direction === 'down';
  const arrow = isUp ? '↗' : isDown ? '↘' : '→';
  const arrowY = interpolate(frame, [0, 38], [isUp ? 44 : isDown ? -44 : 0, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const linePath = isUp
    ? 'M 5 112 C 95 112, 128 33, 250 25'
    : isDown
      ? 'M 5 25 C 95 25, 128 112, 250 112'
      : 'M 5 68 C 100 68, 150 68, 250 68';
  const dashOffset = interpolate(frame, [0, 40], [290, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 66,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 34}px)`,
      }}
    >
      <div>
        <div style={{fontSize: 24, fontWeight: 800, letterSpacing: 5, color: palette.muted}}>
          TENDENCIA REPORTADA
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 112,
            fontWeight: 900,
            letterSpacing: -4,
            lineHeight: 0.98,
            color: accent,
          }}
        >
          {trendLabel[quote.trend.direction]}
        </div>
        <div style={{marginTop: 18, fontSize: 76, fontWeight: 850, letterSpacing: -1.8, color: palette.text}}>
          {formatTrendValue(quote.trend.value, quote.currency)}
        </div>
      </div>

      <div
        style={{
          width: 260,
          height: 260,
          flex: '0 0 260px',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: `radial-gradient(circle at 40% 35%, ${accent}25, ${accent}08 70%)`,
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 80px ${accent}20`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg width="218" height="150" viewBox="0 0 260 140" aria-hidden="true">
          <path
            d={linePath}
            fill="none"
            stroke={`${accent}55`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="290"
            strokeDashoffset={dashOffset}
          />
          <path
            d={isUp ? 'M 218 13 L 250 25 L 230 49' : isDown ? 'M 218 124 L 250 112 L 230 88' : 'M 228 54 L 250 68 L 228 82'}
            fill="none"
            stroke={accent}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={reveal}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            fontSize: 91,
            fontWeight: 800,
            color: accent,
            transform: `translate(${(1 - reveal) * -24}px, ${arrowY}px)`,
            opacity: reveal,
          }}
        >
          {arrow}
        </div>
      </div>
    </div>
  );
};

const PriceRow = ({
  label,
  value,
  currency,
  color,
  progress,
}: {
  label: string;
  value: string;
  currency: Quote['currency'];
  color: string;
  progress: number;
}) => (
  <div
    style={{
      boxSizing: 'border-box',
      width: '100%',
      minHeight: 225,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '23px 34px',
      borderRadius: 28,
      background: 'linear-gradient(110deg, rgba(16, 43, 52, .98), rgba(10, 32, 41, .96))',
      border: '1px solid rgba(152, 198, 192, .18)',
      borderLeft: `8px solid ${color}`,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 54}px) scale(${0.97 + progress * 0.03})`,
    }}
  >
    <div style={{textAlign: 'center'}}>
      <div style={{fontSize: 21, fontWeight: 800, letterSpacing: 4, color: palette.muted}}>
        {label}
      </div>
      <div style={{marginTop: 7, fontSize: 19, fontWeight: 700, color}}>
        COTIZACIÓN EN {currency}
      </div>
    </div>
    <div
      style={{
        fontSize: value.length > 11 ? 92 : value.length > 9 ? 108 : 124,
        fontWeight: 900,
        letterSpacing: -3,
        color: palette.text,
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      {value}
    </div>
  </div>
);

const QuoteSlide = ({
  quote,
  index,
  count,
  frame,
  title,
  source,
  hideRedundantPurchase = false,
}: {
  quote: Quote;
  index: number;
  count: number;
  frame: number;
  title: string;
  source: string;
  hideRedundantPurchase?: boolean;
}) => {
  const localFrame = frame - INTRO_FRAMES - index * QUOTE_FRAMES;
  const transition = interpolate(localFrame, [0, 13], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tendencyOpacity = interpolate(localFrame, [0, 12, 46, 63], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const priceOpacity = interpolate(localFrame, [55, 73], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const priceLift = interpolate(localFrame, [55, 73], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const endFade = interpolate(localFrame, [QUOTE_FRAMES - 12, QUOTE_FRAMES], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const accent = accentFor(quote);
  const hasPurchase = shouldShowPurchase(quote, hideRedundantPurchase);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '74px 86px 76px',
        display: 'flex',
        flexDirection: 'column',
        opacity: transition * endFade,
        background: `radial-gradient(ellipse at 93% 39%, ${accent}12, transparent 39%)`,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 5, color: palette.green}}>
            BOLIVIA <span style={{color: '#76939b'}}>·</span> {title.toUpperCase()}
          </div>
          <div style={{marginTop: 15, fontSize: title.length > 16 ? 57 : 67, fontWeight: 900, letterSpacing: -2.4, color: palette.text}}>
            {title}
          </div>
        </div>
        <div
          style={{
            padding: '13px 18px',
            borderRadius: 999,
            border: '1px solid rgba(166, 189, 194, .24)',
            color: palette.muted,
            fontSize: 20,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </div>
      </div>

      <div style={{marginTop: 54}}>
        <div style={{fontSize: 78, fontWeight: 900, letterSpacing: -3, lineHeight: 1, color: palette.text, textAlign: 'center'}}>
          {quote.label}
        </div>
        <div style={{fontSize: 25, marginTop: 11, color: palette.muted, letterSpacing: 1.4, textAlign: 'center'}}>
          {quote.subtitle.toUpperCase()}
        </div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 22}}>
          <QuoteTimestamp timestamp={formatQuoteUpdatedAt(quote)} compact />
        </div>
      </div>

      <div style={{position: 'relative', flex: 1, minHeight: 690, marginTop: 20}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            opacity: tendencyOpacity,
            transform: `translateY(-110px) scale(${0.96 + tendencyOpacity * 0.04})`,
          }}
        >
          <Tendency quote={quote} frame={localFrame} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            opacity: priceOpacity,
            transform: `translateY(calc(-50% + ${priceLift}px))`,
          }}
        >
          <div
            style={{
              minHeight: 88,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              padding: '17px 30px',
              borderRadius: 24,
              background: `${accent}13`,
              border: `1px solid ${accent}55`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <span style={{fontSize: 54, lineHeight: 1, color: accent, fontWeight: 900}}>
                {quote.trend.direction === 'up' ? '↗' : quote.trend.direction === 'down' ? '↘' : '→'}
              </span>
              <span style={{fontSize: 28, fontWeight: 900, letterSpacing: 2, color: accent}}>
                {trendLabel[quote.trend.direction]}
              </span>
            </div>
            <span style={{fontSize: 50, color: palette.text, fontWeight: 850, whiteSpace: 'nowrap'}}>
              {formatTrendValue(quote.trend.value, quote.currency)}
            </span>
          </div>
          <PriceRow
            label="VENTA"
            value={formatCurrency(quote.sale, quote.currency)}
            currency={quote.currency}
            color={palette.gold}
            progress={priceOpacity}
          />
          {hasPurchase && (
            <PriceRow
              label="COMPRA"
              value={formatCurrency(quote.purchase, quote.currency)}
              currency={quote.currency}
              color={palette.green}
              progress={priceOpacity}
            />
          )}
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 28}}>
        <div style={{fontSize: 24, fontWeight: 700, color: palette.muted, letterSpacing: 0.8}}>
          {source.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

const Recap = ({
  title,
  source,
  quotes,
  frame,
  hideRedundantPurchase = false,
}: Pick<QuoteVideoProps, 'title' | 'source' | 'quotes' | 'hideRedundantPurchase'> & {frame: number}) => {
  const {fps} = useVideoConfig();
  const entrance = spring({frame, fps, config: {damping: 16, stiffness: 115}});
  const spacious = quotes.length <= 2;

  return (
    <AbsoluteFill
      style={{
        padding: '70px 76px 77px',
        background: `radial-gradient(ellipse at 50% 0%, rgba(42, 132, 116, .2), transparent 43%), ${palette.background}`,
        color: palette.text,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', height: '100%', opacity: entrance}}>
        <div
          style={{
            textAlign: 'center',
            opacity: entrance,
            transform: `translateY(${(1 - entrance) * 72}px) scale(${0.9 + entrance * 0.1})`,
          }}
        >
          <div style={{fontSize: 24, color: palette.green, fontWeight: 900, letterSpacing: 5}}>
            RESUMEN FINAL
          </div>
          <div style={{fontSize: 84, color: palette.text, fontWeight: 900, letterSpacing: -3.2, marginTop: 12, lineHeight: 1}}>
            {title.toUpperCase()}
          </div>
          <div style={{fontSize: 25, color: palette.muted, marginTop: 13}}>
            TODAS LAS COTIZACIONES <span style={{color: '#65838a'}}>·</span> VENTA · COMPRA · VARIACIÓN
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            marginTop: 32,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: `repeat(${quotes.length}, minmax(0, 1fr))`,
            gap: spacious ? 22 : 13,
            justifyItems: 'center',
          }}
        >
          {quotes.map((quote, index) => {
            const accent = accentFor(quote);
            const sale = formatCurrency(quote.sale, quote.currency);
            const hasPurchase = shouldShowPurchase(quote, hideRedundantPurchase);
            const purchase = hasPurchase ? formatCurrency(quote.purchase, quote.currency) : null;
            const stagger = spring({
              frame: Math.max(0, frame - 6 - index * 5),
              fps,
              config: {damping: 15, stiffness: 125},
            });
            const arrow = quote.trend.direction === 'up' ? '↗' : quote.trend.direction === 'down' ? '↘' : '→';

            return (
              <div
                key={quote.key}
                style={{
                  opacity: Math.min(stagger, 1),
                  transform: `translateY(${(1 - stagger) * 56}px) scale(${0.94 + stagger * 0.06})`,
                  minHeight: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: spacious ? '31px 38px' : '12px 18px',
                  borderRadius: 28,
                  background: 'linear-gradient(125deg, rgba(17, 52, 60, .98), rgba(9, 31, 40, .98))',
                  border: `1px solid ${accent}42`,
                  borderLeft: `7px solid ${accent}`,
                  boxShadow: '0 14px 36px rgba(0, 0, 0, .18)',
                }}
              >
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 0, width: '100%'}}>
                  <div style={{minWidth: 0, fontSize: spacious ? 68 : 42, fontWeight: 900, letterSpacing: -1.5, color: palette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {quote.label}
                  </div>
                  <div
                    style={{
                      minWidth: 0,
                      fontSize: spacious ? 34 : 23,
                      color: accent,
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {arrow} {trendLabel[quote.trend.direction]} {formatTrendValue(quote.trend.value, quote.currency)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: hasPurchase && !spacious ? '1fr 1fr' : '1fr',
                    gap: 12,
                    marginTop: 6,
                    minWidth: 0,
                  }}
                >
                  <div style={{minWidth: 0, overflow: 'hidden', textAlign: 'center'}}>
                    <div style={{fontSize: spacious ? 23 : 15, color: palette.muted, fontWeight: 800, letterSpacing: 2}}>
                      VENTA
                    </div>
                    <div style={{fontSize: hasPurchase ? amountFontSize(sale, spacious) : spacious ? 104 : 64, color: palette.text, fontWeight: 900, letterSpacing: -1.5, whiteSpace: 'nowrap'}}>
                      {sale}
                    </div>
                  </div>
                  {hasPurchase && (
                    <div style={{minWidth: 0, overflow: 'hidden', textAlign: 'center'}}>
                      <div style={{fontSize: spacious ? 23 : 15, color: palette.muted, fontWeight: 800, letterSpacing: 2}}>
                        COMPRA
                      </div>
                      <div
                        style={{
                          fontSize: amountFontSize(purchase ?? '', spacious),
                          color: palette.text,
                          fontWeight: 900,
                          letterSpacing: -1.5,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {purchase}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 6, textAlign: 'center'}}>
                  <div style={{fontSize: spacious ? 25 : 15, color: '#a6bdc2', fontWeight: 700}}>
                    {quote.subtitle.toUpperCase()}
                  </div>
                  <div style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
                    <div style={{fontSize: spacious ? 17 : 12, color: palette.gold, fontWeight: 900, letterSpacing: 1}}>
                      ACTUALIZADO
                    </div>
                    <div style={{fontSize: spacious ? 60 : 28, color: palette.text, fontWeight: 900, lineHeight: 1}}>
                      {formatQuoteUpdatedAt(quote)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 20,
            gap: 12,
            opacity: entrance,
            transform: `translateY(${(1 - entrance) * 48}px) scale(${0.92 + entrance * 0.08})`,
          }}
        >
          <div style={{textAlign: 'center', fontSize: 18, color: '#9ab0b5', letterSpacing: 0.8}}>
            FUENTE: {source.toUpperCase()} · VARIACIÓN REPORTADA, NO PROYECTADA
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const QuoteVideo = ({title, subtitle, source, quotes, hideRedundantPurchase = false}: QuoteVideoProps) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const recapStart = INTRO_FRAMES + quotes.length * QUOTE_FRAMES;
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 100% 0%, rgba(35, 112, 100, .26), transparent 34%), radial-gradient(ellipse at 0% 100%, rgba(29, 87, 107, .2), transparent 36%), ${palette.background}`,
        color: palette.text,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{position: 'absolute', inset: 0, opacity: 0.075}}>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#a2d5c9" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {frame < INTRO_FRAMES ? (
        <Intro title={title} subtitle={subtitle} source={source} />
      ) : frame >= recapStart ? (
        <Recap
          title={title}
          source={source}
          quotes={quotes}
          frame={frame - recapStart}
          hideRedundantPurchase={hideRedundantPurchase}
        />
      ) : (
        quotes.map((quote, index) => (
          <QuoteSlide
            key={quote.key}
            quote={quote}
            index={index}
            count={quotes.length}
            frame={frame}
            title={title}
            source={source}
            hideRedundantPurchase={hideRedundantPurchase}
          />
        ))
      )}

      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, background: 'rgba(166, 189, 194, .12)'}}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${palette.green}, ${palette.gold})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
