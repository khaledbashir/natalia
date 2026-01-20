"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MembersPage(){
  const params = useParams();
  const orgId = params.id;
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(()=>{
    fetch(`/api/orgs/${orgId}/members`).then(r=>r.json()).then(d=>setMembers(d.members)).catch(()=>setMembers([]))
  },[orgId])

  const invite = async ()=>{
    if(!email) return;
    const r = await fetch(`/api/orgs/${orgId}/invites`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, role:'member'})
    })
    if(r.ok){
      const res = await r.json();
      alert(`Invite URL: ${res.invite_url}`)
      setEmail("")
    } else {
      alert('Invite failed')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Members</h2>
      <div className="mt-4 mb-4">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="invite email" className="border p-2 mr-2" />
        <button onClick={invite} className="btn">Send Invite</button>
      </div>
      <ul>
        {members.map((m:any)=> (
          <li key={m.email} className="py-2 border-b">{m.full_name || m.email} <span className="text-sm text-gray-500">({m.role})</span></li>
        ))}
      </ul>
    </div>
  )
}
