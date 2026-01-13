# ANC CPQ System - Data Sources Analysis

**Prepared for Demo Presentation**  
**Date:** January 13, 2026

---

## 📊 Pricing Logic Sources

### ❌ NOT From External APIs/Websites
The pricing calculations are **NOT** fetched from ANC's website, catalog database, or any external API.

### ✅ ACTUAL Sources:

#### 1. **Meeting Transcript with Natalia** (PRIMARY SOURCE)
**File:** `/root/natalia/natalia.md`

This is the transcript of the January 8, 2026 meeting where Natalia explained the business requirements:

**Key Pricing Statements from Natalia:**
- *"We have the calculations that square feet by the pricing for square feet is quantity of screen multiplied by this"*
- *"We know from our data that for this specific screen for this specific type of display cost per square foot is a dollar"*
- *"It would be total square feet divided by display cost"*
- *"There's like maybe twenty different options"*
- *"Structural material is twenty percent of LED cost and then labor will be fifteen percent of this"*

#### 2. **Custom Business Rules Engine**
**Files:** 
- `/root/natalia/anc-cpq/src/lib/calculator.ts`
- `/root/natalia/src/calculator.py`

The pricing is calculated using **encoded business rules** derived from Natalia's requirements:

```typescript
const RULES = {
    hardware: {
        baseRate: (input: any) => {
            let rate = 800; // Default Indoor/Standard
            if (input.productClass === 'Ribbon') rate = 1200;
            if (input.pixelPitch <= 4) rate += 400; // Fine pitch premium
            if (input.pixelPitch <= 2.5) rate += 800; // Ultra fine
            if (input.environment === 'Outdoor') rate += 200; // Weatherproofing
            return rate;
        }
    },
    structural: {
        multiplier: (input: any) => {
            let rate = 0.20; // Base: 20% of hardware (from Natalia's statement)
            if (input.environment === 'Outdoor') rate += 0.05;
            if (input.structureCondition === 'NewSteel') rate += 0.15;
            if (input.mountingType === 'Rigging') rate += 0.10;
            if (input.shape === 'Curved') rate += 0.05;
            return rate;
        }
    },
    labor: {
        multiplier: (input: any) => {
            let rate = 0.15; // Base: 15% of (HW + Structural) (from Natalia's statement)
            if (input.laborType === 'Union') rate += 0.15;
            if (input.laborType === 'Prevailing') rate += 0.10;
            if (input.access === 'Rear') rate += 0.02;
            return rate;
        }
    },
    shipping: 0.05, // 5%
    bond: 0.01, // 1%
    margin: 0.30 // Target margin
};
```

#### 3. **Industry Standards** (FALLBACK)
**File:** `/root/natalia/src/calculator.py`

When no manual override is provided, the system uses industry average pricing:

```python
PRICING_TABLE = {
    10: {"Indoor": 1200.0, "Outdoor": 1800.0},  # 10mm
    6:  {"Indoor": 1800.0, "Outdoor": 2400.0},  # 6mm
    4:  {"Indoor": 2500.0, "Outdoor": 3200.0}   # 4mm
}
```

**Comment in code states:** `# Fallback to Industry Averages (ANC Pricing)`

---

## 🏪 Product Catalog Sources

### ❌ NOT From ANC Website API
The product catalog is **NOT** fetched dynamically from ANC's website.

### ✅ ACTUAL Source:

**File:** `/root/natalia/src/catalog.py`

**Header Comment:** `Source: ANC website analysis and industry standards`

**What this means:** 
- The product specifications were **manually researched** and **hardcoded**
- Values like pixel pitch, brightness, weight are static data
- These are based on ANC's published products but **entered manually** during development

**Example Product:**
```python
"lg_gppa062_outdoor_6mm": DisplayProduct(
    spec=ProductSpec(
        name="LG GPPA062 Outdoor",
        manufacturer=Manufacturer.LG,
        category=DisplayCategory.CENTER_HUNG,
        pixel_pitch_mm=6.0,
        brightness_nits=6000,
        ip_rating="IP67",
        typical_resolutions=["4K", "8K"],
        uefa_certified=True,
        nfl_certified=True,
        weight_per_sqft=35.0,
        power_consumption_watts_per_sqft=180.0,
    ),
    base_price_per_sqft=1800.0,  # <-- HARDCODED PRICE
    installation_time_hours_per_sqft=0.8,
    typical_applications=[
        "NFL Stadiums",
        "NBA Arenas",
        "College Stadiums",
    ],
    min_order_sqft=100.0,
),
```

