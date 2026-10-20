import {Composition} from 'remotion';
import {INTRO_FRAMES, QUOTE_FRAMES, RECAP_FRAMES, QuoteVideo} from './QuoteVideo';
import type {QuoteVideoProps} from './types';

const defaultProps: QuoteVideoProps = {
  title: 'Dólar',
  subtitle: '',
  source: '',
  generatedAt: '2026-01-01',
  renderedAt: '2026-01-01 00:00:00',
  quotes: [],
};

const durationFor = (quotes: QuoteVideoProps['quotes']) =>
  INTRO_FRAMES + quotes.length * QUOTE_FRAMES + RECAP_FRAMES;

export const RemotionRoot = () => (
  <>
    <Composition
      id="usd-usdt"
      component={QuoteVideo}
      durationInFrames={durationFor(defaultProps.quotes)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{...defaultProps, title: 'Dólar'}}
      calculateMetadata={({props}) => ({durationInFrames: durationFor(props.quotes)})}
    />
    <Composition
      id="otros-activos"
      component={QuoteVideo}
      durationInFrames={durationFor(defaultProps.quotes)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{...defaultProps, title: 'Otras cotizaciones'}}
      calculateMetadata={({props}) => ({durationInFrames: durationFor(props.quotes)})}
    />
  </>
);
