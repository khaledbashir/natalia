'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';

interface PreviewProps {
  input: any;
  result: any;
  projectId?: number;
  onUpdateField?: (field: any, value: any) => void;
  initialShowPricing?: boolean;
}

export default function Preview({ input, result, projectId, onUpdateField }: PreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      console.log('=== STARTING GENERATION ===');
      console.log('Input data:', input);
      console.log('Result data:', result);

      // Create payload exactly as the API expects
      const payload = {
        client_name: input.clientName,
        screens: input.screens ? input.screens.map((s: any) => ({
          product_class: s.productClass,
          pixel_pitch: s.pixelPitch,
          width_ft: s.widthFt,
          height_ft: s.heightFt,
          indoor: s.environment === 'Indoor',
          mounting_type: s.mountingType,
          structure_condition: s.structureCondition || 'Existing',
          labor_type: s.laborType || 'NonUnion',
          power_distance: s.powerDistance || 'Close',
          target_margin: s.targetMargin || 0,
          venue_type: s.venueType || 'corporate'
        })) : [{
          product_class: input.productClass,
          pixel_pitch: input.pixelPitch,
          width_ft: input.widthFt,
          height_ft: input.heightFt,
          indoor: input.environment === 'Indoor',
          mounting_type: input.mountingType,
          structure_condition: input.structureCondition || 'Existing',
          labor_type: input.laborType || 'NonUnion',
          power_distance: input.powerDistance || 'Close',
          target_margin: input.targetMargin || 0,
          venue_type: input.venueType || 'corporate'
        }],
        service_level: input.serviceLevel || 'bronze',
        timeline: input.timeline || 'standard',
        permits: input.permits || 'client',
        control_system: input.controlSystem || 'include',
        bond_required: !!input.bondRequired
      };

      console.log('=== PAYLOAD BEING SENT ===', JSON.stringify(payload, null, 2));

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('=== GENERATION RESPONSE ===', genRes.status, genRes.statusText);

      if (genRes.ok) {
        console.log('✅ Generation successful, downloading Excel...');
        
        const downloadRes = await fetch('/api/download/excel');
        console.log('=== DOWNLOAD RESPONSE ===', downloadRes.status, downloadRes.statusText);
        
        if (downloadRes.ok) {
          console.log('✅ Download successful, creating blob...');
          
          const blob = await downloadRes.blob();
          console.log('✅ Blob created, size:', blob.size, 'bytes');
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ANC_Audit_Trail_${input.clientName?.replace(/\s+/g, '_') || 'Proposal'}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          console.log('✅ Excel download initiated successfully!');
        } else {
          console.error('❌ Download failed:', downloadRes.status, downloadRes.statusText);
          const errorText = await downloadRes.text();
          console.error('Download error response:', errorText);
          alert("Excel Download Failed on Backend");
        }
      } else {
        const errorData = await genRes.text();
        console.error('❌ Generation failed:', genRes.status, genRes.statusText);
        console.error('Generation error response:', errorData);
        alert("Excel Generation Failed on Backend");
      }
    } catch (e) {
      console.error('❌ Major error in generation:', e);
      alert("Error connecting to generator");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input_data: input, 
          result_data: result,
          project_id: projectId 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.shareUrl);
        setShowShareModal(true);
      } else {
        alert('Failed to create share link');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating share link');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !result}
        className="flex items-center gap-2"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export Excel
      </Button>

      <Button
        onClick={handleShare}
        disabled={isSharing || !result}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isSharing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        Share
      </Button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Share Proposal</h3>
            <p className="text-sm text-gray-600 mb-4">Share this proposal with your team:</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-2 border rounded text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                size="sm"
              >
                Copy
              </Button>
            </div>
            <Button
              onClick={() => setShowShareModal(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};