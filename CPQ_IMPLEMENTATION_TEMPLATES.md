# CPQ Customization: Implementation Code Templates

**Quick-start code snippets for each of the 5 customization requirements.**

---

## 1. DOCUMENT PREVIEW PANE (UI Customization)

### Step 1: Create the Preview Component

**File:** `/anc-cpq/src/components/DocumentPreviewPane.tsx`

```tsx
'use client';
import React from 'react';
import { CPQInput, CalculationResult } from '../lib/types';
import { FileText, Eye, Download } from 'lucide-react';

interface DocumentPreviewPaneProps {
  input: CPQInput;
  result: CalculationResult;
}

export function DocumentPreviewPane({ input, result }: DocumentPreviewPaneProps) {
  const [showMockup, setShowMockup] = React.useState(true);
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white border-l border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-slate-600" />
          <h2 className="font-semibold text-slate-800">Document Preview</h2>
        </div>
        <button
          onClick={() => setShowMockup(!showMockup)}
          className="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
        >
          {showMockup ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {showMockup && (
          <div className="bg-white rounded-lg shadow-md p-6 text-sm space-y-4">
            {/* Mock Document */}
            <div className="border-b pb-4">
              <div className="text-xs text-slate-500 font-semibold">DOCUMENT PREVIEW</div>
              <h3 className="text-lg font-bold text-blue-900 mt-2">ANC SALES PROPOSAL</h3>
            </div>
            
            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">CLIENT</div>
                <div className="text-slate-900 font-medium">{input.clientName || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">PROJECT</div>
                <div className="text-slate-900 font-medium">{input.projectName || '—'}</div>
              </div>
            </div>
            
            {/* Specs */}
            <div className="bg-slate-50 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Product:</span>
                <span className="font-medium">{input.productClass} {input.pixelPitch}mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Dimensions:</span>
                <span className="font-medium">{input.widthFt}' W × {input.heightFt}' H</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Environment:</span>
                <span className="font-medium">{input.environment}</span>
              </div>
            </div>
            
            {/* Pricing Preview */}
            <div className="border-t pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Hardware:</span>
                <span className="font-medium">${result.hardwareCost?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Structural:</span>
                <span className="font-medium">${result.structuralCost?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Labor:</span>
                <span className="font-medium">${result.laborCost?.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>TOTAL:</span>
                <span className="text-blue-900">${result.sellPrice?.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Status */}
            <div className="bg-green-50 border border-green-200 rounded p-3 text-xs">
              <div className="text-green-900 font-semibold">✓ Ready to Download</div>
              <div className="text-green-700 text-xs mt-1">
                Document is current as of this moment. Generate PDF/Excel to finalize.
              </div>
            </div>
          </div>
        )}
        
        {!showMockup && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <Eye size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Preview hidden</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 2: Inject into Main Page

**File:** `/anc-cpq/src/app/page.tsx`

Replace the layout section (around line 70):
```tsx
// OLD:
<main className="flex h-screen w-full overflow-hidden font-sans">
  <div className="w-[40%] h-full shrink-0 z-10 relative shadow-2xl bg-slate-950 flex flex-col">
    {/* Wizard Panel */}
  </div>
  <div className="flex-1 h-full overflow-hidden bg-slate-50 flex flex-col relative">
    {/* Preview Panel */}
  </div>
</main>

// NEW:
<main className="flex h-screen w-full overflow-hidden font-sans">
  <div className="w-[35%] h-full shrink-0 z-10 relative shadow-2xl bg-slate-950 flex flex-col">
    {/* Wizard Panel */}
  </div>
  <div className="w-[25%] h-full overflow-hidden bg-slate-50 flex flex-col border-r border-slate-200">
    <DocumentPreviewPane input={input} result={result} />
  </div>
  <div className="flex-1 h-full overflow-hidden bg-white flex flex-col">
    {/* Detailed Preview/Export Panel */}
  </div>
</main>
```

---

## 2. STRUCTURED OUTPUT + CALCULATION MIDDLEWARE

### Step 1: Backend Calculation Middleware

**File:** `/src/calculation_middleware.py`

```python
"""
Calculation Middleware
Bridges extracted JSON parameters → Complex formulas → Structured results
"""

from dataclasses import dataclass
from typing import Dict, Any, List
from calculator import CPQCalculator, CPQInput
import json

