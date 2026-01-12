'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CostCategory {
  id: string;
  category: string;
  description: string;
  amount: number;
  percentage: number;
  calculation?: string;
}

interface CostBreakdownDisplayProps {
  costBreakdown: {
    [key: string]: number;
  };
  totalAmount: number;
  margin: number;
  timelineSurcharge?: number;
}

export function CostBreakdownDisplay({ costBreakdown, totalAmount, margin, timelineSurcharge = 0 }: CostBreakdownDisplayProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Hardware', 'Structural', 'Installation', 'Professional Services'])
  );

  // Organize costs into logical groups
  const costGroups = {
    hardware: {
      label: 'Hardware Costs',
      categories: [
        { id: 'hardware', category: 'LED Display Hardware', amount: costBreakdown['1. Hardware'] || 0, percentage: 0 },
      ]
    },
    structural: {
      label: 'Structural Costs',
      categories: [
        { id: 'structural_materials', category: 'Structural Materials', amount: costBreakdown['2. Structural Materials'] || 0, percentage: 0 },
        { id: 'structural_labor', category: 'Structural Labor', amount: costBreakdown['3. Structural Labor'] || 0, percentage: 0 },
      ]
    },
    installation: {
      label: 'Installation Costs',
      categories: [
        { id: 'led_installation', category: 'LED Installation (Labor)', amount: costBreakdown['4. LED Installation'] || 0, percentage: 0 },
        { id: 'electrical_materials', category: 'Electrical & Data - Materials', amount: costBreakdown['5. Electrical Materials'] || 0, percentage: 0 },
        { id: 'electrical_labor', category: 'Electrical & Data - Subcontracting', amount: costBreakdown['6. Electrical Labor'] || 0, percentage: 0 },
        { id: 'cms_equipment', category: 'CMS - Equipment', amount: costBreakdown['7. CMS Equipment'] || 0, percentage: 0 },
        { id: 'cms_installation', category: 'CMS - Installation', amount: costBreakdown['8. CMS Installation'] || 0, percentage: 0 },
        { id: 'cms_commissioning', category: 'CMS - Commissioning', amount: costBreakdown['9. CMS Commissioning'] || 0, percentage: 0 },
        { id: 'final_commissioning', category: 'Installation & Commissioning (Final)', amount: costBreakdown['16. Final Commissioning'] || 0, percentage: 0 },
      ]
    },
    professional: {
      label: 'Professional Services',
      categories: [
        { id: 'project_management', category: 'Project Management', amount: costBreakdown['10. Project Management'] || 0, percentage: 0 },
        { id: 'submittals', category: 'Submittals', amount: costBreakdown['13. Submittals'] || 0, percentage: 0 },
        { id: 'engineering', category: 'Engineering', amount: costBreakdown['14. Engineering'] || 0, percentage: 0 },
      ]
    },
    softCosts: {
      label: 'Soft Costs',
      categories: [
        { id: 'general_conditions', category: 'General Conditions', amount: costBreakdown['11. General Conditions'] || 0, percentage: 0 },
        { id: 'travel_expenses', category: 'Travel & Expenses', amount: costBreakdown['12. Travel & Expenses'] || 0, percentage: 0 },
        { id: 'permits', category: 'Permits', amount: costBreakdown['15. Permits'] || 0, percentage: 0 },
        { id: 'bond', category: 'Bond', amount: costBreakdown['17. Bond'] || 0, percentage: 0 },
      ]
    }
  };

  // Calculate percentages
  const calculatePercentages = () => {
    const percentages: { [key: string]: number } = {};

    Object.values(costGroups).forEach(group => {
      group.categories.forEach(cat => {
        const pct = (cat.amount / totalAmount) * 100;
        percentages[cat.id] = pct;
      });
    });

    return percentages;
  };

  const percentages = calculatePercentages();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPercentageColor = (pct: number) => {
    if (pct > 30) return 'text-red-600';
    if (pct > 20) return 'text-orange-600';
    if (pct > 15) return 'text-yellow-600';
    if (pct > 10) return 'text-blue-600';
    return 'text-green-600';
  };

  const getProgressBarColor = (pct: number) => {
    if (pct > 30) return 'bg-red-500';
    if (pct > 20) return 'bg-orange-500';
    if (pct > 15) return 'bg-yellow-500';
    if (pct > 10) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Cost Breakdown</h3>
      </div>

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Price Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Total Project Price</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalAmount)}
          </div>
          {timelineSurcharge > 0 && (
            <div className="mt-2 text-xs text-orange-600 font-medium">
              +{formatCurrency(timelineSurcharge)} timeline surcharge
            </div>
          )}
        </div>

        {/* Margin Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Target Margin</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(margin * 100).toFixed(0)}%
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Gross profit percentage
          </div>
        </div>

        {/* Category Count Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Cost Categories</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {Object.keys(costBreakdown).length}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Individual line items
          </div>
        </div>
      </div>

      {/* Cost Groups */}
      {Object.entries(costGroups).map(([groupKey, group]) => (
        <div key={groupKey} className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          {/* Group Header */}
          <button
            onClick={() => toggleCategory(group.label)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-left">
                <h4 className="font-bold text-lg">{group.label}</h4>
                <p className="text-xs text-blue-100">
                  {group.categories.length} categor{group.categories.length > 1 ? 'ies' : 'y'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {formatCurrency(
                  group.categories.reduce((sum, cat) => sum + cat.amount, 0)
                )}
              </span>
              {expandedCategories.has(group.label) ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </div>
          </button>

          {/* Expandable Categories */}
          {expandedCategories.has(group.label) && (
            <div className="p-4 space-y-3 bg-gray-50">
              {group.categories.map((category) => {
                const pct = percentages[category.id] || 0;
                return (
                  <div key={category.id} className="border-l-4 border-blue-200 pl-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {category.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(category.amount)}
                        </p>
                        <p className={`text-xs font-medium ${getPercentageColor(pct)}`}>
                          {pct.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`${getProgressBarColor(pct)} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Cost Summary Table */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="font-bold text-gray-900 mb-3 text-sm">Quick Reference</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 font-semibold text-gray-700">Category</th>
                <th className="text-right p-2 font-semibold text-gray-700">Amount</th>
                <th className="text-right p-2 font-semibold text-gray-700">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(costBreakdown).map(([key, amount]) => (
                <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 text-gray-900">{key}</td>
                  <td className="p-2 text-right font-semibold text-gray-900">
                    {formatCurrency(amount)}
                  </td>
                  <td className={`p-2 text-right font-medium ${getPercentageColor(percentages[key] || 0)}`}>
                    {(percentages[key] || 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td className="p-2 text-gray-900">TOTAL</td>
                <td className="p-2 text-right text-blue-600 text-lg">
                  {formatCurrency(totalAmount)}
                </td>
                <td className="p-2 text-right text-gray-600">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
