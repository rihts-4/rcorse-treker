export type ScheduleEntry = {
  id: string; // courseId
  courseName: string;
  location: string;
  day: string;
  period: number;
  semester: string;
};

const BASE = 'http://localhost:3000/api/schedule';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'LOL',
  } as const;
}

export async function fetchSchedule(userId: string, semester: string): Promise<ScheduleEntry[]> {
  const url = `${BASE}?userId=${encodeURIComponent(userId)}&semester=${encodeURIComponent(semester)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const body = await res.json();
  return body.data ?? [];
}

export async function saveScheduleItem(params: { userId: string; semester: string; day: string; period: number; courseId: string; }) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function removeScheduleItem(params: { userId: string; semester: string; day: string; period: number; }) {
  const res = await fetch(BASE, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
}
