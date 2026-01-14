// Temporarily modify the generate function to use debug endpoint
const handleGenerate = async () => {
    setIsGenerating(true);
    try {
        // Create payload exactly as before
        const payload = {
            client_name: input.clientName,
            screens: input.screens ? input.screens.map((s: any) => ({
                product_class: s.productClass,
                pixel_pitch: s.pixelPitch,
                width_ft: s.widthFt,
                height_ft: s.heightFt,
                is_outdoor: s.environment === 'Outdoor',
                shape: s.shape,
                access: s.access,
                complexity: s.complexity,
                structure_condition: s.structureCondition || 'Existing',
                unit_cost: s.unitCost || 0,
                target_margin: s.targetMargin || 0,
                labor_type: s.laborType || 'NonUnion',
                power_distance: s.powerDistance || 'Close',
                permits: s.permits || 'Client',
                control_system: s.controlSystem || 'Include',
                bond_required: !!s.bondRequired
            })) : [{
                product_class: input.productClass,
                pixel_pitch: input.pixelPitch,
                width_ft: input.widthFt,
                height_ft: input.heightFt,
                is_outdoor: input.environment === 'Outdoor',
                shape: input.shape,
                access: input.access,
                complexity: input.complexity,
                structure_condition: input.structureCondition || 'Existing',
                unit_cost: input.unitCost || 0,
                target_margin: input.targetMargin || 0,
                labor_type: input.laborType || 'NonUnion',
                power_distance: input.powerDistance || 'Close',
                permits: input.permits || 'Client',
                control_system: input.controlSystem || 'Include',
                bond_required: !!input.bondRequired
            }]
        };

        console.log('=== FRONTEND PAYLOAD ===', JSON.stringify(payload, null, 2));

        const genRes = await fetch('/api/generate-debug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await genRes.json();
        console.log('=== BACKEND RESPONSE ===', responseData);

        if (genRes.ok) {
            const downloadRes = await fetch('/api/download/excel');
            if (downloadRes.ok) {
                const blob = await downloadRes.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ANC_Audit_Trail_${input.clientName?.replace(/\s+/g, '_') || 'Proposal'}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } else {
            alert("Excel Generation Failed on Backend");
        }
    } catch (e) {
        console.error('Generation error:', e);
        alert("Error connecting to generator");
    }
};