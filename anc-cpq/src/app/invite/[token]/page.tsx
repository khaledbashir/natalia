"use client";

import React, {useState, useEffect} from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function InviteAccept(){
  const params = useParams();
  const token = params.token;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('')

  const accept = async ()=>{
    const r = await fetch('/api/invite/accept', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({token, email, full_name: name})})
    if(r.ok){
      const j = await r.json()
      setStatus('Invite accepted. Your API key: '+j.user.api_key)
    } else {
      const t = await r.json()
      setStatus('Error: '+(t.detail || 'unknown'))
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Accept Invite</h2>
      <p className="mb-4">Token: <code>{token}</code></p>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your email" className="border p-2 mr-2" />
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="full name" className="border p-2 mr-2" />
      <button onClick={accept} className="btn">Accept Invite</button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  )
}
