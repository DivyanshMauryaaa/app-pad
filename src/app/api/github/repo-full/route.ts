import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import { fetchAllRepoFilesWithContent } from '@/lib/github';

const appId = process.env.GITHUB_APP_ID;
const privateKey = process.env.GITHUB_PRIVATE_KEY?.replaceAll("\\n", "\n");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const installationId = searchParams.get('installation_id') || process.env.GITHUB_INSTALLATION_ID;

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }
  if (!installationId) {
    return NextResponse.json({ error: 'Missing installation_id' }, { status: 400 });
  }

  try {
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: appId!,
        privateKey: privateKey!,
        installationId: installationId!,
      },
    });

    const files = await fetchAllRepoFilesWithContent({ octokit, owner, repo });
    return NextResponse.json({ files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 