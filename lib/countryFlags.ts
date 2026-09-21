// Currency/country codes as used by the FairEconomy calendar feed.
const FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  All: "🌐",
};

export function countryFlag(code: string): string {
  return FLAGS[code] ?? "🏳️";
}
