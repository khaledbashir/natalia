"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MasterSheetPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-master", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setUploadStatus("success");
        setMessage("Master sheet uploaded and validated successfully!");
      } else {
        setUploadStatus("error");
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      setUploadStatus("error");
      setMessage("Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-8 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Sheet</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your pricing catalog
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl">
          {/* Upload Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload Master Excel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="master-file">Excel File</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    id="master-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload your master pricing sheet with tabs: Hardware,
                  Structural, Labor, Shipping, Finance, Summary
                </p>
              </div>

              {uploadStatus !== "idle" && (
                <Alert
                  variant={uploadStatus === "success" ? "default" : "destructive"}
                >
                  {uploadStatus === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Current Master Sheet */}
          <Card>
            <CardHeader>
              <CardTitle>Current Master Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">
                      master_excel_realistic_dummy.xlsx
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded on{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Sheet Tabs:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Metadata",
                    "Hardware",
                    "Structural",
                    "Labor",
                    "Shipping",
                    "Misc",
                    "Finance",
                    "Summary",
                  ].map((tab) => (
                    <div
                      key={tab}
                      className="flex items-center gap-2 px-3 py-2 bg-muted rounded text-sm"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
