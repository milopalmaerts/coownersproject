"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
      <div className="text-4xl">⚠️</div>
      <h1 className="text-lg font-semibold text-tl-text-primary">
        Unable to load live market data
      </h1>
      <p className="text-sm text-tl-text-secondary max-w-md">
        TradingLegends could not reach the market data provider. We never
        substitute demo data here — please try again in a moment.
      </p>
      {error.digest && (
        <p className="text-xs text-tl-text-muted">Reference: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-2 text-sm font-medium px-4 py-2 rounded-lg bg-tl-accent text-black hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
