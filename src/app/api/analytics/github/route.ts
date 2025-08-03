import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';

export async function POST(req: NextRequest) {
  try {
    const { owner, repo, installationId } = await req.json();
    if (!owner || !repo || !installationId) {
      return NextResponse.json({ error: 'Missing owner, repo, or installationId' }, { status: 400 });
    }
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

    // Commits in last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const commits = await octokit.rest.repos.listCommits({ owner, repo, since });
    const commitCount = commits.data.length;

    // Open PRs
    const prs = await octokit.rest.pulls.list({ owner, repo, state: 'open' });
    const openPRs = prs.data.length;

    // Open issues
    const issues = await octokit.rest.issues.listForRepo({ owner, repo, state: 'open' });
    const openIssues = issues.data.length;

    // Stars
    const repoInfo = await octokit.rest.repos.get({ owner, repo });
    const stars = repoInfo.data.stargazers_count;
    const forks = repoInfo.data.forks_count;

    // Contributors
    const contributors = await octokit.rest.repos.listContributors({ owner, repo });
    const contributorCount = contributors.data.length;

    return NextResponse.json({
      commitCount,
      openPRs,
      openIssues,
      stars,
      forks,
      contributorCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}