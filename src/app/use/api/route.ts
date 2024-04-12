import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const response = await kv.hgetall("rewards");
  if (!response) {
    return NextResponse.json("no rewards found");
  }
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  //get data from request
  const body = await request.json();
  const rewardName = body.name;
  const rewardCost = body.cost;

  if (!rewardName || !rewardCost) return NextResponse.error();

  const response = await kv.hset("rewards", {
    [rewardName]: rewardCost,
  });
  return NextResponse.json(response);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const rewardName = body.name;

  if (!rewardName) return NextResponse.error();

  const response = await kv.hdel("rewards", rewardName);
  return NextResponse.json(response);
}
