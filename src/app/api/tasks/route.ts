import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const task = body.task;
    const url = new URL("/api/tasks", process.env.RECLAIM_API_URL);
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(task),
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.RECLAIM_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      return NextResponse.json({ data });
}

export async function PUT(request: NextRequest) {
    const task = await request.json();
    const url = new URL(`/api/tasks/${task.id}`, process.env.RECLAIM_API_URL);
    const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(task),
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.RECLAIM_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      return NextResponse.json({ data });
}

export async function GET() {
  const url = new URL("/api/tasks", process.env.RECLAIM_API_URL);
  url.searchParams.append("status", "COMPLETE,NEW,SCHEDULED,IN_PROGRESS,ARCHIVED");
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
