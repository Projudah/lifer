import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const response = await kv.get<string>("points");
  let points = "0";
  if (!response || response == "nil") {
    await kv.set("points", "0");
  } else {
    points = response;
  }
  return NextResponse.json(points);
}

export async function POST(request: NextRequest) {
    //get data from request
    const body = await request.json();
    const points = body.points;

    if(!points) return NextResponse.error();

    const response = await kv.set("points", points);
    return NextResponse.json(response);
}
