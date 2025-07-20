import { NextRequest, NextResponse } from 'next/server';

// This endpoint expects a POST request with a JSON body containing a 'description', 'file_path', and repo parameters.
// It returns a generated bug report as an object.

export async function POST(req: NextRequest) {
  try {
    const { description, file_path, owner, repo, installationId, app_id, user_id } = await req.json();
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid description' }, { status: 400 });
    }

    // Add repo context to the AI prompt
    let repoContext = '';
    if (owner && repo) {
      repoContext = `\nRepository: ${owner}/${repo}`;
      if (file_path) repoContext += `\nFile: ${file_path}`;
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
            text: `Given the following bug or issue, generate a detailed bug report as a JSON object with \"title\", \"description\", \"severity\", and optionally \"line_number\". Be concise but clear. Bug: ${description}${repoContext}`
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
    let bugReport;
    try {
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        bugReport = JSON.parse(jsonMatch[1]);
      } else {
        bugReport = JSON.parse(generatedText);
      }
    } catch (e) {
      // If parsing fails, return a basic bug report
      bugReport = {
        title: 'Bug Report',
        description: generatedText,
        severity: 'medium',
      };
    }

    return NextResponse.json(bugReport);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 