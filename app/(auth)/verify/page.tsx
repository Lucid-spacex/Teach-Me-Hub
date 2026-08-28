import Link from "next/link";
import { Field, Form } from "@/components/form";
import { verify } from "@/lib/actions/auth";

export default async function VerifyPage({ searchParams }: PageProps<"/verify">) {
  const { email } = await searchParams;

  return (
    <>
      <h1>Verify account</h1>
      <p className="muted">Enter the one-time code emailed to you.</p>
      <Form action={verify} submitLabel="Verify">
        <Field
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={typeof email === "string" ? email : undefined}
        />
        <Field label="OTP" name="otp" required />
      </Form>
      <p>
        <Link href="/login">Back to log in</Link>
      </p>
    </>
  );
}
