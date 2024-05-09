import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const response = await kv.hgetall("goals");
  if (!response) {
    return NextResponse.json({});
  }

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
    //get data from request
    const goal = await request.json();

    if(!goal) return NextResponse.error();

    const response = await kv.hset("goals", goal);
    return NextResponse.json(response);
}

export async function DELETE(request: NextRequest) {
    const body = await request.json();
    const goal = body.id;

    if(!goal) return NextResponse.error();

    const response = await kv.hdel("goals", goal);
    return NextResponse.json(response);
}