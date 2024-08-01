import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI();

export async function POST(request: NextRequest) {
    // Get data from request
    const text = await request.json();

    // Create a new thread
    const thread = await openai.beta.threads.create();

    // Add a message to the thread
    await openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: text
        }
    );

    // Start the run
    const run = await openai.beta.threads.runs.create(
        thread.id,
        { 
          assistant_id: 'asst_EuEquPy1rTqa8Kugk1n96Ldw',
        }
    );

    // Return the run ID to the client
    return NextResponse.json({ runId: run.id, threadId: thread.id });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  const threadId = searchParams.get('threadId');

  if (!runId || !threadId) {
    return NextResponse.json({ error: 'Missing runId or threadId' }, { status: 400 });
  }

  // Get the run status
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);

  // Retrieve the latest messages
  const messages = await openai.beta.threads.messages.list(run.thread_id);

  return NextResponse.json({ status: run.status, messages });
}