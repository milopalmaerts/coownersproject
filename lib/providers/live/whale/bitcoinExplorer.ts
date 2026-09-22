// mempool.space's public API — free, no key, no published hard rate limit
// (fair-use). Used to scan the most recent confirmed blocks for large
// transfers. usdValue is based on the tx's LARGEST single output, not the
// sum of all outputs — summing was tried first and produced wildly inflated
// numbers (some batch/consolidation payouts from exchanges summed to
// hundreds of millions of dollars), which both crowded out every other
// whale entry and mischaracterized a batch payout as one giant transfer.
// The largest single output is what every free whale tracker uses without
// proprietary UTXO clustering, and reads as "size of the biggest payment in
// this transaction" rather than "total money that touched this tx".
const MEMPOOL_BASE = "https://mempool.space/api";
const MAX_PAGES = 20; // 25 txs/page -> up to 500 txs scanned per block

// BTC blocks land roughly every ~10 min, so a single block is a thin window.
// Scanning the last 3 (~30 min) gives meaningfully more whale hits without
// hammering mempool.space.
const BLOCKS_TO_SCAN = 3;

interface MempoolTx {
  txid: string;
  vout: { value: number }[]; // value in satoshis
}

interface MempoolBlock {
  id: string;
  timestamp: number; // unix seconds
  previousblockhash: string;
}

export interface BtcCandidateTx {
  txid: string;
  totalSats: number;
  blockTimestamp: number; // unix seconds
}

async function mempoolFetch(path: string): Promise<Response> {
  return fetch(`${MEMPOOL_BASE}${path}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TradingLegendsBot/1.0)" },
    next: { revalidate: 60 },
  });
}

async function fetchBlockTxs(hash: string, timestamp: number): Promise<BtcCandidateTx[]> {
  const txs: BtcCandidateTx[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const index = page * 25;
    const res = await mempoolFetch(`/block/${hash}/txs/${index}`);
    if (!res.ok) break;
    const batch = (await res.json()) as MempoolTx[];
    if (batch.length === 0) break;

    for (const tx of batch) {
      const largestOutputSats = tx.vout.reduce((max, out) => Math.max(max, out.value), 0);
      txs.push({ txid: tx.txid, totalSats: largestOutputSats, blockTimestamp: timestamp });
    }

    if (batch.length < 25) break;
  }
  return txs;
}

export async function fetchRecentBtcBlockTxs(): Promise<BtcCandidateTx[]> {
  const heightRes = await mempoolFetch("/blocks/tip/height");
  if (!heightRes.ok) {
    throw new Error(`mempool.space tip height failed: ${heightRes.status}`);
  }
  const height = await heightRes.text();

  const hashRes = await mempoolFetch(`/block-height/${height}`);
  if (!hashRes.ok) {
    throw new Error(`mempool.space block hash failed: ${hashRes.status}`);
  }
  let hash = await hashRes.text();

  const allTxs: BtcCandidateTx[] = [];
  for (let i = 0; i < BLOCKS_TO_SCAN; i++) {
    const blockRes = await mempoolFetch(`/block/${hash}`);
    if (!blockRes.ok) break;
    const block = (await blockRes.json()) as MempoolBlock;

    allTxs.push(...(await fetchBlockTxs(hash, block.timestamp)));

    if (!block.previousblockhash) break;
    hash = block.previousblockhash;
  }

  return allTxs;
}
