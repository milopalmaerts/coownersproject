// mempool.space's public API — free, no key, no published hard rate limit
// (fair-use). Used to scan the most recent confirmed block for large
// transfers. This reads gross transaction output value, not net transferred
// amount (a tx can include change outputs back to the sender), so treat
// usdValue as an approximation of transaction size, same as most whale
// trackers do without proprietary UTXO clustering.
const MEMPOOL_BASE = "https://mempool.space/api";
const MAX_PAGES = 20; // 25 txs/page -> up to 500 txs scanned per block

interface MempoolTx {
  txid: string;
  vout: { value: number }[]; // value in satoshis
}

interface MempoolBlock {
  timestamp: number; // unix seconds
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

export async function fetchLatestBtcBlockTxs(): Promise<BtcCandidateTx[]> {
  const heightRes = await mempoolFetch("/blocks/tip/height");
  if (!heightRes.ok) {
    throw new Error(`mempool.space tip height failed: ${heightRes.status}`);
  }
  const height = await heightRes.text();

  const hashRes = await mempoolFetch(`/block-height/${height}`);
  if (!hashRes.ok) {
    throw new Error(`mempool.space block hash failed: ${hashRes.status}`);
  }
  const hash = await hashRes.text();

  const blockRes = await mempoolFetch(`/block/${hash}`);
  if (!blockRes.ok) {
    throw new Error(`mempool.space block info failed: ${blockRes.status}`);
  }
  const block = (await blockRes.json()) as MempoolBlock;

  const txs: BtcCandidateTx[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const index = page * 25;
    const res = await mempoolFetch(`/block/${hash}/txs/${index}`);
    if (!res.ok) break;
    const batch = (await res.json()) as MempoolTx[];
    if (batch.length === 0) break;

    for (const tx of batch) {
      const totalSats = tx.vout.reduce((sum, out) => sum + out.value, 0);
      txs.push({ txid: tx.txid, totalSats, blockTimestamp: block.timestamp });
    }

    if (batch.length < 25) break;
  }

  return txs;
}
