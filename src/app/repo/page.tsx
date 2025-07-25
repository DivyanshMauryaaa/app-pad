'use client';

import { useState, useEffect } from 'react';
import { useRepoData } from '@/hooks/use-repo-data';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Folder, FileText } from 'lucide-react';
import { toast } from 'sonner';
import supabase from '@/supabase/client';

interface RepoBrowserProps {
  installationId?: string;
  githubRepo?: string;
  app?: any;
}

export default function RepoBrowser({ installationId = '', githubRepo = '', app }: RepoBrowserProps) {
  const [repoInput, setRepoInput] = useState(githubRepo || '');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (githubRepo && githubRepo.includes('/')) {
      setRepoInput(githubRepo);
      const [o, r] = githubRepo.split('/');
      setOwner(o);
      setRepo(r);
      setPath('');
    }
  }, [githubRepo]);

  const { contents, loading, error } = useRepoData({ owner, repo, installationId, path });

  const handleBrowse = async () => {
    setInputError('');
    const parts = repoInput.split('/');
    if (parts.length !== 2) {
      setInputError('Enter repo as owner/repo');
      return;
    }
    if (!installationId) {
      setInputError('No installation ID found for this app.');
      return;
    }

    const { error } = await supabase.from('apps').update({ github_repo: `${parts[0]}/${parts[1]}` }).eq('id', app.id).single();
    if (error) {
      setInputError('Error updating app');
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
    <Card className="w-[screen] mx-auto mt-10 p-8 rounded-lg border shadow bg-card">
      <CardHeader>
        <CardTitle className="text-3xl">GitHub Repo</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="flex gap-2 mb-4 items-end">
          <Input
            type="text"
            placeholder="owner/repo"
            value={repoInput}
            onChange={e => setRepoInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleBrowse} className="shrink-0">Browse</Button>
        </div>
        {inputError && <Badge variant="destructive" className="mb-2">{inputError}</Badge>}
        {error && <Badge variant="destructive" className="mb-2">{error}</Badge>}
        {loading && <Badge className="mb-2">Loading...</Badge>}
        {owner && repo && (
          <div className="mb-4">
            <span className="font-semibold">Repo:</span> <Badge onClick={() => { navigator.clipboard.writeText(`${owner}/${repo}`); toast.success('Copied to clipboard') }} className='cursor-pointer'>{owner}/{repo}</Badge>
            {path && <span> / {path}</span>}
            {path && (
              <Button variant="secondary" size="sm" className="ml-2 px-2 py-0.5 h-7" onClick={() => setPath('')}>
                Go Root /
              </Button>
            )}
          </div>
        )}
        <ul className="space-y-2">
          {contents.map(item => (
            <li key={item.sha || item.path} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
              {item.type === 'dir' ? (
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => handleFolderClick(item.path)}>
                  <Folder className="w-5 h-5 text-primary" />
                  <span className="font-medium text-primary">{item.name}</span>
                  <Badge variant="secondary">Folder</Badge>
                </div>) : (
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.name}</span>
                  <Badge variant="outline">File</Badge>
                </div>
              )}
            </li>
          ))}
        </ul>
        {!loading && contents.length === 0 && owner && repo && (
          <div className="text-muted-foreground mt-4">Nothing here...</div>
        )}
      </CardContent>
    </Card>
  );
}