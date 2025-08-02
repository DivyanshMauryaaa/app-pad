'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/supabase/client";
import { toast } from "sonner";
import { Loader2, Settings, Database, Code, BarChart3, Shield, Palette, BlocksIcon, Paintbrush } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AnalyticsPage from "./analytics/page";

const AdvancedPage = () => {
    const [app, setApp] = useState<any>();
    const params = useParams();
    const appId = params.id;
    const [loading, setLoading] = useState(true);

    const getAppData = async () => {
        const { data: app, error } = await supabase.from('apps')
            .select('*')
            .eq('id', appId)
            .single();

        if (error) toast.error('Failed to fetch app data');
        else setApp(app);
        setLoading(false);
    }

    useEffect(() => {
        if (appId) {
            getAppData()
        };
    }, [appId]);

    if (loading) return (
        <div className='flex justify-center items-center h-full'>
            <Loader2 className='animate-spin' />
        </div>
    );

    return (
        <div className="w-full min-h-screen flex flex-col">
            {/* Header */}
            <div className="py-6 px-4">
                <h1 className="text-3xl font-bold tracking-tight">Advanced</h1>
                <p className="text-muted-foreground">
                    {app?.name ? `Configure advanced settings for ${app.name}` : 'Configure your application settings'}
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="analytics" className="flex-1 flex flex-col w-full">
                <div className="flex justify-center w-full">
                    <TabsList className="flex gap-2 bg-transparent border-b border-muted w-auto rounded-none">
                        <TabsTrigger value="analytics" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </TabsTrigger>
                        <TabsTrigger value="flows" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <BlocksIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Flows</span>
                        </TabsTrigger>
                        <TabsTrigger value="designs" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <Paintbrush className="w-4 h-4" />
                            <span className="hidden sm:inline">Designs</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="w-full flex-1 px-0 py-8">
                    <div className="w-full h-full">
                        <AnalyticsPage />
                    </div>
                </TabsContent>

                {/* Flows Tab */}
                <TabsContent value="flows" className="w-full flex-1 px-0 py-8">
                    <div className="w-full h-full flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-4">Flows</h2>
                        <p className="mb-6 text-muted-foreground">Monitor and manage your flows</p>
                        <Button className="md:w-[20%]">Create Flow</Button>
                    </div>
                </TabsContent>

                {/* Designs Tab */}
                <TabsContent value="designs" className="w-full flex-1 px-0 py-8">
                    <div className="w-full h-full flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-4">API Configuration</h2>
                        <p className="mb-6 text-muted-foreground">Manage API endpoints and authentication settings</p>
                        <div className="mb-4">
                            <label className="text-sm font-medium">Base URL</label>
                            <div className="p-3 bg-muted rounded-md mt-1">
                                <code className="text-sm">https://api.yourapp.com/v1</code>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full max-w-2xl">
                            <div className="bg-muted rounded-md p-4">
                                <div className="text-sm font-medium mb-2">Rate Limit</div>
                                <div className="font-semibold">1000 req/hour</div>
                            </div>
                            <div className="bg-muted rounded-md p-4">
                                <div className="text-sm font-medium mb-2">API Keys</div>
                                <div className="font-semibold">3 Active</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button>Generate New Key</Button>
                            <Button variant="outline">View Documentation</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdvancedPage;