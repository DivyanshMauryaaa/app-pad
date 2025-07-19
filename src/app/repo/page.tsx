'use client';

import { useState, useEffect } from 'react';

export default function RepoBrowser({ installationId = '' }: { installationId?: string }) {
  const [repoInput, setRepoInput] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [contents, setContents] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch repo contents when owner/repo/path/installationId changes
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

  const handleBrowse = () => {
    setError('');
    const parts = repoInput.split('/');
    if (parts.length !== 2) {
      setError('Enter repo as owner/repo');
      return;
    }
    if (!installationId) {
      setError('No installation ID found for this app.');
      return;
    }
    setOwner(parts[0]);
    setRepo(parts[1]);
    setPath('');
  };

  const handleFolderClick = (folderPath: string) => {
    setPath(folderPath);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">GitHub Repo Browser</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="owner/repo"
          value={repoInput}
          onChange={e => setRepoInput(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button onClick={handleBrowse} className="bg-blue-600 text-white px-4 py-1 rounded">
          Browse
        </button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading && <div>Loading...</div>}
      {owner && repo && (
        <div>
          <div className="mb-2">
            <strong>Repo:</strong> {owner}/{repo}
            {path && <span> / {path}</span>}
            {path && (
              <button className="ml-2 text-blue-600" onClick={() => setPath('')}>
                Root
              </button>
            )}
          </div>
          <ul>
            {contents.map(item => (
              <li key={item.sha}>
                {item.type === 'dir' ? (
                  <button
                    className="text-blue-600 underline"
                    onClick={() => handleFolderClick(item.path)}
                  >
                    📁 {item.name}
                  </button>
                ) : (
                  <span>📄 {item.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}