"use client";

import React, {useEffect, useState} from 'react'

export default function DemoPage(){
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [status, setStatus] = useState('')

  useEffect(()=>{
    fetch('/api/projects').then(r=>r.json()).then((d)=>setProjects(d)).catch(()=>setProjects([]))
  },[])

  const pickDemo = ()=>{
    const demo = projects.find(p=>p.client_name && p.client_name.toLowerCase().includes('demo')) || projects[0]
    setSelected(demo)
  }

  const runGenerate = async ()=>{
    if(!selected) return alert('Select a project first')
    setStatus('Generating...')
    // Create a simple payload based on selected state or a default
    const payload = {
      client_name: selected.client_name || 'Demo Client',
      screens: [
        {product_class: 'Ribbon', pixel_pitch: 10, width_ft: 40, height_ft: 6, is_outdoor: true},
        {product_class: 'Scoreboard', pixel_pitch: 6, width_ft: 30, height_ft: 16, is_outdoor: false}
      ],
      service_level: 'bronze',
      timeline: 'standard'
    }
    const r = await fetch('/api/generate', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    const j = await r.json()
    if(r.ok) setStatus('Generation complete: files created')
    else setStatus('Error: '+(j.detail||JSON.stringify(j)))
  }

  const [emailAddr, setEmailAddr] = useState('')
  const sendEmail = async ()=>{
    if(!selected) return alert('Select a project first')
    if(!emailAddr) return alert('Enter an email address')
    setStatus('Sending...')
    const payload = {
      client_name: selected.client_name || 'Demo Client',
      recipient_email: emailAddr,
      screens: [
        {product_class: 'Ribbon', pixel_pitch: 10, width_ft: 40, height_ft: 6, is_outdoor: true}
      ]
    }
    const r = await fetch('/api/send-proposal', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    const j = await r.json()
    if(r.ok) setStatus('Sent: '+j.outbox)
    else setStatus('Error: '+(j.detail||JSON.stringify(j)))
  }

  const downloadPdf = ()=> window.open('/api/download/pdf', '_blank')
  const downloadExcel = ()=> window.open('/api/download/excel', '_blank')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Demo Project</h1>

      <div className="mt-4">
        <button className="btn mr-2" onClick={pickDemo}>Select Demo Project</button>
        <button className="btn mr-2" onClick={runGenerate}>Run Generate (Create PDF/Excel)</button>
        <button className="btn mr-2" onClick={downloadPdf}>Download PDF</button>
        <button className="btn" onClick={downloadExcel}>Download Excel</button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Selected Project</h3>
        <pre className="bg-gray-100 p-4 mt-2">{selected? JSON.stringify(selected, null, 2) : 'No project selected'}</pre>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Status</h3>
        <p className="mt-2">{status}</p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">All Projects</h3>
        <ul className="list-disc pl-6 mt-2">
          {projects.map(p=> <li key={p.id}>{p.client_name} (id: {p.id})</li>)}
        </ul>
      </div>
    </div>
  )
}
