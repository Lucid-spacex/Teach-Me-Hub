import { Field, Form, Select } from "@/components/form";
import { Empty } from "@/components/states";
import { createEnrollment } from "@/lib/actions/parent";
import { apiAuthedQuery } from "@/lib/api";
import { formatDate, shortId } from "@/lib/format";
import type { Enrollment, Student } from "@/lib/types";

export default async function ParentEnrollmentsPage() {
  const [enrollments, students] = await Promise.all([
    apiAuthedQuery<Enrollment[]>("/enrollments"),
    apiAuthedQuery<Student[]>("/students"),
  ]);
  const studentName = (id: string) =>
    students.find((student) => student.id === id)?.fullName ?? shortId(id);

  return (
    <>
      <h1>My enrollments</h1>
      {enrollments.length === 0 ? (
        <Empty what="enrollments" />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Child</th>
              <th>Subject ID</th>
              <th>Tutor ID</th>
              <th>Frequency</th>
              <th>Status</th>
              <th>Start</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td>{studentName(enrollment.studentId)}</td>
                <td>{shortId(enrollment.subjectId)}</td>
                <td>{enrollment.tutorId ? shortId(enrollment.tutorId) : "Unassigned"}</td>
                <td>{enrollment.frequency}</td>
                <td>{enrollment.status}</td>
                <td>{formatDate(enrollment.startDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Create enrollment</h2>
      {students.length === 0 ? (
        <p className="muted">Add a child first.</p>
      ) : (
        <Form action={createEnrollment} submitLabel="Create enrollment">
          <Select
            label="Child"
            name="studentId"
            required
            options={students.map((student) => ({
              value: student.id,
              label: student.fullName,
            }))}
          />
          <Field
            label="Subject ID"
            name="subjectId"
            required
            hint="The API has no subject list endpoint yet — paste a subject UUID."
          />
          <Select
            label="Frequency"
            name="frequency"
            required
            options={[
              { value: "WEEKLY", label: "Weekly" },
              { value: "BI_WEEKLY", label: "Bi-weekly" },
              { value: "MONTHLY", label: "Monthly" },
            ]}
          />
          <Field label="Start date" name="startDate" type="date" required />
          <Field label="End date" name="endDate" type="date" />
        </Form>
      )}
    </>
  );
}
