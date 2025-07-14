'use client';
import { useState, useEffect } from "react";
import supabase from "@/supabase/client";
import { useParams } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const fields = [
  { key: "name", label: "Credential Name", type: "text" },
  { key: "host", label: "Host", type: "text" },
  { key: "port", label: "Port", type: "number" },
  { key: "database_name", label: "Database Name", type: "text" },
  { key: "username", label: "Username", type: "text" },
  { key: "password", label: "Password", type: "password" },
  { key: "url", label: "Connection String", type: "text" },
  { key: "database_type", label: "Database Type", type: "text" },
];

interface Credential {
  id: string;
  name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  url: string;
  database_type: string;
  app_id: string;
}

export default function DatabasePage() {
  const params = useParams();
  const appId = params.id as string;
  const [creds, setCreds] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCred, setSelectedCred] = useState<Credential | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<Credential>>({
    name: "",
    host: "",
    port: 5432,
    database_name: "",
    username: "",
    password: "",
    url: "",
    database_type: "postgresql",
  });

  const getCreds = async () => {
    try {
      const { data, error } = await supabase.from('database_credentials')
        .select("*")
        .eq('app_id', appId);

      if (error) throw error;
      setCreds(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appId) {
      getCreds();
    }
  }, [appId]);

  const resetForm = () => {
    setFormData({
      name: "",
      host: "",
      port: 5432,
      database_name: "",
      username: "",
      password: "",
      url: "",
      database_type: "postgresql",
    });
  };

  const handleInputChange = (key: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addCred = async () => {
    if (!formData.name?.trim()) {
      toast.error("Credential name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('database_credentials')
        .insert({
          ...formData,
          app_id: appId,
        });

      if (error) throw error;

      await getCreds();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Database credential added successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCred = async () => {
    if (!selectedCred || !formData.name?.trim()) {
      toast.error("Credential name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('database_credentials')
        .update(formData)
        .eq('id', selectedCred.id);

      if (error) throw error;

      await getCreds();
      setIsEditDialogOpen(false);
      setSelectedCred(null);
      resetForm();
      toast.success("Database credential updated successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCred = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('database_credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await getCreds();
      toast.success("Database credential deleted successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cred: Credential) => {
    setSelectedCred(cred);
    setFormData(cred);
    setIsEditDialogOpen(true);
  };

  const handleView = (cred: Credential) => {
    setSelectedCred(cred);
    setIsViewDialogOpen(true);
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const renderFormFields = () => {
    return fields.map((field) => (
      <div key={field.key} className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={field.key} className="text-right">
          {field.label}
        </Label>
        <div className="col-span-3">
          {field.key === 'url' ? (
            <Textarea
              id={field.key}
              value={formData[field.key as keyof Credential] || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          ) : (
            <Input
              id={field.key}
              type={field.type}
              value={formData[field.key as keyof Credential] || ''}
              onChange={(e) => handleInputChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          )}
        </div>
      </div>
    ));
  };

  const renderViewFields = () => {
    if (!selectedCred) return null;

    return fields.map((field) => (
      <div key={field.key} className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right font-medium">
          {field.label}:
        </Label>
        <div className="col-span-3">
          {field.type === 'password' ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {showPassword ? selectedCred[field.key as keyof Credential] : '••••••••'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          ) : (
            <span className="font-mono text-sm">
              {selectedCred[field.key as keyof Credential] || 'Not set'}
            </span>
          )}
        </div>
      </div>
    ));
  };

  if (loading && creds.length === 0) {
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Database Credentials</h1>
          <p className="text-gray-600">Store your database credentials here!</p>
        </div>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus size={16} />
          Add Credential
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {creds.map((cred) => (
          <Card key={cred.id} className="">
            <CardContent className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{cred.name}</h3>
                <div className="">
                  <p className="text-sm text-gray-600">{cred.host}:{cred.port}</p>
                  {/* <br /> */}
                  <p className="text-sm text-gray-500">Database: {cred.database_name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(cred)}
                >
                  <Eye size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(cred)}
                >
                  <Edit size={16} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        database credential "{cred.name}" from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCred(cred.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {creds.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No database credentials found. Add one to get started!</p>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add Database Credential</DialogTitle>
            <DialogDescription>
              Enter the details for your new database credential.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderFormFields()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCred} disabled={loading}>
              {loading ? 'Adding...' : 'Add Credential'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Database Credential</DialogTitle>
            <DialogDescription>
              Update the details for your database credential.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderFormFields()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateCred} disabled={loading}>
              {loading ? 'Updating...' : 'Update Credential'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>View Database Credential</DialogTitle>
            <DialogDescription>
              Database credential details for "{selectedCred?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderViewFields()}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}