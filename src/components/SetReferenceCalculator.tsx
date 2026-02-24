import React, { useState, useMemo } from 'react';
import { NumberInput } from './NumberInput';

/**
 * Set Reference Calculator
 * A tool to calculate set measurements from a physical reference sample
 */
export const SetReferenceCalculator: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Reference measurements
  const [refSetCount, setRefSetCount] = useState<number>(10);
  const [refLengthMM, setRefLengthMM] = useState<number>(0);
  const [refLengthInches, setRefLengthInches] = useState<number>(1);
  const [useInches, setUseInches] = useState(true);
  
  // Target calculation
  const [targetSets, setTargetSets] = useState<number>(54);
  
  // Calculate from reference
  const calculations = useMemo(() => {
    const totalRefMM = useInches ? refLengthInches * 25.4 : refLengthMM;
    
    if (refSetCount <= 0 || totalRefMM <= 0) {
      return null;
    }
    
    const setLengthWithGapMM = totalRefMM / refSetCount;
    const setsPerInch = 25.4 / setLengthWithGapMM;
    const targetLengthMM = targetSets * setLengthWithGapMM;
    const targetLengthInches = targetLengthMM / 25.4;
    
    return {
      setLengthWithGapMM,
      setsPerInch,
      targetLengthMM,
      targetLengthInches,
    };
  }, [refSetCount, refLengthMM, refLengthInches, useInches, targetSets]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📐</span>
          <div className="text-left">
            <h3 className="font-semibold text-indigo-800">Set Reference Calculator</h3>
            <p className="text-xs text-indigo-600">Calculate from a physical sample</p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-indigo-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">How to use:</h4>
            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Measure a sample section of your mala (e.g., 10 sets)</li>
              <li>Enter the number of sets and measured length below</li>
              <li>Get calculated set length and sets per inch</li>
              <li>Calculate target mala length based on number of sets needed</li>
            </ol>
          </div>
          
          {/* Reference Input */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-4">Reference Measurement</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Number of Sets ( o )</label>
                <NumberInput
                  value={refSetCount}
                  onChange={setRefSetCount}
                  min={1}
                  step={1}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Count sets in your sample</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Measured Length
                  <button
                    onClick={() => setUseInches(!useInches)}
                    className="ml-2 text-xs text-indigo-600 hover:underline"
                  >
                    ({useInches ? 'inches' : 'mm'}) - click to switch
                  </button>
                </label>
                {useInches ? (
                  <NumberInput
                    value={refLengthInches}
                    onChange={setRefLengthInches}
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <NumberInput
                    value={refLengthMM}
                    onChange={setRefLengthMM}
                    min={0}
                    step={0.1}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Total length of {refSetCount} sets
                </p>
              </div>
            </div>
          </div>
          
          {/* Calculated Results */}
          {calculations && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Calculated from Reference</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="text-sm text-green-700">Set Length (with gap)</div>
                  <div className="text-2xl font-bold text-green-900">
                    {calculations.setLengthWithGapMM.toFixed(2)}mm
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="text-sm text-green-700">Sets per Inch</div>
                  <div className="text-2xl font-bold text-green-900">
                    {calculations.setsPerInch.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Target Calculator */}
          {calculations && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-4">Target Mala Calculator</h4>
              
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Target Number of Sets</label>
                  <NumberInput
                    value={targetSets}
                    onChange={setTargetSets}
                    min={1}
                    step={1}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <div className="flex gap-2 mt-2">
                    {[27, 54, 108].map(preset => (
                      <button
                        key={preset}
                        onClick={() => setTargetSets(preset)}
                        className={`px-2 py-1 text-xs rounded ${
                          targetSets === preset 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-sm text-indigo-700">Estimated Mala Length</div>
                  <div className="text-2xl font-bold text-indigo-900">
                    {calculations.targetLengthInches.toFixed(2)}"
                  </div>
                  <div className="text-xs text-indigo-600">
                    {calculations.targetLengthMM.toFixed(1)}mm
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Visual explanation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">What is a "Set"?</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>A set is</span>
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-4 h-5 bg-amber-400 rounded-l-full text-xs">(</span>
                <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-700 rounded-full text-white text-xs">o</span>
                <span className="inline-flex items-center justify-center w-4 h-5 bg-amber-400 rounded-r-full text-xs">)</span>
              </div>
              <span>= Cap + Bead + Cap with the gap to next set</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
