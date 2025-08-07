'use client';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import supabase from '@/supabase/client';
import { DownloadIcon, FileLock2, PencilIcon, PlusIcon, SaveIcon, TrashIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import MdRenderer from '@/components/mdrenderer';
import { DialogDescription } from '@radix-ui/react-dialog';
import CryptoJS from 'crypto-js';

const LegalVaultPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [legalDocuments, setLegalDocuments] = useState<any[]>([]);
    const params = useParams();
    const appId = params.id as string;
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [open, setOpen] = useState(false);
    const [fileOpen, setFileOpen] = useState(false);
    const [file, setFile] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [content, setContent] = useState("");
    const [deleteDialog, setDeleteDialog] = useState(false);
    const { user } = useUser();

    const fetchLegalDocuments = async () => {
        const { data, error } = await supabase
            .from('legal_docs')
            .select('*')
            .eq('app_id', appId);

        if (error) {
            setError(error.message);
        } else {
            setLegalDocuments(data);
        }
        setIsLoading(false);
    }

    const openFile = async (id: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('legal_docs')
            .select('*')
            .eq('id', id)
            .eq('app_id', appId)
            .single();

        if (error) setError(error.message);

        // Decrypt the content using AES
        let decryptedContent = '';
        try {
            const bytes = CryptoJS.AES.decrypt(data.content, 'my-very-secure-key');
            decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            decryptedContent = '';
        }
        setContent(decryptedContent);
        setFile(data);
        setFileOpen(true);
        setIsLoading(false);
    }

    const handleAddDocument = async () => {
        setIsLoading(true);
        const { error } = await supabase
            .from('legal_docs')
            .insert({ name: title, description, app_id: appId, created_by: user?.id });
        if (error) {
            setError(error.message);
        } else {
            toast.success('Document added successfully');
        }
        setOpen(false);
        fetchLegalDocuments();
        setIsLoading(false);
    }

    useEffect(() => {
        fetchLegalDocuments();
    }, []);

    if (isLoading) return <div>Loading...</div>;

    const handleDelete = async () => {
        const { error } = await supabase
            .from('legal_docs')
            .delete()
            .eq('id', file?.id);
        if (error) setError(error.message);
        else toast.success('Document deleted successfully');
        setFileOpen(false);
        setDeleteDialog(false);
        fetchLegalDocuments();
    }

    const saveDocument = async () => {
        // Encrypt the content using AES before saving
        const encryptedContent = CryptoJS.AES.encrypt(content, 'my-very-secure-key').toString();
        const { error } = await supabase
            .from('legal_docs')
            .update({ content: encryptedContent })
            .eq('id', file?.id);
        if (error) setError(error.message);
        else toast.success('Document saved successfully');
        fetchLegalDocuments();
    }

    return (
        <div>
            <p className='font-bold text-3xl'>Legal Documents Vault</p>
            {error && <p className='text-red-500'>{error}</p>}

            <div className='flex flex-row gap-4 mt-4'>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusIcon className='w-4 h-4' />
                            Add Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-2xl'>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Legal Document</DialogTitle>
                            </DialogHeader>

                            <Input type='text' placeholder='Title' className='mb-4' value={title} onChange={(e) => setTitle(e.target.value)} />
                            <Textarea placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
                            <DialogFooter>
                                <Button onClick={handleAddDocument}>Add</Button>
                            </DialogFooter>
                        </DialogContent>

                    </DialogContent>
                </Dialog>
            </div>

            <div className='flex flex-wrap gap-4 mt-4'>
                {legalDocuments.map((doc) => (
                    <Card key={doc.id} onClick={() => openFile(doc.id)} className='w-[20%] hover:bg-accent cursor-pointer transition-all duration-150'>
                        <CardHeader>
                            <CardTitle className='flex flex-row gap-2 items-center'>
                                <FileLock2 size={25} />
                                {doc.name}
                            </CardTitle>
                            <CardDescription>{doc.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Dialog open={!!fileOpen} onOpenChange={() => setFileOpen(false)}>
                <DialogContent className='p-5' fullscreen>
                    <DialogHeader>
                        <DialogTitle className='flex flex-col mb-2'>
                            <p className='text-4xl text-center'>{file?.name}</p>
                            <p className='text-lg text-center text-muted-foreground'>{file?.description}</p>
                            <br />
                            <p className='text-sm text-center text-muted-foreground'>Created on: {file?.created_at.split("T")[0]}</p>
                            <p className='text-sm text-center text-muted-foreground'>Last Updated on: {file?.updated_at.split("T")[0]}</p>
                        </DialogTitle>
                    </DialogHeader>
                    <hr />
                    <div className='flex flex-row gap-2 items-center mt-2'>
                        <Button variant='outline' onClick={() => {
                            if (editMode && content !== file?.content) saveDocument();
                            setEditMode(!editMode);
                        }}>
                            {editMode ? <SaveIcon size={20} /> : <PencilIcon size={20} />}
                            {editMode ? "Save" : "Edit"}
                        </Button>
                        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant='outline'>
                                    <TrashIcon size={20} />
                                    Delete
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Document?</DialogTitle>
                                    <DialogDescription>This action cannot be undone</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant={'ghost'} onClick={() => setDeleteDialog(false)}>No</Button>
                                    <Button onClick={() => handleDelete()}>Yes, Delete</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <br />

                    {editMode ? (
                        <div className='flex flex-col gap-2'>
                            <Textarea placeholder='Please enter the content of the document here...' value={content} onChange={(e) => setContent(e.target.value)} className='h-[500px] w-full font-mono' />
                        </div>
                    ) : (
                        <div className='h-[70%]'>
                            <MdRenderer content={content || ""} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default LegalVaultPage;