import { Form } from "@/components/form";
import { Empty, NotAvailable } from "@/components/states";
import { assignTutor, setVettingStatus } from "@/lib/actions/admin";
import { apiAuthedQueryOptional } from "@/lib/api";
import { formatDate, shortId } from "@/lib/format";
import type { AdminOverview, Enrollment, PendingTutor } from "@/lib/types";

export default async function AdminPage() {
  const [overview, pendingTutors, unmatched] = await Promise.all([
    apiAuthedQueryOptional<AdminOverview>("/admin/reports/overview"),
    apiAuthedQueryOptional<PendingTutor[]>("/admin/tutors/pending"),
    apiAuthedQueryOptional<Enrollment[]>("/admin/enrollments/unmatched"),
  ]);

  return (
    <>
      <h1>Admin</h1>

      <section>
        <h2>Overview</h2>
        {overview ? (
          <table>
            <tbody>
              <tr>
                <th>Active students</th>
                <td>{overview.activeStudents}</td>
                <th>Active tutors</th>
                <td>{overview.activeTutors}</td>
              </tr>
              <tr>
                <th>Total enrollments</th>
                <td>{overview.totalEnrollments}</td>
                <th>Pending vetting</th>
                <td>{overview.pendingVetting}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <NotAvailable />
        )}
      </section>

      <section>
        <h2>Tutors pending vetting</h2>
        {!pendingTutors ? (
          <NotAvailable />
        ) : pendingTutors.length === 0 ? (
          <Empty what="tutors pending vetting" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subjects</th>
                <th>Rate</th>
                <th>User ID</th>
                <th>Profile ID</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {pendingTutors.map(({ user, tutorProfile }) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{tutorProfile?.subjects?.join(", ") || "—"}</td>
                  <td>{tutorProfile?.hourlyRate ?? "—"}</td>
                  <td>{shortId(user.id)}</td>
                  <td>{shortId(tutorProfile?.id)}</td>
                  <td>
                    <Form
                      action={setVettingStatus}
                      submitLabel="Approve"
                      className="inline-form"
                    >
                      <input type="hidden" name="tutorId" value={user.id} />
                      <input
                        type="hidden"
                        name="vettingStatus"
                        value="APPROVED"
                      />
                    </Form>
                    <Form
                      action={setVettingStatus}
                      submitLabel="Reject"
                      className="inline-form"
                    >
                      <input type="hidden" name="tutorId" value={user.id} />
                      <input
                        type="hidden"
                        name="vettingStatus"
                        value="REJECTED"
                      />
                    </Form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Unmatched enrollments</h2>
        {!unmatched ? (
          <NotAvailable />
        ) : unmatched.length === 0 ? (
          <Empty what="unmatched enrollments" />
        ) : (
          <>
            <p className="muted">
              The API has no endpoint listing approved tutors yet, so the tutor
              is assigned by pasting a tutor UUID.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Enrollment</th>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Frequency</th>
                  <th>Start</th>
                  <th>Assign tutor</th>
                </tr>
              </thead>
              <tbody>
                {unmatched.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>{shortId(enrollment.id)}</td>
                    <td>{shortId(enrollment.studentId)}</td>
                    <td>{shortId(enrollment.subjectId)}</td>
                    <td>{enrollment.frequency}</td>
                    <td>{formatDate(enrollment.startDate)}</td>
                    <td>
                      <Form
                        action={assignTutor}
                        submitLabel="Assign"
                        className="inline-form"
                      >
                        <input
                          type="hidden"
                          name="enrollmentId"
                          value={enrollment.id}
                        />
                        <input
                          name="tutorId"
                          required
                          placeholder="tutor UUID"
                        />
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </>
  );
}
