"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "./ui";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[var(--color-text)] px-4 py-2.5 text-sm text-white shadow-[var(--shadow-soft)]"
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Could not copy");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-secondary focus-ring px-3 py-1.5 text-xs active:scale-[0.98]"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

export function AddressDisplay({ address }: { address: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <code className="mono surface-inset block flex-1 break-all p-3 text-xs">
        {address}
      </code>
      <CopyButton text={address} />
    </div>
  );
}

export function LoadingButton({
  loading,
  loadingLabel,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <Button
      className={className}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (loadingLabel ?? "Loading…") : children}
    </Button>
  );
}

export function OnboardingBanner({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="callout-warning border-b px-6 py-2.5 text-sm">
      Step {currentStep} of {totalSteps} — finish wallet setup to unlock
      payments and withdrawals.
    </div>
  );
}

export type ProgressStepStatus = "pending" | "active" | "done";

export function ProgressSteps({
  steps,
}: {
  steps: { label: string; status: ProgressStepStatus }[];
}) {
  return (
    <ol className="space-y-1.5" aria-label="Progress">
      {steps.map((step, i) => (
        <li
          key={i}
          className={`flex items-center gap-2 text-xs ${
            step.status === "active"
              ? "font-medium text-[var(--color-text)] motion-safe:animate-pulse"
              : step.status === "done"
                ? "text-[var(--color-success)]"
                : "text-[var(--color-muted)]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              step.status === "done"
                ? "bg-[var(--color-success)]"
                : step.status === "active"
                  ? "bg-[var(--color-accent)]"
                  : "bg-[var(--color-border-strong)]"
            }`}
          />
          <span>{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
