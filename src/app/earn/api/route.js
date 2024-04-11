export async function GET() {
  const url = new URL(process.env.RECLAIM_API_URL);
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
