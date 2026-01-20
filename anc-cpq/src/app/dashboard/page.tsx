"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, DollarSign, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, revenue: 0 })

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((d) => {
        setProjects(d || [])
        // Calculate stats
        const now = new Date()
        const thisMonth = d.filter((p: any) => {
          const created = new Date(p.created_at)
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        })
        setStats({
          total: d.length,
          thisMonth: thisMonth.length,
          revenue: 0 // TODO: sum from project totals
        })
      })
      .catch(() => setProjects([]))
  }, [])

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening.</p>
        </div>
        <Link href="/new-project">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—%</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
              <Link href="/new-project">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 10).map((p) => (
                <Link key={p.id} href={`/project/${p.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <div>
                      <div className="font-medium">{p.client_name || 'Untitled Project'}</div>
                      <div className="text-sm text-muted-foreground">
                        Created {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">ID: {p.id}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
