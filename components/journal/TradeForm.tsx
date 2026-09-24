"use client";

import { useMemo, useState } from "react";
import { JournalTrade, TradeDirection, RuleFollowed } from "@/lib/journal/types";
import { computeRealizedR, validatePartialPercentages } from "@/lib/journal/calculations";
import { Card, CardHeader } from "@/components/ui/Card";

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
};

function Field({ label, value, onChange, type = "text", placeholder }: FieldProps) {
  return (
    <div>
      <label className="block text-xs text-tl-text-muted mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary placeholder:text-tl-text-muted focus:outline-none focus:border-tl-accent"
      />
    </div>
  );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-tl-border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs tl-label text-tl-text-secondary"
      >
        <span>
          <span className="text-tl-accent mr-1">{open ? "▾" : "▸"}</span>
          {title}
        </span>
      </button>
      {open && <div className="p-3 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3">{children}</div>}
    </div>
  );
}

const emptyForm = {
  trade_date: new Date().toISOString().slice(0, 10),
  asset: "",
  direction: "long" as TradeDirection,
  setup: "",
  strategy: "",
  timeframe: "",
  session: "",
  entry_price: "",
  stop_loss: "",
  tp1: "",
  tp2: "",
  tp3: "",
  risk_amount: "",
  risk_pct: "",
  position_size: "",
  tp1_pct_closed: "",
  tp1_r: "",
  tp2_pct_closed: "",
  tp2_r: "",
  tp3_pct_closed: "",
  tp3_r: "",
  final_exit_price: "",
  final_exit_r: "",
  remaining_pct: "",
  result_r: "",
  result_amount: "",
  screenshot_before_url: "",
  screenshot_after_url: "",
  entry_reason: "",
  exit_reason: "",
  mistakes: "",
  emotion_before: "",
  emotion_during: "",
  emotion_after: "",
  confidence: "",
  fear: "",
  fomo: false,
  revenge_trading: false,
  overtrading: false,
  patience: "",
  discipline: "",
  rule_followed: "" as RuleFollowed | "",
  notes: "",
};

type FormState = typeof emptyForm;

