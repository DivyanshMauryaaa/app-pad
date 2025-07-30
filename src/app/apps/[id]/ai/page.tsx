'use client'

import { useState, useEffect, useRef } from "react";
import supabase from "@/supabase/client";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, ListChecks, FileText, Bug, Code, MessageCircle, Download, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MdRenderer from '@/components/mdrenderer';
import { useIsSubscribed } from '@/hooks/use-is-subscribed';
import PricingDialog from '@/app/components/PricingDialog';

type TodoList = {
  id: string;
  app_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type Todo = {
  id: string;
  app_id: string;
  list_id: string;
  name: string;
  status: string;
  description: string;
  link: string;
  created_at: string;
  updated_at: string;
};

type Document = {
  id: string;
  app_id: string;
  title: string;
  content: string;
  type: 'readme' | 'api' | 'guide' | 'changelog' | 'other';
  created_at: string;
  updated_at: string;
};

type BugReport = {
  id: string;
  app_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  file_path?: string;
  line_number?: number;
  created_at: string;
  updated_at: string;
};

type CodeReview = {
  id: string;
  app_id: string;
  title: string;
  file_path: string;
  suggestions: string;
  issues: string[];
  improvements: string[];
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const AiPage = () => {
  const params = useParams();
  const appId = params.id as string;
  const { user } = useUser();
  const isSubscribed = useIsSubscribed(appId); // 'true' for Pro, else Free

  // Context Options State
  const [useGithubContext, setUseGithubContext] = useState(true);
  const [githubFileLimit, setGithubFileLimit] = useState(20); // default for Free
  const [githubLineLimit, setGithubLineLimit] = useState(1000); // default for Free
  const [includePRs, setIncludePRs] = useState(false);
  const [includeCommits, setIncludeCommits] = useState(false);
  const [prLimit, setPrLimit] = useState(2); // default for Free
  const [commitLimit, setCommitLimit] = useState(5); // default for Free
  const [allFiles, setAllFiles] = useState(false); // Pro only
  const [allPRs, setAllPRs] = useState(false); // Pro only
  const [allCommits, setAllCommits] = useState(false); // Pro only

  // Repository data
  const [installationId, setInstallationId] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [path, setPath] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  // Prepare repo context for AI endpoints
  const repoContext = `\nRepository: ${owner}/${repo}` +
    (installationId ? `\nInstallation ID: ${installationId}` : '') +
    (appId ? `\nApp ID: ${appId}` : '') +
    (user?.id ? `\nUser ID: ${user.id}` : '');

  // Todo Generator state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [todos, setTodos] = useState<Record<string, Todo[]>>({});
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [generatedTodos, setGeneratedTodos] = useState<Omit<Todo, 'id' | 'list_id' | 'app_id' | 'created_at' | 'updated_at'>[]>([]);

  // Document Generator state
  const [docPrompt, setDocPrompt] = useState("");
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<Partial<Document> | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Bug Reporter state
  const [bugDescription, setBugDescription] = useState("");
  const [bugFilePath, setBugFilePath] = useState("");
  const [isGeneratingBugs, setIsGeneratingBugs] = useState(false);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);

  // Code Review state
  const [reviewFilePath, setReviewFilePath] = useState("");
  const [reviewCode, setReviewCode] = useState("");
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [codeReviews, setCodeReviews] = useState<CodeReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when chatMessages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  useEffect(() => {
    const fetchRepoData = async () => {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();
      console.log(data);

      if (error) {
        console.error('Error fetching app repo data:', error);
        toast.error(`Failed to fetch app repo data. ${error.cause + error.message + error.name}`);
        return;
      }

      if (data) {
        setInstallationId(data.github_installation_id || '');
        setGithubRepo(data.github_repo || '');
        // Parse owner and repo from github_repo (format: owner/repo)
        if (data.github_repo && data.github_repo.includes('/')) {
          const [owner, repo] = data.github_repo.split('/');
          setOwner(owner);
          setRepo(repo);
        } else {
          setOwner('');
          setRepo('');
          toast.error('No valid GitHub repository connected to this app. Please connect a repo in the format owner/repo.');
        }
      } else {
        setOwner('');
        setRepo('');
        setInstallationId('');
        setGithubRepo('');
        toast.error('Failed to fetch app repo data.');
      }
    };
    fetchRepoData();
  }, [appId]);

  const repoParams = {
    owner: owner,
    repo: repo,
    installationId: installationId
  };

  // Place contextOptions here, after all state and functions
  const contextOptions = {
    useGithubContext,
    githubFileLimit: allFiles ? 'all' : githubFileLimit,
    githubLineLimit,
    includePRs,
    prLimit: allPRs ? 'all' : prLimit,
    includeCommits,
    commitLimit: allCommits ? 'all' : commitLimit,
    allFiles,
    allPRs,
    allCommits,
    isPro: isSubscribed === 'standard' || isSubscribed === 'pro',
  };

  useEffect(() => {
    if (appId) {
      fetchTodoLists();
      fetchDocuments();
      fetchBugReports();
      fetchCodeReviews();
    }
  }, [appId]);

  const fetchTodoLists = async () => {
    const { data, error } = await supabase
      .from('todo_lists')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todo lists:', error);
      toast.error('Failed to load todo lists');
      return;
    }

    setTodoLists(data || []);

    if (data && data.length > 0) {
      const todosData: Record<string, Todo[]> = {};
      for (const list of data) {
        const { data: todos, error } = await supabase
          .from('todos')
          .select('*')
          .eq('list_id', list.id)
          .order('created_at', { ascending: true });

        if (!error) {
          todosData[list.id] = todos || [];
        }
      }
      setTodos(todosData);
    }
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  const fetchBugReports = async () => {
    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBugReports(data);
    }
  };

  const fetchCodeReviews = async () => {
    const { data, error } = await supabase
      .from('code_reviews')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCodeReviews(data);
    }
  };

  const [showPricing, setShowPricing] = useState(false);

  // Helper to check AI usage
  const checkAIUsage = async () => {
    if (isSubscribed === 'standard' || isSubscribed === 'pro') return true;
    const res = await fetch('/api/ai/check-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, user_id: user?.id })
    });
    const data = await res.json();
    if (data.allowed) return true;
    setShowPricing(true);
    return false;
  };

  const generateTodos = async () => {
    if (!await checkAIUsage()) return;
    if (!prompt.trim()) {
      toast.error('Please enter a feature description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/create-todo-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...repoParams,
          app_id: appId,
          user_id: user?.id || null,
          ...contextOptions,
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const parsedTodos = data.todos;

      if (!Array.isArray(parsedTodos)) {
        throw new Error('Generated content is not in expected format');
      }

      setNewListName(`Feature: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`);
      setNewListDescription(prompt);
      setGeneratedTodos(parsedTodos.map((todo: any) => ({
        name: todo.name || 'Unnamed task',
        description: todo.description || '',
        status: 'pending',
        link: ''
      })));
      toast.success('Tasks generated successfully');
    } catch (error) {
      console.error('Error generating todos:', error);
      toast.error('Failed to generate tasks. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDocument = async () => {
    if (!await checkAIUsage()) return;
    if (!docPrompt.trim()) {
      toast.error('Please enter a document description');
      return;
    }

    setIsGeneratingDoc(true);
    try {
      const response = await fetch('/api/ai/create-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: docPrompt,
          ...repoParams,
          app_id: appId,
          user_id: user?.id || null,
          ...contextOptions,
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setGeneratedDoc({
        title: data.title,
        content: data.content
      });
      toast.success('Document generated successfully');
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document. Please try again.');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const generateBugReport = async () => {
    if (!await checkAIUsage()) return;
    // Allow empty description, scan repo if empty
    setIsGeneratingBugs(true);
    try {
      const response = await fetch('/api/ai/report-bugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: bugDescription, // can be empty
          file_path: bugFilePath,
          ...repoParams,
          app_id: appId,
          user_id: user?.id || null,
          ...contextOptions,
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Save bug report to database
      const { data: savedBug, error } = await supabase
        .from('bugs')
        .insert({
          app_id: appId,
          name: data.title,
          description: data.description,
          severity: data.severity,
          // status: 'open',
          // file_path: bugFilePath || null,
          // line_number: data.line_number || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && savedBug) {
        setBugReports(prev => [savedBug, ...prev]);
        setBugDescription('');
        setBugFilePath('');
        toast.success('Bug report generated and saved');
      }
    } catch (error) {
      console.error('Error generating bug report:', error);
      toast.error('Failed to generate bug report. Please try again.');
    } finally {
      setIsGeneratingBugs(false);
    }
  };

  const generateCodeReview = async () => {
    if (!await checkAIUsage()) return;
    setIsGeneratingReview(true);
    try {
      const body: any = {
        file_path: reviewFilePath,
        repoContext,
        owner,
        repo,
        installationId,
        app_id: appId,
        user_id: user?.id || null,
        ...contextOptions,
      };
      if (reviewCode && reviewCode.trim()) {
        body.code = reviewCode;
      }
      const response = await fetch('/api/ai/code-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // Save code review to database
      const { data: savedReview, error } = await supabase
        .from('code_reviews')
        .insert({
          app_id: appId,
          title: data.title,
          file_path: reviewFilePath,
          suggestions: data.suggestions,
          issues: data.issues || [],
          improvements: data.improvements || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && savedReview) {
        setCodeReviews(prev => [savedReview, ...prev]);
        setReviewCode('');
        setReviewFilePath('');
        toast.success('Code review generated and saved');
      }
    } catch (error) {
      console.error('Error generating code review:', error);
      toast.error('Failed to generate code review. Please try again.');
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const sendChatMessage = async () => {
    if (!await checkAIUsage()) return;
    if (!chatInput.trim()) return;

    // Only one-shot, no follow-up, no chat history
    setIsChatLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          // history: chatMessages, // REMOVE history for one-shot
          repoContext,
          owner,
          repo,
          installationId,
          app_id: appId,
          user_id: user?.id || null,
          ...contextOptions,
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const saveTodoList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    if (generatedTodos.length === 0) {
      toast.error('No tasks to save');
      return;
    }

    setIsSaving(true);
    try {
      const { data: listData, error: listError } = await supabase
        .from('todo_lists')
        .insert({
          app_id: appId,
          name: newListName,
          description: newListDescription,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (listError) throw listError;

      const todosToInsert = generatedTodos.map(todo => ({
        app_id: appId,
        list_id: listData.id,
        name: todo.name,
        status: todo.status,
        description: todo.description,
        link: todo.link,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: todosError } = await supabase
        .from('todos')
        .insert(todosToInsert);

      if (todosError) throw todosError;

      await fetchTodoLists();
      setSelectedListId(listData.id);
      setGeneratedTodos([]);
      setPrompt('');
      toast.success('Todo list saved successfully');
    } catch (error) {
      console.error('Error saving todo list:', error);
      toast.error('Failed to save todo list');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDocument = async () => {
    if (!generatedDoc) {
      toast.error('No document to save');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          app_id: appId,
          name: generatedDoc.title!,
          content: generatedDoc.content!,
          type: 'other', // Assuming all documents are markdown
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [data, ...prev]);
      setGeneratedDoc(null);
      setDocPrompt('');
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  const updateTodoStatus = async (listId: string, todoId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', todoId);

      if (error) throw error;

      setTodos(prev => ({
        ...prev,
        [listId]: prev[listId].map(todo =>
          todo.id === todoId ? { ...todo, status, updated_at: new Date().toISOString() } : todo
        )
      }));
    } catch (error) {
      console.error('Error updating todo status:', error);
      toast.error('Failed to update task status');
    }
  };

  const updateBugStatus = async (bugId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bugs')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bugId);

      if (error) throw error;

      setBugReports(prev => prev.map(bug =>
        bug.id === bugId ? { ...bug, status: status as any, updated_at: new Date().toISOString() } : bug
      ));
    } catch (error) {
      console.error('Error updating bug status:', error);
      toast.error('Failed to update bug status');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="py-4">
      <h1 className="text-3xl font-bold mb-6">AI Features</h1>
      <Tabs defaultValue="todo-gen" className="w-full">
        <TabsList className="mb-6 bg-transparent">
          <TabsTrigger value="todo-gen" className="p-5">Todo Generator</TabsTrigger>
          <TabsTrigger value="document-gen" className="p-5">Document Generator</TabsTrigger>
          <TabsTrigger value="bug-gen" className="p-5">Bug Reporter</TabsTrigger>
          <TabsTrigger value="code-review" className="p-5">Code Review</TabsTrigger>
          <TabsTrigger value="pulseai-chat" className="p-5">PulseAI Chat</TabsTrigger>
        </TabsList>

        {/* Context Options UI */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Context Options</CardTitle>
            <CardDescription>
              Customize what project context is used for all AI features. (Pro users can select more options)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={useGithubContext} onCheckedChange={checked => setUseGithubContext(!!checked)} id="use-github-context" />
                <Label htmlFor="use-github-context">Use GitHub context?</Label>
              </div>
              {useGithubContext && (
                <div className="flex flex-col gap-3 pl-6">
                  <div className="flex items-center gap-2">
                    <Label>Files:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={allFiles ? 9999 : ((isSubscribed === 'standard' || isSubscribed === 'pro') ? 9999 : 20)}
                      value={allFiles ? '' : githubFileLimit}
                      onChange={e => setGithubFileLimit(Number(e.target.value))}
                      disabled={isSubscribed !== 'standard' && isSubscribed !== 'pro'}
                      placeholder={(isSubscribed === 'standard' || isSubscribed === 'pro') ? 'Enter number or select All' : 'Max 20'}
                      style={{ width: 80 }}
                    />
                    {(isSubscribed === 'standard' || isSubscribed === 'pro') && (
                      <div className="flex items-center gap-1">
                        <Checkbox checked={allFiles} onCheckedChange={checked => setAllFiles(!!checked)} id="all-files" />
                        <Label htmlFor="all-files">All</Label>
                      </div>
                    )}
                    {(isSubscribed !== 'standard' && isSubscribed !== 'pro') && <span className="text-xs text-muted-foreground">(Free: 20 max)</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Lines per file:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={allFiles ? 99999 : ((isSubscribed === 'standard' || isSubscribed === 'pro') ? 99999 : 1000)}
                      value={allFiles ? '' : githubLineLimit}
                      onChange={e => setGithubLineLimit(Number(e.target.value))}
                      disabled={isSubscribed !== 'standard' && isSubscribed !== 'pro'}
                      placeholder={(isSubscribed === 'standard' || isSubscribed === 'pro') ? 'Enter number or select All' : 'Max 1000'}
                      style={{ width: 100 }}
                    />
                    {(isSubscribed !== 'standard' && isSubscribed !== 'pro') && <span className="text-xs text-muted-foreground">(Free: 1000 max)</span>}
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Checkbox checked={includePRs} onCheckedChange={checked => setIncludePRs(!!checked)} id="include-prs" />
                    <Label htmlFor="include-prs">Include Pull Requests?</Label>
                    {includePRs && (
                      <>
                        <Input
                          type="number"
                          min={1}
                          max={allPRs ? 999 : (isSubscribed === 'standard' ? 999 : 2)}
                          value={allPRs ? '' : prLimit}
                          onChange={e => setPrLimit(Number(e.target.value))}
                          disabled={isSubscribed !== 'standard'}
                          placeholder={isSubscribed === 'standard' ? 'Enter number or select All' : 'Max 2'}
                          style={{ width: 80 }}
                        />
                        {isSubscribed === 'standard' && (
                          <div className="flex items-center gap-1">
                            <Checkbox checked={allPRs} onCheckedChange={checked => setAllPRs(!!checked)} id="all-prs" />
                            <Label htmlFor="all-prs">All</Label>
                          </div>
                        )}
                        {isSubscribed !== 'standard' && <span className="text-xs text-muted-foreground">(Free: 2 max)</span>}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={includeCommits} onCheckedChange={checked => setIncludeCommits(!!checked)} id="include-commits" />
                    <Label htmlFor="include-commits">Include Commits?</Label>
                    {includeCommits && (
                      <>
                        <Input
                          type="number"
                          min={1}
                          max={allCommits ? 999 : (isSubscribed === 'standard' ? 999 : 5)}
                          value={allCommits ? '' : commitLimit}
                          onChange={e => setCommitLimit(Number(e.target.value))}
                          disabled={isSubscribed !== 'standard'}
                          placeholder={isSubscribed === 'standard' ? 'Enter number or select All' : 'Max 5'}
                          style={{ width: 80 }}
                        />
                        {isSubscribed === 'standard' && (
                          <div className="flex items-center gap-1">
                            <Checkbox checked={allCommits} onCheckedChange={checked => setAllCommits(!!checked)} id="all-commits" />
                            <Label htmlFor="all-commits">All</Label>
                          </div>
                        )}
                        {isSubscribed !== 'standard' && <span className="text-xs text-muted-foreground">(Free: 5 max)</span>}
                      </>
                    )}
                  </div> */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Todo Generator Tab */}
        <TabsContent value="todo-gen">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate Development Tasks</CardTitle>
              <CardDescription>
                Describe a feature you want to implement and we'll break it down into actionable tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the feature you want to implement (e.g., 'Add user authentication with email/password and Google login')"
                  rows={4}
                />
                <Button onClick={generateTodos} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ListChecks className="mr-2 h-4 w-4" />
                      Generate Tasks
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {(generatedTodos.length > 0 || selectedListId) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {generatedTodos.length > 0 ? "Generated Tasks" : "Todo List"}
                </CardTitle>
                <CardDescription>
                  {generatedTodos.length > 0
                    ? "Review and save these tasks to your project"
                    : "Manage your todo items"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedTodos.length > 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="list-name">List Name</Label>
                      <Input
                        id="list-name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter a name for this list"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="list-description">Description</Label>
                      <Textarea
                        id="list-description"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        placeholder="Enter a description for this list"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium">Tasks</h3>
                      <div className="space-y-3">
                        {generatedTodos.map((todo, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Checkbox checked={todo.status === 'completed'} />
                            <div className="flex-1">
                              <p className="font-medium">{todo.name}</p>
                              {todo.description && (
                                <p className="text-sm text-muted-foreground">{todo.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={saveTodoList} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Todo List
                        </>
                      )}
                    </Button>
                  </div>
                ) : selectedListId && todos[selectedListId] ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {todos[selectedListId].map((todo) => (
                        <div key={todo.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={todo.status === 'completed'}
                            onCheckedChange={(checked) =>
                              updateTodoStatus(
                                selectedListId,
                                todo.id,
                                checked ? 'completed' : 'pending'
                              )
                            }
                          />
                          <div className="flex-1">
                            <p className="font-medium">{todo.name}</p>
                            {todo.description && (
                              <p className="text-sm text-muted-foreground">{todo.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Document Generator Tab */}
        <TabsContent value="document-gen">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate Documentation</CardTitle>
              <CardDescription>
                Create comprehensive documentation for your project automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={docPrompt}
                  onChange={(e) => setDocPrompt(e.target.value)}
                  placeholder="Describe what documentation you need (e.g., 'Create a comprehensive README for a React TypeScript project with setup instructions')"
                  rows={4}
                />
                <Button onClick={generateDocument} disabled={isGeneratingDoc}>
                  {isGeneratingDoc ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Document
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedDoc && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{generatedDoc.title}</CardTitle>
                    <CardDescription>Generated document</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedDoc.content || '')}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={saveDocument}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{generatedDoc.content}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bug Reporter Tab */}
        <TabsContent value="bug-gen">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Scan for Bugs and Issues</CardTitle>
              <CardDescription>
                Click 'Scan' to automatically analyze your codebase for bugs. Optionally, specify a file or folder path to scan a specific area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  value={bugFilePath}
                  onChange={(e) => setBugFilePath(e.target.value)}
                  placeholder="Optional: Enter file or folder path (e.g., 'src/pages/Login.tsx')"
                />
                <Button onClick={generateBugReport} disabled={isGeneratingBugs}>
                  {isGeneratingBugs ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bug className="mr-2 h-4 w-4" />
                  )}
                  Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Review Tab */}
        <TabsContent value="code-review">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Scan for Code Quality</CardTitle>
              <CardDescription>
                Click 'Scan' to review your codebase for improvements. Optionally, specify a file or folder path to review a specific area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  value={reviewFilePath}
                  onChange={(e) => setReviewFilePath(e.target.value)}
                  placeholder="Optional: Enter file or folder path (e.g., 'src/components/Cart.tsx')"
                />
                <Button onClick={generateCodeReview} disabled={isGeneratingReview}>
                  {isGeneratingReview ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Code className="mr-2 h-4 w-4" />
                  )}
                  Scan
                </Button>
              </div>
            </CardContent>
          </Card>

          {codeReviews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Code Reviews</h2>
              <div className="space-y-4">
                {codeReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <CardTitle>{review.title}</CardTitle>
                      <CardDescription>File: {review.file_path}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <p className="text-center text-2xl font-bold">Suggestions</p>
                        <br />
                        <MdRenderer content={review.suggestions} />
                      </div>
                      <div className="mb-2">
                        <p className="text-center text-2xl font-bold text-red-600">Issues</p>
                        <br />
                        <MdRenderer content={Array.isArray(review.issues) ? review.issues.join('\n') : review.issues} />
                      </div>
                      <div className="mb-2">
                        <p className="text-center text-2xl font-bold text-green-600">Improvements</p>
                        <br />
                        <MdRenderer content={Array.isArray(review.improvements) ? review.improvements.join('\n') : review.improvements} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MessageCircle className="mr-1 h-4 w-4" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        {new Date(review.updated_at).toLocaleDateString()}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* PulseAI Chat Tab */}
        <TabsContent value="pulseai-chat">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>PulseAI Chat</CardTitle>
              <CardDescription>
                Chat with PulseAI to get help with your project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[500px] max-h-[70vh] relative">
                {/* Chat messages area */}
                <div className="flex-1 overflow-y-auto pr-4 mb-2" style={{ minHeight: 0 }}>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex border-none shadow-none ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : ''}`}>
                        {msg.role === 'assistant' ? (
                          <MdRenderer content={msg.content} />
                        ) : (
                          <p className="dark:text-black text-white">{msg.content}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="p-3 rounded-lg bg-muted">
                        <p>PulseAI is typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                {/* Fixed input box */}
                <div className="flex gap-2 w-full absolute left-0 right-0 bottom-0 bg-background p-2 border-t z-10">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    placeholder="Ask PulseAI a question..."
                    rows={1}
                    className="resize-none flex-1 min-h-[40px] max-h-[120px]"
                  />
                  <Button onClick={sendChatMessage} disabled={isChatLoading || !chatInput.trim()} className="h-[40px]">
                    {isChatLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <PricingDialog open={showPricing} onOpenChange={setShowPricing} />
    </div>
  );
};

export default AiPage;