import { Field, Form, Select, TextArea } from "@/components/form";
import { Empty } from "@/components/states";
import { submitProgressReport } from "@/lib/actions/tutor";
import { apiAuthedQuery } from "@/lib/api";
import { formatDate, shortId } from "@/lib/format";
import type { TutorStudent } from "@/lib/types";

export default async function TutorReportsPage() {
  const rows = await apiAuthedQuery<TutorStudent[]>("/tutor/students");

  return (
    <>
      <h1>Progress reports</h1>
      {rows.length === 0 ? (
        <Empty what="enrollments to report on" />
      ) : (
        <Form action={submitProgressReport} submitLabel="Submit report">
          <Select
            label="Enrollment"
            name="enrollmentId"
            required
            options={rows.map(({ student, enrollment }) => ({
              value: enrollment.id,
              label: `${student.fullName} — ${shortId(enrollment.id)} (from ${formatDate(enrollment.startDate)})`,
            }))}
          />
          <Field label="Period" name="period" required hint="e.g. January 2026" />
          <TextArea label="Summary" name="summary" required />
          <TextArea label="Strengths" name="strengths" required />
          <TextArea label="Areas to improve" name="areasToImprove" required />
        </Form>
      )}
    </>
  );
}
