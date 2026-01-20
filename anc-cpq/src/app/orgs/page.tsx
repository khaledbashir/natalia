"use client";

import React, { useEffect, useState } from "react";

export default function OrgsPage() {
  const [orgs, setOrgs] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/orgs")
      .then((r) => r.json())
      .then(setOrgs)
      .catch(() => setOrgs([]));
  }, []);

  const create = async () => {
    if (!name) return;
    const r = await fetch(`/api/orgs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (r.ok) {
      const created = await r.json();
      setOrgs((s) => [...s, created]);
      setName("");
    } else {
      alert("Failed to create org");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Organizations</h1>
      <div className="mb-4">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Org name" className="border p-2 mr-2" />
        <button className="btn" onClick={create}>Create</button>
      </div>
      <ul>
        {orgs.map((o:any) => (
          <li key={o.id} className="py-2 border-b"><a href={`/orgs/${o.id}/members`} className="underline">{o.name}</a></li>
        ))}
      </ul>
    </div>
  )
}
