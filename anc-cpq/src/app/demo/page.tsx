"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, FileText, LayoutDashboard, Mail, RefreshCw, Smartphone } from "lucide-react"

export default function DemoPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [emailAddr, setEmailAddr] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((d) => {
        setProjects(d)
        // Auto-select demo if exists
        const demo = d.find((p: any) => p.client_name && p.client_name.toLowerCase().includes('demo'))
        if (demo) setSelected(demo)
      })
      .catch(() => setProjects([]))
  }, [])

  const selectProject = (p: any) => setSelected(p)

  const runGenerate = async () => {
    if (!selected) return
    setLoading(true)
    setStatus('Generating proposal assets...')
    
    try {
      const payload = {
        client_name: selected.client_name || 'Demo Client',
        screens: [
            {product_class: 'Ribbon', pixel_pitch: 10, width_ft: 40, height_ft: 6, is_outdoor: true},
            {product_class: 'Scoreboard', pixel_pitch: 6, width_ft: 30, height_ft: 16, is_outdoor: false}
        ],
        service_level: 'bronze',
        timeline: 'standard'
      }
      
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (r.ok) {
        setStatus('Success: PDF & Excel generated')
      } else {
        const j = await r.json()
        setStatus('Error: ' + (j.detail || 'Unknown error'))
      }
    } catch (e) {
      setStatus('Error: Network failed')
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!selected || !emailAddr) return
    setLoading(true)
    setStatus('Sending email...')
    
    try {
        const payload = {
            client_name: selected.client_name || 'Demo Client',
            recipient_email: emailAddr,
            screens: [
              {product_class: 'Ribbon', pixel_pitch: 10, width_ft: 40, height_ft: 6, is_outdoor: true}
            ]
          }
      
      const r = await fetch('/api/send-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const j = await r.json()
      if (r.ok) setStatus('Email sent to ' + emailAddr)
      else setStatus('Error: ' + (j.detail || JSON.stringify(j)))
    } catch (e) {
      setStatus('Error: Failed to send')
    } finally {
      setLoading(false)
    }
  }

  const openLink = (url: string) => window.open(url, '_blank')

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Dashboard</h1>
          <p className="text-muted-foreground mt-2">Test the full proposal lifecycle from generation to delivery.</p>
        </div>
        <Badge variant={selected ? "default" : "secondary"} className="text-sm px-4 py-1">
          {selected ? `Active: ${selected.client_name}` : 'No Project Selected'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Selector - Left Column */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><LayoutDashboard className="h-5 w-5"/> Projects</CardTitle>
                    <CardDescription>Select a project to work on</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] overflow-y-auto space-y-2">
                    {projects.length === 0 && <div className="text-sm text-center py-8 text-muted-foreground">No projects found</div>}
                    {projects.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => selectProject(p)}
                            className={`p-3 rounded-md cursor-pointer border transition-all hover:bg-accent ${selected?.id === p.id ? 'bg-accent border-primary ring-1 ring-primary' : 'bg-card'}`}
                        >
                            <div className="font-medium">{p.client_name}</div>
                            <div className="text-xs text-muted-foreground">ID: {p.id} • {new Date().toLocaleDateString()}</div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Actions - Middle & Right Column */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Status Panel */}
            {status && (
                <div className={`p-4 rounded-md border flex items-center gap-3 ${status.includes('Error') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-700'}`}>
                    {status.includes('Error') ? <AlertCircle className="h-5 w-5"/> : <CheckCircle2 className="h-5 w-5"/>}
                    <span className="font-medium">{status}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generation Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">1. Asset Generation</CardTitle>
                        <CardDescription>Create PDF and Excel files from project data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded">
                            Simulated Scope:
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>40x6' Indoor Ribbon (10mm)</li>
                                <li>30x16' Outdoor Scoreboard (6mm)</li>
                            </ul>
                        </div>
                        <Button 
                            onClick={runGenerate} 
                            disabled={!selected || loading} 
                            className="w-full"
                        >
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                            Generate Proposal Assets
                        </Button>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openLink('/api/download/pdf')} className="flex-1">
                            <FileText className="mr-2 h-4 w-4 text-red-500"/> View PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openLink('/api/download/excel')} className="flex-1">
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600"/> View Excel
                        </Button>
                    </CardFooter>
                </Card>

                {/* Delivery Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">2. Delivery</CardTitle>
                        <CardDescription>Send the proposal to the client</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Recipient Email</label>
                            <input 
                                type="email" 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="client@example.com"
                                value={emailAddr}
                                onChange={e => setEmailAddr(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={sendEmail} 
                            disabled={!selected || !emailAddr || loading}
                            className="w-full"
                        >
                            <Mail className="mr-2 h-4 w-4"/>
                            Send Proposal Email
                        </Button>
                    </CardContent>
                    <CardFooter>
                         <div className="text-xs text-muted-foreground">
                            Note: This will use the configured SMTP server to send the actual files generated in step 1.
                         </div>
                    </CardFooter>
                </Card>
            </div>
            
            {/* Debug Data */}
            <Card className="opacity-80">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Raw Project Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto max-h-[200px]">
                        {selected ? JSON.stringify(selected, null, 2) : '// No project data loaded'}
                    </pre>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  )
}
