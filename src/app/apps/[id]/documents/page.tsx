'use client';

import { useState, useEffect } from 'react';
import supabase from '@/supabase/client';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import "highlight.js/styles/github-dark.css"; // or another highlight.js theme
import { ArrowLeftCircleIcon, SaveIcon, Trash2 } from 'lucide-react';

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
                            >
                                <div className="font-semibold text-lg text-foreground"
                                    onClick={() => openDoc(doc.id)}
                                >{doc.name}</div>
                                <div className="text-muted-foreground text-sm whitespace-pre-line mt-2 line-clamp-2">{doc.content}</div>
                                <Trash2 className='cursor-pointer mt-2 hover:text-red-600' size={20} onClick={async () => {
                                    await supabase.from('documents').delete().eq('id', doc.id);
                                    pullDocsfromdb();
                                }} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
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
                            <article className="prose prose-invert rounded-lg w-[80%] max-w-none border dark:border-gray-700 p-7 m-auto border-gray-300">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    rehypePlugins={[
                                        rehypeHighlight,
                                        rehypeSlug,
                                        [rehypeAutolinkHeadings, { behavior: "wrap" }]
                                    ]}
                                    components={{
                                        // Optional: customize rendering for checkboxes, tables, etc.
                                        // Example: GitHub-style checkboxes
                                        input: ({ node, ...props }) =>
                                            props.type === "checkbox" ? (
                                                <input {...props} disabled className="mr-2 accent-blue-500" />
                                            ) : (
                                                <input {...props} />
                                            ),
                                        // Optional: style tables
                                        table: ({ node, ...props }) => (
                                            <table className="border-collapse border border-border" {...props} />
                                        ),
                                        th: ({ node, ...props }) => (
                                            <th className="border border-border bg-muted px-2 py-1" {...props} />
                                        ),
                                        td: ({ node, ...props }) => (
                                            <td className="border border-border px-2 py-1" {...props} />
                                        ),
                                        h1: ({ node, ...props }) => (
                                            <h1 className='text-5xl py-3 hover:underline' {...props} />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <h2 className='text-3xl py-3 hover:underline' {...props} />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <h3 className='text-2xl py-3 hover:underline' {...props} />
                                        ),
                                        hr: ({ node, ...props }) => (
                                            <hr className='py-2 mt-4' />
                                        ),
                                        code({
                                            // node,
                                            inline,
                                            className,
                                            children,
                                            ...props
                                        }: React.HTMLAttributes<HTMLElement> & { inline?: boolean; children?: React.ReactNode }) {
                                            return inline ? (
                                                <code className="bg-muted px-1 rounded text-sm" {...props}>{children}</code>
                                            ) : (
                                                <pre className="bg-muted rounded p-3 overflow-x-auto my-2">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            );
                                        },
                                    }}
                                >
                                    {viewDoc?.content || ""}
                                </ReactMarkdown>
                            </article>
                        </TabsContent>
                        <TabsContent value="edit" className="flex-1 flex flex-col">
                            <Textarea
                                value={viewDoc?.content}
                                onChange={e => setViewDoc({ ...viewDoc, content: e.target.value })}
                                className="flex-1 mb-4 w-[80%] m-auto"
                                rows={16}
                            />

                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DocumentsPage;