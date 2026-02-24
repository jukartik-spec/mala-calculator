import { useState, useEffect, useRef, useCallback } from 'react';
import { useMala } from '../context/MalaContext';
import { Pattern, PatternItem, getDisplayDiameter, CapItem, KadiSettings } from '../types/mala';
import { NumberInput } from './NumberInput';

export function PatternBuilder() {
  const { 
    items, 
    currentPattern, 
    setCurrentPattern, 
    patterns, 
    setPatterns, 
    gapSettings,
    setGapSettings
  } = useMala();
  
  const [patternName, setPatternName] = useState('Custom Pattern');
  const [showGapSettings, setShowGapSettings] = useState(false);
  
  // Pattern items in the bucket
  const [bucketItems, setBucketItems] = useState<PatternItem[]>([]);

  // Dropdown selections
  const [selectedBeadId, setSelectedBeadId] = useState('');
  const [selectedManiId, setSelectedManiId] = useState('');
  const [addBeadCount, setAddBeadCount] = useState(1);
  const [addManiCount, setAddManiCount] = useState(1);

  // Caps toggle
  const [includeCaps, setIncludeCaps] = useState(false);
  const [selectedCapId, setSelectedCapId] = useState('');
  
  // Kadi settings (simplified - not a dropdown, just settings)
  const [kadiSettings, setKadiSettings] = useState<KadiSettings>({
    enabled: false,
    sizeMM: 8,
    weightGrams: 0.5
  });
  
  // Prevent infinite update loops
  const isUpdatingFromPattern = useRef(false);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get items by type
  const beadItems = items.filter(i => i.type === 'bead');
  const maniItems = items.filter(i => i.type === 'mani');
  const capItems = items.filter(i => i.type === 'cap');

  // Set default selections when items are available
  useEffect(() => {
    if (beadItems.length > 0 && !selectedBeadId) {
      setSelectedBeadId(beadItems[0].id);
    }
    if (maniItems.length > 0 && !selectedManiId) {
      setSelectedManiId(maniItems[0].id);
    }
    if (capItems.length > 0 && !selectedCapId) {
      setSelectedCapId(capItems[0].id);
    }
  }, [beadItems, maniItems, capItems, selectedBeadId, selectedManiId, selectedCapId]);

  // Add bead to bucket
  const addBeadToBucket = () => {
    if (!selectedBeadId || addBeadCount <= 0) return;
    
    setBucketItems(prev => {
      const existingIndex = prev.findIndex(bi => bi.itemId === selectedBeadId);
      if (existingIndex >= 0) {
        const newBucket = [...prev];
        newBucket[existingIndex] = { ...newBucket[existingIndex], count: newBucket[existingIndex].count + addBeadCount };
        return newBucket;
      } else {
        return [...prev, { itemId: selectedBeadId, count: addBeadCount }];
      }
    });
  };

  // Add mani to bucket
  const addManiToBucket = () => {
    if (!selectedManiId || addManiCount <= 0) return;
    
    setBucketItems(prev => {
      const existingIndex = prev.findIndex(bi => bi.itemId === selectedManiId);
      if (existingIndex >= 0) {
        const newBucket = [...prev];
        newBucket[existingIndex] = { ...newBucket[existingIndex], count: newBucket[existingIndex].count + addManiCount };
        return newBucket;
      } else {
        return [...prev, { itemId: selectedManiId, count: addManiCount }];
      }
    });
  };

  // Update item count in bucket
  const updateBucketItemCount = (index: number, count: number) => {
    if (count <= 0) {
      setBucketItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setBucketItems(prev => {
        const newBucket = [...prev];
        newBucket[index] = { ...newBucket[index], count };
        return newBucket;
      });
    }
  };

  // Remove item from bucket
  const removeFromBucket = (index: number) => {
    setBucketItems(prev => prev.filter((_, i) => i !== index));
  };

  // Move item up/down in bucket
  const moveBucketItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === bucketItems.length - 1) return;
    
    setBucketItems(prev => {
      const newBucket = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newBucket[index], newBucket[newIndex]] = [newBucket[newIndex], newBucket[index]];
      return newBucket;
    });
  };

  // Clear bucket
  const clearBucket = () => {
    setBucketItems([]);
    setIncludeCaps(false);
    setKadiSettings({ enabled: false, sizeMM: 8, weightGrams: 0.5 });
  };

  // Update pattern in context
  const updatePattern = useCallback(() => {
    if (isUpdatingFromPattern.current) return;
    
    if (bucketItems.length > 0) {
      const pattern: Pattern = {
        id: currentPattern?.id || `pattern-${Date.now()}`,
        name: patternName,
        items: bucketItems,
        repeatCount: 1,
        includeCaps,
        selectedCapId: includeCaps ? selectedCapId : undefined,
        kadiSettings,
      };
      setCurrentPattern(pattern);
    } else {
      setCurrentPattern(null);
    }
  }, [bucketItems, patternName, includeCaps, selectedCapId, kadiSettings, currentPattern?.id, setCurrentPattern]);

  // Debounced update
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      updatePattern();
    }, 100);
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [bucketItems, patternName, includeCaps, selectedCapId, kadiSettings, updatePattern]);

  // Load pattern from context (triggered when currentPattern changes from external source like MalaFinder)
  useEffect(() => {
    if (currentPattern && !isUpdatingFromPattern.current) {
      isUpdatingFromPattern.current = true;
      
      // Update all local states from the pattern
      setPatternName(currentPattern.name || 'Custom Pattern');
      setIncludeCaps(currentPattern.includeCaps || false);
      setSelectedCapId(currentPattern.selectedCapId || capItems[0]?.id || '');
      setKadiSettings(currentPattern.kadiSettings || { enabled: false, sizeMM: 8, weightGrams: 0.5 });
      
      // Update bucket items
      if (currentPattern.items && currentPattern.items.length > 0) {
        setBucketItems([...currentPattern.items]);
      }
      
      setTimeout(() => {
        isUpdatingFromPattern.current = false;
      }, 200);
    }
  }, [currentPattern?.id, currentPattern?.name, currentPattern?.items?.length, capItems]);

  const savePattern = () => {
    if (!currentPattern) return;
    const existingIndex = patterns.findIndex(p => p.id === currentPattern.id);
    if (existingIndex >= 0) {
      const newPatterns = [...patterns];
      newPatterns[existingIndex] = currentPattern;
      setPatterns(newPatterns);
    } else {
      setPatterns([...patterns, currentPattern]);
    }
  };

  const loadPattern = (pattern: Pattern) => {
    setCurrentPattern(pattern);
  };

  const getItemById = (id: string) => items.find(i => i.id === id);

  // Calculate totals
  const beadCount = bucketItems.reduce((sum, bi) => {
    const item = getItemById(bi.itemId);
    return item?.type === 'bead' ? sum + bi.count : sum;
  }, 0);
  
  const maniCount = bucketItems.reduce((sum, bi) => {
    const item = getItemById(bi.itemId);
    return item?.type === 'mani' ? sum + bi.count : sum;
  }, 0);
  
  const totalCaps = includeCaps ? beadCount * 2 : 0;
  const totalPieces = beadCount + maniCount + totalCaps + (kadiSettings.enabled ? 1 : 0);
  
  const selectedCap = capItems.find(c => c.id === selectedCapId) as CapItem | undefined;

  // Quick presets
  const loadPreset = (presetName: string) => {
    const defaultBead = beadItems[0];
    const defaultMani = maniItems[0];
    
    if (presetName === '108') {
      if (defaultBead) {
        setBucketItems([{ itemId: defaultBead.id, count: 108 }]);
        setPatternName('Standard 108 Mala');
      }
    } else if (presetName === '54+53') {
      const newItems: PatternItem[] = [];
      if (defaultBead) newItems.push({ itemId: defaultBead.id, count: 54 });
      if (defaultMani) newItems.push({ itemId: defaultMani.id, count: 53 });
      setBucketItems(newItems);
      setPatternName('54 Bead + 53 Mani');
    } else if (presetName === '27+26') {
      const newItems: PatternItem[] = [];
      if (defaultBead) newItems.push({ itemId: defaultBead.id, count: 27 });
      if (defaultMani) newItems.push({ itemId: defaultMani.id, count: 26 });
      setBucketItems(newItems);
      setPatternName('27 Bead + 26 Mani');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Pattern Builder
      </h2>

      {/* Quick Presets */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-gray-600">Presets:</span>
        <button onClick={() => loadPreset('108')} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200">108 Bead</button>
        <button onClick={() => loadPreset('54+53')} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200">54+53</button>
        <button onClick={() => loadPreset('27+26')} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200">27+26</button>
        <button onClick={clearBucket} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200">Clear</button>
      </div>

      {/* Saved Patterns */}
      {patterns.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Patterns</h3>
          <div className="flex gap-2 flex-wrap">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => loadPattern(pattern)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  currentPattern?.id === pattern.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border border-gray-300 hover:border-purple-400'
                }`}
              >
                {pattern.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pattern Name</label>
        <input
          type="text"
          value={patternName}
          onChange={(e) => setPatternName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Enter pattern name"
        />
      </div>

      {/* Add Items Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Add Items to Pattern</h3>
        
        {/* Add Beads */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <h4 className="text-sm font-medium text-amber-800 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-700"></div>
            Add Beads
          </h4>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedBeadId}
              onChange={(e) => setSelectedBeadId(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 border rounded-lg text-sm bg-white"
            >
              {beadItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.displayName} ({getDisplayDiameter(item)}mm)
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">×</span>
              <NumberInput
                value={addBeadCount}
                onChange={setAddBeadCount}
                min={1}
                step={1}
                className="w-16 px-2 py-2 border rounded-lg text-sm text-center"
              />
            </div>
            <button
              onClick={addBeadToBucket}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Add Mani */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-700"></div>
            Add Mani (Gold Balls)
          </h4>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedManiId}
              onChange={(e) => setSelectedManiId(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 border rounded-lg text-sm bg-white"
            >
              {maniItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.displayName} ({getDisplayDiameter(item)}mm)
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">×</span>
              <NumberInput
                value={addManiCount}
                onChange={setAddManiCount}
                min={1}
                step={1}
                className="w-16 px-2 py-2 border rounded-lg text-sm text-center"
              />
            </div>
            <button
              onClick={addManiToBucket}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Caps Toggle */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 20 20">
              <path d="M 14 3 Q 4 10 14 17" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Caps (Gold)
          </h4>
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={includeCaps}
              onChange={(e) => setIncludeCaps(e.target.checked)}
              className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Caps on Beads</span>
          </label>
          
          {includeCaps && (
            <select
              value={selectedCapId}
              onChange={(e) => setSelectedCapId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
            >
              {capItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.displayName} ({getDisplayDiameter(item)}mm, {item.height}mm h)
                </option>
              ))}
            </select>
          )}
          
          {includeCaps && beadCount > 0 && (
            <p className="text-sm text-orange-700 mt-2 bg-orange-100 rounded px-2 py-1">
              {beadCount} beads × 2 = <strong>{beadCount * 2} caps</strong>
            </p>
          )}
        </div>
        
        {/* Kadi (Joint) Settings */}
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4 border border-yellow-300">
          <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Kadi (Joint) - Gold
          </h4>
          
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={kadiSettings.enabled}
              onChange={(e) => setKadiSettings({ ...kadiSettings, enabled: e.target.checked })}
              className="w-5 h-5 rounded text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Kadi at Joint</span>
          </label>
          
          {kadiSettings.enabled && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-xs text-yellow-800 mb-1">Kadi Size (mm)</label>
                <NumberInput
                  value={kadiSettings.sizeMM}
                  onChange={(val) => setKadiSettings({ ...kadiSettings, sizeMM: val })}
                  min={1}
                  step={0.5}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-yellow-800 mb-1">Weight (grams)</label>
                <NumberInput
                  value={kadiSettings.weightGrams}
                  onChange={(val) => setKadiSettings({ ...kadiSettings, weightGrams: val })}
                  min={0}
                  step={0.1}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm bg-white"
                />
              </div>
            </div>
          )}
          
          {kadiSettings.enabled && (
            <p className="text-xs text-yellow-700 mt-2">
              Kadi adds {kadiSettings.sizeMM}mm to mala length and {kadiSettings.weightGrams}g to gold weight
            </p>
          )}
        </div>
      </div>

      {/* Pattern Bucket */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
          <span>📦 Pattern Bucket</span>
          <span className="text-sm font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{totalPieces} pieces</span>
        </h3>
        
        {bucketItems.length === 0 && !includeCaps && !kadiSettings.enabled ? (
          <div className="text-center py-6 text-gray-400">
            <p>Add items using the dropdowns above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Show Kadi if enabled */}
            {kadiSettings.enabled && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-300 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-yellow-600 flex items-center justify-center">
                  <span className="text-[10px] text-yellow-900">◉</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-yellow-800">Kadi (Joint)</div>
                  <div className="text-xs text-yellow-600">{kadiSettings.sizeMM}mm • {kadiSettings.weightGrams}g gold</div>
                </div>
                <div className="text-sm font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded">
                  ×1
                </div>
              </div>
            )}
            
            {/* Show Caps if enabled (they wrap beads) */}
            {includeCaps && selectedCap && beadCount > 0 && (
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-6 rounded-l-full shrink-0"
                    style={{ backgroundColor: selectedCap.color }}
                  />
                  <div 
                    className="w-3 h-6 rounded-r-full shrink-0"
                    style={{ backgroundColor: selectedCap.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-orange-800">{selectedCap.displayName}</div>
                  <div className="text-xs text-orange-600">caps • wraps each bead (×2)</div>
                </div>
                <div className="text-sm font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded">
                  {beadCount} × 2 = {beadCount * 2}
                </div>
              </div>
            )}
            
            {/* Regular bucket items */}
            {bucketItems.map((bi, index) => {
              const item = getItemById(bi.itemId);
              if (!item) return null;
              
              const isBead = item.type === 'bead';
              
              return (
                <div key={`${bi.itemId}-${index}`} className={`rounded-lg p-3 border flex items-center gap-2 flex-wrap sm:flex-nowrap ${
                  isBead ? 'bg-amber-50 border-amber-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  {/* Move buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveBucketItem(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs px-1"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveBucketItem(index, 'down')}
                      disabled={index === bucketItems.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs px-1"
                    >
                      ▼
                    </button>
                  </div>
                  
                  {/* Item visual with caps if applicable */}
                  <div className="flex items-center gap-0">
                    {isBead && includeCaps && selectedCap && (
                      <div 
                        className="w-2 h-5 rounded-l-full shrink-0"
                        style={{ backgroundColor: selectedCap.color }}
                      />
                    )}
                    <div 
                      className={`w-6 h-6 rounded-full shrink-0 border flex items-center justify-center ${
                        item.type === 'mani' ? 'border-2' : ''
                      }`}
                      style={{ 
                        backgroundColor: item.color,
                        borderColor: item.type === 'mani' ? '#B8860B' : 'rgba(0,0,0,0.2)'
                      }}
                    >
                      {item.type === 'mani' && <span className="text-[8px]">✦</span>}
                    </div>
                    {isBead && includeCaps && selectedCap && (
                      <div 
                        className="w-2 h-5 rounded-r-full shrink-0"
                        style={{ backgroundColor: selectedCap.color }}
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800">{item.displayName}</div>
                    <div className="text-xs text-gray-500">
                      {item.type} • {getDisplayDiameter(item)}mm
                      {isBead && includeCaps && ' (with caps)'}
                    </div>
                  </div>
                  
                  {/* Count controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateBucketItemCount(index, bi.count - 1)}
                      className="w-7 h-7 bg-white rounded text-sm font-bold hover:bg-gray-100 border"
                    >
                      −
                    </button>
                    <NumberInput
                      value={bi.count}
                      onChange={(val) => updateBucketItemCount(index, val)}
                      min={0}
                      step={1}
                      className="w-16 px-2 py-1 border rounded text-center text-sm bg-white"
                    />
                    <button
                      onClick={() => updateBucketItemCount(index, bi.count + 1)}
                      className="w-7 h-7 bg-white rounded text-sm font-bold hover:bg-gray-100 border"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromBucket(index)}
                    className="text-red-500 hover:text-red-700 text-xl font-bold px-2"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Bucket Summary */}
        {(bucketItems.length > 0 || (includeCaps && beadCount > 0) || kadiSettings.enabled) && (
          <div className="mt-3 pt-3 border-t text-sm text-gray-600">
            <div className="flex flex-wrap gap-2">
              {kadiSettings.enabled && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">1 kadi</span>}
              {beadCount > 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{beadCount} beads</span>}
              {maniCount > 0 && <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{maniCount} mani</span>}
              {totalCaps > 0 && <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">{totalCaps} caps</span>}
            </div>
          </div>
        )}
      </div>

      {/* Pattern Preview - Shows the actual bucket sequence */}
      {bucketItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="font-semibold text-gray-700 mb-3">Pattern Sequence Preview</h3>
          
          {/* Visual Pattern Sequence - Shows actual order from bucket */}
          <div className="bg-white rounded-lg p-4 border overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {/* Show Kadi at start if enabled */}
              {kadiSettings.enabled && (
                <>
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-yellow-600 flex items-center justify-center">
                      <span className="text-[8px] text-yellow-900">◉</span>
                    </div>
                    <div className="absolute -top-2 -right-1 bg-yellow-600 text-white text-[8px] px-1 rounded-full">
                      K
                    </div>
                  </div>
                  <span className="text-gray-300 text-xs mx-0.5">—</span>
                </>
              )}
              
              {bucketItems.map((bi, bucketIndex) => {
                const item = getItemById(bi.itemId);
                if (!item) return null;
                
                const isBead = item.type === 'bead';
                const isMani = item.type === 'mani';
                
                return (
                  <div key={bucketIndex} className="flex items-center gap-1">
                    {/* Show item with count badge */}
                    <div className="relative flex items-center gap-0">
                      {isBead && includeCaps && (
                        <div
                          className="w-2 h-5 rounded-l-full"
                          style={{ backgroundColor: selectedCap?.color || '#F59E0B' }}
                          title="Cap"
                        />
                      )}
                      <div
                        className={`flex items-center justify-center ${isMani ? 'w-5 h-5' : 'w-6 h-6'} rounded-full`}
                        style={{ 
                          backgroundColor: item.color,
                          border: isMani ? '2px solid #B8860B' : '1px solid rgba(0,0,0,0.2)'
                        }}
                        title={item.displayName}
                      >
                        {isMani && <span className="text-[8px]">✦</span>}
                      </div>
                      {isBead && includeCaps && (
                        <div
                          className="w-2 h-5 rounded-r-full"
                          style={{ backgroundColor: selectedCap?.color || '#F59E0B' }}
                          title="Cap"
                        />
                      )}
                      
                      {/* Count badge */}
                      <div className="absolute -top-2 -right-1 bg-gray-800 text-white text-[9px] px-1 rounded-full min-w-[16px] text-center">
                        {bi.count}
                      </div>
                    </div>
                    
                    {/* Arrow between items */}
                    {bucketIndex < bucketItems.length - 1 && (
                      <span className="text-gray-300 text-xs mx-0.5">→</span>
                    )}
                  </div>
                );
              })}
              
              {/* Repeat indicator */}
              <span className="text-gray-400 text-xs ml-1">...</span>
            </div>
            
            {/* Pattern Legend */}
            <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 text-xs text-gray-600">
              {kadiSettings.enabled && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border border-yellow-600" />
                  <span>Kadi: <strong>1</strong></span>
                </div>
              )}
              {bucketItems.map((bi, idx) => {
                const item = getItemById(bi.itemId);
                if (!item) return null;
                return (
                  <div key={idx} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.displayName}: <strong>{bi.count}</strong></span>
                  </div>
                );
              })}
              {includeCaps && selectedCap && (
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-l-full" 
                    style={{ backgroundColor: selectedCap.color }}
                  />
                  <span>Cap: <strong>{beadCount * 2}</strong></span>
                </div>
              )}
            </div>
          </div>
          
          {/* Summary */}
          <div className="mt-3 text-sm text-gray-600 text-center">
            <span className="font-medium">Total:</span>{' '}
            {kadiSettings.enabled && <span>1 kadi + </span>}
            {beadCount > 0 && <span>{beadCount} bead{beadCount !== 1 ? 's' : ''}</span>}
            {maniCount > 0 && <span>{beadCount > 0 ? ' + ' : ''}{maniCount} mani</span>}
            {includeCaps && <span> + {beadCount * 2} caps</span>}
            {' = '}<strong>{totalPieces} pieces</strong>
          </div>
        </div>
      )}

      {/* Gap Settings */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowGapSettings(!showGapSettings)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
        >
          <span className="font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Gap & Measurement Settings
          </span>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${showGapSettings ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showGapSettings && (
          <div className="p-4 border-t bg-white space-y-4">
            {/* Basic Gap Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gap Between Items (mm)</label>
                <NumberInput
                  value={gapSettings.uniformGap}
                  onChange={val => setGapSettings({ ...gapSettings, uniformGap: val })}
                  min={0}
                  step={0.1}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Thread/Wire Weight (g)</label>
                <NumberInput
                  value={gapSettings.threadWeightGrams || 0}
                  onChange={val => setGapSettings({ ...gapSettings, threadWeightGrams: val })}
                  min={0}
                  step={0.01}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Cap-Bead Gap */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Cap ↔ Bead Gap (mm)</label>
              <NumberInput
                value={gapSettings.capBeadGap}
                onChange={val => setGapSettings({ ...gapSettings, capBeadGap: val })}
                min={0}
                step={0.1}
                className="w-32 px-3 py-2 border rounded-lg text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Gap between cap and bead (usually 0)</p>
            </div>

            {/* Set Length Calculation Method */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">Set Length Calculation Method</h4>
              <p className="text-xs text-blue-600 mb-3">Choose how to calculate the length of one set ( o )</p>
              
              <div className="space-y-3">
                {/* Method 1: Components */}
                <label className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  gapSettings.setLengthMethod === 'components' 
                    ? 'border-blue-500 bg-white' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="setLengthMethod"
                      checked={gapSettings.setLengthMethod === 'components'}
                      onChange={() => setGapSettings({ ...gapSettings, setLengthMethod: 'components' })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Calculate from Components</div>
                      <p className="text-xs text-gray-500 mt-1">
                        Set = (Cap Height - Overlap) × 2 + Cap-Bead Gap × 2 + Bead Diameter
                      </p>
                      
                      {gapSettings.setLengthMethod === 'components' && (
                        <div className="mt-3 p-2 bg-orange-50 rounded">
                          <label className="block text-xs text-orange-800 mb-1">Cap Overlap / Fit Depth (mm)</label>
                          <NumberInput
                            value={gapSettings.capOverlap}
                            onChange={val => setGapSettings({ ...gapSettings, capOverlap: val })}
                            min={0}
                            max={selectedCap ? selectedCap.height : 10}
                            step={0.1}
                            className="w-24 px-2 py-1 border border-orange-300 rounded text-sm"
                          />
                          <p className="text-xs text-orange-600 mt-1">How much cap fits INTO the bead hole</p>
                          {selectedCap && (
                            <p className="text-xs text-orange-700 mt-1">
                              Effective cap height: {selectedCap.height}mm - {gapSettings.capOverlap}mm = <strong>{Math.max(0, selectedCap.height - gapSettings.capOverlap).toFixed(2)}mm</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Method 2: Measured */}
                <label className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  gapSettings.setLengthMethod === 'measured' 
                    ? 'border-blue-500 bg-white' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="setLengthMethod"
                      checked={gapSettings.setLengthMethod === 'measured'}
                      onChange={() => setGapSettings({ ...gapSettings, setLengthMethod: 'measured' })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Use Measured Set Length</div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the actual measured length of one ( o ) set from a real mala
                      </p>
                      
                      {gapSettings.setLengthMethod === 'measured' && (
                        <div className="mt-3 p-2 bg-green-50 rounded space-y-3">
                          <div>
                            <label className="block text-xs text-green-800 mb-1">Measured Set Length (mm)</label>
                            <NumberInput
                              value={gapSettings.measuredSetLengthMM}
                              onChange={val => setGapSettings({ ...gapSettings, measuredSetLengthMM: val })}
                              min={0}
                              step={0.01}
                              className="w-24 px-2 py-1 border border-green-300 rounded text-sm"
                            />
                            <p className="text-xs text-green-600 mt-1">One ( o ) set = {gapSettings.measuredSetLengthMM}mm</p>
                          </div>
                          
                          <label className="flex items-start gap-2 cursor-pointer p-2 bg-green-100 rounded">
                            <input
                              type="checkbox"
                              checked={gapSettings.measuredSetIncludesGap}
                              onChange={(e) => setGapSettings({ ...gapSettings, measuredSetIncludesGap: e.target.checked })}
                              className="mt-0.5"
                            />
                            <div>
                              <div className="text-sm font-medium text-green-800">Measured length includes gap</div>
                              <p className="text-xs text-green-600 mt-0.5">
                                Check this if you measured from one set's start to the next set's start (includes the spacing)
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={savePattern}
          disabled={bucketItems.length === 0}
          className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Save Pattern
        </button>
        <button
          onClick={clearBucket}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
