import { Octokit } from 'octokit';

export async function fetchAllRepoFilesWithContent({ octokit, owner, repo, path = '' }: { octokit: any, owner: string, repo: string, path?: string }) {
  const files: { path: string, content: string }[] = [];

  async function fetchDir(currentPath: string) {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path: currentPath });
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === 'dir') {
          await fetchDir(item.path);
        } else if (item.type === 'file') {
          // Fetch file content (base64 encoded)
          const fileData = await octokit.rest.repos.getContent({ owner, repo, path: item.path });
          if (!Array.isArray(fileData.data) && fileData.data.content) {
            const buff = Buffer.from(fileData.data.content, 'base64');
            files.push({ path: item.path, content: buff.toString('utf-8') });
          }
        }
      }
    }
  }

  await fetchDir(path);
  return files;
}
