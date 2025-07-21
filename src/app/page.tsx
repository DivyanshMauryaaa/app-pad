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

      {/* <div className="flex gap-2">
        <SearchIcon size={20}/>
        <Input 
          placeholder="Search"
        />
      </div> */}
      <p className="text-5xl font-semibold text-center">Your Apps</p>

      <div className="mt-6 space-y-4">
        {apps && apps.length > 0 ? (
          apps.map((app: any) => (
            <Card key={app.id} className="scale-75 cursor-pointer bg-gradient-to-br from-muted to-card hover:scale-95 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-6xl hover:underline cursor-pointer font-normal">
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
        <AddAppDialog />
      </div>


    </div>

  );
}
