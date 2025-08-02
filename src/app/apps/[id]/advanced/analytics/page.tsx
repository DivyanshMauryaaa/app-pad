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
import { ChevronDown, ChevronUp } from 'lucide-react';
import CryptoJS from 'crypto-js';

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
                if (data.github_token) data.github_token = decryptCreds(data.github_token);
                if (data.github_repo) data.github_repo = decryptCreds(data.github_repo);
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
        if (!credsDirty && allCredsPresent()) {
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
                body = { githubToken, owner: githubOwner, repo: githubRepo };
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
        } else if (platform === 'github') {
            updateFields = { github_token: encryptCreds(githubToken), github_repo: encryptCreds(githubOwner && githubRepo ? `${githubOwner}/${githubRepo}` : '') };
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
                if (data.github_token) data.github_token = decryptCreds(data.github_token);
                if (data.github_repo) data.github_repo = decryptCreds(data.github_repo);
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
                            <SelectItem value="supabase">Supabase</SelectItem>
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
                        {platform === "github" && (
                            <div className="flex flex-col gap-2 w-full max-w-md">
                                <span className="text-sm">GitHub Token</span>
                                <Input type="text" value={githubToken} onChange={e => { setGithubToken(e.target.value); setCredsDirty(true); }} placeholder="GITHUB_TOKEN" />
                                <span className="text-sm">Owner</span>
                                <Input type="text" value={githubOwner} onChange={e => { setGithubOwner(e.target.value); setCredsDirty(true); }} placeholder="owner" />
                                <span className="text-sm">Repo</span>
                                <Input type="text" value={githubRepo} onChange={e => { setGithubRepo(e.target.value); setCredsDirty(true); }} placeholder="repo" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingAnalytics ? (
                    <div className="col-span-full flex justify-center items-center">
                        <Progress />
                        <span className="ml-2">Loading analytics...</span>
                    </div>
                ) : (
                    analytics.map((item: any) => (
                        <Card key={item.name}>
                            <CardHeader>
                                <CardTitle className="text-3xl">{item.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-5xl">
                                    {(platform === 'stripe' && item.name === 'totalRevenue') ? `$${item.value}` : item.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

export default AnalyticsPage;