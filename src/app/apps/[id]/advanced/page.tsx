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
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Advanced Settings
                </h1>
                <p className="text-muted-foreground">
                    {app?.name ? `Configure advanced settings for ${app.name}` : 'Configure your application settings'}
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="configuration" className="space-y-4">
                <TabsList className="grid w-full m-auto grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="configuration" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger value="database" className="flex items-center gap-2">
                        <BlocksIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Flows</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Paintbrush className="w-4 h-4" />
                        <span className="hidden sm:inline">Designs</span>
                    </TabsTrigger>
                </TabsList>

                {/* Configuration Tab */}
                <TabsContent value="configuration" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>
                                View your application analytics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Tables</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">12</p>
                                        <p className="text-xs text-muted-foreground">+2 this month</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">1,234</p>
                                        <p className="text-xs text-muted-foreground">+156 this week</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">2.4GB</p>
                                        <Progress value={65} className="mt-2" />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Connections</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">8/20</p>
                                        <p className="text-xs text-muted-foreground">Active connections</p>
                                    </CardContent>
                                </Card>
                            </div>


                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Database Tab */}
                <TabsContent value="database" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Flows</CardTitle>
                            <CardDescription>
                                Monitor and manage your flows
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button>Create Flow</Button>
                            
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API Tab */}
                <TabsContent value="api" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Configuration</CardTitle>
                            <CardDescription>
                                Manage API endpoints and authentication settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Base URL</label>
                                    <Card>
                                        <CardContent className="p-3">
                                            <code className="text-sm">https://api.yourapp.com/v1</code>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="font-semibold">1000 req/hour</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge variant="secondary">3 Active</Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button>Generate New Key</Button>
                                <Button variant="outline">View Documentation</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics Overview</CardTitle>
                            <CardDescription>
                                Track your application's performance and usage metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">5,432</p>
                                        <p className="text-xs text-green-600">+12% this week</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">12,845</p>
                                        <p className="text-xs text-green-600">+8% this week</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">23%</p>
                                        <p className="text-xs text-red-600">-2% this week</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">4m 32s</p>
                                        <p className="text-xs text-green-600">+15s this week</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <Button>View Detailed Report</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage authentication and security policies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-medium">Session Monitoring</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Monitor active sessions across devices
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-medium">Login Notifications</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified of new login attempts
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Session Timeout</h4>
                                <Card>
                                    <CardContent className="p-3">
                                        <p className="text-sm">Auto logout after 30 minutes of inactivity</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <Button>Update Security Settings</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance Settings</CardTitle>
                            <CardDescription>
                                Customize the look and feel of your application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Theme</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Card className="cursor-pointer border-2">
                                            <CardContent className="p-3 text-center">
                                                <p className="text-sm">Light</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="cursor-pointer border-2 border-primary">
                                            <CardContent className="p-3 text-center">
                                                <p className="text-sm">Dark</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="cursor-pointer border-2">
                                            <CardContent className="p-3 text-center">
                                                <p className="text-sm">System</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Accent Color</h4>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer ring-2 ring-offset-2 ring-blue-500"></div>
                                        <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                                        <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                                        <div className="w-8 h-8 rounded-full bg-orange-500 cursor-pointer"></div>
                                        <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-medium">Compact Mode</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Use smaller spacing and components
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                            <Button>Apply Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdvancedPage;