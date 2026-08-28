import { Empty } from "@/components/states";
import { apiAuthedQuery } from "@/lib/api";
import { formatDate, shortId } from "@/lib/format";
import type { TutorStudent } from "@/lib/types";

export default async function TutorStudentsPage() {
  const rows = await apiAuthedQuery<TutorStudent[]>("/tutor/students");

  return (
    <>
      <h1>My students</h1>
      {rows.length === 0 ? (
        <Empty what="assigned students" />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Grade</th>
              <th>School</th>
              <th>Enrollment</th>
              <th>Frequency</th>
              <th>Status</th>
              <th>Start</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ student, enrollment }) => (
              <tr key={enrollment.id}>
                <td>{student.fullName}</td>
                <td>{student.gradeLevel}</td>
                <td>{student.school ?? "—"}</td>
                <td>{shortId(enrollment.id)}</td>
                <td>{enrollment.frequency}</td>
                <td>{enrollment.status}</td>
                <td>{formatDate(enrollment.startDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
