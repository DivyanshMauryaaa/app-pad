import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { fetchAllRepoFilesWithContent } from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    const { message, history, owner, repo, installationId, app_id, user_id, repoContext } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid message' }, { status: 400 });
    }

    // Build chat history context
    let chatContext = '';
    if (Array.isArray(history)) {
      chatContext = history.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    }

    // Detect if this is the first user prompt
    const isFirstPrompt = !history || history.length === 0;

    // Use repoContext from client, fallback to empty string
    const repoContextStr = typeof repoContext === 'string' ? repoContext : '';

    // Fetch repo content if possible (only for first prompt)
    let repoFiles: { path: string; content: string }[] = [];
    if (isFirstPrompt && owner && repo && installationId) {
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
        repoFiles = await fetchAllRepoFilesWithContent({ octokit, owner, repo });
        if (repoFiles.length > 30) repoFiles = repoFiles.slice(0, 30);
        repoFiles = repoFiles.map(f => ({
          path: f.path,
          content: f.content.split(/\r?\n/).slice(0, 1000).join('\n')
        }));
      } catch (e) {
        repoFiles = [];
      }
    }

    // Compose the prompt
    let prompt = '';
    if (isFirstPrompt) {
      prompt = `${repoContextStr}\n${chatContext}\nUser: ${message}\n\n---\nRepository Files (partial):\n${repoFiles.map((f: { path: string; content: string }) => {
        // Limit to first 2000 lines per file
        const lines = f.content.split(/\r?\n/).slice(0, 2000).join('\n');
        return `File: ${f.path}\n${lines}`;
      }).join('\n---\n')}`;
    } else {
      prompt = `${chatContext}\nUser: ${message}`;
    }

    // if () {}

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

    return NextResponse.json({ response: generatedText });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 