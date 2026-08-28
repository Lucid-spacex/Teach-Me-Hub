export function Loading({ what = "data" }: { what?: string }) {
  return <p className="muted">Loading {what}...</p>;
}

export function ErrorText({ message }: { message: string }) {
  return <p className="error">{message}</p>;
}

export function Empty({ what }: { what: string }) {
  return <p className="muted">No {what} yet.</p>;
}

export function NotAvailable() {
  return <p className="muted">This feature isn&apos;t available yet.</p>;
}
