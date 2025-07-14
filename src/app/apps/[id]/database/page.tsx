'use client';

import { useState, useEffect } from "react";
import supabase from "@/supabase/client";
import { useParams } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

const fields = [
  { key: "name", label: "Credential Name", type: "text" },
  { key: "host", label: "Host", type: "text" },
  { key: "port", label: "Port", type: "number" },
  { key: "database_name", label: "Database Name", type: "text" },
  { key: "username", label: "Username", type: "text" },
  { key: "password", label: "Password", type: "password" },
  { key: "connection_string", label: "Connection String", type: "text" },
  { key: "database_type", label: "Database Type", type: "text" },
];

export default function DatabasePage() {
  const params = useParams();
  const appId = params.id as string;

  const [creds, setCreds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state for adding
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    host: "",
    port: "",
    database_name: "",
    username: "",
    password: "",
    connection_string: "",
    database_type: "",
  });

  const fetchCreds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("database_credentials")
      .select("*")
      .eq("app_id", appId)
      .order("created_at", { ascending: false });
    setCreds(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (appId) fetchCreds();
  }, [appId]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addCred = async () => {
    await supabase.from("database_credentials").insert({
      ...form,
      app_id: appId,
    });
    setForm({
      name: "",
      host: "",
      port: "",
      database_name: "",
      username: "",
      password: "",
      connection_string: "",
      database_type: "",
    });
    setOpen(false);
    fetchCreds();
  };

  const deleteCred = async (id: string) => {
    await supabase.from("database_credentials").delete().eq("id", id);
    fetchCreds();
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Database Credentials</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Add Credentials</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Database Credentials</DialogTitle>
              <DialogDescription>
                Fill in the details to save your database credentials.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                addCred();
              }}
              className="space-y-2"
            >
              {fields.map(f => (
                <Input
                  key={f.key}
                  type={f.type}
                  placeholder={f.label}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className="mb-2"
                //   required={f.key !== "connection_string" || "port"} // connection_string is optional
                />
              ))}
              <Button type="submit" className="w-full mt-2">
                Save Credentials
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : creds.length === 0 ? (
          <div className="text-muted-foreground">No credentials stored yet.</div>
        ) : (
          <ul className="space-y-4">
            {creds.map(cred => (
              <li key={cred.id} className="bg-card rounded-lg p-4 border border-border shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{cred.name}</div>
                    <div className="text-muted-foreground text-sm">Type: {cred.database_type}</div>
                    <div className="text-muted-foreground text-xs mt-2">
                      <strong>Host:</strong> {cred.host}<br />
                      <strong>Port:</strong> {cred.port}<br />
                      <strong>DB Name:</strong> {cred.database_name}<br />
                      <strong>User:</strong> {cred.username}<br />
                      <strong>Password:</strong> <span className="blur-sm hover:blur-none transition">{cred.password}</span><br />
                      <strong>Connection String:</strong> <span className="break-all">{cred.connection_string}</span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteCred(cred.id)}
                    aria-label="Delete credential"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}