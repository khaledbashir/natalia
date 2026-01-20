"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectPage() {
  const router = useRouter()

  useEffect(() => {
    // Create a new project and redirect to wizard
    fetch('/api/projects', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_name: 'New Project' })
    })
      .then(r => r.json())
      .then(data => {
        // Redirect to the main wizard (existing page.tsx with the chat/wizard)
        router.push(`/?project=${data.id}`)
      })
      .catch(err => {
        console.error('Failed to create project:', err)
        router.push('/')
      })
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Creating new project...</p>
      </div>
    </div>
  )
}
