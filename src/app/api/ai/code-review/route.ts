import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { fetchAllRepoFilesWithContent } from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    const { code, file_path, owner, repo, installationId, app_id, user_id, repoContext } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid code' }, { status: 400 });
    }    

    // Use repoContext from client, fallback to empty string
    const repoContextStr = typeof repoContext === 'string' ? repoContext : '';

    // Fetch repo and file content if possible
    let repoFiles: { path: string; content: string }[] = [];
    let fileContent = '';
    if (owner && repo && installationId) {
      const appId = process.env.GITHUB_APP_ID;
      const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: appId!,
          privateKey: privateKey!,
          installationId: installationId!,
        },
      });
      // Fetch all repo files (limit to 40 for prompt size)
      try {
        repoFiles = await fetchAllRepoFilesWithContent({ octokit, owner, repo });
        if (repoFiles.length > 40) repoFiles = repoFiles.slice(0, 40);
      } catch (e) {
        repoFiles = [];
      }
      // Fetch specific file content if file_path is provided
      if (file_path) {
        try {
          const { data } = await octokit.rest.repos.getContent({ owner, repo, path: file_path });
          if (!Array.isArray(data) && data.type === 'file' && data.content) {
            const buff = Buffer.from(data.content, 'base64');
            // Limit to first 2000 lines
            fileContent = buff.toString('utf-8').split(/\r?\n/).slice(0, 2000).join('\n');
          }
        } catch (e) {
          fileContent = '';
        }
      }
    }

    // Compose the prompt
    const prompt = `Review the following code and provide:\n- A title for the review\n- Suggestions for improvement\n- A list of issues (as an array of strings)\n- A list of improvements (as an array of strings)\nReturn a JSON object with keys: title, suggestions, issues, improvements.\nCode:${repoContextStr}\n${code}\n\n---\nRepository Files (partial):\n${repoFiles.map((f: { path: string; content: string }) => {
      // Limit to first 2000 lines per file
      const lines = f.content.split(/\r?\n/).slice(0, 2000).join('\n');
      return `File: ${f.path}\n${lines}`;
    }).join('\n---\n')}\n\n---\nTarget File Content:\n${fileContent}`;

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