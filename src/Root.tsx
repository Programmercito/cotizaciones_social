import {Composition} from 'remotion';
import {QuoteVideo} from './QuoteVideo';
import type {QuoteVideoProps} from './types';

const defaultProps: QuoteVideoProps = {
  title: 'Cotizaciones',
  subtitle: '',
  source: '',
  generatedAt: '2026-01-01',
  quotes: [],
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="usd-usdt"
      component={QuoteVideo}
      durationInFrames={390}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{...defaultProps, title: 'USD + USDT'}}
    />
    <Composition
      id="otros-activos"
      component={QuoteVideo}
      durationInFrames={390}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{...defaultProps, title: 'Otras cotizaciones'}}
    />
  </>
);
