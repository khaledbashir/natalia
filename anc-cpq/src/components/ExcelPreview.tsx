"use client";
import React from "react";
import { CPQInput, CalculationResult } from "../lib/types";
import { calculateScreen } from "../lib/calculator";

const BRAND_BLUE = "#003D82";

interface ExcelPreviewProps {
    input: CPQInput;
    result: CalculationResult;
}

export function ExcelPreview({ input, result }: ExcelPreviewProps) {
    const isMultiScreen = input.screens && input.screens.length > 0;

    return (
        <div className="w-full bg-white p-8 rounded-lg overflow-x-auto">
            <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 mb-2">
                    EXCEL AUDIT EXPORT PREVIEW
                </h2>
                <p className="text-sm text-slate-500">
                    This is exactly what will be exported to Excel
                </p>
            </div>

            {!isMultiScreen ? (
                // Single Screen Excel Preview
                <table className="w-full text-[11px] border-collapse">
                    <thead>
                        <tr
                            style={{ backgroundColor: BRAND_BLUE }}
                            className="text-white uppercase tracking-widest font-extrabold"
                        >
                            <th className="border border-slate-300 p-2 text-left">
                                Screen / Category
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Dimensions
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Area (SqFt)
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Base $/SqFt
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Raw HW Cost
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Structural (20%)
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Labor (15%)
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Expenses (5%)
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Margin %
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                HW Price
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Str Price
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Labor Price
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Exp Price
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Subtotal
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Bond (1%)
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                Contingency (5%)
                            </th>
                            <th className="border border-slate-300 p-2 text-right">
                                GRAND TOTAL
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <ExcelDataRow
                            label={`${input.productClass} (${input.pixelPitch}mm)`}
                            widthFt={input.widthFt}
                            heightFt={input.heightFt}
                            pixelPitch={input.pixelPitch}
                            result={result}
                        />
                    </tbody>
                </table>
            ) : (
                // Multi-Screen Excel Preview
                <div className="space-y-8">
                    <table className="w-full text-[11px] border-collapse">
                        <thead>
                            <tr
                                style={{ backgroundColor: BRAND_BLUE }}
                                className="text-white uppercase tracking-widest font-extrabold"
                            >
                                <th className="border border-slate-300 p-2 text-left">
                                    Screen / Category
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Dimensions
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Area (SqFt)
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Base $/SqFt
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Raw HW Cost
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Structural (20%)
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Labor (15%)
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Expenses (5%)
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Margin %
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    HW Price
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Str Price
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Labor Price
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Exp Price
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Subtotal
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Bond (1%)
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    Contingency (5%)
                                </th>
                                <th className="border border-slate-300 p-2 text-right">
                                    GRAND TOTAL
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {input.screens?.map((screen, idx) => {
                                const screenResult = calculateScreen(screen);
                                return (
                                    <ExcelDataRow
                                        key={idx}
                                        label={`${screen.productClass} (${screen.pixelPitch}mm)`}
                                        widthFt={screen.widthFt}
                                        heightFt={screen.heightFt}
                                        pixelPitch={screen.pixelPitch}
                                        result={screenResult}
                                    />
                                );
                            })}
                            <tr
                                className="font-bold"
                                style={{ backgroundColor: "#003D8220" }}
                            >
                                <td
                                    colSpan={13}
                                    className="border border-slate-300 p-2 text-right font-black text-white"
                                >
                                    AGGREGATE PROJECT TOTAL
                                </td>
                                <td className="border border-slate-300 p-2 text-right font-black text-white">
                                    ${result.sellPrice.toLocaleString()}
                                </td>
                                <td className="border border-slate-300 p-2 text-right font-black text-white">
                                    $
                                    {(result.sellPrice * 0.01).toLocaleString()}
                                </td>
                                <td className="border border-slate-300 p-2 text-right font-black text-white">
                                    $
                                    {(result.sellPrice * 0.05).toLocaleString()}
                                </td>
                                <td className="border border-slate-300 p-2 text-right font-black text-white">
                                    $
                                    {(result.sellPrice * 1.06).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

interface ExcelDataRowProps {
    label: string;
    widthFt: number;
    heightFt: number;
    pixelPitch: number;
    result: CalculationResult;
}

function ExcelDataRow({
    label,
    widthFt,
    heightFt,
    pixelPitch,
    result,
}: ExcelDataRowProps) {
    // Calculate area in square feet
    const areaSqFt = (widthFt * heightFt).toFixed(2);

    // Calculate base rate per sqft (matches Python: base_rate from math data)
    const baseRate = (result.hardwareCost / parseFloat(areaSqFt)).toFixed(2);

    // Raw Costs (matches Python formulas)
    // E: Raw HW Cost = Area * Base Rate
    const rawHwCost = parseFloat(areaSqFt) * parseFloat(baseRate);

    // F: Structural (20% of HW)
    const structuralCost = rawHwCost * 0.2;

    // G: Labor (15% of HW + Str)
    const laborCost = (rawHwCost + structuralCost) * 0.15;

    // H: Expenses (5% of HW)
    const expenseCost = rawHwCost * 0.05;

    // Calculate margin from sell price (matches Python)
    const subtotal = rawHwCost + structuralCost + laborCost + expenseCost;
    const margin =
        subtotal > 0 ? (result.sellPrice - subtotal) / result.sellPrice : 0;
    const marginPct = (margin * 100).toFixed(2);

    // Marked-up prices using Excel formula logic: Price = Raw Cost / (1 - Margin)
    // This matches the Python formulas: =IFERROR(E{row}/(1-I{row}), E{row})
    const hwPrice = margin < 1 ? rawHwCost / (1 - margin) : rawHwCost;
    const strPrice =
        margin < 1 ? structuralCost / (1 - margin) : structuralCost;
    const laborPrice = margin < 1 ? laborCost / (1 - margin) : laborCost;
    const expPrice = margin < 1 ? expenseCost / (1 - margin) : expenseCost;

    // N: Subtotal = Sum(J:M)
    const subtotalPrice = hwPrice + strPrice + laborPrice + expPrice;

    // O: Bond (1% of Subtotal)
    const bond = subtotalPrice * 0.01;

    // P: Contingency (5% of Subtotal)
    const contingency = subtotalPrice * 0.05;

    // Q: Grand Total Sell
    const grandTotal = subtotalPrice + bond + contingency;

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            <td className="border border-slate-300 p-2 font-bold text-slate-900">
                {label}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                {widthFt}' x {heightFt}'
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                {areaSqFt}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                ${baseRate}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                $
                {rawHwCost.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                ${baseRate}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                ${structuralCost.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                ${laborCost.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                ${expenseCost.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                {marginPct}%
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                $
                {hwPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                $
                {strPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                $
                {laborPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right text-slate-900">
                $
                {subtotalPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right font-bold">
                $
                {subtotalPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td className="border border-slate-300 p-2 text-right">
                ${bond.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </td>
            <td className="border border-slate-300 p-2 text-right">
                $
                {contingency.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
            <td
                className="border border-slate-300 p-2 text-right font-bold text-white"
                style={{ backgroundColor: "#003D8220" }}
            >
                $
                {grandTotal.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                })}
            </td>
        </tr>
    );
}
