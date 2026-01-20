"use client";

import React, {useState} from 'react';
import { useParams } from 'next/navigation';

export default function UploadMaster(){
  const params = useParams();
  const orgId = params.id;
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async ()=>{
    if(!file) return alert('Choose a file first');
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('org_id', orgId);
    const r = await fetch('/api/upload-master', {method:'POST', body: fd});
    if(r.ok){
      const j = await r.json();
      setReport(j.report);
    } else {
      const t = await r.json();
      alert('Upload failed: '+(t.detail||'unknown'))
    }
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Upload Master Excel</h2>
      <p className="text-sm text-gray-500 mb-4">Upload your organization's Master Excel to validate and attach it to the org.</p>
      <input type="file" accept=".xlsx" onChange={(e:any)=>setFile(e.target.files[0])} />
      <div className="mt-4">
        <button className="btn" onClick={upload} disabled={loading}>{loading? 'Uploading...' : 'Upload & Validate'}</button>
      </div>

      {report && (
        <div className="mt-6">
          <h3 className="font-semibold">Validation Report</h3>
          <pre className="bg-gray-100 p-4 mt-2 overflow-auto">{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
