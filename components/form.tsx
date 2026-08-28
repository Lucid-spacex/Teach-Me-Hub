"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

export interface ActionState {
  error?: string;
  success?: string;
}

export type Action = (
  state: ActionState | null,
  formData: FormData,
) => Promise<ActionState | null>;

export function Form({
  action,
  submitLabel,
  className,
  children,
}: {
  action: Action;
  submitLabel: string;
  className?: string;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      {children}
      <button type="submit" disabled={pending}>
        {pending ? "Working..." : submitLabel}
      </button>
      {state?.error ? <p className="error">{state.error}</p> : null}
      {state?.success ? <p className="muted">{state.success}</p> : null}
    </form>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = false,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <label>
      {label}
      {hint ? <span>{hint}</span> : null}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  required = false,
  rows = 3,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label>
      {label}
      <textarea name={name} required={required} rows={rows} />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  required = false,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  defaultValue?: string;
}) {
  return (
    <label>
      {label}
      {hint ? <span>{hint}</span> : null}
      <select name={name} required={required} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
