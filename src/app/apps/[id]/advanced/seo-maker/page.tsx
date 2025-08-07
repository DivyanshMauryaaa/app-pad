'use client';
import { useState, useEffect } from 'react';
import supabase from '@/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { AlignRight, Copy, LucidePencilLine, Search, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const SEOPage = () => {
    const params = useParams();
    const appId = params.id;
    const { user } = useUser();

    const [openDialog, setOpenDialog] = useState(false);
    const [seoResult, setSeoResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [appName, setAppName] = useState('');
    const [shortDesc, setShortDesc] = useState('');
    const [audience, setAudience] = useState('');
    const [language, setLanguage] = useState('');
    const [region, setRegion] = useState('');
    const [purpose, setPurpose] = useState('');
    const [tone, setTone] = useState('');

    const [allSEO, setAllSEO] = useState<any[]>([]);
    const [loadingAll, setLoadingAll] = useState(false);
    const [selectedSEO, setSelectedSEO] = useState<any | null>(null);
    const [showSEODialog, setShowSEODialog] = useState(false);

    const generateNewSEO = async () => {
        if (!user?.id || !appId) {
            toast.error('User or App ID missing.');
            return;
        }
        setLoading(true);
        setSeoResult(null);
        try {
            const res = await fetch('/api/seo/generate-seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    app_id: appId,
                    user_id: user.id,
                    appName,
                    shortDesc,
                    audience,
                    language,
                    region,
                    purpose,
                    tone
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Failed to generate SEO content.');
            } else {
                setSeoResult(data.seo);
                toast.success('SEO content generated and saved!');
                setOpenDialog(false);
            }
        } catch (err) {
            toast.error('Something went wrong.' + err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSEO = async () => {
        if (!appId) return;
        setLoadingAll(true);
        const { data, error } = await supabase
            .from('seo_metadata')
            .select('*')
            .eq('app_id', appId)
            .order('created_at', { ascending: false });
        if (error) {
            toast.error('Failed to fetch SEO data: ' + error.message);
        } else {
            setAllSEO(data || []);
        }
        setLoadingAll(false);
    };

    useEffect(() => {
        fetchAllSEO();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId]);

    // After generating new SEO, refresh the list
    useEffect(() => {
        if (seoResult) fetchAllSEO();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seoResult]);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto p-4">
                <Card className="w-full py-[50px]">
                    <CardHeader>
                        <Sparkles size={40} />
                        <CardTitle className="text-2xl">SEO Content Generator</CardTitle>

                        {/* Trigger dialog */}
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                            <DialogTrigger asChild>
                                <Button className="cursor-pointer mt-4">Generate Content</Button>
                            </DialogTrigger>

                            <DialogContent className="p-9" fullscreen>
                                <DialogHeader>
                                    <DialogTitle>Generate SEO Content</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to help the AI generate optimized SEO metadata.
                                    </DialogDescription>
                                </DialogHeader>
                                <br />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>App Name</Label>
                                        <Input value={appName} placeholder='Type here...' onChange={(e) => setAppName(e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Target Audience</Label>
                                        <Input value={audience} placeholder='Type here...' onChange={(e) => setAudience(e.target.value)} />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Short Description</Label>
                                        <Textarea rows={4} value={shortDesc} placeholder='Type here...' onChange={(e) => setShortDesc(e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Language (optional)</Label>
                                        <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. en, hi, ja" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Region (optional)</Label>
                                        <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. India, USA" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Purpose</Label>
                                        <Select onValueChange={setPurpose}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select purpose..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="landing">Landing Page</SelectItem>
                                                <SelectItem value="blog">Blog Post</SelectItem>
                                                <SelectItem value="product">Product Page</SelectItem>
                                                <SelectItem value="portfolio">Portfolio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tone</Label>
                                        <Select onValueChange={setTone} value='formal'>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tone..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="formal">Formal</SelectItem>
                                                <SelectItem value="fun">Fun</SelectItem>
                                                <SelectItem value="professional">Professional</SelectItem>
                                                <SelectItem value="casual">Casual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-start mt-6">
                                    <Button onClick={generateNewSEO} disabled={loading}>
                                        {loading ? 'Generating...' : 'Generate SEO'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                </Card>

                {/* Other Cards */}
                <Card className="w-full py-[50px]">
                    <CardHeader>
                        <Search size={40} />
                        <CardTitle className="text-2xl">Content Reviewer</CardTitle>
                        <Button className="cursor-pointer mt-4">Review Content</Button>
                    </CardHeader>
                </Card>

                <Card className="w-full py-[50px]">
                    <CardHeader>
                        <LucidePencilLine size={40} />
                        <CardTitle className="text-2xl">AI BlogWriter</CardTitle>
                        <Button className="cursor-pointer mt-4">Generate Articles for your Website</Button>
                    </CardHeader>
                </Card>
            </div>
            <div className='flex gap-3'>
                {seoResult && (
                    <div className="w-full max-w-3xl mx-auto mt-10 rounded-2xl border transition-all duration-300 hover:shadow-2xl">

                        {/* Header */}
                        <div className="p-6 border-b dark:border-gray-700/50 light:border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg dark:bg-blue-500/20 light:bg-blue-100">
                                        <svg className="w-5 h-5 dark:text-blue-400 light:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold dark:text-white light:text-gray-900">
                                        SEO Metadata
                                    </h2>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full dark:bg-green-500/20 dark:text-green-400 light:bg-green-100 light:text-green-700">
                                        Generated
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(seoResult, null, 2));
                                        toast.success("Copied to clipboard!");
                                    }}
                                    className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 
                                 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 dark:text-gray-300 dark:hover:text-white
                                 light:bg-gray-100 light:hover:bg-gray-200 light:text-gray-600 light:hover:text-gray-900"
                                >
                                    <Copy size={16} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">Copy</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Title */}
                            <div className="group">
                                <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Title
                                </div>
                                <div className="p-4 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-blue-400/50 transition-colors">
                                    <p className="dark:text-gray-200 light:text-gray-800 font-medium leading-relaxed">{seoResult.title}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="group">
                                <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Description
                                </div>
                                <div className="p-4 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-green-400/50 transition-colors">
                                    <p className="dark:text-gray-200 light:text-gray-800 leading-relaxed">{seoResult.description}</p>
                                </div>
                            </div>

                            {/* Slug */}
                            <div className="group">
                                <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Slug
                                </div>
                                <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-purple-400/50 transition-colors">
                                    <code className="dark:text-purple-300 light:text-purple-700 font-mono text-sm">{seoResult.slug}</code>
                                </div>
                            </div>

                            {/* Canonical URL */}
                            {/* <div className="group">
                                <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    Canonical URL
                                </div>
                                <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-indigo-400/50 transition-colors">
                                    <a
                                        href={seoResult.canonical_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 dark:text-blue-400 light:text-blue-600 hover:underline break-all font-mono text-sm"
                                    >
                                        <span>{seoResult.canonical_url}</span>
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            </div> */}

                            {/* Keywords */}
                            {seoResult.keywords && (
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-3 dark:text-gray-400 light:text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                        Keywords
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.isArray(seoResult.keywords) ? seoResult.keywords : seoResult.keywords.split(", ")).map((keyword: any, index: any) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 text-sm rounded-full dark:bg-pink-500/20 dark:text-pink-300 light:bg-pink-100 light:text-pink-700 border dark:border-pink-500/30 light:border-pink-200 hover:scale-105 transition-transform cursor-default"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* OG Image URL */}
                            {/* {seoResult.og_image_url && (
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        OG Image URL
                                    </div>
                                    <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-yellow-400/50 transition-colors">
                                        <a
                                            href={seoResult.og_image_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 dark:text-blue-400 light:text-blue-600 hover:underline break-all font-mono text-sm"
                                        >
                                            <span>{seoResult.og_image_url}</span>
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            )} */}

                            {/* Grid for smaller items */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Twitter Card Type */}
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                        Twitter Card Type
                                    </div>
                                    <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-cyan-400/50 transition-colors">
                                        <span className="dark:text-gray-200 light:text-gray-800 font-medium">{seoResult.twitter_card_type}</span>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                        Language
                                    </div>
                                    <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-orange-400/50 transition-colors">
                                        <span className="dark:text-gray-200 light:text-gray-800 font-medium">{seoResult.language}</span>
                                    </div>
                                </div>

                                {/* No Index */}
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className={`w-2 h-2 rounded-full ${seoResult.no_index ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        No Index
                                    </div>
                                    <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 transition-colors">
                                        <span className={`font-medium ${seoResult.no_index ? 'dark:text-red-400 light:text-red-600' : 'dark:text-green-400 light:text-green-600'}`}>
                                            {seoResult.no_index ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>

                                {/* No Follow */}
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className={`w-2 h-2 rounded-full ${seoResult.no_follow ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                        No Follow
                                    </div>
                                    <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 transition-colors">
                                        <span className={`font-medium ${seoResult.no_follow ? 'dark:text-red-400 light:text-red-600' : 'dark:text-green-400 light:text-green-600'}`}>
                                            {seoResult.no_follow ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            {(seoResult.created_at || seoResult.updated_at) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700/50 light:border-gray-200">
                                    {seoResult.created_at && (
                                        <div className="group">
                                            <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                Created At
                                            </div>
                                            <div className="p-3 rounded-lg dark:bg-gray-800/30 light:bg-gray-50 border dark:border-gray-700/30 light:border-gray-200">
                                                <span className="dark:text-gray-300 light:text-gray-700 text-sm font-mono">
                                                    {new Date(seoResult.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {seoResult.updated_at && (
                                        <div className="group">
                                            <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                Updated At
                                            </div>
                                            <div className="p-3 rounded-lg dark:bg-gray-800/30 light:bg-gray-50 border dark:border-gray-700/30 light:border-gray-200">
                                                <span className="dark:text-gray-300 light:text-gray-700 text-sm font-mono">
                                                    {new Date(seoResult.updated_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* All SEO Data Table/List */}
            <div className="max-w-8xl mx-auto mt-16">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">All Generated SEO Metadata</h2>
                    <Button onClick={fetchAllSEO} disabled={loadingAll} variant="outline">
                        {loadingAll ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
                <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-900">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-2 text-left">Title</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-left">Slug</th>
                                <th className="px-4 py-2 text-left">Keywords</th>
                                <th className="px-4 py-2 text-left">No Index</th>
                                <th className="px-4 py-2 text-left">No Follow</th>
                                <th className="px-4 py-2 text-left">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allSEO.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No SEO metadata generated yet.</td>
                                </tr>
                            )}
                            {allSEO.map((seo, idx) => (
                                <tr
                                    key={seo.id || idx}
                                    className={`border-t dark:border-gray-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800/40 ${selectedSEO && selectedSEO.id === seo.id ? 'bg-blue-100 dark:bg-gray-800/60' : ''}`}
                                    onClick={() => { setSelectedSEO(seo); setShowSEODialog(true); }}
                                >
                                    <td className="px-4 py-2 font-semibold max-w-xs truncate" title={seo.title}>{seo.title}</td>
                                    <td className="px-4 py-2 max-w-xs truncate" title={seo.description}>{seo.description}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{seo.slug}</td>
                                    <td className="px-4 py-2">{Array.isArray(seo.keywords) ? seo.keywords.join(', ') : seo.keywords}</td>
                                    <td className="px-4 py-2 text-center">{seo.no_index ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2 text-center">{seo.no_follow ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{seo.created_at ? new Date(seo.created_at).toLocaleString() : ''}</td>
                                    <td className="px-4 py-2 font-mono text-xs"><Button variant={'outline'} className='cursor-pointer hover:text-red-600' onClick={() => {}}><Trash2 /></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SEO Details Dialog */}
            <Dialog open={showSEODialog} onOpenChange={setShowSEODialog}>
                <DialogContent className="p-0 max-h-[800px] overflow-scroll">
                    {selectedSEO && (
                        <div className="w-full">
                            <div className="p-6 border-b dark:border-gray-700/50 light:border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg dark:bg-blue-500/20 light:bg-blue-100">
                                        <svg className="w-5 h-5 dark:text-blue-400 light:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold dark:text-white light:text-gray-900">SEO Metadata</h2>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full dark:bg-green-500/20 dark:text-green-400 light:bg-green-100 light:text-green-700">Generated</span>
                                </div>
                                <div
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(selectedSEO, null, 2));
                                        toast.success("Copied to clipboard!");
                                    }}
                                    className="group cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 dark:text-gray-300 dark:hover:text-white light:bg-gray-100 light:hover:bg-gray-200 light:text-gray-600 light:hover:text-gray-900"
                                >
                                    <Copy size={16} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">Copy As Json</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>Title
                                    </div>
                                    <div className="p-4 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-blue-400/50 transition-colors">
                                        <p className="dark:text-gray-200 light:text-gray-800 font-medium leading-relaxed" onClick={() => {
                                            navigator.clipboard.writeText(selectedSEO.title)
                                            toast.success("Successfuly Copied Title!")
                                        }}>{selectedSEO.title}</p>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>Description
                                    </div>
                                    <div className="p-4 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-green-400/50 transition-colors">
                                        <p className="dark:text-gray-200 light:text-gray-800 leading-relaxed" onClick={() => {
                                            navigator.clipboard.writeText(selectedSEO.description)
                                            toast.success("Successfuly Copied Description!")
                                        }}>{selectedSEO.description}</p>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>Slug
                                    </div>
                                    <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-purple-400/50 transition-colors">
                                        <code className="dark:text-purple-300 light:text-purple-700 font-mono text-sm" onClick={() => {
                                            navigator.clipboard.writeText(selectedSEO.slug)
                                            toast.success("Successfuly Copied Slug!")
                                        }}>{selectedSEO.slug}</code>
                                    </div>
                                </div>
                                {selectedSEO.keywords && (
                                    <div className="group">
                                        <div className="flex items-center gap-2 text-sm font-medium mb-3 dark:text-gray-400 light:text-gray-600">
                                            <span className="w-2 h-2 rounded-full bg-pink-500"></span>Keywords
                                            <Copy onClick={() => {
                                                navigator.clipboard.writeText(selectedSEO.keywords)
                                                toast.success("Copied all the keywords")
                                            }}
                                                size={16}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(selectedSEO.keywords) ? selectedSEO.keywords : selectedSEO.keywords.split(", ")).map((keyword: any, index: any) => (
                                                <span key={index} className="px-3 py-1.5 text-sm rounded-full dark:bg-pink-500/20 dark:text-pink-300 light:bg-pink-100 light:text-pink-700 border dark:border-pink-500/30 light:border-pink-200 hover:scale-105 transition-transform cursor-default" onClick={() => {
                                                    navigator.clipboard.writeText(keyword)
                                                    toast.success(`Successfuly Copied ${keyword || "keyword"}!`)
                                                }}>{keyword}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="group">
                                        <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>Twitter Card Type
                                        </div>
                                        <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 group-hover:border-cyan-400/50 transition-colors">
                                            <span className="dark:text-gray-200 light:text-gray-800 font-medium">{selectedSEO.twitter_card_type}</span>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>Language
                                        </div>
                                        <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-orange-200 group-hover:border-orange-400/50 transition-colors">
                                            <span className="dark:text-gray-200 light:text-gray-800 font-medium">{selectedSEO.language}</span>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                            <span className={`w-2 h-2 rounded-full ${selectedSEO.no_index ? 'bg-red-500' : 'bg-green-500'}`}></span>No Index
                                        </div>
                                        <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 transition-colors">
                                            <span className={`font-medium ${selectedSEO.no_index ? 'dark:text-red-400 light:text-red-600' : 'dark:text-green-400 light:text-green-600'}`}>{selectedSEO.no_index ? "Yes" : "No"}</span>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                            <span className={`w-2 h-2 rounded-full ${selectedSEO.no_follow ? 'bg-red-500' : 'bg-green-500'}`}></span>No Follow
                                        </div>
                                        <div className="p-3 rounded-lg dark:bg-gray-800/50 light:bg-gray-50 border dark:border-gray-700/50 light:border-gray-200 transition-colors">
                                            <span className={`font-medium ${selectedSEO.no_follow ? 'dark:text-red-400 light:text-red-600' : 'dark:text-green-400 light:text-green-600'}`}>{selectedSEO.no_follow ? "Yes" : "No"}</span>
                                        </div>
                                    </div>
                                </div>
                                {(selectedSEO.created_at || selectedSEO.updated_at) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700/50 light:border-gray-200">
                                        {selectedSEO.created_at && (
                                            <div className="group">
                                                <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>Created At
                                                </div>
                                                <div className="p-3 rounded-lg dark:bg-gray-800/30 light:bg-gray-50 border dark:border-gray-700/30 light:border-gray-200">
                                                    <span className="dark:text-gray-300 light:text-gray-700 text-sm font-mono">{new Date(selectedSEO.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selectedSEO.updated_at && (
                                            <div className="group">
                                                <div className="flex items-center gap-2 text-sm font-medium mb-2 dark:text-gray-400 light:text-gray-600">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Updated At
                                                </div>
                                                <div className="p-3 rounded-lg dark:bg-gray-800/30 light:bg-gray-50 border dark:border-gray-700/30 light:border-gray-200">
                                                    <span className="dark:text-gray-300 light:text-gray-700 text-sm font-mono">{new Date(selectedSEO.updated_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SEOPage;

const MetaRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
        <span className="font-medium text-white/60">{label}:</span>
        <span className="text-white">{value || <span className="italic text-gray-400">N/A</span>}</span>
    </div>
);
