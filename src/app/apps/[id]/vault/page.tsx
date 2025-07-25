'use client';

// import { useUser } from "@clerk/nextjs";
import supabase from "@/supabase/client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Eye, Smartphone } from "lucide-react";
import { toast } from "sonner";
import PricingDialog from '@/app/components/PricingDialog';
import { useIsSubscribed } from "@/hooks/use-is-subscribed";

const Vault = () => {

    const [env, setEnv] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [showDialogOpen, setShowDialogOpen] = useState(false);
    const [selectedEnv, setSelectedEnv] = useState<any>(null);
    const [showPricing, setShowPricing] = useState(false);

    // const { user } = useUser();
    const params = useParams();
    const appId = params.id;

    const [newEnvKey, setNewEnvKey] = useState("");
    const [newEnvValue, setNewEnvValue] = useState("")
    const [newEnvDescription, setNewEnvDescription] = useState("");
    const [newEnvType, setNewEnvType] = useState('development');

    const getEnv = async () => {
        const { data, error } = await supabase
            .from('vault')
            .select('*')
            .eq('app_id', appId)

        setEnv(data);
        setLoading(false)
    }

    const addEnv = async () => {
        if (!isPro && env.length >= 3) {
            setShowPricing(true);
            setLoading(false);
            return;
        }
        setLoading(true);

        const { error } = await supabase.from('vault')
            .insert({
                key: newEnvKey,
                value: newEnvValue,
                description: newEnvDescription,
                app_id: appId,
                ...(isPro ? { type: newEnvType } : {})
            })

        if (error) alert(error);

        // Clear form and close dialog
        setNewEnvKey("");
        setNewEnvValue("");
        setNewEnvDescription("");
        setDialogOpen(false);

        getEnv();
        setLoading(false);
    }

    const deleteEnv = async (id: string) => {
        setLoading(true);

        const { error } = await supabase.from('vault')
            .delete()
            .eq('id', id);

        if (error) alert(error);
        getEnv();
        setLoading(false);
    }

    const editEnv = async (id: string) => {
        setLoading(true);

        const { error } = await supabase.from('vault')
            .update({
                key: newEnvKey,
                value: newEnvValue,
                description: newEnvDescription
            }).eq('id', id)

        if (error) alert(error);

        // Clear form and close dialog
        setNewEnvKey("");
        setNewEnvValue("");
        setNewEnvDescription("");
        setEditDialogOpen(false);

        getEnv();
        setLoading(false);
    }

    const handleEditClick = (envVar: any) => {
        setNewEnvKey(envVar.key);
        setNewEnvValue(envVar.value);
        setNewEnvDescription(envVar.description);
        setEditDialogOpen(true);
    };

    const handleShowClick = (envVar: any) => {
        setSelectedEnv(envVar);
        setShowDialogOpen(true);
    };

    const isPro = useIsSubscribed(appId as string) === 'true';

    useEffect(() => {
        if (appId) {
            getEnv();
        }
    }, [appId]);

    if (loading && env.length === 0) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <p className="text-5xl font-semibold">Vault</p>
            <p>Store your environment secrets here!</p>
            <br />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Add New</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Environment Variable</DialogTitle>
                        <DialogDescription>
                            Add a new environment variable to your vault. Fill in the key, value, and description.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="key" className="text-right">
                                Key
                            </Label>
                            <Input
                                id="key"
                                value={newEnvKey}
                                onChange={(e) => setNewEnvKey(e.target.value)}
                                placeholder="API_KEY"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="value" className="text-right">
                                Value
                            </Label>
                            <Input
                                id="value"
                                value={newEnvValue}
                                onChange={(e) => setNewEnvValue(e.target.value)}
                                placeholder="your-secret-value"
                                className="col-span-3"
                                type="password"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={newEnvDescription}
                                onChange={(e) => setNewEnvDescription(e.target.value)}
                                placeholder="Description of this environment variable"
                                className="col-span-3"
                                rows={3}
                            />
                        </div>
                        {isPro && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <select
                                    id="type"
                                    value={newEnvType}
                                    onChange={e => setNewEnvType(e.target.value)}
                                    className="col-span-3 border rounded px-2 py-1"
                                >
                                    <option value="development">Development</option>
                                    <option value="production">Production</option>
                                    <option value="staging">Staging</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={addEnv}
                            disabled={!newEnvKey || !newEnvValue || loading}
                        >
                            {loading ? "Adding..." : "Add Variable"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <PricingDialog open={showPricing} onOpenChange={setShowPricing} appId={appId as string || ''} />

            <div className="mt-6 space-y-4">
                {env.map((envVar: any) => (
                    <Card key={envVar.id}>
                        <CardHeader>
                            <CardTitle>{envVar.key}</CardTitle>
                            <CardDescription>{envVar.description}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="p-3 rounded flex gap-2 bg-accent">
                                <Copy
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedEnv?.value);
                                        toast("Successfully Copied")
                                    }}
                                    size={20}
                                    className="cursor-pointer mt-2"
                                />
                                <Input
                                    value={envVar.value || ""}
                                    disabled
                                    className="w-[40%] m-auto text-center"
                                    type="password"
                                    prefix={"Show"}
                                />
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => deleteEnv(envVar.id)}
                                    className="cursor-pointer hover:bg-red-600 hover:text-white"
                                >
                                    Delete
                                </Button>

                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            variant={'secondary'}
                                            onClick={() => handleEditClick(envVar)}
                                            className="cursor-pointer"
                                        >
                                            Edit
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Update Environment Variable</DialogTitle>
                                            <DialogDescription>
                                                Update the environment variable details
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="edit-key" className="text-right">
                                                    Key
                                                </Label>
                                                <Input
                                                    id="edit-key"
                                                    value={newEnvKey}
                                                    onChange={(e) => setNewEnvKey(e.target.value)}
                                                    placeholder="API_KEY"
                                                    className="col-span-3"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="edit-value" className="text-right">
                                                    Value
                                                </Label>
                                                <Input
                                                    id="edit-value"
                                                    value={newEnvValue}
                                                    onChange={(e) => setNewEnvValue(e.target.value)}
                                                    placeholder="your-secret-value"
                                                    className="col-span-3"
                                                    type="password"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="edit-description" className="text-right">
                                                    Description
                                                </Label>
                                                <Textarea
                                                    id="edit-description"
                                                    value={newEnvDescription}
                                                    onChange={(e) => setNewEnvDescription(e.target.value)}
                                                    placeholder="Description of this environment variable"
                                                    className="col-span-3"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setEditDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => editEnv(envVar.id)}
                                                disabled={!newEnvKey || !newEnvValue || loading}
                                            >
                                                {loading ? "Saving..." : "Save Variable"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={showDialogOpen} onOpenChange={setShowDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            onClick={() => handleShowClick(envVar)}
                                            className="flex gap-2 cursor-pointer"
                                        >
                                            <Eye />Show
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px] md:max-w-[900px]">
                                        <DialogHeader className="border-b">
                                            <DialogTitle>{selectedEnv?.key}</DialogTitle>
                                            <br />
                                        </DialogHeader>
                                        <Copy
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedEnv?.value);
                                                toast("Successfully Copied")
                                            }}
                                            size={20}
                                            className="cursor-pointer mt-2"
                                        />
                                        <p className="text-center text-lg bg-accent p-3 rounded font-mono">
                                            {selectedEnv?.value}
                                        </p>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default Vault;