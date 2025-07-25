import { useState, useEffect } from 'react';

interface RepoDataOptions {
  owner: string;
  repo: string;
  installationId: string;
  path?: string;
}

interface FileContent {
  sha: string;
  name: string;
  path: string;
  type: string;
  content?: string;
  size?: number;
  // Add other properties as needed
}

const MAX_FILES = 24;
const MAX_LINES_PER_FILE = 2000;

export function useRepoData({ owner, repo, installationId, path = '' }: RepoDataOptions) {
  const [contents, setContents] = useState<FileContent[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitWarning, setLimitWarning] = useState('');

  const countLines = (content: string): number => {
    return content.split('\n').length;
  };

  const truncateContent = (content: string, maxLines: number): string => {
    const lines = content.split('\n');
    if (lines.length <= maxLines) return content;
    
    return lines.slice(0, maxLines).join('\n') + 
           `\n\n// ... Content truncated (${lines.length - maxLines} more lines)`;
  };

  const processContents = (data: any[]): FileContent[] => {
    let warnings: string[] = [];
    
    // Limit number of files
    let processedData = data;
    if (data.length > MAX_FILES) {
      processedData = data.slice(0, MAX_FILES);
      warnings.push(`Showing first ${MAX_FILES} files (${data.length - MAX_FILES} files hidden)`);
    }

    // Process each file and limit lines
    const processedContents = processedData.map((item: any) => {
      if (item.type === 'file' && item.content) {
        const lineCount = countLines(item.content);
        
        if (lineCount > MAX_LINES_PER_FILE) {
          warnings.push(`File "${item.name}" truncated (${lineCount} lines → ${MAX_LINES_PER_FILE} lines)`);
          return {
            ...item,
            content: truncateContent(item.content, MAX_LINES_PER_FILE),
            originalLineCount: lineCount,
            truncated: true
          };
        }
      }
      
      return item;
    });

    if (warnings.length > 0) {
      setLimitWarning(warnings.join('; '));
    } else {
      setLimitWarning('');
    }

    return processedContents;
  };

  useEffect(() => {
    if (!owner || !repo || !installationId) return;
    
    setLoading(true);
    setError('');
    setLimitWarning('');
    
    fetch(`/api/github/repo?owner=${owner}&repo=${repo}&installation_id=${installationId}&path=${path}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          const dataArray = Array.isArray(data) ? data : [data];
          const processedContents = processContents(dataArray);
          setContents(processedContents);
        }
      })
      .catch(() => setError('Failed to fetch repo contents.'))
      .finally(() => setLoading(false));
  }, [owner, repo, path, installationId]);

  return { 
    contents, 
    loading, 
    error, 
    limitWarning,
    limits: {
      maxFiles: MAX_FILES,
      maxLinesPerFile: MAX_LINES_PER_FILE
    }
  };
}