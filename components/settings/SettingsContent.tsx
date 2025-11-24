"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ExternalLink } from "lucide-react";

interface SettingsContentProps {
  apiToken?: string;
  email?: string;
  name?: string;
}

export function SettingsContent({
  apiToken,
  email,
  name,
}: SettingsContentProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (apiToken) {
      await navigator.clipboard.writeText(apiToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and API settings
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email || ""} disabled />
          </div>
        </CardContent>
      </Card>

      {/* API Token */}
      <Card>
        <CardHeader>
          <CardTitle>API Token</CardTitle>
          <CardDescription>
            Use this token in the VS Code extension to sync your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiToken">Your API Token</Label>
            <div className="flex gap-2">
              <Input
                id="apiToken"
                value={apiToken || "No token available"}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                disabled={!apiToken}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Keep this token secure. Anyone with this token can send data to
              your account.
            </p>
          </div>
          <div>
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() =>
                window.open(
                  "https://marketplace.visualstudio.com/items?itemName=Mukulrai.miss-minutes",
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Install VS Code Extension
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Extension Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Extension Setup</CardTitle>
          <CardDescription>
            How to configure the VS Code extension
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Click the button above to install the Miss-Minutes extension from
              VS Code Marketplace
            </li>
            <li>
              In VS Code, run the command &quot;Miss-Minutes: Set API Key&quot;
              (Cmd/Ctrl + Shift + P)
            </li>
            <li>Paste your API token from above</li>
            <li>
              Start coding and your activity will be tracked automatically!
            </li>
          </ol>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Quick Setup:</p>
            <code className="text-xs bg-background px-2 py-1 rounded">
              1. Copy API token → 2. Open VS Code → 3. Press Cmd/Ctrl+Shift+P →
              4. Type &quot;Miss-Minutes: Set API Key&quot; → 5. Paste token
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete all data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your coding activity data
              </p>
            </div>
            <Button variant="destructive">Delete Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
