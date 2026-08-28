import { Field, Form, Select, TextArea } from "@/components/form";
import { Empty } from "@/components/states";
import { logSession } from "@/lib/actions/tutor";
import { apiAuthedQuery } from "@/lib/api";
import { formatDateTime, shortId } from "@/lib/format";
import type { TutoringSession } from "@/lib/types";

export default async function TutorSessionsPage() {
  const sessions = await apiAuthedQuery<TutoringSession[]>("/tutor/sessions");
  const sorted = [...sessions].sort(
    (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
  );

  return (
    <>
      <h1>My sessions</h1>
      {sorted.length === 0 ? (
        <Empty what="sessions" />
      ) : (
        <table>
          <thead>
            <tr>
              <th>When (UTC)</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Enrollment</th>
              <th>Notes</th>
              <th>Homework</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((session) => (
              <tr key={session.id}>
                <td>{formatDateTime(session.scheduledAt)}</td>
                <td>{session.durationMinutes} min</td>
                <td>{session.status}</td>
                <td>{shortId(session.enrollmentId)}</td>
                <td>{session.tutorNotes ?? "—"}</td>
                <td>{session.homeworkAssigned ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Log a session</h2>
      {sorted.length === 0 ? (
        <p className="muted">No sessions to log.</p>
      ) : (
        <Form action={logSession} submitLabel="Save session">
          <Select
            label="Session"
            name="sessionId"
            required
            options={sorted.map((session) => ({
              value: session.id,
              label: `${formatDateTime(session.scheduledAt)} — ${session.status}`,
            }))}
          />
          <Select
            label="Status"
            name="status"
            required
            options={[
              { value: "COMPLETED", label: "Completed" },
              { value: "MISSED", label: "Missed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
          <TextArea label="Tutor notes" name="tutorNotes" />
          <Field label="Homework assigned" name="homeworkAssigned" />
        </Form>
      )}
    </>
  );
}
