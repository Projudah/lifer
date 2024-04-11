const taskUrl = "https://api.app.reclaim.ai/api/tasks";
const token = "f9cac08d-19b4-46b5-8120-8efe6195d0b1";
export async function GET() {
  const url = new URL(taskUrl);
  url.searchParams.append("status", "COMPLETE,NEW,SCHEDULED,IN_PROGRESS");
  url.searchParams.append("instance", "true");
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("res", res);
  const data = await res.json();
  return Response.json({ data });
}
