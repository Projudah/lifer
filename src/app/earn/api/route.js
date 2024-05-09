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