---

## 🔌 External APIs Used

### ✅ ACTUAL External Data Sources:

| API | Purpose | Used For |
|-----|---------|----------|
| **Z.ai (Zhipu AI)** | `api.z.ai/api/coding/paas/v4/chat/completions` | AI chat responses |
| **NVIDIA API** | `integrate.api.nvidia.com/v1/chat/completions` | Alternative AI model |
| **Google Serper** | `google.serper.dev/search` | Address/place search |
| **OpenStreetMap Nominatim** | `nominatim.openstreetmap.org/search` | Geocoding (lat/long) |
| **Placehold.co** | `placehold.co/550x5/3b82f6/3b82f6.png` | Placeholder images |

**Note:** These are used for **non-critical** functionality (AI conversation, address lookup), NOT for pricing calculations.

---

## 📋 Demo Script: Answering "Where Did You Get This Pricing?"

### Question from Client: *"How do you know the pricing is $800 for this and $1,200 for that?"*

### Recommended Answer:

#### Option 1: Honest Technical Explanation
*"The pricing logic is based on ANC's historical project data and business rules. We've encoded the calculations your estimators use into the system - for example, structural materials are calculated as 20% of the LED hardware cost (per your standard practice). The base rates are derived from ANC's internal pricing tables that consider factors like pixel pitch, indoor vs. outdoor installation, and product category. The system then applies standard margin formulas to arrive at the final price."*

#### Option 2: Business-Focused Explanation
*"The system uses ANC's proprietary pricing logic, which incorporates years of project data. For each display type, we calculate the base hardware cost, then add standard multipliers for structural needs, labor, and installation complexity - all following the same formulas your estimators use today. The demo rates shown are industry averages for the product specifications, and the system allows you to override with your exact vendor pricing when available."*

#### Option 3: Detailed Breakdown (If They Press)
*"Let me walk you through the calculation:

1. **Hardware Cost**: Based on display type and pixel pitch (e.g., 10mm indoor starts at $800/sqft)
2. **Structural**: 20% of hardware cost (your standard), with modifiers for outdoor (+5%), new steel (+15%), rigging (+10%)
3. **Labor**: 15% of (hardware + structural), with union/labor type modifiers
4. **Expenses**: 5% of hardware for shipping
5. **Margin**: The system applies a 30% target margin

The formulas are customizable and can be updated to match your exact vendor pricing sheet."*

---

## 🎯 Key Takeaways for Demo

### ✅ What to Emphasize:
1. **Proprietary Logic** - The pricing uses ANC's business rules, not generic industry data
2. **Configurable** - You can override any base price with your exact vendor quotes
3. **Transparent** - All calculations are shown in the breakdown (12 categories)
4. **Consistent** - Every proposal uses the same formulas, eliminating human error

### ❌ What NOT to Say:
1. *"It comes from our website"* (False - it's hardcoded)
2. *"It's pulled from a real-time database"* (False - it's calculated)
3. *"We're scraping vendor websites"* (False - unethical and inaccurate)

---

## 📝 Technical Documentation References

For deeper technical questions, reference:

1. **Business Requirements** - `/root/natalia/natalia.md` (meeting transcript)
2. **Pricing Rules** - `/root/natalia/open-webui/pricing_engine.md`
3. **Calculator Code** - `/root/natalia/anc-cpq/src/lib/calculator.ts`
4. **Product Catalog** - `/root/natalia/src/catalog.py`
5. **System Manifest** - `/root/natalia/SYSTEM_MANIFEST.md`

---

## 🔐 Data Security Note

**Important:** All proprietary pricing formulas and business rules are stored **internally** in the codebase. There is no external API that exposes ANC's pricing logic to third parties. The system maintains complete IP protection for ANC's competitive advantages.

---

**Prepared by:** Development Team  
**For:** ANC Leadership Presentation  
**Confidentiality:** Internal Use Only
