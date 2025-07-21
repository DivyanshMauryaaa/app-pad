'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import supabase from "@/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Card } from "../ui/card";
import { PlusCircle } from "lucide-react";

const AddAppDialog = () => {
    const [appName, setAppName] = useState('');
    const [appDescription, setAppDescription] = useState('');
    const [homePage, sethomePage] = useState('');
    const [appRepo, setAppRepo] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useUser();

    const AddApp = async () => {
        const { error, data } = await supabase.from('apps')
        .insert(
            {
                name: appName,
                description: appDescription,
                user_id: user?.id,
                homepage: homePage,
                github_repo: appRepo
            }
        ).select();

        if (error) {
            setSuccess('');
            throw error.message + error.cause;
        }
        setSuccess('App added successfully!');
        setAppName('');
        setAppDescription('');
        sethomePage('');
        setAppRepo('');
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="scale-75 flex flex-col cursor-pointer hover:scale-95 transition-all duration-200 items-center text-center">
                    <PlusCircle size={150} className="text-accent" />
                    <p className="text-accent text-6xl">Add New</p>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new app</DialogTitle>
                    <DialogDescription>
                        This will add a new app to your account.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <Input
                        placeholder="App name"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full"
                    />
                    <Textarea
                        placeholder="Description (optional)"
                        value={appDescription}
                        onChange={(e) => setAppDescription(e.target.value)}
                        className="w-full max-h-[300px] min-h-[130px]"
                    />
                    <Input
                        placeholder="Homepage url"
                        value={homePage}
                        onChange={(e) => sethomePage(e.target.value)}
                        className="w-full"
                    />
                    <Input
                        placeholder="Repo url"
                        value={appRepo}
                        onChange={(e) => setAppRepo(e.target.value)}
                        className="w-full"
                    />
                    <Button onClick={AddApp}>Add App</Button>
                    {success && (
                        <div className="text-green-600 text-sm">{success}</div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}

export default AddAppDialog