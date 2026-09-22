// A small, manually-curated set of well-known, publicly documented exchange
// hot wallets on Ethereum (visible on Etherscan's own public name tags and
// widely reported). This is NOT an exhaustive exchange database — most
// transactions won't match anything here, and that's fine: when a transfer
// doesn't match, it stays labeled "Unknown wallet" rather than guessing.
//
// Reading the match: funds moving FROM one of these TO an unknown wallet is
// commonly a withdrawal (the buyer moving coins off the exchange, often read
// as accumulation). Funds moving FROM an unknown wallet TO one of these is
// commonly a deposit (often read as incoming sell pressure). This is the
// same inference every free whale tracker uses — a heuristic, not certainty.
export const ETH_EXCHANGE_ADDRESSES: Record<string, string> = {
  "0x28c6c06298d514db089934071355e5743bf21d60": "Binance",
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance",
  "0xdfd5293d8e347dfe59e90efd55b2956a1343963d": "Binance",
  "0x71660c4005ba85c37ccec55d0c4493e66fe775d3": "Coinbase",
  "0x503828976d22510aad0201ac7ec88293211d23da": "Coinbase",
  "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740": "Coinbase",
  "0x2910543af39aba0cd09dbb2d50200b3e800a63d2": "Kraken",
  "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13": "Kraken",
  "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b": "OKX",
};

export function lookupEthExchange(address: string | null | undefined): string | null {
  if (!address) return null;
  return ETH_EXCHANGE_ADDRESSES[address.toLowerCase()] ?? null;
}
