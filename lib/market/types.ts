export type OptionType = "call" | "put";

export type OptionContract = {
  symbol: string;
  underlying: string;
  type: OptionType;
  expiration: string;
  strike: number;
  bid: number | null;
  ask: number | null;
  last: number | null;
  volume: number | null;
  openInterest: number | null;
  impliedVolatility: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
};

export type OptionChain = {
  ticker: string;
  expiration: string;
  underlyingPrice: number;
  calls: OptionContract[];
  puts: OptionContract[];
};

export type Quote = {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  asOf: string;
};

export type ExpirationResponse = {
  ticker: string;
  expirations: string[];
};

export type ChatRequest = {
  ticker: string;
  expiration: string;
  message: string;
  chainSummary?: ChainSummary;
};

export type ChatResponse = {
  message: string;
};

export type ContractSummary = {
  symbol: string;
  type: OptionType;
  strike: number;
  bid: number | null;
  ask: number | null;
  volume: number | null;
  openInterest: number | null;
  impliedVolatility: number | null;
  delta: number | null;
};

export type ChainSummary = {
  underlyingPrice?: number;
  totalCalls?: number;
  totalPuts?: number;
  liquidContracts?: ContractSummary[];
  highVolumeContracts?: ContractSummary[];
  highIvContracts?: ContractSummary[];
  atmStrike?: number;
};

export type MarketProvider = {
  getQuote(ticker: string): Promise<Quote>;
  getExpirations(ticker: string): Promise<ExpirationResponse>;
  getOptionsChain(ticker: string, expiration: string): Promise<OptionChain>;
};
