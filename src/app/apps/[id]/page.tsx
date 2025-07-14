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

export default function Page() {
    const params = useParams();
    const id = params.id as string;

    const [app, setApp] = useState<any>();
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('todo');

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
                <TabsList className="flex bg-background rounded-lg shadow p-1 gap-2 max-w-3xl border border-border">
                    {[
                        { value: "todo", label: "Todo" },
                        { value: "bugs", label: "Bugs" },
                        { value: "documents", label: "Documents" },
                        { value: "builds", label: "Builds" },
                        { value: "vault", label: "Vault" },
                        { value: "brand", label: "Brand" },
                        { value: "ai", label: "AI" },
                        { value: "database", label: "Database" }
                    ].map(tabItem => (
                        <TabsTrigger
                            key={tabItem.value}
                            value={tabItem.value}
                            className="flex-1 px-4 py-2 rounded-md transition-colors duration-200 text-foreground font-semibold
                                data-[state=active]:bg-white data-[state=active]:text-gray-700
                                hover:bg-muted hover:text-foreground"
                        >
                            {tabItem.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="bg-background rounded-b-lg shadow p-6 border border-t-0 border-border text-foreground">
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
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-foreground">Builds</h2>
                            <p className="text-muted-foreground">View and manage builds for this app.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="vault">
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-foreground">Vault</h2>
                            <p className="text-muted-foreground">Manage environment variables and secrets.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="brand">
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-foreground">Brand</h2>
                            <p className="text-muted-foreground">Manage branding for your app.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="ai">
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-foreground">AI</h2>
                            <p className="text-muted-foreground">AI features and integrations.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="database">
                        <DatabasePage />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}