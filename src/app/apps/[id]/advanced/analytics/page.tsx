'use client';

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import supabase from "@/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookIcon, ChevronDown, ChevronUp, CreditCard, GithubIcon, LayoutDashboard } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from "next/link";

// Encryption helpers
const getEncryptionKey = () => {
    // For demo: use a static key, but in production, use a user passphrase or device secret!
    return localStorage.getItem('creds_encryption_key') || 'user-should-set-this';
};
export function encryptCreds(plain: string) {
    return CryptoJS.AES.encrypt(plain, getEncryptionKey()).toString();
}
export function decryptCreds(cipher: string) {
    try {
        const bytes = CryptoJS.AES.decrypt(cipher, getEncryptionKey());
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return '';
    }
}

const AnalyticsPage = () => {
    const [platform, setPlatform] = useState("clerk");
    const [analytics, setAnalytics] = useState<any>([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    // User-entered credentials
    const [clerkSecretKey, setClerkSecretKey] = useState("");
    const [supabaseUrl, setSupabaseUrl] = useState("");
    const [supabaseServiceKey, setSupabaseServiceKey] = useState("");
    const [githubToken, setGithubToken] = useState("");
    const [githubOwner, setGithubOwner] = useState("");
    const [githubRepo, setGithubRepo] = useState("");
    const [stripeSecretKey, setStripeSecretKey] = useState("");
    // App data for default creds
    const [app, setApp] = useState<any>(null);
    const [credsExpanded, setCredsExpanded] = useState(false);
    const [credsDirty, setCredsDirty] = useState(false);

    const params = useParams();
    const appId = params.id;

    // Fetch app data for default creds
    useEffect(() => {
        const getApp = async () => {
            const { data, error } = await supabase
                .from('apps')
                .select('*')
                .eq('id', appId)
                .single();
            if (!error && data) {
                // Decrypt creds if present
                if (data.clerk_secret_key) data.clerk_secret_key = decryptCreds(data.clerk_secret_key);
                if (data.supabase_url) data.supabase_url = decryptCreds(data.supabase_url);
                if (data.supabase_service_key) data.supabase_service_key = decryptCreds(data.supabase_service_key);
                if (data.stripe_secret_key) data.stripe_secret_key = decryptCreds(data.stripe_secret_key);
                setApp(data);
            }
        };
        if (appId) getApp();
    }, [appId]);

    // Prefill creds from app data on platform change
    useEffect(() => {
        if (!app) return;
        if (platform === 'clerk') {
            setClerkSecretKey(app.clerk_secret_key || "");
        } else if (platform === 'supabase') {
            setSupabaseUrl(app.supabase_url || "");
            setSupabaseServiceKey(app.supabase_service_key || "");
        } else if (platform === 'github') {
            setGithubToken(app.github_token || "");
            if (app.github_repo && app.github_repo.includes('/')) {
                const [owner, repo] = app.github_repo.split('/');
                setGithubOwner(owner);
                setGithubRepo(repo);
            } else {
                setGithubOwner("");
                setGithubRepo("");
            }
        } else if (platform === 'stripe') {
            setStripeSecretKey(app.stripe_secret_key || "");
        }
        setCredsDirty(false); // Not dirty after loading from DB
    }, [platform, app]);

    // Helper: check if all creds for current platform are present
    const allCredsPresent = () => {
        if (platform === 'clerk') return !!clerkSecretKey;
        if (platform === 'supabase') return !!supabaseUrl && !!supabaseServiceKey;
        if (platform === 'github') return !!githubToken && !!githubOwner && !!githubRepo;
        if (platform === 'stripe') return !!stripeSecretKey;
        return false;
    };

    // Auto-fetch analytics if all creds present and not dirty
    useEffect(() => {
        if (platform === 'github') {
            // Always auto-fetch for GitHub if app has installation_id and repo
            if (app && app.github_installation_id && app.github_repo) {
                setCredsExpanded(false);
                fetchAnalytics();
            }
        } else if (!credsDirty && allCredsPresent()) {
            setCredsExpanded(false);
            fetchAnalytics();
        } else if (!allCredsPresent()) {
            setCredsExpanded(true);
        }
    }, [platform, app, clerkSecretKey, supabaseUrl, supabaseServiceKey, githubToken, githubOwner, githubRepo, stripeSecretKey, credsDirty]);

    // Fetch analytics from the selected platform using user-entered API keys
    const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
            let apiUrl = '';
            let body: any = {};
            if (platform === 'clerk') {
                apiUrl = '/api/analytics/clerk';
                body = { clerkSecretKey };
            } else if (platform === 'supabase') {
                apiUrl = '/api/analytics/supabase';
                body = { supabaseUrl, supabaseServiceKey };
            } else if (platform === 'github') {
                apiUrl = '/api/analytics/github';
                // Use app.github_installation_id and app.github_repo if available
                let owner = app.github_repo.split('/')[0] || '';
                let repo = app.github_repo.split('/')[1] || '';
                let installationId = app.github_installation_id || '';
                body = { owner, repo, installationId };
            } else if (platform === 'stripe') {
                apiUrl = '/api/analytics/stripe';
                body = { stripeSecretKey };
            }
            if (!apiUrl) return;
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error);
            // Convert result object to array of { name, value }
            const data = Object.entries(result).map(([name, value]) => ({ name, value }));
            setAnalytics(data);
        } catch (err: any) {
            toast.error('Failed to fetch analytics: ' + err.message);
            setAnalytics([]);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    // Save credentials to Supabase
    const saveCreds = async () => {
        if (!appId) return;
        let updateFields: any = {};
        if (platform === 'clerk') {
            updateFields = { clerk_secret_key: encryptCreds(clerkSecretKey) };
        } else if (platform === 'supabase') {
            updateFields = { supabase_url: encryptCreds(supabaseUrl), supabase_service_key: encryptCreds(supabaseServiceKey) };
        } else if (platform === 'stripe') {
            updateFields = { stripe_secret_key: encryptCreds(stripeSecretKey) };
        }
        const { error } = await supabase
            .from('apps')
            .update(updateFields)
            .eq('id', appId);
        if (error) {
            toast.error('Failed to save credentials: ' + error.message);
        } else {
            toast.success('Credentials saved!');
            setCredsExpanded(false);
            setCredsDirty(false); // Not dirty after save
            fetchAnalytics();
            // Optionally, refetch app data
            const { data } = await supabase.from('apps').select('*').eq('id', appId).single();
            if (data) {
                // Decrypt after save
                if (data.clerk_secret_key) data.clerk_secret_key = decryptCreds(data.clerk_secret_key);
                if (data.supabase_url) data.supabase_url = decryptCreds(data.supabase_url);
                if (data.supabase_service_key) data.supabase_service_key = decryptCreds(data.supabase_service_key);
                if (data.stripe_secret_key) data.stripe_secret_key = decryptCreds(data.stripe_secret_key);
                setApp(data);
            }
        }
    };

    return (
        <div className="space-y-4">

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Platform:</span>
                <div className="w-[160px]">
                    <Select defaultValue={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="clerk">Clerk</SelectItem>
                            {/* <SelectItem value="supabase">Supabase</SelectItem> */}
                            <SelectItem value="github">Github</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Credentials Inputs with dropdown */}
            <div>
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setCredsExpanded(v => !v)}>
                    <p className="text-xl font-medium">Credentials</p>
                    {allCredsPresent() && (
                        credsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                </div>
                <br />
                {(credsExpanded || !allCredsPresent()) && (
                    <>
                        {platform === "clerk" && (
                            <div className="flex flex-col gap-2 w-full max-w-md">
                                <span className="text-sm">Clerk Secret Key</span>
                                <Input type="text" value={clerkSecretKey} onChange={e => { setClerkSecretKey(e.target.value); setCredsDirty(true); }} placeholder="CLERK_SECRET_KEY" />
                            </div>
                        )}
                        {platform === "supabase" && (
                            <div className="flex flex-col gap-2 w-full max-w-md">
                                <span className="text-sm">Supabase Project URL</span>
                                <Input type="text" value={supabaseUrl} onChange={e => { setSupabaseUrl(e.target.value); setCredsDirty(true); }} placeholder="https://xyzcompany.supabase.co" />
                                <span className="text-sm">Supabase Service Key</span>
                                <Input type="text" value={supabaseServiceKey} onChange={e => { setSupabaseServiceKey(e.target.value); setCredsDirty(true); }} placeholder="SUPABASE_SERVICE_KEY" />
                            </div>
                        )}
                        {platform === "stripe" && (
                            <div className="flex flex-col gap-2 w-full max-w-md">
                                <span className="text-sm">Stripe Secret Key</span>
                                <Input type="text" value={stripeSecretKey} onChange={e => { setStripeSecretKey(e.target.value); setCredsDirty(true); }} placeholder="STRIPE_SECRET_KEY" />
                            </div>
                        )}
                        <Button className="mt-4" onClick={() => { setCredsExpanded(false); fetchAnalytics(); }} disabled={loadingAnalytics}>
                            {loadingAnalytics ? 'Loading...' : 'Fetch Analytics'}
                        </Button>
                        <Button className="mt-4 ml-2" variant="outline" onClick={saveCreds} disabled={loadingAnalytics}>
                            Save
                        </Button>
                    </>
                )}
            </div>
            <div>
                {platform === "github" && (
                    <div className="flex gap-3 flex-col">
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://github.com/${app.github_repo}`} target="_blank">
                                <Button variant="outline">
                                    <GithubIcon className="w-4 h-4" />
                                    <span>Repo</span>
                                </Button>
                            </Link>
                        </div><div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://docs.github.com/`} target="_blank">
                                <Button variant="outline">
                                    <BookIcon className="w-4 h-4" />
                                    <span>Docs</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                )}
                {platform === "clerk" && (
                    <div className="flex gap-3 flex-col">
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://dashboard.clerk.com/`} target="_blank">
                                <Button variant="outline">
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Clerk Dashboard</span>
                                </Button>
                            </Link>
                        </div>                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://docs.clerk.com/`} target="_blank">
                                <Button variant="outline">
                                    <BookIcon className="w-4 h-4" />
                                    <span>Docs</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
                {platform === "supabase" && (
                    <div className="flex gap-3 flex-col">
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://dashboard.clerk.com/`} target="_blank">
                                <Button variant="outline">
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Clerk Dashboard</span>
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://docs.supabase.com/`} target="_blank">
                                <Button variant="outline">
                                    <BookIcon className="w-4 h-4" />
                                    <span>Docs</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
                {platform === "stripe" && (
                    <div className="flex gap-3 flex-col">
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://dashboard.stripe.com/`} target="_blank">
                                <Button variant="outline">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Stripe Dashboard</span>
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2 w-full max-w-md">
                            <Link href={`https://docs.stripe.com/`} target="_blank">
                                <Button variant="outline">
                                    <BookIcon className="w-4 h-4" />
                                    <span>Docs</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

            </div>
            {/* Metrics cards row remains unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingAnalytics ? (
                    <div className="col-span-full flex justify-center items-center">
                        <Progress value={75} />
                        <p className="ml-2">Loading analytics...</p>
                    </div>
                ) : (
                    analytics.filter((item: any) => !(
                        Array.isArray(item.value) && item.value.length > 0 && typeof item.value[0] === 'object' && !(platform === 'supabase' && item.name === 'tableStats')
                    )).map((item: any) => (
                        <Card key={item.name}>
                            <CardHeader>
                                <CardTitle className="text-3xl">{item.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-5xl">
                                    {(platform === 'stripe' && item.name === 'totalRevenue') ? `$${item.value}` : String(item.value)}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
            {/* Supabase: Render Table Stats as a table below the cards */}
            {!loadingAnalytics && platform === 'supabase' && (() => {
                const tableStats = analytics.find((item: any) => item.name === 'tableStats')?.value || [];
                if (Array.isArray(tableStats) && tableStats.length > 0 && typeof tableStats[0] === 'object') {
                    const keys = Object.keys(tableStats[0]);
                    return (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-2">Table Stats</h2>
                            <div className="overflow-x-auto rounded-lg border bg-background">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            {keys.map((key) => (
                                                <th key={key} className="px-4 py-2 text-left font-semibold whitespace-nowrap border-b">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableStats.map((row: any, idx: number) => (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                                                {keys.map((key) => {
                                                    const val = row[key];
                                                    const isObject = typeof val === 'object' && val !== null;
                                                    const isLongString = typeof val === 'string' && val.length > 30;
                                                    if (isObject || isLongString) {
                                                        return (
                                                            <td key={key} className="px-4 py-2 border-b max-w-xs truncate">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <button className="underline text-blue-500 hover:text-blue-700 text-xs">View</button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-2xl w-full">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Full Value</DialogTitle>
                                                                        </DialogHeader>
                                                                        <pre className="whitespace-pre-wrap break-all text-xs bg-muted/30 rounded p-2 max-h-[60vh] overflow-auto">
                                                                            {isObject ? JSON.stringify(val, null, 2) : val}
                                                                        </pre>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </td>
                                                        );
                                                    }
                                                    return (
                                                        <td key={key} className="px-4 py-2 border-b max-w-xs truncate">{String(val)}</td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}
            {/* Stripe: Render Products, Customers, Transactions in Tabs */}
            {!loadingAnalytics && platform === 'stripe' && (
                (() => {
                    const products = analytics.find((item: any) => item.name === 'products')?.value || [];
                    const customers = analytics.find((item: any) => item.name === 'customers')?.value || [];
                    const transactions = analytics.find((item: any) => item.name === 'transactions')?.value || [];
                    // Helper to render a table
                    const renderTable = (data: any[]) => {
                        if (!data || data.length === 0) return <div className="p-4 text-muted-foreground">No data available.</div>;
                        const keys = Object.keys(data[0]);
                        return (
                            <div className="overflow-x-auto rounded-lg border bg-background">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            {keys.map((key) => (
                                                <th key={key} className="px-4 py-2 text-left font-semibold whitespace-nowrap border-b">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50' + 'p-5'}>
                                                {keys.map((key) => {
                                                    const val = row[key];
                                                    const isObject = typeof val === 'object' && val !== null;
                                                    const isLongString = typeof val === 'string' && val.length > 30;
                                                    if (isObject || isLongString) {
                                                        return (
                                                            <td key={key} className="px-4 py-2 border-b max-w-xs truncate">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <button className="underline text-blue-500 hover:text-blue-700 text-xs">View</button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-2xl w-full">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Full Value</DialogTitle>
                                                                        </DialogHeader>
                                                                        <pre className="whitespace-pre-wrap break-all text-xs bg-muted/30 rounded p-2 max-h-[60vh] overflow-auto">
                                                                            {isObject ? JSON.stringify(val, null, 2) : val}
                                                                        </pre>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </td>
                                                        );
                                                    }
                                                    return (
                                                        <td key={key} className="border-b max-w-xs truncate p-5 py-8">{String(val)}</td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    };
                    return (
                        <div className="mt-8">
                            <Tabs defaultValue="products" className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="products">Products</TabsTrigger>
                                    <TabsTrigger value="customers">Customers</TabsTrigger>
                                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                </TabsList>
                                <TabsContent value="products">
                                    {renderTable(products)}
                                </TabsContent>
                                <TabsContent value="customers">
                                    {renderTable(customers)}
                                </TabsContent>
                                <TabsContent value="transactions">
                                    {renderTable(transactions)}
                                </TabsContent>
                            </Tabs>
                        </div>
                    );
                })()
            )}
            {/* Other platforms: Render tables for array data below the cards */}
            {!loadingAnalytics && platform !== 'stripe' && analytics.filter((item: any) => Array.isArray(item.value) && item.value.length > 0 && typeof item.value[0] === 'object').map((item: any) => (
                <div key={item.name} className="mt-8">
                    <h2 className="text-2xl font-bold mb-2">{item.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</h2>
                    <div className="overflow-x-auto rounded-lg border bg-background">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-muted">
                                    {Object.keys(item.value[0]).map((key) => (
                                        <th key={key} className="px-4 py-2 text-left font-semibold whitespace-nowrap border-b">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {item.value.map((row: any, idx: number) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                                        {Object.values(row).map((val, i) => {
                                            const isObject = typeof val === 'object' && val !== null;
                                            const isLongString = typeof val === 'string' && val.length > 30;
                                            if (isObject || isLongString) {
                                                return (
                                                    <td key={i} className="px-4 py-2 border-b max-w-xs truncate">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <button className="underline text-blue-500 hover:text-blue-700 text-xs">View</button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl w-full">
                                                                <DialogHeader>
                                                                    <DialogTitle>Full Value</DialogTitle>
                                                                </DialogHeader>
                                                                <pre className="whitespace-pre-wrap break-all text-xs bg-muted/30 rounded p-2 max-h-[60vh] overflow-auto">
                                                                    {isObject ? JSON.stringify(val, null, 2) : val}
                                                                </pre>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </td>
                                                );
                                            }
                                            return (
                                                <td key={i} className="px-4 py-2 border-b max-w-xs truncate">{String(val)}</td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AnalyticsPage;