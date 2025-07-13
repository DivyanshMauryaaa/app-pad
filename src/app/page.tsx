'use client'

import AddAppDialog from "@/components/app/AddAppDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import supabase from "@/supabase/client";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRightIcon, SearchIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [apps, setApps] = useState<any>([])
  const { user } = useUser();
  
  const pullApps = async () => {
    const { data, error } = await supabase.from('apps').select('*').eq('user_id', user?.id);
    
    setApps(data);
    if (error) throw error;
  }

  useEffect(() => {
    if (user) {
      pullApps();
    }
  }, [user]);

  return (

    <div className="p-6 space-y-2">

      <div className="flex gap-2">
        <SearchIcon size={20}/>
        <Input 
          placeholder="Search"
        />
      </div>

      <AddAppDialog />

      <div className="mt-6 space-y-4">
        {apps && apps.length > 0 ? (
          apps.map((app: any) => (
            <Card key={app.id}>
              <CardHeader>
                <CardTitle className="text-5xl hover:underline cursor-pointer ">
                  <Link href={`/apps/${app.id}`} className="flex gap-2">
                    {app.name}<ArrowUpRightIcon />
                  </Link>
                </CardTitle>
                <CardDescription className="text-xl">{app.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant={'outline'}>
                  <Trash2Icon onClick={async () => {
                    await supabase.from('apps')
                    .delete()
                    .eq('id', app.id)
                  }} />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-gray-400">No apps found.</div>
        )}
      </div>

        
    </div>

  );
}
