import { useState, useEffect } from 'react';

interface RepoDataOptions {
  owner: string;
  repo: string;
  installationId: string;
  path?: string;
}

export function useRepoData({ owner, repo, installationId, path = '' }: RepoDataOptions) {
  const [contents, setContents] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!owner || !repo || !installationId) return;
    setLoading(true);
    setError('');
    fetch(`/api/github/repo?owner=${owner}&repo=${repo}&installation_id=${installationId}&path=${path}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setContents(Array.isArray(data) ? data : [data]);
      })
      .catch(() => setError('Failed to fetch repo contents.'))
      .finally(() => setLoading(false));
  }, [owner, repo, path, installationId]);

  return { contents, loading, error };
} 