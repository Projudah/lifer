export async function GET() {
  const url = new URL("/api/tasks", process.env.RECLAIM_API_URL);
  url.searchParams.append("status", "COMPLETE,NEW,SCHEDULED,IN_PROGRESS");
  url.searchParams.append("instance", "true");
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.RECLAIM_API_TOKEN}`,
    },
  });
  const data = await res.json();
  return Response.json({ data });
}

export async function POST(request) {
  const body = await request.json();

  if (!body.id) return Response.error();

  const url = new URL(
    `/api/planner/done/task/${body.id}`,
    process.env.RECLAIM_API_URL
  );
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.RECLAIM_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return Response.json({ data });
}
