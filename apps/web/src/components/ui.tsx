export { Nav } from "./nav";

export function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card p-6 ${className}`}>
      <h2 className="font-display mb-4 text-lg font-semibold tracking-tight text-[var(--color-text)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)]">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-[var(--color-muted)]">{description}</p>
      )}
    </div>
  );
}

export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`btn-primary focus-ring px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="focus-ring w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
      {...props}
    />
  );
}

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]"
    >
      {children}
    </label>
  );
}

export type StepStatus = "done" | "active" | "pending";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path
        d="M2 6l2.5 2.5L10 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepIndicator({
  steps,
  orientation = "horizontal",
}: {
  steps: { label: string; status: StepStatus }[];
  orientation?: "horizontal" | "vertical";
}) {
  if (orientation === "vertical") {
    return (
      <ol className="space-y-4" aria-label="Setup steps">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <StepDot status={step.status} number={i + 1} />
            <span className={stepLabelClass(step.status)}>{step.label}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      className="flex flex-wrap items-center gap-2 sm:gap-4"
      aria-label="Setup steps"
    >
      {steps.map((step, i) => (
        <li key={i} className="flex items-center gap-2">
          <StepDot status={step.status} number={i + 1} />
          <span className={stepLabelClass(step.status)}>{step.label}</span>
          {i < steps.length - 1 && (
            <span
              className="mx-1 hidden h-px w-6 bg-[var(--color-border-strong)] sm:inline"
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function stepLabelClass(status: StepStatus) {
  if (status === "active") return "text-sm font-medium text-[var(--color-text)]";
  if (status === "done") return "text-sm text-[var(--color-success)]";
  return "text-sm text-[var(--color-muted)]";
}

function StepDot({
  status,
  number,
}: {
  status: StepStatus;
  number: number;
}) {
  const base =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors";
  if (status === "done") {
    return (
      <span
        className={`${base} bg-[var(--color-success)] text-white`}
        aria-label={`Step ${number} complete`}
      >
        <CheckIcon />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span
        className={`${base} bg-[var(--color-accent)] text-white`}
        aria-label={`Step ${number} in progress`}
      >
        {number}
      </span>
    );
  }
  return (
    <span
      className={`${base} border border-[var(--color-border-strong)] text-[var(--color-muted)]`}
      aria-label={`Step ${number} pending`}
    >
      {number}
    </span>
  );
}

export function StatusBadge({
  variant,
  children,
}: {
  variant: "success" | "warning" | "pending";
  children: React.ReactNode;
}) {
  const styles = {
    success:
      "bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]",
    warning: "callout-warning",
    pending:
      "bg-[var(--color-bg)] text-[var(--color-muted)] border-[var(--color-border)]",
  };
  const srLabels = {
    success: "Status: complete",
    warning: "Status: action required",
    pending: "Status: pending",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm ${styles[variant]}`}
    >
      <span className="sr-only">{srLabels[variant]}</span>
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--color-border)] motion-reduce:animate-none ${className}`}
    />
  );
}
