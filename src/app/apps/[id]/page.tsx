'use client';

import { Tabs } from '@/components/ui/tabs';
import supabase from '@/supabase/client';
import { TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TodoContent from './todos/page';
import BugsPage from './bugs/page';
import DocumentsPage from './documents/page';
import DatabasePage from './database/page';
import Vault from './vault/page';
import BuildsPage from './builds/page';
import AppBranding from './brand/page';
import AiPage from './ai/page';
import { Card, CardHeader } from '@/components/ui/card';
import { Bot, Bug, CheckCircle2, FileIcon, GithubIcon, KeyRoundIcon } from 'lucide-react';
import RepoBrowser from '@/app/repo/page';

export default function Page() {
    const params = useParams();
    const id = params.id as string;

    const [app, setApp] = useState<any>();
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('home');
    const [repoInput, setRepoInput] = useState('');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [repoData, setRepoData] = useState<any>(null);
    const [repoLoading, setRepoLoading] = useState(false);
    const [repoError, setRepoError] = useState('');
    const [installationId, setInstallationId] = useState('');

    const getAppData = async () => {
        const { data, error } = await supabase.from('apps')
            .select('*')
            .eq('id', id)
            .single();

        setApp(data);
        if (error) alert(error.message + error.cause);

        setLoading(false);
    };

    useEffect(() => {
        if (id) {
            getAppData();
            // Fetch installation ID for this app
            supabase
                .from('apps')
                .select('github_installation_id')
                .eq('id', id)
                .single()
                .then(({ data }) => {
                    if (data?.github_installation_id) {
                        setInstallationId(data.github_installation_id);
                    }
                });
        }
    }, [id]);

    useEffect(() => {
        // Set the repo input if already connected
        if (app?.github_repo) {
            setRepoInput(app.github_repo);
        }
    }, [app]);

    useEffect(() => {
        if (app?.github_repo) {
            setRepoLoading(true);
            setRepoError('');
            const [owner, repo] = app.github_repo.split('/');
            fetch(`/api/github/repo?owner=${owner}&repo=${repo}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        setRepoError(data.error);
                        setRepoData(null);
                    } else {
                        setRepoData(data);
                    }
                })
                .catch(() => setRepoError('Failed to fetch repo data.'))
                .finally(() => setRepoLoading(false));
        } else {
            setRepoData(null);
        }
    }, [app?.github_repo]);

    if (loading) {
        return (
            <div className='text-center text-7xl'>
                Please wait, we are loading...
            </div>
        );
    }

    return (
        <div className='p-6 min-h-screen'>
            <p className='text-5xl mb-8'>{app?.name}</p>

            <Tabs value={tab} onValueChange={setTab} className="w-full mx-auto mt-8">
                <TabsList className="flex bg-background rounded-lg shadow p-1 gap-2 max-w-3xl border border-border">
                    {[
                        { value: "home", label: "Home" },
                        { value: "todo", label: "Todo" },
                        { value: "bugs", label: "Bugs" },
                        { value: "documents", label: "Documents" },
                        { value: "builds", label: "Builds" },
                        { value: "vault", label: "Vault" },
                        // { value: "database", label: "Database" },
                        // { value: "brand", label: "Brand" },
                        { value: "ai", label: "AI" },
                        { value: "github", label: "Github" },
                    ].map(tabItem => (
                        <TabsTrigger
                            key={tabItem.value}
                            value={tabItem.value}
                            className="flex-1 px-4 py-2 rounded-md transition-colors duration-200 text-foreground font-semibold
                                dark:data-[state=active]:bg-white dark:data-[state=active]:text-gray-700
                                hover:bg-muted hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-slate-800 cursor-pointer"
                        >
                            {tabItem.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="bg-background rounded-b-lg shadow p-6 mt-3 text-foreground">
                    <TabsContent value="home">
                        <p className='text-6xl'>{app?.name}</p>
                        <p className='text-lg'>{app?.description}</p>

                        <br />

                        <div className='flex gap-8'>
                            <Card
                                onClick={() => setTab('todo')}
                                className="bg-gradient-to-br w-[300px] from-accent to-card rounded-2xl p-6 border border-border shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]">
                                <CheckCircle2 size={48} />
                                <p className='text-4xl'>Todos</p>
                            </Card>

                            <Card
                                onClick={() => setTab('bugs')}
                                className="bg-gradient-to-br w-[300px] from-accent to-card rounded-2xl p-6 border border-border shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]">
                                <Bug size={48} />
                                <p className='text-4xl'>Bugs</p>
                            </Card>

                            <Card
                                onClick={() => setTab('documents')}
                                className="bg-gradient-to-br w-[300px] from-accent to-card rounded-2xl p-6 border border-border shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]">
                                <FileIcon size={48} />
                                <p className='text-4xl'>Documents</p>
                            </Card>

                            <Card
                                onClick={() => setTab('vault')}
                                className="bg-gradient-to-br w-[300px] from-accent to-card rounded-2xl p-6 border border-border shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]">
                                <KeyRoundIcon size={48} />
                                <p className='text-4xl'>Vault</p>
                            </Card>

                            <Card
                                onClick={() => setTab('ai')}
                                className="bg-gradient-to-br w-[300px] from-accent to-card rounded-2xl p-6 border border-border shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]">
                                <Bot size={48} />
                                <p className='text-4xl'>AI</p>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="todo">
                        <TodoContent />
                    </TabsContent>
                    <TabsContent value="bugs">
                        <BugsPage />
                    </TabsContent>
                    <TabsContent value="documents">
                        <DocumentsPage />
                    </TabsContent>
                    <TabsContent value="builds">
                        <BuildsPage />
                    </TabsContent>
                    <TabsContent value="vault">
                        <Vault />
                    </TabsContent>
                    <TabsContent value="database">
                        <DatabasePage />
                    </TabsContent>
                    <TabsContent value="brand">
                        <AppBranding />
                    </TabsContent>
                    <TabsContent value="ai">
                        <AiPage />
                    </TabsContent>
                    <TabsContent value="github">
                        {/* Prompt to install GitHub App if not installed */}
                        {!installationId && (
                            <div className="mb-6 p-4 border border-yellow-400 bg-yellow-50 rounded">
                                <p className="mb-2 text-yellow-800 font-semibold">
                                    To use GitHub integration, you must install the GitHub App on your account.
                                </p>
                                <button
                                    className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-900 transition"
                                    onClick={() => window.open(`https://github.com/apps/pulsepatch/installations/new?state=${id}`, '_blank')}
                                >
                                    Install GitHub App
                                </button>
                                <p className="mt-2 text-sm text-yellow-700">
                                    After installing, please refresh this page.
                                </p>
                            </div>
                        )}
                        {/* Repo browser only if installationId is present */}
                        {installationId && <RepoBrowser installationId={installationId} />}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}