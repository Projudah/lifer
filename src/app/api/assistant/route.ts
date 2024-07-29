import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI();

export async function POST(request: NextRequest) {
    //get data from request
    const text = await request.json();

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: text
        }
      );
    
      const run = await openai.beta.threads.runs.createAndPoll(
        thread.id,
        { 
          assistant_id: 'asst_EuEquPy1rTqa8Kugk1n96Ldw',
        }
      );

      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        );
        return NextResponse.json(messages);
      } else {
        return NextResponse.json({ error: 'The request timed out' });
      }
}