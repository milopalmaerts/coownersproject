// Etherscan API V2 — free tier (5 req/sec, 100,000/day) but requires a key
// since Etherscan retired keyless access. Create one at etherscan.io/apis.
const ETHERSCAN_BASE = "https://api.etherscan.io/v2/api";
const ETH_CHAIN_ID = 1;

interface EtherscanBlockResult {
  timestamp: string; // hex unix seconds
  transactions: {
    hash: string;
    value: string; // hex wei
  }[];
}

export interface EthCandidateTx {
  hash: string;
  wei: bigint;
  blockTimestamp: number; // unix seconds
}

async function etherscanCall<T>(params: Record<string, string>): Promise<T> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    throw new Error("ETHERSCAN_API_KEY is not configured");
  }

  const query = new URLSearchParams({
    ...params,
    chainid: String(ETH_CHAIN_ID),
    apikey: apiKey,
  });

  const res = await fetch(`${ETHERSCAN_BASE}?${query.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Etherscan request failed: ${res.status}`);
  }

  const json = (await res.json()) as { result: T; message?: string };
  return json.result;
}

export async function fetchLatestEthBlockTxs(): Promise<EthCandidateTx[]> {
  const blockNumberHex = await etherscanCall<string>({
    module: "proxy",
    action: "eth_blockNumber",
  });

  const block = await etherscanCall<EtherscanBlockResult | null>({
    module: "proxy",
    action: "eth_getBlockByNumber",
    tag: blockNumberHex,
    boolean: "true",
  });

  if (!block) return [];

  const blockTimestamp = parseInt(block.timestamp, 16);

  return block.transactions
    .filter((tx) => tx.value && tx.value !== "0x0")
    .map((tx) => ({ hash: tx.hash, wei: BigInt(tx.value), blockTimestamp }));
}
