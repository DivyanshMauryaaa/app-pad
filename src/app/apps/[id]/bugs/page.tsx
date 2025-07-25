'use client'

import { useState, useEffect } from "react";
import supabase from "@/supabase/client";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Bug, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import PricingDialog from '@/app/components/PricingDialog';
import { useIsSubscribed } from "@/hooks/use-is-subscribed";

const BugsPage = () => {
    const [bugs, setBugs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true)
    const params = useParams();
    const appId = params.id as string;
    const { user } = useUser();

    // Add bug dialog state
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [severity, setSeverity] = useState('medium');

    const [showPricing, setShowPricing] = useState(false);

    const getBugs = async () => {
        const { data } = await supabase.from('bugs')
            .select("*")
            .eq('app_id', appId);
        setBugs(data || []);
        setLoading(false);
    }

    useEffect(() => {
        if (appId) getBugs();
    }, [appId]);

    const isPro = useIsSubscribed(appId) === 'true';

    const addBug = async () => {
        if (!isPro && bugs.length >= 2) {
            setShowPricing(true);
            return;
        }
        if (!name) return;
        await supabase.from('bugs').insert({
            app_id: appId,
            name,
            description,
            link,
            severity,
            resolved: false,
        });
        setName('');
        setDescription('');
        setLink('');
        setSeverity('medium');
        setOpen(false);
        getBugs();
    }

    const EditBugDialog = ({ bug, onUpdated }: { bug: any, onUpdated: () => void }) => {
        const [open, setOpen] = useState(false);
        const [name, setName] = useState(bug.name);
        const [description, setDescription] = useState(bug.description || "");
        const [link, setLink] = useState(bug.link || "");
        const [severity, setSeverity] = useState(bug.severity || "Medium");

        const handleEdit = async () => {
            await supabase.from('bugs').update({
                name,
                description,
                link,
                severity,
            }).eq('id', bug.id);
            setOpen(false);
            onUpdated();
        };

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="ml-2" aria-label="Edit bug">
                        <Pencil className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Bug</DialogTitle>
                        <DialogDescription>
                            Update the details for this bug.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Bug title"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="mb-2"
                    />
                    <Textarea
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="mb-2"
                    />
                    <Input
                        placeholder="Related link (optional)"
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        className="mb-2"
                    />
                    <Select value={severity} onValueChange={setSeverity}>
                        <SelectTrigger className="mb-4">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleEdit} className="w-full mt-2">
                        Save Changes
                    </Button>
                </DialogContent>
            </Dialog>
        );
    }

    const DeleteBugDialog = ({ bugId, onDeleted }: { bugId: string, onDeleted: () => void }) => {
        const [open, setOpen] = useState(false);
        const [loading, setLoading] = useState(false);

        const handleDelete = async () => {
            setLoading(true);
            await supabase.from('bugs').delete().eq('id', bugId);
            setLoading(false);
            setOpen(false);
            onDeleted();
        };

        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2"
                        aria-label="Delete bug"
                    >
                        <Trash2 className="w-4 h-4 cursor-pointer" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Bug?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The bug will be permanently deleted and cannot be restored.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className="bg-background text-foreground min-h-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Bugs</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary">Report Bug</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Report a Bug</DialogTitle>
                            <DialogDescription>
                                Fill in the details to report a new bug for this app.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            placeholder="Bug title"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mb-2"
                        />
                        <Textarea
                            placeholder="Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            placeholder="Related link (optional)"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            className="mb-2"
                        />
                        <Select value={severity} onValueChange={setSeverity}>
                            <SelectTrigger className="mb-4">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={addBug} className="w-full mt-2">
                            Submit Bug
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                {loading ? (
                    <div className="text-muted-foreground">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {bugs.map(bug => (
                            <div key={bug.id} className="bg-gradient-to-br from-accent to-card rounded-2xl p-6 border border-border shadow-lg transition-transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between min-h-[180px]">
                                <div className="flex items-center gap-3 mb-2">
                                    {/* Icon based on severity */}
                                    {bug.severity?.toLowerCase() === "critical" ? (
                                        <AlertTriangle className="text-red-700 w-7 h-7" />
                                    ) : (
                                        <Bug className="text-yellow-600 w-7 h-7" />
                                    )}
                                    <span className={`font-bold text-2xl truncate ${bug.resolved ? "line-through text-muted-foreground" : "text-foreground"}`}>{bug.name}</span>
                                </div>
                                <div className="text-muted-foreground text-base mb-2 line-clamp-3">{bug.description}</div>
                                {bug.link && (
                                    <a href={bug.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs mb-2 block">
                                        {bug.link}
                                    </a>
                                )}
                                {bug.resolved && (
                                    <p className="text-green-700 font-semibold">Resolved!</p>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={!!bug.resolved}
                                            onCheckedChange={async (checked) => {
                                                await supabase.from('bugs').update({ resolved: checked }).eq('id', bug.id);
                                                getBugs();
                                            }}
                                            aria-label={bug.resolved ? "Mark as unresolved" : "Mark as resolved"}
                                        />
                                        <span className={`px-2 py-1 rounded text-sm ${bug.severity?.toLowerCase() === "critical" ? "bg-red-700 text-white" :
                                                bug.severity?.toLowerCase() === "high" ? "bg-red-500 text-white" :
                                                bug.severity?.toLowerCase() === "medium" ? "bg-yellow-600 text-white" :
                                                "bg-green-700 text-white"
                                            }`}>
                                            {bug.severity}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <EditBugDialog bug={bug} onUpdated={getBugs} />
                                        <DeleteBugDialog bugId={bug.id} onDeleted={getBugs} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <PricingDialog open={showPricing} onOpenChange={setShowPricing} appId={appId} />
        </div>
    )
}

export default BugsPage;