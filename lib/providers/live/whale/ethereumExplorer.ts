// Etherscan API V2 — free tier (5 req/sec, 100,000/day) but requires a key
// since Etherscan retired keyless access. Create one at etherscan.io/apis.
const ETHERSCAN_BASE = "https://api.etherscan.io/v2/api";
const ETH_CHAIN_ID = 1;

// ETH blocks land roughly every 12s, so a single block covers almost no
// ground — scan the last ~20 blocks (~4 min) instead. Each block number is
// its own cached URL (60s revalidate), so repeat page loads within a minute
// don't re-hit Etherscan.
const BLOCKS_TO_SCAN = 20;

// Free tier is 5 req/sec — fetch in small batches with a pause between them
// instead of firing all 20 block requests at once, which trips the rate
// limit and gets an error payload back instead of a block.
const BATCH_SIZE = 4;
const BATCH_DELAY_MS = 250;

interface EtherscanBlockResult {
  timestamp: string; // hex unix seconds
  transactions: {
    hash: string;
    value: string; // hex wei
    from: string;
    to: string | null;
  }[];
}

export interface EthCandidateTx {
  hash: string;
  wei: bigint;
  blockTimestamp: number; // unix seconds
  from: string;
  to: string | null;
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBlockByNumber(hexNumber: string): Promise<EthCandidateTx[]> {
  const block = await etherscanCall<EtherscanBlockResult | string | null>({
    module: "proxy",
    action: "eth_getBlockByNumber",
    tag: hexNumber,
    boolean: "true",
  });

  // A rate-limited or otherwise-failed call comes back as a string message
  // (e.g. "Max rate limit reached") rather than a block object — treat that
  // block as unavailable for this pass instead of crashing the whole scan.
  if (!block || typeof block === "string" || !Array.isArray(block.transactions)) {
    return [];
  }

  const blockTimestamp = parseInt(block.timestamp, 16);

  return block.transactions
    .filter((tx) => tx.value && tx.value !== "0x0")
    .map((tx) => ({
      hash: tx.hash,
      wei: BigInt(tx.value),
      blockTimestamp,
      from: tx.from,
      to: tx.to,
    }));
}

export async function fetchRecentEthBlockTxs(): Promise<EthCandidateTx[]> {
  const blockNumberHex = await etherscanCall<string>({
    module: "proxy",
    action: "eth_blockNumber",
  });
  const tipNumber = parseInt(blockNumberHex, 16);

  const blockNumbers = Array.from({ length: BLOCKS_TO_SCAN }, (_, i) => tipNumber - i);

  const results: EthCandidateTx[][] = [];
  for (let i = 0; i < blockNumbers.length; i += BATCH_SIZE) {
    const batch = blockNumbers.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((n) => fetchBlockByNumber(`0x${n.toString(16)}`))
    );
    results.push(...batchResults);
    if (i + BATCH_SIZE < blockNumbers.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return results.flat();
}
