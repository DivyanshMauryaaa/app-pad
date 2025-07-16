'use client'

import { useState, useEffect } from "react";
import supabase from "@/supabase/client";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Brand {
    id: string;
    app_id: string;
    logo_url: string;
    banner_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    created_at: string;
    updated_at: string;
}

const AppBranding = () => {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [app, setApp] = useState<any>({})
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        primary_color: '',
        secondary_color: '',
        accent_color: '',
        logo_file: null as File | null,
        banner_file: null as File | null,
    });
    const params = useParams();
    const appId = params.id;

    const makeBrand = async () => {
        try {
            const { data, error } = await supabase.from('brand')
                .insert({
                    app_id: appId,
                    logo_url: '',
                    banner_url: '',
                    primary_color: '#3b82f6',
                    secondary_color: '#64748b',
                    accent_color: '#06b6d4'
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating brand:', error);
                return;
            }

            setBrand(data);
            console.log('Brand created successfully:', data);
        } catch (error) {
            console.error('Error creating brand:', error);
        } finally {
            setLoading(false);
        }
    }

    const getCurrentApp = async () => {
        const { data } = await supabase.from('apps').select('*')
        .eq('id', appId).single();

        setApp(data);
    }

    const getBranding = async () => {
        try {
            const { data, error } = await supabase.from('brand')
                .select("*")
                .eq('app_id', appId)
                .single();

            if (error) {
                console.error('Error fetching branding:', error);
                // If no brand exists, create one
                if (error.code === 'PGRST116') {
                    await makeBrand();
                    return;
                }
                return;
            }

            setBrand(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const uploadFile = async (file: File, type: 'logo' | 'banner'): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${appId}_${type}_${Date.now()}.${fileExt}`;
            const filePath = `branding/${fileName}`;

            const { data, error } = await supabase.storage
                .from('app-assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('Upload error:', error);
                return null;
            }

            const { data: publicData } = supabase.storage
                .from('app-assets')
                .getPublicUrl(filePath);

            return publicData.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    };

    const handleSave = async () => {
        if (!brand) return;

        setEditLoading(true);
        try {
            let logoUrl = brand.logo_url;
            let bannerUrl = brand.banner_url;

            // Upload logo if selected
            if (formData.logo_file) {
                const uploadedLogoUrl = await uploadFile(formData.logo_file, 'logo');
                if (uploadedLogoUrl) logoUrl = uploadedLogoUrl;
            }

            // Upload banner if selected
            if (formData.banner_file) {
                const uploadedBannerUrl = await uploadFile(formData.banner_file, 'banner');
                if (uploadedBannerUrl) bannerUrl = uploadedBannerUrl;
            }

            const { data, error } = await supabase.from('brand')
                .update({
                    logo_url: logoUrl,
                    banner_url: bannerUrl,
                    primary_color: formData.primary_color || brand.primary_color,
                    secondary_color: formData.secondary_color || brand.secondary_color,
                    accent_color: formData.accent_color || brand.accent_color,
                    updated_at: new Date().toISOString()
                })
                .eq('id', brand.id)
                .select()
                .single();

            if (error) {
                console.error('Update error:', error);
                toast.error("Failed to update branding");
                return;
            }

            setBrand(data);
            setDialogOpen(false);
            setFormData({
                primary_color: '',
                secondary_color: '',
                accent_color: '',
                logo_file: null,
                banner_file: null,
            });
            
            toast.success("Branding updated successfully");

        } catch (error) {
            console.error('Save error:', error);
            toast.error("Failed to update branding");
        } finally {
            setEditLoading(false);
        }
    };

    const handleOpenDialog = () => {
        if (brand) {
            setFormData({
                primary_color: brand.primary_color,
                secondary_color: brand.secondary_color,
                accent_color: brand.accent_color,
                logo_file: null,
                banner_file: null,
            });
        }
        setDialogOpen(true);
    };

    useEffect(() => {
        if (appId) {
            getBranding();
            getCurrentApp();
        }
    }, [appId]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
                    <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 bg-gray-200 rounded-lg"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-500">No branding found for this app</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Edit Button */}
            <div className="flex justify-end mb-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
                            <Edit2 className="h-4 w-4" />
                            Edit Branding
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit App Branding</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo Image</Label>
                                <div className="flex items-center gap-4">
                                    {brand.logo_url && (
                                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                                            <Image
                                                src={brand.logo_url}
                                                alt="Current logo"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({...formData, logo_file: e.target.files?.[0] || null})}
                                        />
                                    </div>
                                </div>
                                {formData.logo_file && (
                                    <p className="text-sm text-gray-500">Selected: {formData.logo_file.name}</p>
                                )}
                            </div>

                            {/* Banner Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="banner">Banner Image</Label>
                                <div className="flex items-center gap-4">
                                    {brand.banner_url && (
                                        <div className="relative h-16 w-24 overflow-hidden rounded-lg border">
                                            <Image
                                                src={brand.banner_url}
                                                alt="Current banner"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Input
                                            id="banner"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({...formData, banner_file: e.target.files?.[0] || null})}
                                        />
                                    </div>
                                </div>
                                {formData.banner_file && (
                                    <p className="text-sm text-gray-500">Selected: {formData.banner_file.name}</p>
                                )}
                            </div>

                            {/* Color Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary">Primary Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="primary"
                                            type="color"
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                                            className="w-12 h-10 p-1 border rounded"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.primary_color}
                                            onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                                            placeholder="#3b82f6"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="secondary">Secondary Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="secondary"
                                            type="color"
                                            value={formData.secondary_color}
                                            onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                                            className="w-12 h-10 p-1 border rounded"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.secondary_color}
                                            onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                                            placeholder="#64748b"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accent">Accent Color</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="accent"
                                            type="color"
                                            value={formData.accent_color}
                                            onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                                            className="w-12 h-10 p-1 border rounded"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.accent_color}
                                            onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                                            placeholder="#06b6d4"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={editLoading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={editLoading}
                                >
                                    {editLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Banner Section */}
            <div className="relative mb-8">
                {brand.banner_url ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={brand.banner_url}
                            alt="App Banner"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                ) : (
                    <div 
                        className="h-48 w-full rounded-lg shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: brand.primary_color || '#f3f4f6' }}
                    >
                        <p className="text-white/80 font-medium">No banner image</p>
                    </div>
                )}
            </div>

            {/* Logo and Brand Info Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="flex-shrink-0">
                    {brand.logo_url ? (
                        <div className="relative h-20 w-20 overflow-hidden rounded-lg shadow-md border-2 border-white bg-white">
                            <Image
                                src={brand.logo_url}
                                alt="App Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div 
                            className="h-20 w-20 rounded-lg shadow-md border-2 border-white flex items-center justify-center"
                            style={{ backgroundColor: brand.secondary_color || '#e5e7eb' }}
                        >
                            <span className="text-white font-bold text-xl">
                                {brand.app_id?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Brand Details */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">{app.name}</h1>
                    <p className="text-gray-600 mb-4">{app.description}</p>
                    
                    {/* Color Palette */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Color Palette</h3>
                            <div className="flex flex-wrap gap-3">
                                {brand.primary_color && (
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                                            style={{ backgroundColor: brand.primary_color }}
                                        ></div>
                                        <div>
                                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                                            <p className="text-xs text-gray-500 mt-1">{brand.primary_color}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {brand.secondary_color && (
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                                            style={{ backgroundColor: brand.secondary_color }}
                                        ></div>
                                        <div>
                                            <Badge variant="secondary" className="text-xs">Secondary</Badge>
                                            <p className="text-xs text-gray-500 mt-1">{brand.secondary_color}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {brand.accent_color && (
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                                            style={{ backgroundColor: brand.accent_color }}
                                        ></div>
                                        <div>
                                            <Badge variant="secondary" className="text-xs">Accent</Badge>
                                            <p className="text-xs text-gray-500 mt-1">{brand.accent_color}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Card */}
            <Card className="mt-8">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Brand Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Created:</span>
                            <p className="font-medium">
                                {brand.created_at ? new Date(brand.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Last Updated:</span>
                            <p className="font-medium">
                                {brand.updated_at ? new Date(brand.updated_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">App ID:</span>
                            <p className="font-medium font-mono">{brand.app_id}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Brand ID:</span>
                            <p className="font-medium font-mono">{brand.id}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AppBranding;