function num(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function TradeForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<JournalTrade>;
  onSubmit: (patch: Partial<JournalTrade>) => Promise<{ error: string | null }>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    ...(initial
      ? Object.fromEntries(
          Object.entries(initial).map(([k, v]) => [k, v === null || v === undefined ? emptyForm[k as keyof FormState] ?? "" : String(v)])
        )
      : {}),
    direction: (initial?.direction as TradeDirection) ?? "long",
    rule_followed: (initial?.rule_followed as RuleFollowed) ?? "",
    fomo: initial?.fomo ?? false,
    revenge_trading: initial?.revenge_trading ?? false,
    overtrading: initial?.overtrading ?? false,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAutoR, setUseAutoR] = useState(!initial?.result_r);

  const set = <K extends keyof FormState>(key: K) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const pctValid = validatePartialPercentages([
    num(form.tp1_pct_closed),
    num(form.tp2_pct_closed),
    num(form.tp3_pct_closed),
    num(form.remaining_pct),
  ]);

  const calculatedR = useMemo(() => {
    return computeRealizedR(
      [
        { price: num(form.tp1), pctClosed: num(form.tp1_pct_closed), r: num(form.tp1_r) },
        { price: num(form.tp2), pctClosed: num(form.tp2_pct_closed), r: num(form.tp2_r) },
        { price: num(form.tp3), pctClosed: num(form.tp3_pct_closed), r: num(form.tp3_r) },
      ],
      num(form.final_exit_r),
      num(form.remaining_pct)
    );
  }, [form.tp1, form.tp1_pct_closed, form.tp1_r, form.tp2, form.tp2_pct_closed, form.tp2_r, form.tp3, form.tp3_pct_closed, form.tp3_r, form.final_exit_r, form.remaining_pct]);

  const effectiveR = useAutoR && calculatedR !== null ? calculatedR : num(form.result_r);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.asset.trim()) {
      setError("Asset is required.");
      return;
    }
    if (effectiveR === null) {
      setError("Result (R) is required — either fill in partials or enter it manually.");
      return;
    }
    if (!pctValid) {
      setError("Partial percentages (TP1 + TP2 + TP3 + remaining) can't exceed 100%.");
      return;
    }

    setSubmitting(true);
    const patch: Partial<JournalTrade> = {
      trade_date: form.trade_date,
      asset: form.asset.trim().toUpperCase(),
      direction: form.direction,
      setup: form.setup || null,
      strategy: form.strategy || null,
      timeframe: form.timeframe || null,
      session: form.session || null,
      entry_price: num(form.entry_price),
      stop_loss: num(form.stop_loss),
      tp1: num(form.tp1),
      tp2: num(form.tp2),
      tp3: num(form.tp3),
      risk_amount: num(form.risk_amount),
      risk_pct: num(form.risk_pct),
      position_size: num(form.position_size),
      tp1_pct_closed: num(form.tp1_pct_closed),
      tp1_r: num(form.tp1_r),
      tp2_pct_closed: num(form.tp2_pct_closed),
      tp2_r: num(form.tp2_r),
      tp3_pct_closed: num(form.tp3_pct_closed),
      tp3_r: num(form.tp3_r),
      final_exit_price: num(form.final_exit_price),
      final_exit_r: num(form.final_exit_r),
      remaining_pct: num(form.remaining_pct),
      result_r: effectiveR,
      result_amount: num(form.result_amount),
      screenshot_before_url: form.screenshot_before_url || null,
      screenshot_after_url: form.screenshot_after_url || null,
      entry_reason: form.entry_reason || null,
      exit_reason: form.exit_reason || null,
      mistakes: form.mistakes || null,
      emotion_before: form.emotion_before || null,
      emotion_during: form.emotion_during || null,
      emotion_after: form.emotion_after || null,
      confidence: num(form.confidence),
      fear: num(form.fear),
      fomo: form.fomo,
      revenge_trading: form.revenge_trading,
      overtrading: form.overtrading,
      patience: num(form.patience),
      discipline: num(form.discipline),
      rule_followed: form.rule_followed || null,
      notes: form.notes || null,
    };

    const result = await onSubmit(patch);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Card>
        <CardHeader title="Trade" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Date" type="date" value={form.trade_date} onChange={set("trade_date")} />
          <Field label="Asset" value={form.asset} onChange={set("asset")} placeholder="BTC" />
          <div>
            <label className="block text-xs text-tl-text-muted mb-1">Direction</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, direction: "long" }))}
                className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
                  form.direction === "long"
                    ? "bg-tl-positive/15 border-tl-positive text-tl-positive"
                    : "border-tl-border text-tl-text-secondary"
                }`}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, direction: "short" }))}
                className={`flex-1 text-sm font-medium py-2 rounded-lg border transition-colors ${
                  form.direction === "short"
                    ? "bg-tl-negative/15 border-tl-negative text-tl-negative"
                    : "border-tl-border text-tl-text-secondary"
                }`}
              >
                Short
              </button>
            </div>
          </div>
          <Field label="Entry Price" type="number" value={form.entry_price} onChange={set("entry_price")} />
          <Field label="Stop Loss" type="number" value={form.stop_loss} onChange={set("stop_loss")} />
        </div>
      </Card>

      <Section title="Setup & Context">
        <Field label="Setup" value={form.setup} onChange={set("setup")} />
        <Field label="Strategy" value={form.strategy} onChange={set("strategy")} />
        <Field label="Timeframe" value={form.timeframe} onChange={set("timeframe")} placeholder="15m" />
        <Field label="Session" value={form.session} onChange={set("session")} placeholder="London" />
      </Section>

      <Section title="Risk & Size">
        <Field label="Risk Amount (€)" type="number" value={form.risk_amount} onChange={set("risk_amount")} />
        <Field label="Risk %" type="number" value={form.risk_pct} onChange={set("risk_pct")} />
        <Field label="Position Size" type="number" value={form.position_size} onChange={set("position_size")} />
        <Field label="Result (€)" type="number" value={form.result_amount} onChange={set("result_amount")} />
      </Section>

      <Section title="Take Profits & Partial Exits" defaultOpen>
        <Field label="TP1 Price" type="number" value={form.tp1} onChange={set("tp1")} />
        <Field label="TP1 % Closed" type="number" value={form.tp1_pct_closed} onChange={set("tp1_pct_closed")} />
        <Field label="TP1 R" type="number" value={form.tp1_r} onChange={set("tp1_r")} />
        <Field label="TP2 Price" type="number" value={form.tp2} onChange={set("tp2")} />
        <Field label="TP2 % Closed" type="number" value={form.tp2_pct_closed} onChange={set("tp2_pct_closed")} />
        <Field label="TP2 R" type="number" value={form.tp2_r} onChange={set("tp2_r")} />
        <Field label="TP3 Price" type="number" value={form.tp3} onChange={set("tp3")} />
        <Field label="TP3 % Closed" type="number" value={form.tp3_pct_closed} onChange={set("tp3_pct_closed")} />
        <Field label="TP3 R" type="number" value={form.tp3_r} onChange={set("tp3_r")} />
        <Field label="Final Exit Price" type="number" value={form.final_exit_price} onChange={set("final_exit_price")} />
        <Field label="Final Exit R" type="number" value={form.final_exit_r} onChange={set("final_exit_r")} />
        <Field label="Remaining % (if not fully closed above)" type="number" value={form.remaining_pct} onChange={set("remaining_pct")} />

        <div className="col-span-2 sm:col-span-3 flex items-center gap-3 pt-2 border-t border-tl-border">
          <span className="text-xs text-tl-text-muted">Calculated realized R:</span>
          <span
            className={`tl-mono font-semibold ${
              calculatedR === null
                ? "text-tl-text-muted"
                : calculatedR > 0
                  ? "text-tl-positive"
                  : calculatedR < 0
                    ? "text-tl-negative"
                    : "text-tl-text-secondary"
            }`}
          >
            {calculatedR === null ? "—" : `${calculatedR >= 0 ? "+" : ""}${calculatedR.toFixed(2)}R`}
          </span>
          {!pctValid && <span className="text-xs text-tl-negative">% closed exceeds 100%</span>}
        </div>
      </Section>

      <Card label="result.sh">
        <CardHeader title="Result (R) — authoritative" />
        <p className="text-xs text-tl-text-muted mb-2">
          This is the number used everywhere else on the site. Auto-fills from
          the partials above; override it any time execution differed from
          the calculation.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            step="any"
            value={useAutoR ? (calculatedR ?? "") : form.result_r}
            onChange={(e) => {
              setUseAutoR(false);
              set("result_r")(e.target.value);
            }}
            className="w-40 rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-lg font-bold tl-mono text-tl-text-primary focus:outline-none focus:border-tl-accent"
            placeholder="e.g. 1.5 or -1"
          />
          {calculatedR !== null && (
            <button
              type="button"
              onClick={() => {
                setUseAutoR(true);
                set("result_r")(String(calculatedR));
              }}
              className="text-xs text-tl-accent hover:underline"
            >
              Use calculated ({calculatedR.toFixed(2)}R)
            </button>
          )}
        </div>
      </Card>

      <Section title="Psychology">
        <Field label="Emotion Before" value={form.emotion_before} onChange={set("emotion_before")} />
        <Field label="Emotion During" value={form.emotion_during} onChange={set("emotion_during")} />
        <Field label="Emotion After" value={form.emotion_after} onChange={set("emotion_after")} />
        <Field label="Confidence (1-10)" type="number" value={form.confidence} onChange={set("confidence")} />
        <Field label="Fear (1-10)" type="number" value={form.fear} onChange={set("fear")} />
        <Field label="Patience (1-10)" type="number" value={form.patience} onChange={set("patience")} />
        <Field label="Discipline (1-10)" type="number" value={form.discipline} onChange={set("discipline")} />
        <div>
          <label className="block text-xs text-tl-text-muted mb-1">Followed plan?</label>
          <select
            value={form.rule_followed}
            onChange={(e) => setForm((f) => ({ ...f, rule_followed: e.target.value as RuleFollowed }))}
            className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
          >
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="partially">Partially</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="flex items-end gap-4 col-span-2 sm:col-span-1">
          {(["fomo", "revenge_trading", "overtrading"] as const).map((k) => (
            <label key={k} className="flex items-center gap-1.5 text-xs text-tl-text-secondary">
              <input
                type="checkbox"
                checked={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))}
              />
              {k.replace("_", " ")}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Reasoning & Notes">
        <Field label="Entry Reason" value={form.entry_reason} onChange={set("entry_reason")} />
        <Field label="Exit Reason" value={form.exit_reason} onChange={set("exit_reason")} />
        <Field label="Mistakes" value={form.mistakes} onChange={set("mistakes")} />
        <Field label="Screenshot Before (URL)" value={form.screenshot_before_url} onChange={set("screenshot_before_url")} />
        <Field label="Screenshot After (URL)" value={form.screenshot_after_url} onChange={set("screenshot_after_url")} />
        <div className="col-span-2 sm:col-span-3">
          <label className="block text-xs text-tl-text-muted mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
          />
        </div>
      </Section>

      {error && <p className="text-sm text-tl-negative">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-medium px-5 py-2.5 rounded-lg bg-tl-accent text-black hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Saving…" : initial?.id ? "Save Changes" : "Add Trade"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium px-5 py-2.5 rounded-lg border border-tl-border text-tl-text-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
