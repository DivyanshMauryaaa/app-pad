'use client';

import { useState, useEffect } from 'react';
import supabase from '@/supabase/client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
                        <Button onClick={addDoc} className="w-full mt-2" disabled={loading}>
                            {loading ? "Adding..." : "Add Document"}
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                {loading ? (
                    <div className="text-muted-foreground">Loading...</div>
                ) : (
                    <ul className="space-y-4">
                        {documents.map(doc => (
                            <li
                                key={doc.id}
                                className="bg-card rounded-lg p-4 border border-border shadow cursor-pointer hover:bg-muted transition"
                                onClick={() => openDoc(doc.id)}
                            >
                                <div className="font-semibold text-lg text-foreground">{doc.name}</div>
                                <div className="text-muted-foreground text-sm whitespace-pre-line mt-2 line-clamp-2">{doc.content}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {/* Fullscreen dialog for viewing a document */}
            <Dialog open={!!docId && !!viewDoc} onOpenChange={open => { if (!open) closeDoc(); }}>
                <DialogContent fullscreen className='p-6'>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{viewDoc?.name}</DialogTitle>
                        <DialogDescription>
                            Document ID: {viewDoc?.id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto mt-4 text-foreground whitespace-pre-line">
                        {viewDoc?.content}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DocumentsPage;