export type ScheduleEntry = {
  id: string; // courseId
  courseName: string;
  location: string;
  day: string;
  period: number;
  semester: string;
};

const BASE = 'http://localhost:3000/api/schedule';

/**
 * Provides the default HTTP headers used for schedule API requests.
 *
 * @returns An immutable headers object with `Content-Type` set to `application/json` and `Authorization` set to `LOL`.
 */
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'LOL',
  } as const;
}

/**
 * Retrieve the schedule entries for a specific user and semester.
 *
 * @param userId - The user's identifier
 * @param semester - The semester identifier (e.g., "2025-Fall")
 * @returns An array of ScheduleEntry objects for the specified user and semester; an empty array if no entries are found
 * @throws Error when the HTTP response is not OK; the error message is the response body text
 */
export async function fetchSchedule(userId: string, semester: string): Promise<ScheduleEntry[]> {
  const url = `${BASE}?userId=${encodeURIComponent(userId)}&semester=${encodeURIComponent(semester)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const body = await res.json();
  return body.data ?? [];
}

/**
 * Creates or updates a schedule item for a specific user and semester.
 *
 * @param params - Object describing the schedule item to save:
 *   - userId: the user's id
 *   - semester: semester identifier
 *   - day: day of the week for the entry
 *   - period: period number for the entry
 *   - courseId: id of the course to assign
 * @throws Error - when the HTTP request fails; the error message contains the server response text
 */
export async function saveScheduleItem(params: { userId: string; semester: string; day: string; period: number; courseId: string; }) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
}

/**
 * Deletes a schedule entry for a user for a specific day and period in a semester.
 *
 * @param params - Parameters identifying the schedule entry to remove.
 * @param params.userId - The user's ID.
 * @param params.semester - The semester identifier.
 * @param params.day - The day of the entry to remove.
 * @param params.period - The period number of the entry to remove.
 * @throws Error - If the server responds with a non-OK status; the error message contains the response body text.
 */
export async function removeScheduleItem(params: { userId: string; semester: string; day: string; period: number; }) {
  const res = await fetch(BASE, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
}