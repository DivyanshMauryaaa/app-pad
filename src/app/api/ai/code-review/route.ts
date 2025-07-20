import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, file_path, owner, repo, installationId, app_id, user_id } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid code' }, { status: 400 });
    }

    // Add repo context
    let repoContext = '';
    if (owner && repo) {
      repoContext = `\nRepository: ${owner}/${repo}`;
      if (file_path) repoContext += `\nFile: ${file_path}`;
      if (installationId) repoContext += `\nInstallation ID: ${installationId}`;
      if (app_id) repoContext += `\nApp ID: ${app_id}`;
      if (user_id) repoContext += `\nUser ID: ${user_id}`;
    }

    // Compose the prompt
    const prompt = `Review the following code and provide:\n- A title for the review\n- Suggestions for improvement\n- A list of issues (as an array of strings)\n- A list of improvements (as an array of strings)\nReturn a JSON object with keys: title, suggestions, issues, improvements.\nCode:${repoContext}\n${code}`;

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
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
    let review;
    try {
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        review = JSON.parse(jsonMatch[1]);
      } else {
        review = JSON.parse(generatedText);
      }
    } catch (e) {
      // If parsing fails, return a basic review
      review = {
        title: 'Code Review',
        suggestions: generatedText,
        issues: [],
        improvements: []
      };
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 