import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { fetchAllRepoFilesWithContent } from '@/lib/github';

// This endpoint expects a POST request with a JSON body containing a 'prompt' string and repo parameters.
// It returns generated documentation as markdown content and a title.

export async function POST(req: NextRequest) {
  try {
    const { prompt, owner, repo, installationId, app_id, user_id, file_path } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid prompt' }, { status: 400 });
    }

    // Add repo context to the AI prompt
    let repoContext = '';
    let repoFiles: { path: string; content: string }[] = [];
    if (owner && repo && installationId) {
      const appId = process.env.GITHUB_APP_ID;
      const privateKey = process.env.GITHUB_PRIVATE_KEY?.replaceAll("\\n", "\n");
      const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: appId!,
          privateKey: privateKey!,
          installationId: installationId!,
        },
      });
      try {
        repoFiles = await fetchAllRepoFilesWithContent({ octokit, owner, repo, path: file_path || '' });
      } catch (e) {
        repoFiles = [];
      }
      repoContext = `\nRepository: ${owner}/${repo}`;
      if (installationId) repoContext += `\nInstallation ID: ${installationId}`;
      if (app_id) repoContext += `\nApp ID: ${app_id}`;
      if (user_id) repoContext += `\nUser ID: ${user_id}`;
      repoContext += `\n---\nRepository Files (partial):\n${repoFiles.map((f: { path: string; content: string }) => `File: ${f.path}\n${f.content}`).join('\n---\n')}`;
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
            text: `Generate clear and concise markdown documentation for the following feature or code. Return only markdown. Feature/Code: ${prompt}${repoContext} ONLY USE THE KNOWLEDGE AVAILBLE TO YOU! DO NOT PREDICT ANYTHING!`
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

    // Try to extract a title from the markdown (first heading)
    let title = 'Document';
    const titleMatch = generatedText.match(/^#\s+(.+)/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    return NextResponse.json({ title, content: generatedText });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 