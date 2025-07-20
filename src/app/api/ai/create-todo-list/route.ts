import { NextRequest, NextResponse } from 'next/server';

// This endpoint expects a POST request with a JSON body containing a 'prompt' string and repo parameters.
// It returns a generated todo list as an array of tasks with name and description.

export async function POST(req: NextRequest) {
  try {
    const { prompt, owner, repo, installationId, app_id, user_id } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid prompt' }, { status: 400 });
    }

    // Add repo context to the AI prompt
    let repoContext = '';
    if (owner && repo) {
      repoContext = `\nRepository: ${owner}/${repo}`;
      if (installationId) repoContext += `\nInstallation ID: ${installationId}`;
      if (app_id) repoContext += `\nApp ID: ${app_id}`;
      if (user_id) repoContext += `\nUser ID: ${user_id}`;
    }

    // Call Google AI Studio API (Gemini)
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Break down the following software feature into specific development tasks as a JSON array of objects with \"name\" and \"description\" properties. Each task should be actionable for a developer. Be concise but clear. Feature: ${prompt}${repoContext}`
          }]
        }]
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: `API request failed with status ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      return NextResponse.json({ error: 'No generated content found in response' }, { status: 500 });
    }

    // Try to parse the JSON from the response
    let parsedTodos;
    try {
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        parsedTodos = JSON.parse(jsonMatch[1]);
      } else {
        parsedTodos = JSON.parse(generatedText);
      }
    } catch (e) {
      // If parsing fails, try to handle plain text response
      const lines = generatedText.split('\n').filter((line: string) => line.trim());
      parsedTodos = lines.map((line: string) => {
        const [name, ...descParts] = line.split(':');
        return {
          name: name.trim(),
          description: descParts.join(':').trim()
        };
      });
    }

    if (!Array.isArray(parsedTodos)) {
      return NextResponse.json({ error: 'Generated content is not in expected format' }, { status: 500 });
    }

    return NextResponse.json({ todos: parsedTodos });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 