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
// import BuildsPage from './builds/page';
import AppBranding from './brand/page';
import AiPage from './ai/page';
import { Card, CardHeader } from '@/components/ui/card';
import { ArrowRight, Bot, Bug, CheckCircle2, FileIcon, GithubIcon, KeyRoundIcon, Sparkles } from 'lucide-react';
import RepoBrowser from '@/app/repo/page';
import { Button } from '@/components/ui/button';

export default function Page() {
    const params = useParams();
    const id = params.id as string;

    const [app, setApp] = useState<any>();
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('home');
    const [installationId, setInstallationId] = useState('');
    const [githubRepo, setGithubRepo] = useState('');

    const getAppData = async () => {
        const { data, error } = await supabase.from('apps')
            .select('*, github_repo')
            .eq('id', id)
            .single();

        setApp(data);
        if (data?.github_repo) setGithubRepo(data.github_repo);
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
                <TabsList className="flex bg-background rounded-lg shadow p-1 gap-2 m-auto max-w-4xl border border-border">
                    {[
                        { value: "home", label: "Home" },
                        { value: "todo", label: "Todo" },
                        { value: "bugs", label: "Bugs" },
                        { value: "documents", label: "Documents" },
                        { value: "vault", label: "Vault" },
                        { value: "ai", label: "AI" },
                        { value: "github", label: "Github" },
                        { value: "settings", label: "Settings" }
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
                        <div className='m-auto py-3 text-center'>
                            <p className='text-6xl font-bold'>{app?.name}</p>
                            <p className='text-lg'>{app?.description}</p>
                        </div>
                        <hr />
                        <br />

                        <div className='flex gap-8 m-auto w-[90%]'>
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
                                onClick={() => setTab('github')}
                                className="bg-gradient-to-br w-[300px] from-accent to-card rounded-2xl p-6 border border-border shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]">
                                <GithubIcon size={48} />
                                <p className='text-4xl'>Github Repo</p>
                            </Card>
                        </div>
                        <br />
                        {app.is_subscribed === "false" && (
                            <Card
                                className="w-[90%] m-auto rounded-xl p-6 border border-border transition-transform  flex flex-col justify-between min-h-[180px]">
                                <Sparkles size={48} />
                                <p className='text-4xl'>Get the best out of PulsePatch!</p>
                                <p>Upgrade to Pro to unlock all features!</p>
                                <Button onClick={() => setTab('settings')} className='flex gap-4 text-center cursor-pointer w-[10%] p-5 hover:w-[14%] '>Upgrade <ArrowRight size={24} /></Button>
                            </Card>
                        )}

                        <div className='w-[90%] m-auto bg-card p-4 my-4 rounded-2xl'>
                            <AiPage />
                        </div>

                        <div className='w-[90%] m-auto'>
                            <RepoBrowser installationId={installationId} githubRepo={githubRepo} app={app} />
                        </div>

                        <br />
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
                    <TabsContent value="settings">

                        <div className="flex flex-col gap-6 max-w-xl mx-auto mt-8">
                            <h2 className="text-3xl font-bold mb-2">Settings</h2>
                            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted">
                                <span className="font-medium text-lg">Subscription Status</span>
                                {app?.is_subscribed === "true" ? (
                                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm font-semibold">
                                        Inactive
                                    </span>
                                )}
                            </div>

                            <div className='flex items-center justify-between p-4 rounded-lg border border-border bg-muted'>

                            </div>
                        </div>


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
                                <Button
                                    onClick={() => window.open(`https://github.com/apps/pulsepatch/installations/new?state=${id}`, '_blank')}
                                >
                                    Install GitHub App
                                </Button>
                                <p className="mt-2 text-sm text-yellow-700">
                                    After installing, please refresh this page.
                                </p>
                            </div>
                        )}
                        {/* Repo browser only if installationId is present */}
                        {installationId && <RepoBrowser installationId={installationId} githubRepo={githubRepo} app={app} />}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}