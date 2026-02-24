import { useMemo, useState } from 'react';
import { useMala } from '../context/MalaContext';
import { isGoldItem } from '../types/mala';
import { MalaPreview } from './MalaPreview';

export function Calculator() {
  const { calculateMala, currentPattern, goldRates, items, gapSettings } = useMala();
  const [viewMode, setViewMode] = useState<'linear' | 'circular'>('linear');

  const result = useMemo(() => calculateMala(), [calculateMala]);

  if (!currentPattern || currentPattern.items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculation Results
        </h2>
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>Create a pattern to see calculations</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Mala Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('linear')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'linear'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => setViewMode('circular')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                viewMode === 'circular'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Circular
            </button>
          </div>
        </div>
      </div>

      {/* Mala Preview */}
      <MalaPreview expandedItems={result.expandedItems} viewMode={viewMode} />

      {/* Calculator Results */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculation Results
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-80">Total Pieces</div>
            <div className="text-3xl font-bold">{result.totalPieces}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-80">Total Length</div>
            <div className="text-3xl font-bold">{result.totalLengthInches.toFixed(2)}"</div>
            <div className="text-xs opacity-70">{result.totalLengthMM.toFixed(1)} mm</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-80">Total Weight</div>
            <div className="text-3xl font-bold">{result.totalWeightGrams.toFixed(2)}g</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
            <div className="text-sm opacity-80">Pieces/Inch</div>
            <div className="text-3xl font-bold">{result.piecesPerInch.toFixed(2)}</div>
            <div className="text-xs opacity-70">≈ {Math.floor(result.piecesPerInch)}-{Math.ceil(result.piecesPerInch)} pcs</div>
          </div>
        </div>

        {/* Sets Per Inch - Only show if caps are included */}
        {result.setCount > 0 && result.setsPerInch > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <span className="text-lg">( o )</span>
              Sets Per Inch Calculation
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="text-sm text-orange-700">Total Sets</div>
                <div className="text-2xl font-bold text-orange-900">{result.setCount}</div>
                <div className="text-xs text-orange-600">({result.beadCount} beads × 2 caps)</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="text-sm text-orange-700">Set Length</div>
                <div className="text-2xl font-bold text-orange-900">{result.setLengthMM.toFixed(2)}mm</div>
                <div className="text-xs text-orange-600">
                  {gapSettings.setLengthMethod === 'measured' ? '📏 measured' : '( o ) calculated'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="text-sm text-orange-700">Sets/Inch</div>
                <div className="text-2xl font-bold text-orange-900">{result.setsPerInch.toFixed(2)}</div>
                <div className="text-xs text-orange-600 mt-1">
                  ≈ <strong>{Math.floor(result.setsPerInch)}</strong> to <strong>{Math.ceil(result.setsPerInch)}</strong> sets
                </div>
              </div>
            </div>
            
            {/* Visual breakdown */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-orange-100">
              <div className="text-sm text-orange-700 mb-2">Set Breakdown:</div>
              {gapSettings.setLengthMethod === 'measured' ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-green-100 rounded flex items-center gap-1">
                    📏 Measured Set Length: <strong>{gapSettings.measuredSetLengthMM}mm</strong>
                  </span>
                  <span className="text-gray-400 text-xs">(using actual measurement instead of calculation)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  {(() => {
                    const capItem = currentPattern.selectedCapId 
                      ? items.find(i => i.id === currentPattern.selectedCapId)
                      : null;
                    const effectiveCapHeight = capItem && capItem.type === 'cap'
                      ? Math.max(0, capItem.height - gapSettings.capOverlap)
                      : 0;
                    
                    const beadItem = currentPattern.items.find(pi => {
                      const item = items.find(i => i.id === pi.itemId);
                      return item?.type === 'bead';
                    });
                    const bead = beadItem ? items.find(i => i.id === beadItem.itemId) : null;
                    const beadDiameter = bead && bead.type === 'bead' ? bead.diameterMM : 0;
                    
                    return (
                      <>
                        <span className="px-2 py-1 bg-amber-100 rounded">Cap: {effectiveCapHeight.toFixed(2)}mm</span>
                        <span>+</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">Gap: {gapSettings.capBeadGap}mm</span>
                        <span>+</span>
                        <span className="px-2 py-1 bg-amber-700 text-white rounded">Bead: {beadDiameter}mm</span>
                        <span>+</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">Gap: {gapSettings.capBeadGap}mm</span>
                        <span>+</span>
                        <span className="px-2 py-1 bg-amber-100 rounded">Cap: {effectiveCapHeight.toFixed(2)}mm</span>
                        <span>=</span>
                        <span className="px-2 py-1 bg-orange-500 text-white rounded font-bold">{result.setLengthMM.toFixed(2)}mm</span>
                      </>
                    );
                  })()}
                </div>
              )}
              
              {/* Sets per inch explanation */}
              <div className="mt-3 pt-3 border-t border-orange-100">
                <div className="text-sm text-orange-700 mb-1">Sets/Inch Calculation:</div>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="px-2 py-1 bg-orange-100 rounded">Set: {result.setLengthMM.toFixed(2)}mm</span>
                  <span>+</span>
                  <span className="px-2 py-1 bg-blue-100 rounded">Gap: {gapSettings.uniformGap}mm</span>
                  <span>=</span>
                  <span className="px-2 py-1 bg-orange-200 rounded font-medium">{result.setLengthWithGapMM.toFixed(2)}mm per set</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">25.4mm ÷ {result.setLengthWithGapMM.toFixed(2)}mm =</span>
                  <span className="px-2 py-1 bg-green-500 text-white rounded font-bold">{result.setsPerInch.toFixed(2)} sets/inch</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown by Type */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Breakdown by Item Type</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Item</th>
                  <th className="text-right py-2 px-3">Pieces</th>
                  <th className="text-right py-2 px-3">Weight (g)</th>
                  <th className="text-right py-2 px-3">Avg/piece</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.piecesByType).map(([name, count]) => {
                  const weight = result.weightByType[name] || 0;
                  const item = items.find(i => i.displayName === name);
                  const isGold = item ? isGoldItem(item) : false;
                  return (
                    <tr key={name} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 flex items-center gap-2">
                        {item && (
                          <div
                            className={`w-4 h-4 ${item.type === 'cap' ? 'rounded-l-full' : 'rounded-full'}`}
                            style={{ 
                              backgroundColor: item.color,
                            }}
                          />
                        )}
                        {name}
                        {isGold && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1 rounded">Gold</span>
                        )}
                      </td>
                      <td className="text-right py-2 px-3 font-medium">{count}</td>
                      <td className="text-right py-2 px-3">{weight.toFixed(2)}g</td>
                      <td className="text-right py-2 px-3 text-gray-500">
                        {(weight / count).toFixed(3)}g
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-semibold bg-gray-50">
                  <td className="py-2 px-3">Total</td>
                  <td className="text-right py-2 px-3">{result.totalPieces}</td>
                  <td className="text-right py-2 px-3">{result.totalWeightGrams.toFixed(2)}g</td>
                  <td className="text-right py-2 px-3 text-gray-500">
                    {(result.totalWeightGrams / result.totalPieces).toFixed(3)}g
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Gold Details */}
        {result.goldWeight > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Gold Calculation
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-amber-700">Gold Weight</div>
                <div className="text-2xl font-bold text-amber-900">{result.goldWeight.toFixed(3)}g</div>
              </div>
              <div>
                <div className="text-sm text-amber-700">Gold Rate</div>
                <div className="text-2xl font-bold text-amber-900">₹{goldRates.rate.toLocaleString()}/g</div>
              </div>
              <div>
                <div className="text-sm text-amber-700">Estimated Gold Cost</div>
                <div className="text-2xl font-bold text-amber-900">
                  ₹{result.goldCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Length Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Millimeters:</span>
                <span className="font-medium">{result.totalLengthMM.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Centimeters:</span>
                <span className="font-medium">{(result.totalLengthMM / 10).toFixed(2)} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inches:</span>
                <span className="font-medium">{result.totalLengthInches.toFixed(2)}"</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Feet:</span>
                <span className="font-medium">{(result.totalLengthInches / 12).toFixed(2)} ft</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Density Metrics</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pieces/Inch:</span>
                <span className="font-medium">{result.piecesPerInch.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pieces/CM:</span>
                <span className="font-medium">{(result.piecesPerInch / 2.54).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Length/Piece:</span>
                <span className="font-medium">{(result.totalLengthMM / result.totalPieces).toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight/Inch:</span>
                <span className="font-medium">{(result.totalWeightGrams / result.totalLengthInches).toFixed(2)} g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Breakdown - Diagnostic */}
        {result.setCount > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium text-gray-700 mb-2">📊 Calculation Breakdown</h4>
            <div className="text-sm space-y-2 font-mono bg-white p-3 rounded border">
              {(() => {
                // Get mani info
                let maniTotal = 0;
                let maniCount = 0;
                result.expandedItems.forEach(ei => {
                  if (ei.item.type === 'mani') {
                    maniTotal += ei.item.height || 4;
                    maniCount++;
                  }
                });
                
                const setCount = result.setCount;
                const setLength = result.setLengthMM;
                const totalItems = setCount + maniCount;
                const totalGaps = Math.max(0, totalItems - 1);
                const gapLength = gapSettings.uniformGap;
                
                const setsTotal = setCount * setLength;
                const gapsTotal = totalGaps * gapLength;
                const calculatedTotal = setsTotal + maniTotal + gapsTotal;
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Sets:</span>
                      <span>{setCount} × {setLength.toFixed(2)}mm = <strong>{setsTotal.toFixed(2)}mm</strong></span>
                      
                      <span className="text-gray-600">Mani:</span>
                      <span>{maniCount} × {(maniTotal/maniCount || 0).toFixed(2)}mm = <strong>{maniTotal.toFixed(2)}mm</strong></span>
                      
                      <span className="text-gray-600">Gaps:</span>
                      <span>{totalGaps} × {gapLength}mm = <strong>{gapsTotal.toFixed(2)}mm</strong></span>
                      
                      <span className="text-gray-600 border-t pt-2">Formula:</span>
                      <span className="border-t pt-2">{setsTotal.toFixed(1)} + {maniTotal.toFixed(1)} + {gapsTotal.toFixed(1)}</span>
                      
                      <span className="text-gray-600 font-bold">Total:</span>
                      <span className="font-bold">{calculatedTotal.toFixed(2)}mm = {(calculatedTotal/25.4).toFixed(2)}"</span>
                    </div>
                    
                    {Math.abs(calculatedTotal - result.totalLengthMM) > 0.1 && (
                      <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
                        ⚠️ Note: Actual result is {result.totalLengthMM.toFixed(2)}mm ({result.totalLengthInches.toFixed(2)}") - 
                        difference may be due to gap calculation method
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Pattern Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Pattern: {currentPattern.name}</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>
              <span className="font-medium">Sequence:</span>{' '}
              {currentPattern.items.map((pi) => {
                const item = items.find(i => i.id === pi.itemId);
                return item ? `${pi.count}× ${item.displayName}` : '';
              }).filter(Boolean).join(' → ')}
              {' '}<span className="font-medium">× {currentPattern.repeatCount} repeats</span>
            </div>
            {currentPattern.includeCaps && (
              <div className="flex items-center gap-2 text-orange-700">
                <span className="text-lg">( o )</span>
                <span>Caps included on beads ({result.beadCount} beads × 2 = {result.capCount} caps)</span>
                {gapSettings.capOverlap > 0 && (
                  <span className="text-xs bg-orange-100 px-2 py-0.5 rounded">
                    Cap overlap: {gapSettings.capOverlap}mm
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
