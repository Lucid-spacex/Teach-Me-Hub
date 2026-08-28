import Link from "next/link";
import { Field, Form } from "@/components/form";
import { login } from "@/lib/actions/auth";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { verified } = await searchParams;

  return (
    <>
      <h1>Log in</h1>
      {verified ? <p className="muted">Account verified. Log in below.</p> : null}
      <Form action={login} submitLabel="Log in">
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
      </Form>
      <p>
        No account? <Link href="/register">Register</Link>
      </p>
      <p>
        Have an OTP? <Link href="/verify">Verify your account</Link>
      </p>
    </>
  );
}
