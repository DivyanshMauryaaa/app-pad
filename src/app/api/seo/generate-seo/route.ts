import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/supabase/client';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { fetchAllRepoFilesWithContent } from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    const {
      app_id,
      user_id,
      appName,
      shortDesc,
      audience,
      language,
      region,
      purpose,
      tone,
      owner,
      repo,
      installationId,
      repoContext
    } = await req.json();

    if (!app_id || !user_id || !appName || !shortDesc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build context for the prompt
    let repoFiles: { path: string; content: string }[] = [];
    let repoContextStr = typeof repoContext === 'string' ? repoContext : '';
    if (owner && repo && installationId) {
      const appId = process.env.GITHUB_APP_ID;
      const privateKey = process.env.GITHUB_PRIVATE_KEY?.replaceAll("\n", "\n");
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
        if (repoFiles.length > 20) repoFiles = repoFiles.slice(0, 20);
        repoFiles = repoFiles.map(f => ({
          path: f.path,
          content: f.content.split(/\r?\n/).slice(0, 500).join('\n')
        }));
      } catch (e) {
        repoFiles = [];
      }
      repoContextStr += `\n---\nRepository Files (partial):\n${repoFiles.map((f: { path: string; content: string }) => `File: ${f.path}\n${f.content}`).join('\n---\n')}`;
    }

    // Compose the prompt for Gemini
    const prompt = `Generate SEO metadata for the following app. Return a JSON object with keys: title, description, slug, canonical_url, keywords (array), og_image_url, twitter_card_type, no_index, no_follow, language.\n\nApp Name: ${appName}\nShort Description: ${shortDesc}\nTarget Audience: ${audience}\nLanguage: ${language}\nRegion: ${region}\nPurpose: ${purpose}\nTone: ${tone}\n${repoContextStr}\nONLY USE THE KNOWLEDGE AVAILABLE TO YOU! DO NOT PREDICT ANYTHING!`;

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
      return NextResponse.json({ error: `AI API request failed with status ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      return NextResponse.json({ error: 'No generated content found in response' }, { status: 500 });
    }

    // Try to parse the JSON from the response
    let seo;
    try {
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        seo = JSON.parse(jsonMatch[1]);
      } else {
        seo = JSON.parse(generatedText);
      }
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse AI response as JSON', raw: generatedText }, { status: 500 });
    }

    // Insert into Supabase
    const { data: inserted, error: dbError } = await supabase.from('seo_metadata').insert([
      {
        user_id,
        app_id,
        title: seo.title,
        description: seo.description,
        slug: seo.slug,
        canonical_url: seo.canonical_url,
        keywords: seo.keywords,
        og_image_url: seo.og_image_url,
        twitter_card_type: seo.twitter_card_type,
        no_index: seo.no_index,
        no_follow: seo.no_follow,
        language: seo.language || language || 'en',
        is_active: true
      }
    ]).select().single();

    if (dbError) {
      return NextResponse.json({ error: 'Failed to insert into database', dbError, seo }, { status: 500 });
    }

    return NextResponse.json({ seo: inserted });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
}
