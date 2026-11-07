"use client";

// Operator UI kit — Framer-style: near-black canvas, charcoal cards, white pill
// for the primary action, surface lift (not colour) for selection, one blue for
// focus/selected, red only for what is on air.

import { useEffect, useState } from "react";

type BtnVariant = "primary" | "secondary" | "quiet" | "live";
type BtnSize = "sm" | "md" | "lg" | "xl";

const VARIANT: Record<BtnVariant, string> = {
  primary: "bg-white text-black hover:bg-white/90",
  secondary: "bg-ui-s1 text-ui-ink hover:bg-ui-s2",
  quiet: "bg-transparent text-ui-muted hover:text-ui-ink hover:bg-ui-s1",
  live: "bg-ui-live text-white hover:brightness-110",
};
const SIZE: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-5 text-[15px]",
  xl: "h-16 px-7 text-[18px]",
};

export function Btn({ variant = "secondary", size = "md", className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
  return (
    <button
      {...rest}
      className={`inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    />
  );
}

// Two taps to confirm (reset, next team…). Reverts after 3 s.
export function ConfirmBtn({ onConfirm, confirmLabel, children, ...rest }: Omit<React.ComponentProps<typeof Btn>, "onClick"> & { onConfirm: () => void; confirmLabel: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Btn
      {...rest}
      variant={armed ? "primary" : rest.variant}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {armed ? confirmLabel : children}
    </Btn>
  );
}

export function Card({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`rounded-[20px] bg-ui-s1 ${className}`}>
      {children}
    </div>
  );
}

export function Caption({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`ui-caption ${className}`}>{children}</p>;
}

// Pill tabs: selected = lifted surface + white text (not a colour fill).
export function Segmented<T extends string>({ value, options, onChange, size = "md", className = "" }: { value: T; options: { value: T; label: React.ReactNode }[]; onChange: (v: T) => void; size?: "md" | "lg"; className?: string }) {
  return (
    <div className={`flex rounded-full bg-ui-canvas p-1 ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full font-medium transition ${size === "lg" ? "h-11 text-[15px]" : "h-9 text-[14px]"} ${o.value === value ? "bg-ui-s2 text-ui-ink shadow-[0_0_0_1px_rgb(var(--ui-accent)/0.35)]" : "text-ui-muted hover:text-ui-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 min-w-0 rounded-[10px] bg-ui-canvas px-3.5 text-[14px] text-ui-ink placeholder:text-ui-muted/70 focus:shadow-[0_0_0_1px_rgb(var(--ui-accent)/0.6)] focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function Select({ className = "", ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`h-9 rounded-full bg-ui-s1 px-3.5 text-[14px] font-medium text-ui-ink hover:bg-ui-s2 focus:outline-none ${className}`}
    />
  );
}

export function LiveDot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full bg-ui-live shadow-[0_0_0_3px_rgb(var(--ui-live)/0.25)] ${className}`} />;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-[4px] bg-ui-s2 px-1.5 py-0.5 font-mono text-[11px] text-ui-muted">{children}</kbd>;
}
