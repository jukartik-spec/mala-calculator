import React, { useState } from 'react';
import { useMala } from '../context/MalaContext';
import { BeadItem, ManiItem, CapItem, Pattern } from '../types/mala';

interface Combination {
  id: string;
  bead: BeadItem;
  cap: CapItem | null;
  mani: ManiItem | null;
  beadCount: number;
  maniCount: number;
  capCount: number;
  gap: number;
  lengthMM: number;
  lengthInches: number;
  weightGrams: number;
  goldWeightGrams: number;
  setsPerInch: number;
  lengthScore: number;
  weightScore: number;
  totalScore: number;
  // Calculation breakdown
  setLengthMM: number;
  setsLengthMM: number;
  maniLengthMM: number;
  gapsLengthMM: number;
  kadiLengthMM: number;
  totalGaps: number;
}

export const MalaFinder: React.FC<{ onSwitchTab: (tab: string) => void }> = ({ onSwitchTab }) => {
  const { items, setCurrentPattern, setGapSettings, gapSettings } = useMala();

  // Customer Requirements State
  const [targetLength, setTargetLength] = useState<number>(24);
  const [lengthPriority, setLengthPriority] = useState<'exact' | 'approximate' | 'minimum'>('approximate');
  
  const [targetWeight, setTargetWeight] = useState<number>(50);
  const [weightPriority, setWeightPriority] = useState<'exact' | 'max' | 'notimportant'>('notimportant');
  
  const [beadCount, setBeadCount] = useState<number>(54);
  const [beadCountMode, setBeadCountMode] = useState<'auto' | 'fixed'>('auto');
  const [selectedBeadTypes, setSelectedBeadTypes] = useState<string[]>(['all']);
  
  // Cap settings
  const [capOverlap, setCapOverlap] = useState<number>(1.2);
  const [useMeasuredSetLength, setUseMeasuredSetLength] = useState<boolean>(false);
  const [measuredSetLength, setMeasuredSetLength] = useState<number>(6.25);
  
  // Kadi Settings - ALWAYS included in target length (no checkbox)
  const [kadiSize, setKadiSize] = useState<number>(8);
  const [kadiWeight, setKadiWeight] = useState<number>(0.5);
  
  // Gap Gold Weight - use range (min/max grams)
  const [includeGapGoldWeight, setIncludeGapGoldWeight] = useState<boolean>(false);
  const [gapGoldWeightMin, setGapGoldWeightMin] = useState<number>(3);
  const [gapGoldWeightMax, setGapGoldWeightMax] = useState<number>(5);
  
  // Bead Size Preference
  const [beadSizeMode, setBeadSizeMode] = useState<'any' | 'exact' | 'range'>('any');
  const [beadSizeExact, setBeadSizeExact] = useState<number>(6);
  const [beadSizeMin, setBeadSizeMin] = useState<number>(4);
  const [beadSizeMax, setBeadSizeMax] = useState<number>(8);
  
  const [includeMani, setIncludeMani] = useState<boolean>(false);
  const [maniCountMode, setManiCountMode] = useState<'auto' | 'custom' | 'ratio'>('auto');
  const [customManiCount, setCustomManiCount] = useState<number>(53);
  const [maniRatio, setManiRatio] = useState<number>(2);
  
  const [includeCaps, setIncludeCaps] = useState<boolean>(true);
  const [includeKadi, setIncludeKadi] = useState<boolean>(false);
  
  // Gap settings - Default to 3mm fixed
  const [gapMin, setGapMin] = useState<number>(3);
  const [gapMax, setGapMax] = useState<number>(3);
  
  const [matchPriority, setMatchPriority] = useState<'length' | 'weight' | 'balanced'>('length');
  
  // Results
  const [results, setResults] = useState<Combination[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Get items by type
  const beads = items.filter(item => item.type === 'bead') as BeadItem[];
  const caps = items.filter(item => item.type === 'cap') as CapItem[];
  const maniItems = items.filter(item => item.type === 'mani') as ManiItem[];

  // Get unique bead materials
  const defaultMaterials = ['Rudraksha', 'Tulsi', 'Crystal'];
  const existingMaterials = [...new Set(beads.map(b => b.material || 'Other'))];
  const beadMaterials = [...new Set([...defaultMaterials, ...existingMaterials])];

  // Toggle bead type selection
  const toggleBeadType = (material: string) => {
    if (material === 'all') {
      setSelectedBeadTypes(['all']);
    } else {
      let newTypes = selectedBeadTypes.filter(t => t !== 'all');
      if (newTypes.includes(material)) {
        newTypes = newTypes.filter(t => t !== material);
      } else {
        newTypes.push(material);
      }
      if (newTypes.length === 0) {
        newTypes = ['all'];
      }
      setSelectedBeadTypes(newTypes);
    }
  };

  // Find combinations - FIXED LOGIC
  const findCombinations = () => {
    setIsSearching(true);
    setHasSearched(true);
    
    const combinations: Combination[] = [];
    const targetLengthMM = targetLength * 25.4;
    
    // Kadi is ALWAYS subtracted from target when included
    const kadiLengthMM = includeKadi ? kadiSize : 0;
    const targetForBeadsMM = targetLengthMM - kadiLengthMM;
    
    console.log('=== CALCULATION DEBUG ===');
    console.log('Target Length:', targetLength, 'inches =', targetLengthMM, 'mm');
    console.log('Kadi:', includeKadi ? kadiSize + 'mm' : 'Not included');
    console.log('Target for beads:', targetForBeadsMM, 'mm');
    
    // Filter beads by selected types
    let filteredBeads = selectedBeadTypes.includes('all') 
      ? beads 
      : beads.filter(b => selectedBeadTypes.includes(b.material || 'Other'));
    
    // Filter beads by size preference - more lenient
    if (beadSizeMode === 'exact') {
      const exactMatch = filteredBeads.filter(b => Math.abs(b.diameterMM - beadSizeExact) <= 1);
      if (exactMatch.length > 0) {
        filteredBeads = exactMatch;
      }
    } else if (beadSizeMode === 'range') {
      const rangeMatch = filteredBeads.filter(b => b.diameterMM >= beadSizeMin && b.diameterMM <= beadSizeMax);
      if (rangeMatch.length > 0) {
        filteredBeads = rangeMatch;
      }
    }
    
    // If no beads match, use all beads
    if (filteredBeads.length === 0) {
      filteredBeads = beads;
    }
    
    if (filteredBeads.length === 0) {
      alert('No beads available. Please add beads in Item Settings first.');
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Generate gap values to try
    const gapValues: number[] = [];
    for (let g = gapMin; g <= gapMax; g += 0.5) {
      gapValues.push(g);
    }
    if (gapValues.length === 0) {
      gapValues.push(gapMin);
    }

    console.log('Filtered beads:', filteredBeads.length);
    console.log('Gap values:', gapValues);

    // Try all combinations
    for (const bead of filteredBeads) {
      // Get compatible caps - cap should not be wider than bead
      let compatibleCaps = caps.filter(cap => cap.outerDiameterMM <= bead.diameterMM + 0.5);
      if (compatibleCaps.length === 0 && caps.length > 0) {
        // Use smallest cap if none are compatible
        compatibleCaps = [caps.reduce((a, b) => a.outerDiameterMM < b.outerDiameterMM ? a : b)];
      }
      
      const capsToTry = includeCaps ? (compatibleCaps.length > 0 ? compatibleCaps : [null]) : [null];
      const maniToTry = includeMani && maniItems.length > 0 ? maniItems : [null];
      
      for (const cap of capsToTry) {
        for (const mani of maniToTry) {
          for (const gap of gapValues) {
            // Calculate set length
            let setLengthMM = bead.diameterMM;
            if (useMeasuredSetLength && measuredSetLength > 0) {
              setLengthMM = measuredSetLength;
            } else if (cap) {
              const effectiveCapHeight = Math.max(0, cap.height - capOverlap);
              setLengthMM = bead.diameterMM + (effectiveCapHeight * 2);
            }
            
            // Calculate unit length (set + gap)
            const unitLength = setLengthMM + gap;
            
            // Generate bead counts to try
            const beadCountsToTry: number[] = [];
            
            if (beadCountMode === 'fixed') {
              beadCountsToTry.push(beadCount);
            } else {
              // Auto mode - estimate based on target
              const estimatedCount = Math.round(targetForBeadsMM / unitLength);
              
              // Try counts around the estimate
              for (let c = Math.max(5, estimatedCount - 10); c <= estimatedCount + 10; c++) {
                beadCountsToTry.push(c);
              }
              
              // Also try common counts if in range
              [27, 36, 54, 72, 108].forEach(c => {
                if (!beadCountsToTry.includes(c)) {
                  beadCountsToTry.push(c);
                }
              });
            }
            
            for (const currentBeadCount of beadCountsToTry) {
              // Calculate mani count
              let currentManiCount = 0;
              if (includeMani && mani) {
                switch (maniCountMode) {
                  case 'auto':
                    currentManiCount = Math.max(0, currentBeadCount - 1);
                    break;
                  case 'custom':
                    currentManiCount = customManiCount;
                    break;
                  case 'ratio':
                    currentManiCount = Math.floor(currentBeadCount / maniRatio);
                    break;
                }
              }
              
              // Calculate lengths
              const capCount = cap ? currentBeadCount * 2 : 0;
              const totalItems = currentBeadCount + currentManiCount;
              const totalGaps = Math.max(0, totalItems - 1);
              
              const setsLengthMM = currentBeadCount * setLengthMM;
              const maniLengthMM = mani ? currentManiCount * mani.height : 0;
              const gapsLengthMM = totalGaps * gap;
              
              // Beaded portion length (without kadi)
              const beadedLengthMM = setsLengthMM + maniLengthMM + gapsLengthMM;
              
              // Total length (with kadi)
              const totalLengthMM = beadedLengthMM + kadiLengthMM;
              const totalLengthInches = totalLengthMM / 25.4;
              
              // Calculate weight
              const beadWeightTotal = currentBeadCount * bead.weightGrams;
              const capWeightTotal = cap ? capCount * cap.weightGrams : 0;
              const maniWeightTotal = mani ? currentManiCount * mani.weightGrams : 0;
              const kadiWeightTotal = includeKadi ? kadiWeight : 0;
              const gapGoldWeight = includeGapGoldWeight ? ((gapGoldWeightMin + gapGoldWeightMax) / 2) : 0;
              
              const totalWeight = beadWeightTotal + capWeightTotal + maniWeightTotal + kadiWeightTotal;
              const goldWeight = capWeightTotal + maniWeightTotal + kadiWeightTotal + gapGoldWeight;
              
              // Sets per inch
              const setsPerInch = unitLength > 0 ? 25.4 / unitLength : 0;
              
              // Calculate scores - compare BEADED portion to targetForBeads
              const lengthDiff = Math.abs(beadedLengthMM - targetForBeadsMM);
              const lengthScore = targetForBeadsMM > 0 ? (lengthDiff / targetForBeadsMM) * 100 : 0;
              
              const weightDiff = Math.abs(totalWeight - targetWeight);
              const weightScore = weightPriority === 'notimportant' ? 0 : 
                (targetWeight > 0 ? (weightDiff / targetWeight) * 100 : 0);
              
              // Check criteria
              let meetsLengthCriteria = true;
              if (lengthPriority === 'exact' && lengthDiff > 5) meetsLengthCriteria = false;
              if (lengthPriority === 'approximate' && lengthDiff > 25.4) meetsLengthCriteria = false;
              if (lengthPriority === 'minimum' && beadedLengthMM < targetForBeadsMM) meetsLengthCriteria = false;
              
              let meetsWeightCriteria = true;
              if (weightPriority === 'exact' && weightDiff > 5) meetsWeightCriteria = false;
              if (weightPriority === 'max' && totalWeight > targetWeight) meetsWeightCriteria = false;
              
              if (!meetsLengthCriteria || !meetsWeightCriteria) continue;
              
              // Total score
              let totalScore = 0;
              switch (matchPriority) {
                case 'length':
                  totalScore = lengthScore * 2 + weightScore * 0.5;
                  break;
                case 'weight':
                  totalScore = lengthScore * 0.5 + weightScore * 2;
                  break;
                case 'balanced':
                  totalScore = lengthScore + weightScore;
                  break;
              }
              
              combinations.push({
                id: `${bead.id}-${cap?.id || 'nocap'}-${mani?.id || 'nomani'}-${gap}-${currentBeadCount}`,
                bead,
                cap: cap as CapItem | null,
                mani: mani as ManiItem | null,
                beadCount: currentBeadCount,
                maniCount: currentManiCount,
                capCount,
                gap,
                lengthMM: totalLengthMM,
                lengthInches: totalLengthInches,
                weightGrams: totalWeight,
                goldWeightGrams: goldWeight,
                setsPerInch,
                lengthScore,
                weightScore,
                totalScore,
                setLengthMM,
                setsLengthMM,
                maniLengthMM,
                gapsLengthMM,
                kadiLengthMM,
                totalGaps
              });
            }
          }
        }
      }
    }
    
    console.log('Total combinations found:', combinations.length);
    
    // Sort by total score and take top 10
    combinations.sort((a, b) => a.totalScore - b.totalScore);
    const topResults = combinations.slice(0, 10);
    
    console.log('Top results:', topResults.map(r => ({
      beads: r.beadCount,
      caps: r.capCount,
      length: r.lengthInches.toFixed(2) + '"',
      score: r.totalScore.toFixed(2)
    })));
    
    setResults(topResults);
    setIsSearching(false);
  };

  // Send to Pattern Builder
  const sendToPatternBuilder = (combo: Combination) => {
    const patternItems: { itemId: string; count: number }[] = [];
    
    patternItems.push({ itemId: combo.bead.id, count: combo.beadCount });
    
    if (combo.mani) {
      patternItems.push({ itemId: combo.mani.id, count: combo.maniCount });
    }
    
    const kadiSettings = {
      enabled: includeKadi,
      sizeMM: kadiSize,
      weightGrams: kadiWeight
    };
    
    const patternId = `pattern-${Date.now()}`;
    
    const newPattern: Pattern = {
      id: patternId,
      name: `Mala Finder - ${combo.bead.displayName || combo.bead.name}`,
      items: patternItems,
      repeatCount: 1,
      includeCaps: combo.cap !== null,
      selectedCapId: combo.cap?.id || undefined,
      kadiSettings: kadiSettings
    };
    
    setGapSettings({
      ...gapSettings,
      uniformGap: combo.gap
    });
    
    setCurrentPattern(newPattern);
    
    setTimeout(() => {
      onSwitchTab('builder');
    }, 100);
  };

  const getRankLabel = (index: number): { label: string; color: string } => {
    const labels = [
      { label: '⭐ Best Match', color: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
      { label: '🥈 Runner Up', color: 'bg-gray-100 border-gray-400 text-gray-700' },
      { label: '🥉 Option 3', color: 'bg-orange-50 border-orange-300 text-orange-700' },
      { label: '4️⃣ Option 4', color: 'bg-blue-50 border-blue-300 text-blue-700' },
      { label: '5️⃣ Option 5', color: 'bg-purple-50 border-purple-300 text-purple-700' }
    ];
    return labels[index] || { label: `Option ${index + 1}`, color: 'bg-gray-100 border-gray-300' };
  };

  const getMatchPercentage = (score: number): number => {
    return Math.max(0, Math.min(100, 100 - score));
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Customer Requirements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          📋 Customer Requirements
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Target Length */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                📏 Target Length (inches)
              </label>
              <input
                type="number"
                value={targetLength}
                onChange={(e) => setTargetLength(parseFloat(e.target.value) || 0)}
                step="0.5"
                className="w-full px-3 py-2 border rounded-lg text-lg font-semibold"
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="lengthPriority"
                    checked={lengthPriority === 'exact'}
                    onChange={() => setLengthPriority('exact')}
                  />
                  Exact
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="lengthPriority"
                    checked={lengthPriority === 'approximate'}
                    onChange={() => setLengthPriority('approximate')}
                  />
                  Approximate (±1")
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="lengthPriority"
                    checked={lengthPriority === 'minimum'}
                    onChange={() => setLengthPriority('minimum')}
                  />
                  Minimum
                </label>
              </div>
              {includeKadi && (
                <p className="mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  ℹ️ Target includes Kadi ({kadiSize}mm). Beaded portion: {((targetLength * 25.4) - kadiSize).toFixed(1)}mm = {(((targetLength * 25.4) - kadiSize) / 25.4).toFixed(2)}"
                </p>
              )}
            </div>
            
            {/* Target Weight */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <label className="block text-sm font-semibold text-green-800 mb-2">
                ⚖️ Target Weight (grams) - Optional
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                step="1"
                className="w-full px-3 py-2 border rounded-lg"
                disabled={weightPriority === 'notimportant'}
              />
              <div className="mt-2 flex gap-2 flex-wrap">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="weightPriority"
                    checked={weightPriority === 'exact'}
                    onChange={() => setWeightPriority('exact')}
                  />
                  Exact
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="weightPriority"
                    checked={weightPriority === 'max'}
                    onChange={() => setWeightPriority('max')}
                  />
                  Max Limit
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="weightPriority"
                    checked={weightPriority === 'notimportant'}
                    onChange={() => setWeightPriority('notimportant')}
                  />
                  Not Important
                </label>
              </div>
            </div>
            
            {/* Bead Count */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                📿 Bead Count (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="beadCountMode"
                    checked={beadCountMode === 'auto'}
                    onChange={() => setBeadCountMode('auto')}
                  />
                  Auto (based on length)
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="beadCountMode"
                    checked={beadCountMode === 'fixed'}
                    onChange={() => setBeadCountMode('fixed')}
                  />
                  Fixed count
                </label>
              </div>
              {beadCountMode === 'fixed' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={beadCount}
                    onChange={(e) => setBeadCount(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={() => setBeadCount(27)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${beadCount === 27 ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}
                  >
                    27
                  </button>
                  <button
                    onClick={() => setBeadCount(54)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${beadCount === 54 ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}
                  >
                    54
                  </button>
                  <button
                    onClick={() => setBeadCount(108)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${beadCount === 108 ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}
                  >
                    108
                  </button>
                </div>
              )}
            </div>
            
            {/* Bead Size Preference */}
            <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
              <label className="block text-sm font-semibold text-rose-800 mb-2">
                📐 Bead Size Preference (mm)
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="beadSizeMode"
                    checked={beadSizeMode === 'any'}
                    onChange={() => setBeadSizeMode('any')}
                  />
                  Any size
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="beadSizeMode"
                    checked={beadSizeMode === 'exact'}
                    onChange={() => setBeadSizeMode('exact')}
                  />
                  Specific size
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name="beadSizeMode"
                    checked={beadSizeMode === 'range'}
                    onChange={() => setBeadSizeMode('range')}
                  />
                  Size range
                </label>
              </div>
              {beadSizeMode === 'exact' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={beadSizeExact}
                    onChange={(e) => setBeadSizeExact(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    className="w-24 px-3 py-2 border rounded-lg"
                  />
                  <span className="text-sm text-gray-500">mm (±1mm tolerance)</span>
                </div>
              )}
              {beadSizeMode === 'range' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={beadSizeMin}
                    onChange={(e) => setBeadSizeMin(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={beadSizeMax}
                    onChange={(e) => setBeadSizeMax(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    className="w-20 px-2 py-1 border rounded text-sm"
                  />
                  <span className="text-sm text-gray-500">mm</span>
                </div>
              )}
            </div>
            
            {/* Bead Type Filter */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎨 Bead Type Preference
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border">
                  <input
                    type="checkbox"
                    checked={selectedBeadTypes.includes('all')}
                    onChange={() => toggleBeadType('all')}
                  />
                  All Types
                </label>
                {beadMaterials.map(material => (
                  <label key={material} className="flex items-center gap-1 text-sm bg-white px-2 py-1 rounded border">
                    <input
                      type="checkbox"
                      checked={selectedBeadTypes.includes(material)}
                      onChange={() => toggleBeadType(material)}
                      disabled={selectedBeadTypes.includes('all')}
                    />
                    {material}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            {/* Mani Settings */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-yellow-800">
                  ✦ Mani (Gold Balls)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeMani}
                    onChange={(e) => setIncludeMani(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Include</span>
                </label>
              </div>
              
              {includeMani && (
                <div className="space-y-2 mt-3">
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="maniMode"
                        checked={maniCountMode === 'auto'}
                        onChange={() => setManiCountMode('auto')}
                      />
                      Auto (beadCount - 1)
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="maniMode"
                        checked={maniCountMode === 'custom'}
                        onChange={() => setManiCountMode('custom')}
                      />
                      Custom
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="maniMode"
                        checked={maniCountMode === 'ratio'}
                        onChange={() => setManiCountMode('ratio')}
                      />
                      Ratio
                    </label>
                  </div>
                  
                  {maniCountMode === 'custom' && (
                    <input
                      type="number"
                      value={customManiCount}
                      onChange={(e) => setCustomManiCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  )}
                  
                  {maniCountMode === 'ratio' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">1 mani per</span>
                      <input
                        type="number"
                        value={maniRatio}
                        onChange={(e) => setManiRatio(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                        min="1"
                      />
                      <span className="text-sm">beads</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Include Options */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label className="block text-sm font-semibold text-orange-800 mb-2">
                ⚙️ Include
              </label>
              <div className="space-y-3">
                {/* Caps Option */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeCaps}
                      onChange={(e) => setIncludeCaps(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Caps on beads (2 per bead)</span>
                  </label>
                  
                  {includeCaps && (
                    <div className="ml-6 p-2 bg-white rounded border border-orange-200 space-y-3">
                      <div className="space-y-2">
                        <label className="block text-xs text-orange-700 font-medium">
                          Set Length Calculation:
                        </label>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="radio"
                              checked={!useMeasuredSetLength}
                              onChange={() => setUseMeasuredSetLength(false)}
                            />
                            Calculate from components
                          </label>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="radio"
                              checked={useMeasuredSetLength}
                              onChange={() => setUseMeasuredSetLength(true)}
                            />
                            Use Measured Set Length
                          </label>
                        </div>
                      </div>
                      
                      {!useMeasuredSetLength && (
                        <div>
                          <label className="block text-xs text-orange-700 mb-1">
                            Cap Overlap / Fit Depth (mm)
                          </label>
                          <input
                            type="number"
                            value={capOverlap}
                            onChange={(e) => setCapOverlap(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      )}
                      
                      {useMeasuredSetLength && (
                        <div>
                          <label className="block text-xs text-orange-700 mb-1">
                            Measured Set Length (mm) - one ( o ) set
                          </label>
                          <input
                            type="number"
                            value={measuredSetLength}
                            onChange={(e) => setMeasuredSetLength(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Kadi Option - SIMPLIFIED */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeKadi}
                      onChange={(e) => setIncludeKadi(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Kadi (Joint)</span>
                  </label>
                  
                  {includeKadi && (
                    <div className="ml-6 p-2 bg-white rounded border border-orange-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-orange-700 mb-1">Size (mm)</label>
                          <input
                            type="number"
                            value={kadiSize}
                            onChange={(e) => setKadiSize(parseFloat(e.target.value) || 0)}
                            step="0.5"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-orange-700 mb-1">Weight (g)</label>
                          <input
                            type="number"
                            value={kadiWeight}
                            onChange={(e) => setKadiWeight(parseFloat(e.target.value) || 0)}
                            step="0.05"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        ℹ️ Kadi is included in target length. Beaded portion = Target - Kadi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Gap Range */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-sm font-semibold text-purple-800 mb-2">
                📏 Gap Range (mm)
              </label>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={gapMin}
                  onChange={(e) => setGapMin(parseFloat(e.target.value) || 0)}
                  step="0.5"
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
                <span>to</span>
                <input
                  type="number"
                  value={gapMax}
                  onChange={(e) => setGapMax(parseFloat(e.target.value) || 0)}
                  step="0.5"
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
                <span className="text-sm text-gray-500">mm</span>
              </div>
              
              {/* Gap Gold Weight Option */}
              <div className="border-t border-purple-200 pt-2 mt-2">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={includeGapGoldWeight}
                    onChange={(e) => setIncludeGapGoldWeight(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-purple-800">Include Gold Wire Weight</span>
                </label>
                
                {includeGapGoldWeight && (
                  <div className="ml-6 flex items-center gap-2">
                    <span className="text-xs">Min:</span>
                    <input
                      type="number"
                      value={gapGoldWeightMin}
                      onChange={(e) => setGapGoldWeightMin(parseFloat(e.target.value) || 0)}
                      step="0.5"
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-xs">g to Max:</span>
                    <input
                      type="number"
                      value={gapGoldWeightMax}
                      onChange={(e) => setGapGoldWeightMax(parseFloat(e.target.value) || 0)}
                      step="0.5"
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-xs">g</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Match Priority */}
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <label className="block text-sm font-semibold text-indigo-800 mb-2">
                🎯 Match Priority
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="matchPriority"
                    checked={matchPriority === 'length'}
                    onChange={() => setMatchPriority('length')}
                  />
                  <span className="text-sm">🎯 Closest to Target Length</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="matchPriority"
                    checked={matchPriority === 'weight'}
                    onChange={() => setMatchPriority('weight')}
                  />
                  <span className="text-sm">⚖️ Closest to Target Weight</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="matchPriority"
                    checked={matchPriority === 'balanced'}
                    onChange={() => setMatchPriority('balanced')}
                  />
                  <span className="text-sm">📏⚖️ Balance Both Equally</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Find Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={findCombinations}
            disabled={isSearching || beads.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <span className="animate-spin">⏳</span>
                Searching...
              </>
            ) : (
              <>
                🔍 Find Best Combinations
              </>
            )}
          </button>
        </div>
        
        {beads.length === 0 && (
          <p className="mt-4 text-center text-red-500 text-sm">
            ⚠️ No beads in database. Please add beads in Item Settings first.
          </p>
        )}
      </div>
      
      {/* Section 2: Results */}
      {hasSearched && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📊 Results
            {results.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Found {results.length} combinations)
              </span>
            )}
          </h2>
          
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">🤔</p>
              <p className="font-medium">No combinations found</p>
              <p className="text-sm mt-1">Try adjusting your requirements or check the browser console for debug info</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((combo, index) => {
                const rank = getRankLabel(index);
                const lengthMatch = getMatchPercentage(combo.lengthScore);
                const weightMatch = getMatchPercentage(combo.weightScore);
                
                return (
                  <div key={combo.id} className={`p-4 rounded-lg border-2 ${rank.color}`}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold">{rank.label}</span>
                      <button
                        onClick={() => sendToPatternBuilder(combo)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                      >
                        📋 Send to Pattern Builder
                      </button>
                    </div>
                    
                    {/* Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2 bg-amber-100 px-2 py-1 rounded">
                        <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: combo.bead.color || '#8B4513' }}></span>
                        <span className="font-medium truncate">📿 {combo.bead.displayName || combo.bead.name}</span>
                        <span className="text-amber-700">({combo.bead.diameterMM}mm)</span>
                        <span className="ml-auto font-bold">×{combo.beadCount}</span>
                      </div>
                      {combo.cap && (
                        <div className="flex items-center gap-2 bg-orange-100 px-2 py-1 rounded">
                          <span className="w-4 h-4 rounded-l-full shrink-0" style={{ backgroundColor: combo.cap.color || '#DAA520' }}></span>
                          <span className="font-medium truncate">🔶 {combo.cap.displayName || combo.cap.name}</span>
                          <span className="text-orange-700">({combo.cap.outerDiameterMM}mm)</span>
                          <span className="ml-auto font-bold">×{combo.capCount}</span>
                        </div>
                      )}
                      {combo.mani && (
                        <div className="flex items-center gap-2 bg-yellow-100 px-2 py-1 rounded">
                          <span className="w-4 h-4 rounded-full border-2 border-yellow-600 shrink-0" style={{ backgroundColor: combo.mani.color || '#FFD700' }}></span>
                          <span className="font-medium truncate">✦ {combo.mani.displayName || combo.mani.name}</span>
                          <span className="text-yellow-700">({combo.mani.ballGauge}mm)</span>
                          <span className="ml-auto font-bold">×{combo.maniCount}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
                        <span className="font-medium">📏 Gap:</span>
                        <span className="font-bold">{combo.gap}mm</span>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <div className="bg-white bg-opacity-50 p-2 rounded text-center">
                        <div className="text-lg font-bold text-blue-600">{combo.lengthInches.toFixed(2)}"</div>
                        <div className="text-xs text-gray-500">Total Length</div>
                        <div className="text-xs text-gray-400">{combo.lengthMM.toFixed(1)}mm</div>
                      </div>
                      <div className="bg-white bg-opacity-50 p-2 rounded text-center">
                        <div className="text-lg font-bold text-green-600">{combo.weightGrams.toFixed(1)}g</div>
                        <div className="text-xs text-gray-500">Weight</div>
                      </div>
                      <div className="bg-white bg-opacity-50 p-2 rounded text-center">
                        <div className="text-lg font-bold text-yellow-600">{combo.goldWeightGrams.toFixed(2)}g</div>
                        <div className="text-xs text-gray-500">Gold Weight</div>
                      </div>
                      <div className="bg-white bg-opacity-50 p-2 rounded text-center">
                        <div className="text-lg font-bold text-purple-600">{combo.setsPerInch.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Sets/Inch</div>
                      </div>
                    </div>
                    
                    {/* Match Bars */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16">Length:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${lengthMatch}%` }}></div>
                        </div>
                        <span className="w-12 text-right">{lengthMatch.toFixed(0)}%</span>
                      </div>
                      {weightPriority !== 'notimportant' && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-16">Weight:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${weightMatch}%` }}></div>
                          </div>
                          <span className="w-12 text-right">{weightMatch.toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Calculation Breakdown */}
                    <details className="mt-3">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        📐 Show Calculation Breakdown
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span>Sets ({combo.beadCount} × {combo.setLengthMM.toFixed(2)}mm):</span>
                          <span className="font-bold">{combo.setsLengthMM.toFixed(2)}mm</span>
                        </div>
                        {combo.maniLengthMM > 0 && (
                          <div className="flex justify-between">
                            <span>Mani ({combo.maniCount} × {combo.mani?.height || 0}mm):</span>
                            <span className="font-bold">{combo.maniLengthMM.toFixed(2)}mm</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Gaps ({combo.totalGaps} × {combo.gap}mm):</span>
                          <span className="font-bold">{combo.gapsLengthMM.toFixed(2)}mm</span>
                        </div>
                        {combo.kadiLengthMM > 0 && (
                          <div className="flex justify-between">
                            <span>Kadi:</span>
                            <span className="font-bold">{combo.kadiLengthMM.toFixed(2)}mm</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-300 pt-1 mt-1">
                          <span>TOTAL:</span>
                          <span className="font-bold">{combo.lengthMM.toFixed(2)}mm = {combo.lengthInches.toFixed(2)}"</span>
                        </div>
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
