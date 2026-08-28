import { Empty } from "@/components/states";
import { apiAuthedQuery } from "@/lib/api";
import { formatDateTime, shortId } from "@/lib/format";
import type { TutoringSession } from "@/lib/types";

export default async function ParentSessionsPage() {
  const sessions = await apiAuthedQuery<TutoringSession[]>("/sessions", {
    status: "SCHEDULED",
  });
  const upcoming = [...sessions].sort(
    (a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt),
  );

  return (
    <>
      <h1>Upcoming sessions</h1>
      {upcoming.length === 0 ? (
        <Empty what="scheduled sessions" />
      ) : (
        <table>
          <thead>
            <tr>
              <th>When (UTC)</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Enrollment</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((session) => (
              <tr key={session.id}>
                <td>{formatDateTime(session.scheduledAt)}</td>
                <td>{session.durationMinutes} min</td>
                <td>{session.status}</td>
                <td>{shortId(session.enrollmentId)}</td>
                <td>
                  {session.zoomLink ? (
                    <a href={session.zoomLink}>Join</a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
