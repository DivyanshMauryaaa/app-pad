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
  const [apps, setApps] = useState<any>([]);
  const [search, setSearch] = useState("");
  const { user } = useUser();

  const pullApps = async () => {
    const { data, error } = await supabase.from('apps').select('*').eq('user_id', user?.id);
    setApps(data);
    if (error) throw error;
  };

  useEffect(() => {
    if (user) {
      pullApps();
    }
  }, [user]);

  // Filter apps based on search
  const filteredApps = apps?.filter((app: any) =>
    app.name?.toLowerCase().includes(search.toLowerCase()) ||
    app.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <p className="text-5xl font-semibold text-center mb-8">Your Apps</p>
      <div className="flex items-center gap-3 max-w-md mx-auto mb-8 bg-card rounded-xl shadow px-4 py-2 border">
        <SearchIcon size={20} className="text-muted-foreground" />
        <Input
          placeholder="Search your apps..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-0 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary rounded-none text-lg px-0"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
        {/* Add New App Card */}
        <AddAppDialog />
        {/* Render App Cards */}
        {filteredApps && filteredApps.length > 0 ? (
          filteredApps.map((app: any) => (
            <Card key={app.id} className="group cursor-pointer bg-gradient-to-br from-muted/60 to-card/80 hover:scale-[1.03] transition-transform duration-200 border-2 border-transparent hover:border-primary shadow-lg flex flex-col justify-between min-h-[260px]">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold group-hover:underline flex items-center gap-2">
                  <Link href={`/apps/${app.id}`} className="flex gap-2 items-center">
                    {app.name}
                    <ArrowUpRightIcon className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </CardTitle>
                <CardDescription className="text-base mt-2 min-h-[48px]">{app.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button
                  onClick={async (e) => {
                    // e.stopPropagation();
                    const { error } = await supabase.from('apps')
                      .delete()
                      .eq('id', app.id);
                    if (error) throw error;
                    pullApps();
                  }}
                  variant={'outline'} size="icon" aria-label="Delete app" className="hover:bg-destructive/10">
                  <Trash2Icon className="text-destructive hover:scale-110 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 opacity-30"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-7V7h2v6h-2zm0 4v-2h2v2h-2z" fill="currentColor" /></svg>
            <span className="text-xl">No apps found.<br />Try creating a new app or adjusting your search.</span>
          </div>
        )}
      </div>
    </div>
  );
}
