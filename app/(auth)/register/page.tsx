import Link from "next/link";
import { Field, Form, Select } from "@/components/form";
import { register } from "@/lib/actions/auth";

export default function RegisterPage() {
  return (
    <>
      <h1>Register</h1>
      <Form action={register} submitLabel="Register">
        <Field label="Full name" name="fullName" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" required hint="e.g. +1234567890" />
        <Field label="Password" name="password" type="password" required />
        <Select
          label="Role"
          name="role"
          options={[
            { value: "PARENT", label: "Parent" },
            { value: "TUTOR", label: "Tutor" },
          ]}
          required
        />
      </Form>
      <p className="muted">
        After registering, the API emails you a one-time code to verify the
        account.
      </p>
      <p>
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}