@dataclass
class CalculationWarning:
    """Track formula evaluation issues"""
    field: str
    issue: str
    value: Any

class CalculationMiddleware:
    """
    Intercepts extracted parameters, applies business formulas,
    returns structured data for client-facing output.
    """
    
    def __init__(self, calculator: CPQCalculator):
        self.calc = calculator
        self.warnings: List[CalculationWarning] = []
    
    def process(self, extracted_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main processing pipeline:
        1. Validate extracted params
        2. Apply complex formulas
        3. Return structured result
        """
        
        try:
            # Step 1: Convert to CPQInput
            input_obj = self._build_cpq_input(extracted_params)
            
            # Step 2: Apply calculation-specific validations
            self._validate_formula_constraints(input_obj)
            
            # Step 3: Run main calculator
            base_result = self.calc.calculate(input_obj)
            
            # Step 4: Apply labor union formulas (complex business logic)
            labor_adjustment = self._calculate_union_premium(input_obj)
            
            # Step 5: Apply environmental adjustments
            env_adjustment = self._calculate_environmental_factors(input_obj)
            
            # Step 6: Contingency & risk premium
            contingency = self._calculate_contingency(input_obj, base_result)
            
            # Step 7: Margin calculation
            final_result = self._apply_margin(
                base_result,
                labor_adjustment,
                env_adjustment,
                contingency,
                input_obj
            )
            
            return {
                'success': True,
                'extracted_variables': extracted_params,
                'calculations': {
                    'base_cost': base_result['total_cost'],
                    'labor_adjustment': labor_adjustment,
                    'environmental_adjustment': env_adjustment,
                    'contingency': contingency,
                    'final_cost': final_result['total_cost']
                },
                'pricing': {
                    'cost_total': final_result['cost_total'],
                    'margin_amount': final_result['margin_amount'],
                    'sell_price': final_result['sell_price'],
                    'grand_total': final_result['grand_total']
                },
                'warnings': [
                    {'field': w.field, 'issue': w.issue, 'value': w.value}
                    for w in self.warnings
                ]
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'extracted_variables': extracted_params
            }
    
    def _build_cpq_input(self, params: Dict) -> CPQInput:
        """Map extracted JSON to CPQInput"""
        return CPQInput(
            clientName=params.get('clientName', 'Unknown'),
            address=params.get('address', ''),
            projectName=params.get('projectName', ''),
            productClass=params.get('productClass', 'Scoreboard'),
            widthFt=float(params.get('widthFt', 20)),
            heightFt=float(params.get('heightFt', 6)),
            pixelPitch=float(params.get('pixelPitch', 10)),
            environment=params.get('environment', 'Indoor'),
            shape=params.get('shape', 'Flat'),
            access=params.get('access', 'Front'),
            complexity=params.get('complexity', 'Standard'),
            structureCondition=params.get('structureCondition', 'Existing'),
            laborType=params.get('laborType', 'NonUnion'),
            mountingType=params.get('mountingType', 'Wall'),
            powerDistance=params.get('powerDistance', 'Medium'),
            permits=params.get('permits', 'Client'),
            controlSystem=params.get('controlSystem', 'Include'),
            bondRequired=params.get('bondRequired', False),
            targetMargin=float(params.get('targetMargin', 30))
        )
    
    def _validate_formula_constraints(self, input_obj: CPQInput):
        """Business rule validations"""
        if input_obj.widthFt > 100:
            self.warnings.append(
                CalculationWarning(
                    field='widthFt',
                    issue='Unusual width (>100ft); recommend structural review',
                    value=input_obj.widthFt
                )
            )
        
        if input_obj.environment == 'Outdoor' and input_obj.structureCondition == 'Existing':
            self.warnings.append(
                CalculationWarning(
                    field='structureCondition',
                    issue='Outdoor displays on existing structures need structural engineering',
                    value='Existing'
                )
            )
    
    def _calculate_union_premium(self, input_obj: CPQInput) -> float:
        """
        Complex formula: Union labor multiplier
        Rule: Union labor = 1.50x base + prevailing wage + benefits
        """
        if input_obj.laborType == 'NonUnion':
            return 0.0
        
        base_rate = 50  # $/hour (simplified)
        hours_estimate = (input_obj.widthFt * input_obj.heightFt) / 50  # 1 person-hour per 50 sq ft
        
        if input_obj.laborType == 'Union':
            multiplier = 1.50
            benefits = 0.20  # 20% benefits load
        elif input_obj.laborType == 'Prevailing':
            multiplier = 1.75
            benefits = 0.25
        else:
            return 0.0
        
        premium = (base_rate * hours_estimate * multiplier) + (base_rate * hours_estimate * benefits)
        return premium
    
    def _calculate_environmental_factors(self, input_obj: CPQInput) -> float:
        """
        Environmental adjustment:
        Outdoor = +5% structural
        Curved = +8% labor/installation
        Rear access = +3% complexity
        """
        adjustment = 1.0
        
        if input_obj.environment == 'Outdoor':
            adjustment *= 1.05
        
        if input_obj.shape == 'Curved':
            adjustment *= 1.08
        
        if input_obj.access == 'Rear':
            adjustment *= 1.03
        
        return adjustment
    
    def _calculate_contingency(self, input_obj: CPQInput, base_result: Dict) -> float:
        """
        Risk-based contingency:
        High complexity + outdoor + new steel = higher contingency
        """
        contingency_pct = 0.05  # Base 5%
        
        if input_obj.complexity == 'High':
            contingency_pct += 0.05
        
        if input_obj.environment == 'Outdoor':
            contingency_pct += 0.03
        
        if input_obj.structureCondition == 'NewSteel':
            contingency_pct += 0.05
        
        return base_result['total_cost'] * contingency_pct
    
    def _apply_margin(self, base_result, labor_adj, env_adj, contingency, input_obj) -> Dict:
        """Final pricing with margin"""
        adjusted_cost = (
            base_result['total_cost'] * env_adj +
            labor_adj +
            contingency
        )
        
        target_margin = input_obj.targetMargin / 100
        sell_price = adjusted_cost / (1 - target_margin)
        
        return {
            'cost_total': adjusted_cost,
            'margin_amount': sell_price - adjusted_cost,
            'sell_price': sell_price,
            'grand_total': sell_price * 1.095  # Sales tax
        }
```

### Step 2: API Endpoint

**File:** `/src/api_routes.py` (add to existing)

```python
from calculation_middleware import CalculationMiddleware

middleware = CalculationMiddleware(calculator)

@app.post("/api/calculate-with-formulas")
async def calculate_with_formulas(config: WizardConfig):
    """
    POST /api/calculate-with-formulas
    
    Input: Extracted parameters from AI
    Output: Structured calculation result with all formula breakdowns
    """
    
    extracted = config.dict()
    result = middleware.process(extracted)
    
    return {
        'status': 'success' if result['success'] else 'error',
        'data': result
    }
```

### Step 3: Frontend Hook

**File:** `/anc-cpq/src/components/ConversationalWizard.tsx` (modify chat handler)

```tsx
const handleChatResponse = async (userMessage: string) => {
  // Step 1: Get AI extraction
  const chatRes = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: userMessage })
  });
  const chatData = await chatRes.json();
  
  // Step 2: NEW — Run through middleware
  const middlewareRes = await fetch('/api/calculate-with-formulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatData.parameters)
  });
  const middlewareData = await middlewareRes.json();
  
  // Step 3: Pass structured result to parent
  if (middlewareData.status === 'success') {
    onUpdate(chatData.parameters);  // Update UI params
    // Optionally log warnings for debugging
    if (middlewareData.data.warnings.length > 0) {
      console.warn('Calculation warnings:', middlewareData.data.warnings);
    }
  }
};
```

---

## 3. TEMPLATED PDF GENERATION

### Step 1: Create Template Components

**File:** `/anc-cpq/src/components/PDFTemplates/DefaultTemplate.tsx`

```tsx
'use client';
import React from 'react';
import { CPQInput, CalculationResult } from '../../lib/types';
import { ANCLogo } from '../ANCLogo';

interface TemplateProps {
  input: CPQInput;
  result: CalculationResult;
  showPricing?: boolean;
}

export function DefaultTemplate({ input, result, showPricing = true }: TemplateProps) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
  
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white text-slate-900 font-sans">
      {/* Header */}
      <div className="border-b-4 border-blue-900 pb-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-black text-blue-900">ANC SPORTS</h1>
            <p className="text-sm text-slate-500 tracking-wide">DIGITAL DISPLAY SOLUTIONS</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Prepared: {today}</div>
            <div>Valid Until: {validUntil}</div>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Prepared For
          </div>
          <div className="text-lg font-bold text-slate-900">{input.clientName}</div>
          {input.address && (
            <div className="text-sm text-slate-600 mt-1">{input.address}</div>
          )}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Project
          </div>
          <div className="text-lg font-bold text-slate-900">{input.projectName}</div>
          {input.projectName && (
            <div className="text-sm text-slate-600 mt-1">LED Display System</div>
          )}
        </div>
      </div>

      {/* Technical Specs Table */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
          <span className="inline-block w-8 h-8 bg-blue-900 text-white rounded text-center text-xs leading-8">1</span>
          <span className="ml-3">Technical Specifications</span>
        </h2>
        
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="text-left px-4 py-2 font-bold">Parameter</th>
              <th className="text-right px-4 py-2 font-bold">Specification</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="px-4 py-2 font-bold">Product Class</td>
              <td className="text-right px-4 py-2">{input.productClass} Display</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="px-4 py-2 font-bold">Pixel Pitch</td>
              <td className="text-right px-4 py-2">{input.pixelPitch}mm (SMD LED)</td>
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="px-4 py-2 font-bold">Active Dimensions</td>
              <td className="text-right px-4 py-2">
                {input.widthFt}' W × {input.heightFt}' H
              </td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="px-4 py-2 font-bold">Environment</td>
              <td className="text-right px-4 py-2">{input.environment}</td>
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50">
              <td className="px-4 py-2 font-bold">Shape / Configuration</td>
              <td className="text-right px-4 py-2">{input.shape}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Investment Table */}
      {showPricing && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
            <span className="inline-block w-8 h-8 bg-blue-900 text-white rounded text-center text-xs leading-8">2</span>
            <span className="ml-3">Project Investment</span>
          </h2>
          
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="text-left px-4 py-2 font-bold">Cost Category</th>
                <th className="text-right px-4 py-2 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="px-4 py-2">Hardware & Display System</td>
                <td className="text-right px-4 py-2 font-mono">
                  ${result?.hardwareCost?.toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="px-4 py-2">Structural Materials & Engineering</td>
                <td className="text-right px-4 py-2 font-mono">
                  ${result?.structuralCost?.toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="px-4 py-2">Installation Labor & Services</td>
                <td className="text-right px-4 py-2 font-mono">
                  ${result?.laborCost?.toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="px-4 py-2">Shipping, Logistics & Expenses</td>
                <td className="text-right px-4 py-2 font-mono">
                  ${result?.expenseCost?.toLocaleString()}
                </td>
              </tr>
              <tr className="border-t-2 border-blue-900 bg-blue-50">
                <td className="px-4 py-3 font-bold text-blue-900">TOTAL PROJECT INVESTMENT</td>
                <td className="text-right px-4 py-3 font-bold text-blue-900 text-lg font-mono">
                  ${result?.sellPrice?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Terms */}
      <div className="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-600">
        <p className="mb-2">
          <strong>Proposal Terms:</strong> This proposal is valid for 30 days from the date above.
          Pricing subject to change based on material costs, labor availability, and project scope confirmation.
        </p>
        <p>
          <strong>Next Steps:</strong> Please review and confirm acceptance. Upon approval, we will issue
          a detailed statement of work and project timeline.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
        <p>© 2026 ANC Sports Enterprises. All rights reserved.</p>
        <p>Confidential - For authorized recipients only</p>
      </div>
    </div>
  );
}
```

### Step 2: Minimal Template

**File:** `/anc-cpq/src/components/PDFTemplates/MinimalTemplate.tsx`

```tsx
'use client';
import React from 'react';
import { CPQInput, CalculationResult } from '../../lib/types';

export function MinimalTemplate({ input, result }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto p-12 bg-white text-slate-900">
      <h1 className="text-2xl font-bold mb-8">PROPOSAL</h1>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-xs text-slate-500 font-bold">CLIENT</div>
          <p className="text-lg">{input.clientName}</p>
          <p className="text-sm text-slate-600">{input.address}</p>
        </div>
        <div>
          <div className="text-xs text-slate-500 font-bold">PROJECT</div>
          <p className="text-lg">{input.projectName}</p>
          <p className="text-sm text-slate-600">{input.productClass} {input.pixelPitch}mm</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm mb-8">
        <div className="flex justify-between"><span>Hardware:</span><strong>${result.hardwareCost?.toLocaleString()}</strong></div>
        <div className="flex justify-between"><span>Structural:</span><strong>${result.structuralCost?.toLocaleString()}</strong></div>
        <div className="flex justify-between"><span>Labor:</span><strong>${result.laborCost?.toLocaleString()}</strong></div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>TOTAL</span><span>${result.sellPrice?.toLocaleString()}</span></div>
      </div>
    </div>
  );
}
```

### Step 3: Update Print Page

**File:** `/anc-cpq/src/app/print/page.tsx`

```tsx
import React from 'react';
import { CPQInput, CalculationResult } from '../../lib/types';
import { calculateCPQ } from '../../lib/calculator';
import { DefaultTemplate } from '../../components/PDFTemplates/DefaultTemplate';
import { MinimalTemplate } from '../../components/PDFTemplates/MinimalTemplate';

export default function PrintPage({ searchParams }: { searchParams: any }) {
  const dataStr = decodeURIComponent(searchParams.data || '{}');
  const template = searchParams.template || 'default';
  const showPricing = searchParams.showPricing !== 'false';
  
  let input: CPQInput;
  let result: CalculationResult;
  
  try {
    input = JSON.parse(dataStr);
    result = calculateCPQ(input);
  } catch (e) {
    return <div>Error parsing data</div>;
  }
  
  return (
    <div className="bg-white min-h-screen">
      {template === 'minimal' && <MinimalTemplate input={input} result={result} />}
      {template === 'default' && <DefaultTemplate input={input} result={result} showPricing={showPricing} />}
    </div>
  );
}
```

---

## 4. CSV EXPORT ENDPOINT

**File:** `/anc-cpq/src/app/api/download-csv/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CPQInput, CalculationResult } from '../../../lib/types';
import { calculateCPQ } from '../../../lib/calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = body as CPQInput;
    const result = calculateCPQ(input);
    
    // Build CSV rows
    const rows = [
      ['ANC PROPOSAL - DATA EXPORT'],
      [],
      ['CLIENT INFORMATION'],
      ['Client Name', input.clientName],
      ['Address', input.address],
      ['Project Name', input.projectName],
      [],
      ['SPECIFICATIONS'],
      ['Product Class', input.productClass],
      ['Pixel Pitch (mm)', input.pixelPitch],
      ['Width (ft)', input.widthFt],
      ['Height (ft)', input.heightFt],
      ['Total Sq Ft', input.widthFt * input.heightFt],
      ['Environment', input.environment],
      ['Shape', input.shape],
      ['Access', input.access],
      ['Mounting Type', input.mountingType],
      ['Structure Condition', input.structureCondition],
      ['Complexity', input.complexity],
      [],
      ['COST BREAKDOWN'],
      ['Hardware Cost', result.hardwareCost],
      ['Structural Cost', result.structuralCost],
      ['Labor Cost', result.laborCost],
      ['Expense Cost', result.expenseCost],
      ['Bond Cost', result.bondCost],
      [],
      ['PRICING'],
      ['Subtotal', result.costTotal],
      ['Margin %', input.targetMargin || 30],
      ['Margin Amount', result.sellPrice - result.costTotal],
      ['Sell Price', result.sellPrice],
      ['Tax (9.5%)', (result.sellPrice * 0.095)],
      ['Grand Total', result.sellPrice * 1.095],
      [],
      ['Export Date', new Date().toISOString()]
    ];
    
    // Convert to CSV
    const csv = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ANC_Quote_${input.clientName.replace(/\s+/g, '_')}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}
```

---

## 5. SALESFORCE INTEGRATION

### Step 1: Salesforce Client

**File:** `/anc-cpq/src/lib/salesforce-client.ts`

```typescript
import { CPQInput, CalculationResult } from './types';

export class SalesforceClient {
  private accessToken: string = '';
  private instanceUrl: string = '';
  
  constructor(accessToken: string, instanceUrl: string) {
    this.accessToken = accessToken;
    this.instanceUrl = instanceUrl;
  }
  
  private async apiCall(method: string, endpoint: string, body?: any) {
    const url = `${this.instanceUrl}/services/data/v59.0${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async createOpportunity(input: CPQInput, result: CalculationResult) {
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + 30);
    
    return await this.apiCall('POST', '/sobjects/Opportunity', {
      Name: `${input.clientName} - ${input.projectName}`,
      StageName: 'Proposal',
      CloseDate: closeDate.toISOString().split('T')[0],
      Amount: result.sellPrice,
      Description: `LED Display Project: ${input.productClass} ${input.pixelPitch}mm, ${input.widthFt}x${input.heightFt}ft, ${input.environment}`,
      Type: 'New Business',
    });
  }
  
  async createQuote(opportunityId: string, input: CPQInput, result: CalculationResult) {
    return await this.apiCall('POST', '/sobjects/Quote', {
      OpportunityId: opportunityId,
      Name: `Quote - ${input.projectName}`,
      Subtotal: result.costTotal,
      TotalPrice: result.sellPrice,
      ExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      Status: 'Draft',
    });
  }
  
  async attachFile(recordId: string, filename: string, content: string) {
    return await this.apiCall('POST', '/sobjects/ContentVersion', {
      Title: filename,
      VersionData: Buffer.from(content).toString('base64'),
      PathOnClient: filename,
      FirstPublishLocationId: recordId,
    });
  }
}
```

### Step 2: API Route

**File:** `/anc-cpq/src/app/api/salesforce/push-quote/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SalesforceClient } from '../../../lib/salesforce-client';
import { CPQInput, CalculationResult } from '../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const { input, result, accessToken, instanceUrl } = await request.json();
    
    const client = new SalesforceClient(accessToken, instanceUrl);
    
    // Create Opportunity
    const opp = await client.createOpportunity(input as CPQInput, result as CalculationResult);
    
    // Create Quote linked to Opportunity
    const quote = await client.createQuote(opp.id, input as CPQInput, result as CalculationResult);
    
    return NextResponse.json({
      success: true,
      opportunityId: opp.id,
      quoteId: quote.id,
      sfUrl: `${instanceUrl}/lightning/r/Quote/${quote.id}/view`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Step 3: Frontend Component

**File:** `/anc-cpq/src/components/SalesforceButton.tsx`

```tsx
'use client';
import React, { useState } from 'react';
import { Send, Loader2, ExternalLink } from 'lucide-react';
import { CPQInput, CalculationResult } from '../lib/types';

interface SalesforceButtonProps {
  input: CPQInput;
  result: CalculationResult;
}

export function SalesforceButton({ input, result }: SalesforceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sfUrl, setSfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handlePushToSalesforce = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get stored Salesforce token (from session/localStorage)
      const sfToken = localStorage.getItem('sf_access_token');
      const sfInstance = localStorage.getItem('sf_instance_url');
      
      if (!sfToken || !sfInstance) {
        throw new Error('Salesforce credentials not found. Please authenticate first.');
      }
      
      const res = await fetch('/api/salesforce/push-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          result,
          accessToken: sfToken,
          instanceUrl: sfInstance
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      setSfUrl(data.sfUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push to Salesforce');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (sfUrl) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
        <p className="text-green-900 font-semibold mb-2">✓ Pushed to Salesforce</p>
        <a
          href={sfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 underline"
        >
          View in Salesforce <ExternalLink size={14} />
        </a>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePushToSalesforce}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Push to Salesforce
      </button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
}
```

---

## INTEGRATION CHECKLIST

- [ ] UI Preview Pane: Copy DocumentPreviewPane.tsx to components/
- [ ] Calculation Middleware: Copy calculation_middleware.py to src/
- [ ] PDF Templates: Create PDFTemplates folder with DefaultTemplate & MinimalTemplate
- [ ] CSV Export: Add download-csv/route.ts
- [ ] Salesforce Client: Add salesforce-client.ts and related endpoints
- [ ] Test chat → preview → export flow
- [ ] Test PDF rendering in Chrome headless
- [ ] Test Salesforce token storage and API calls
- [ ] Add environment variables for Salesforce OAuth (NEXT_PUBLIC_SF_CLIENT_ID, etc.)
- [ ] Security audit: Review token handling, CORS, data validation

---

**Version:** 1.0  
**Last Updated:** 2026-01-15
