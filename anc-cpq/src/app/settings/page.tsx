"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Palette, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization and system preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl">
          <Tabs defaultValue="organization" className="space-y-6">
            <TabsList>
              <TabsTrigger value="organization" className="gap-2">
                <Building2 className="h-4 w-4" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-2">
                <Palette className="h-4 w-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="smtp" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Key className="h-4 w-4" />
                API
              </TabsTrigger>
            </TabsList>

            {/* Organization Settings */}
            <TabsContent value="organization">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      defaultValue="ANC Sports Enterprises"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-email">Contact Email</Label>
                    <Input
                      id="org-email"
                      type="email"
                      defaultValue="demo@anc.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-address">Address</Label>
                    <Input
                      id="org-address"
                      defaultValue="123 LED Street, Sports City, SC 12345"
                      className="mt-2"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Settings */}
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logo Upload</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recommended: SVG or PNG, max 2MB
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="primary-color"
                        type="color"
                        defaultValue="#3b82f6"
                        className="w-20 h-10"
                      />
                      <Input
                        defaultValue="#3b82f6"
                        className="flex-1"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <Button>Save Branding</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SMTP Settings */}
            <TabsContent value="smtp">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.gmail.com"
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-port">Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        placeholder="587"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp-user">Username</Label>
                      <Input
                        id="smtp-user"
                        placeholder="your-email@domain.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="smtp-pass">Password</Label>
                    <Input
                      id="smtp-pass"
                      type="password"
                      placeholder="Your SMTP password"
                      className="mt-2"
                    />
                  </div>
                  <Button>Save Email Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Settings */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Salesforce Connected</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        readOnly
                        value="Not connected"
                        className="flex-1"
                      />
                      <Button variant="outline">Connect</Button>
                    </div>
                  </div>
                  <div>
                    <Label>API Access Token</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        readOnly
                        value="••••••••••••••••••••"
                        className="flex-1"
                      />
                      <Button variant="outline">Regenerate</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
