export type TrendDirection = 'up' | 'down' | 'equal';

export type Quote = {
  key: string;
  label: string;
  subtitle: string;
  sale: number;
  purchase: number;
  updated_at: string;
  exchange: string;
  currency: 'BOB' | 'USD';
  trend: {
    direction: TrendDirection;
    value: number;
  };
};

export type QuoteSnapshot = {
  generated_at: string;
  title: string;
  source: string;
  quotes: Quote[];
};

export type QuoteVideoProps = {
  title: string;
  subtitle: string;
  source: string;
  generatedAt: string;
  quotes: Quote[];
  hideRedundantPurchase?: boolean;
};
