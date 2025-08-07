'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/supabase/client";
import { toast } from "sonner";
import { Loader2, Settings, Database, Code, BarChart3, Shield, Palette, BlocksIcon, Paintbrush, MailIcon, PencilIcon, Eye, Users, PoundSterling } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AnalyticsPage from "./analytics/page";
import Link from "next/link";
import LegalVaultPage from "./legal-vault/page";

const AdvancedPage = () => {
    const [app, setApp] = useState<any>();
    const params = useParams();
    const appId = params.id;
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const getAppData = async () => {
        const { data: app, error } = await supabase.from('apps')
            .select('*')
            .eq('id', appId)
            .single();

        if (app.is_subscribed === "pro") {
            setIsSubscribed(true);
        }

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

    if (!isSubscribed) {
        return (
            <div className="space-y-4 w-[890px] m-auto mt-[20vh]">
                <p className="text-6xl text-start">You need to be subscribed to the business plan to use this feature.</p>
                <Link href={`/apps/${appId}/pricing`}>
                    <Button className="bg-gradient-to-r mt-4 from-purple-600 to-pink-600 cursor-pointer hover:from-blue-600 text-white hover:to-cyan-500 transition-colors duration-300 font-normal text-xl" size='lg'>Upgrade To Business Plan</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen flex flex-col">
            {/* Tabs */}
            <Tabs defaultValue="analytics" className="flex-1 flex flex-col w-full">
                <div className="flex justify-center w-full">
                    <TabsList className="flex gap-2 bg-transparent border-b border-muted w-auto rounded-none">
                        <TabsTrigger value="analytics" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </TabsTrigger>
                        <TabsTrigger value="doc-vault" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <Shield className="w-4 h-4" />
                            <span className="hidden sm:inline">Legal Docs Vault</span>
                        </TabsTrigger>
                        <TabsTrigger value="post-mgr" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <MailIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Email & Post Manager</span>
                        </TabsTrigger>
                        <TabsTrigger value="blogwriter" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <PencilIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">SEO & Content</span>
                        </TabsTrigger>
                        <TabsTrigger value="contract-reader" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Contract Reader</span>
                        </TabsTrigger>
                        <TabsTrigger value="customer-feedback" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Customer Feedback AI</span>
                        </TabsTrigger>
                        <TabsTrigger value="vibe-pricing" className="px-6 py-2 rounded-t-md font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted hover:text-white transition-all">
                            <PoundSterling className="w-4 h-4" />
                            <span className="hidden sm:inline">Vibe Pricing</span>
                        </TabsTrigger>  
                        
                        
                    </TabsList>
                </div>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="w-full flex-1 px-0 py-8">
                    <div className="w-full h-full">
                        <AnalyticsPage />
                    </div>
                </TabsContent>

                {/* Legal Docs Vault Tab */}
                <TabsContent value="doc-vault" className="w-full flex-1 px-0 py-8">
                    <LegalVaultPage />
                </TabsContent>

                {/*  Tab */}
                <TabsContent value="api-config" className="w-full flex-1 px-0 py-8">
        
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdvancedPage;