// Most large Ethereum-chain money movement happens in stablecoins, not
// native ETH — so native-ETH-only whale detection misses most real "whale"
// activity. This reads ERC-20 Transfer event logs for USDT and USDC
// directly (one getLogs call per token covers a whole block range, unlike
// scanning blocks one by one), which is both cheaper on the free rate limit
// and far more likely to actually find something.
const ETHERSCAN_BASE = "https://api.etherscan.io/v2/api";
const ETH_CHAIN_ID = 1;

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// ~300 blocks ≈ 1 hour — wider than the native-ETH block scan since this is
// a single cheap call per token rather than one call per block.
const BLOCK_RANGE = 300;

const STABLECOINS: { symbol: "USDT" | "USDC"; address: string; decimals: number }[] = [
  { symbol: "USDT", address: "0xdac17f958d2ee523a2206206994597c13d831ec7", decimals: 6 },
  { symbol: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals: 6 },
];

export interface StablecoinTransfer {
  symbol: "USDT" | "USDC";
  txHash: string;
  from: string;
  to: string;
  usdValue: number; // stablecoins are ~1:1 USD, so token amount == usdValue
  blockTimestamp: number; // unix seconds
}

interface EtherscanLogEntry {
  topics: string[];
  data: string;
  timeStamp: string; // hex unix seconds
  transactionHash: string;
}

async function etherscanCall<T>(params: Record<string, string>): Promise<T> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    throw new Error("ETHERSCAN_API_KEY is not configured");
  }

  const query = new URLSearchParams({ ...params, chainid: String(ETH_CHAIN_ID), apikey: apiKey });
  const res = await fetch(`${ETHERSCAN_BASE}?${query.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Etherscan request failed: ${res.status}`);
  }

  const json = (await res.json()) as { result: T };
  return json.result;
}

function topicToAddress(topic: string): string {
  return `0x${topic.slice(26)}`;
}

async function fetchTokenTransfers(
  token: (typeof STABLECOINS)[number],
  fromBlock: number,
  toBlock: number
): Promise<StablecoinTransfer[]> {
  const logs = await etherscanCall<EtherscanLogEntry[] | string | null>({
    module: "logs",
    action: "getLogs",
    address: token.address,
    topic0: TRANSFER_TOPIC,
    fromBlock: String(fromBlock),
    toBlock: String(toBlock),
  });

  if (!logs || typeof logs === "string" || !Array.isArray(logs)) return [];

  return logs.map((log) => {
    const rawAmount = BigInt(log.data === "0x" ? "0x0" : log.data);
    const usdValue = Number(rawAmount) / 10 ** token.decimals;
    return {
      symbol: token.symbol,
      txHash: log.transactionHash,
      from: topicToAddress(log.topics[1]),
      to: topicToAddress(log.topics[2]),
      usdValue,
      blockTimestamp: parseInt(log.timeStamp, 16),
    };
  });
}

export async function fetchRecentStablecoinTransfers(): Promise<StablecoinTransfer[]> {
  const tipHex = await etherscanCall<string>({ module: "proxy", action: "eth_blockNumber" });
  const tip = parseInt(tipHex, 16);
  const fromBlock = tip - BLOCK_RANGE;

  const results = await Promise.all(
    STABLECOINS.map((token) => fetchTokenTransfers(token, fromBlock, tip).catch(() => []))
  );

  return results.flat();
}
