'use client';

import { useState, useEffect } from 'react';
import supabase from '@/supabase/client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import "highlight.js/styles/github-dark.css"; // or another highlight.js theme
import { ArrowLeftCircleIcon, FileIcon, SaveIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
// import { AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Card, CardHeader } from '@/components/ui/card';
import MdRenderer from '@/components/mdrenderer';
import PricingDialog from '@/app/components/PricingDialog';
import { useIsSubscribed } from "@/hooks/use-is-subscribed"

const DocumentsPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const appId = params.id;

    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog state for adding
    const [openAdd, setOpenAdd] = useState(false);
    const [docName, setDocName] = useState('');
    const [docContent, setDocContent] = useState('');

    // For viewing a doc
    const docId = searchParams.get('doc');
    const [viewDoc, setViewDoc] = useState<any | null>(null);

    const pullDocsfromdb = async () => {
        const { data } = await supabase.from('documents')
            .select('*')
            .eq('app_id', appId);
        setDocuments(data || []);
        setLoading(false);
    };

    useEffect(() => {
        if (appId) {
            pullDocsfromdb();
        }
    }, [appId]);

    // Open doc dialog if docId in url
    useEffect(() => {
        if (docId && documents.length > 0) {
            const doc = documents.find(d => d.id === docId);
            setViewDoc(doc || null);
        } else {
            setViewDoc(null);
        }
    }, [docId, documents]);

    const addDoc = async () => {
        setLoading(true);
        const { data } = await supabase.from('documents').insert({
            name: docName || "Untitled",
            content: docContent || "**Write some markdown here...**",
            app_id: appId
        }).select();
        setDocName('');
        setDocContent('');
        setOpenAdd(false);
        pullDocsfromdb();
        setLoading(false);
        // Optionally, open the new doc in dialog:
        if (data && data[0]?.id) {
            router.replace(`?doc=${data[0].id}`);
        }
    };

    // Open doc dialog by setting url param
    const openDoc = (id: string) => {
        router.replace(`?doc=${id}`);
    };

    // Close doc dialog by removing url param
    const closeDoc = () => {
        router.replace(`?`);
    };

    const [showDialogOpen, setShowDialogOpen] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    const isPro = useIsSubscribed(appId as string) === 'true';

    const handleAddDoc = async () => {
        if (!isPro && documents.length >= 10) {
            setShowPricing(true);
            return;
        }
        await addDoc();
    };

    if (loading && documents.length === 0) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className='p-6'>


            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Documents</h2>
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                    <Button variant="secondary" onClick={() => setOpenAdd(true)}>Add Document</Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a Document</DialogTitle>
                            <DialogDescription>
                                Fill in the details to add a new document.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            placeholder="Document name"
                            value={docName}
                            onChange={e => setDocName(e.target.value)}
                            className="mb-2"
                        />
                        <Textarea
                            placeholder="Content (Markdown supported)"
                            value={docContent}
                            onChange={e => setDocContent(e.target.value)}
                            className="mb-2"
                        />
                        <Button onClick={handleAddDoc} className="w-full mt-2" disabled={loading}>
                            {loading ? "Adding..." : "Add Document"}
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                {loading ? (
                    <div className="text-muted-foreground">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {documents.map(doc => (
                            <Card
                                key={doc.id}
                                className="bg-gradient-to-br from-accent to-card rounded-2xl p-6 border border-border shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]"
                            >
                                <div onClick={() => openDoc(doc.id)} className="flex-1">
                                    <CardHeader className="font-bold text-4xl flex gap-4 flex-col text-foreground mb-2 hover:underline truncate">
                                        <FileIcon />
                                        {doc.name}
                                    </CardHeader>
                                    {/* <CardDescription className="text-muted-foreground text-base whitespace-pre-line mt-2 line-clamp-3">
                                        {doc.content}
                                    </CardDescription>
                                     */}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className='hover:text-white hover:bg-red-600 flex gap-2'><Trash2 /> Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure to delete this document?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your account
                                                    and remove your data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogAction>Cancel</AlertDialogAction>
                                                <AlertDialogAction
                                                    onClick={async () => {
                                                        await supabase.from('documents').delete().eq('id', doc.id);
                                                        toast("Deleted Document Successfuly")
                                                        pullDocsfromdb();
                                                    }}
                                                >Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>


            {/* CONTENT */}


            {/* Fullscreen dialog for viewing a document */}
            <Dialog open={!!docId && !!viewDoc} onOpenChange={open => { if (!open) closeDoc(); }}>
                <DialogContent fullscreen className='p-6 flex flex-col overflow-scroll'>
                    <DialogHeader className='bg-accent p-5 rounded-lg'>
                        <DialogTitle
                            className="text-5xl w-full flex gap-4 flex-col"
                        >
                            <ArrowLeftCircleIcon size={34} className='cursor-pointer hover:text-blue-800' onClick={() => closeDoc()} />
                            <p
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={async (e) => {
                                    const newTitle = e.currentTarget.textContent || "Untitled";
                                    if (newTitle !== viewDoc?.name) {
                                        await supabase.from('documents').update({ name: newTitle }).eq('id', viewDoc.id);
                                        setViewDoc({ ...viewDoc, name: newTitle });
                                        pullDocsfromdb();
                                    }
                                }}
                                className='focus:outline-none'
                            >
                                {viewDoc?.name}
                            </p>
                        </DialogTitle>
                        <DialogDescription>
                            Document ID: {viewDoc?.id}
                            <br />

                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="preview" className="flex-1 flex flex-col mt-4">
                        <TabsList className="mb-4 w-48">
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                        </TabsList>
                        <Button
                            onClick={async () => {
                                await supabase.from('documents').update({ content: viewDoc.content }).eq('id', viewDoc.id);
                                pullDocsfromdb();
                            }}
                            variant={'secondary'}
                            className="cursor-pointer self-start flex gap-2"
                        >
                            <SaveIcon /> Save
                        </Button>
                        <hr />
                        <TabsContent value="preview" className="flex-1 overflow-auto">
                            <MdRenderer content={viewDoc?.content} />
                        </TabsContent>
                        <TabsContent value="edit" className="flex-1 flex flex-col">
                            <Textarea
                                value={viewDoc?.content}
                                onChange={e => setViewDoc({ ...viewDoc, content: e.target.value })}
                                className="flex-1 mb-4 w-[80%] m-auto font-mono"
                                rows={16}
                            />

                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
            <PricingDialog open={showPricing} onOpenChange={setShowPricing} />
        </div>
    );
}

export default DocumentsPage;