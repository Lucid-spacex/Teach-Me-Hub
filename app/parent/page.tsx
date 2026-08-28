import { Field, Form } from "@/components/form";
import { Empty } from "@/components/states";
import { addChild } from "@/lib/actions/parent";
import { apiAuthedQuery } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Student } from "@/lib/types";

export default async function ParentChildrenPage() {
  const students = await apiAuthedQuery<Student[]>("/students");

  return (
    <>
      <h1>My children</h1>
      {students.length === 0 ? (
        <Empty what="children" />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date of birth</th>
              <th>Grade</th>
              <th>School</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.fullName}</td>
                <td>{formatDate(student.dateOfBirth)}</td>
                <td>{student.gradeLevel}</td>
                <td>{student.school ?? "—"}</td>
                <td>{student.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Add child</h2>
      <Form action={addChild} submitLabel="Add child">
        <Field label="Full name" name="fullName" required />
        <Field label="Date of birth" name="dateOfBirth" type="date" required />
        <Field label="Grade level" name="gradeLevel" required />
        <Field label="School" name="school" />
        <Field label="Notes" name="notes" />
      </Form>
    </>
  );
}
