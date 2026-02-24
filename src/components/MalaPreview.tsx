import React from 'react';
import { ExpandedItem, getItemDiameter, KadiSettings } from '../types/mala';
import { useMala } from '../context/MalaContext';

interface MalaPreviewProps {
  expandedItems: ExpandedItem[];
  viewMode: 'linear' | 'circular';
}

export const MalaPreview: React.FC<MalaPreviewProps> = ({ expandedItems, viewMode }) => {
  const { gapSettings, currentPattern, items } = useMala();
  
  // Get cap info for effective height calculation
  const capItem = currentPattern?.selectedCapId 
    ? items.find(i => i.id === currentPattern.selectedCapId)
    : null;
  
  const effectiveCapHeight = capItem && capItem.type === 'cap'
    ? Math.max(0, capItem.height - gapSettings.capOverlap)
    : 0;

  // Get kadi settings
  const kadiSettings: KadiSettings = currentPattern?.kadiSettings || { enabled: false, sizeMM: 8, weightGrams: 0.5 };

  // Scale for preview (pixels per mm)
  const SCALE = 4;
  const ONE_INCH_MM = 25.4;
  const ONE_INCH_PX = ONE_INCH_MM * SCALE;

  // Build pattern units from expanded items
  // Pattern should be: (o) ✦ (o) ✦ (o) ... alternating sets and mani
  interface DisplayUnit {
    type: 'set' | 'mani';
    beadItem?: ExpandedItem;
    capColor?: string;
    maniItem?: ExpandedItem;
    lengthMM: number;
  }

  const displayUnits: DisplayUnit[] = [];
  
  // Count beads and mani
  const beadItems = expandedItems.filter(ei => ei.item.type === 'bead');
  const maniItemsList = expandedItems.filter(ei => ei.item.type === 'mani');
  const hasCaps = currentPattern?.includeCaps && capItem;
  
  // Interleave beads (with caps) and mani in alternating pattern
  const maxCount = Math.max(beadItems.length, maniItemsList.length);
  let beadIdx = 0;
  let maniIdx = 0;
  
  for (let i = 0; i < maxCount * 2; i++) {
    if (i % 2 === 0 && beadIdx < beadItems.length) {
      // Add a bead set
      const bead = beadItems[beadIdx];
      const beadDiameter = getItemDiameter(bead.item);
      let setLengthMM = beadDiameter;
      
      if (hasCaps) {
        setLengthMM = effectiveCapHeight + gapSettings.capBeadGap + beadDiameter + gapSettings.capBeadGap + effectiveCapHeight;
        if (gapSettings.setLengthMethod === 'measured' && gapSettings.measuredSetLengthMM > 0) {
          setLengthMM = gapSettings.measuredSetLengthMM;
        }
      }
      
      displayUnits.push({
        type: 'set',
        beadItem: bead,
        capColor: hasCaps ? capItem.color : undefined,
        lengthMM: setLengthMM
      });
      beadIdx++;
    } else if (i % 2 === 1 && maniIdx < maniItemsList.length) {
      // Add a mani
      const mani = maniItemsList[maniIdx];
      const maniHeight = (mani.item as { height?: number }).height || getItemDiameter(mani.item);
      
      displayUnits.push({
        type: 'mani',
        maniItem: mani,
        lengthMM: maniHeight
      });
      maniIdx++;
    }
  }
  
  // Add remaining beads if any
  while (beadIdx < beadItems.length) {
    const bead = beadItems[beadIdx];
    const beadDiameter = getItemDiameter(bead.item);
    let setLengthMM = beadDiameter;
    
    if (hasCaps) {
      setLengthMM = effectiveCapHeight + gapSettings.capBeadGap + beadDiameter + gapSettings.capBeadGap + effectiveCapHeight;
      if (gapSettings.setLengthMethod === 'measured' && gapSettings.measuredSetLengthMM > 0) {
        setLengthMM = gapSettings.measuredSetLengthMM;
      }
    }
    
    displayUnits.push({
      type: 'set',
      beadItem: bead,
      capColor: hasCaps ? capItem.color : undefined,
      lengthMM: setLengthMM
    });
    beadIdx++;
  }
  
  // Add remaining mani if any
  while (maniIdx < maniItemsList.length) {
    const mani = maniItemsList[maniIdx];
    const maniHeight = (mani.item as { height?: number }).height || getItemDiameter(mani.item);
    
    displayUnits.push({
      type: 'mani',
      maniItem: mani,
      lengthMM: maniHeight
    });
    maniIdx++;
  }

  // Calculate total length with gaps
  let totalLengthMM = 0;
  displayUnits.forEach((unit, idx) => {
    totalLengthMM += unit.lengthMM;
    if (idx < displayUnits.length - 1) {
      totalLengthMM += gapSettings.uniformGap;
    }
  });
  
  // Add kadi length if enabled
  if (kadiSettings.enabled) {
    totalLengthMM += kadiSettings.sizeMM;
  }

  // Get counts
  const setCount = displayUnits.filter(u => u.type === 'set').length;
  const maniCount = displayUnits.filter(u => u.type === 'mani').length;
  const capCount = hasCaps ? setCount * 2 : 0;
  const totalPieces = setCount + maniCount + capCount + (kadiSettings.enabled ? 1 : 0);

  if (expandedItems.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center text-gray-400">
        <p>Add items to see preview</p>
      </div>
    );
  }

  if (viewMode === 'linear') {
    // Limit display for performance
    const maxUnitsToShow = 20;
    const unitsToShow = displayUnits.slice(0, maxUnitsToShow);
    const hasMore = displayUnits.length > maxUnitsToShow;

    return (
      <div className="space-y-4">
        {/* Linear Preview Box */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <span className="text-sm font-medium text-gray-700">🔗 Mala Preview (Linear)</span>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <div className="min-w-max">
              {/* The mala items with proper pattern: (o) ✦ (o) ✦ */}
              <div className="flex items-center py-4 relative" style={{ gap: `${Math.max(4, gapSettings.uniformGap * SCALE)}px` }}>
                {/* Thread line behind items */}
                <div 
                  className="absolute top-1/2 h-1 bg-gray-300 rounded-full -translate-y-1/2"
                  style={{ 
                    left: 0, 
                    right: 0,
                    zIndex: 0 
                  }}
                />
                
                {/* Kadi at the start if enabled */}
                {kadiSettings.enabled && (
                  <div 
                    className="rounded-full flex items-center justify-center relative"
                    style={{
                      width: `${Math.max(20, kadiSettings.sizeMM * SCALE * 0.8)}px`,
                      height: `${Math.max(20, kadiSettings.sizeMM * SCALE * 0.8)}px`,
                      background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                      border: '2px solid #8B6914',
                      zIndex: 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span style={{ fontSize: '8px', color: '#5D4E37', fontWeight: 'bold' }}>◉</span>
                  </div>
                )}
                
                {unitsToShow.map((unit, unitIdx) => (
                  <React.Fragment key={unitIdx}>
                    {unit.type === 'set' && unit.beadItem ? (
                      // Render a set: ( o )
                      <div 
                        className="flex items-center relative"
                        style={{ gap: `${gapSettings.capBeadGap * SCALE}px`, zIndex: 1 }}
                      >
                        {/* Left Cap ( */}
                        {unit.capColor && (
                          <div
                            style={{
                              width: `${Math.max(8, effectiveCapHeight * SCALE)}px`,
                              height: `${(capItem && capItem.type === 'cap' ? capItem.outerDiameterMM : 8) * SCALE}px`,
                              backgroundColor: unit.capColor,
                              borderRadius: '50% 0 0 50%',
                              border: '1px solid rgba(0,0,0,0.2)'
                            }}
                          />
                        )}
                        
                        {/* Bead o */}
                        <div
                          className="rounded-full"
                          style={{
                            width: `${getItemDiameter(unit.beadItem.item) * SCALE}px`,
                            height: `${getItemDiameter(unit.beadItem.item) * SCALE}px`,
                            backgroundColor: unit.beadItem.item.color,
                            border: '1px solid rgba(0,0,0,0.15)'
                          }}
                        />
                        
                        {/* Right Cap ) */}
                        {unit.capColor && (
                          <div
                            style={{
                              width: `${Math.max(8, effectiveCapHeight * SCALE)}px`,
                              height: `${(capItem && capItem.type === 'cap' ? capItem.outerDiameterMM : 8) * SCALE}px`,
                              backgroundColor: unit.capColor,
                              borderRadius: '0 50% 50% 0',
                              border: '1px solid rgba(0,0,0,0.2)'
                            }}
                          />
                        )}
                      </div>
                    ) : unit.type === 'mani' && unit.maniItem ? (
                      // Render mani ✦
                      <div
                        className="rounded-full flex items-center justify-center relative"
                        style={{
                          width: `${Math.max(16, unit.lengthMM * SCALE)}px`,
                          height: `${Math.max(16, unit.lengthMM * SCALE)}px`,
                          backgroundColor: unit.maniItem.item.color,
                          border: '2px solid #B8860B',
                          zIndex: 1,
                          boxShadow: '0 0 6px rgba(218,165,32,0.6)'
                        }}
                      >
                        <span style={{ fontSize: '10px', color: '#5D4E37', fontWeight: 'bold' }}>✦</span>
                      </div>
                    ) : null}
                  </React.Fragment>
                ))}
                
                {hasMore && (
                  <div className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 whitespace-nowrap relative" style={{ zIndex: 1 }}>
                    +{displayUnits.length - maxUnitsToShow} more
                  </div>
                )}
              </div>
              
              {/* 1 Inch Scale - Ruler Style */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {/* Ruler */}
                  <div className="relative" style={{ width: `${ONE_INCH_PX}px` }}>
                    {/* Main ruler bar */}
                    <div 
                      className="relative h-4 rounded"
                      style={{ 
                        backgroundColor: '#1f2937',
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)'
                      }}
                    >
                      {/* Start tick */}
                      <div className="absolute left-0 -top-2 w-0.5 h-3 bg-gray-800" />
                      {/* Middle tick */}
                      <div className="absolute left-1/2 -top-1 w-0.5 h-2 bg-gray-800 -translate-x-1/2" />
                      {/* End tick */}
                      <div className="absolute right-0 -top-2 w-0.5 h-3 bg-gray-800" />
                    </div>
                    {/* Labels */}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-600 font-mono font-bold">0</span>
                      <span className="text-xs text-gray-600 font-mono font-bold">1"</span>
                    </div>
                  </div>
                  
                  {/* Scale Label */}
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <span className="text-sm text-blue-700 font-medium">📏 1 inch = 25.4mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kadiSettings.enabled && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 text-center border border-yellow-300">
              <div className="text-yellow-700 font-bold text-xl">1</div>
              <div className="text-xs text-gray-600">Kadi ◉</div>
            </div>
          )}
          {setCount > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
              <div className="text-amber-600 font-bold text-xl">{setCount}</div>
              <div className="text-xs text-gray-600">Sets {hasCaps ? '( o )' : 'o'}</div>
            </div>
          )}
          {maniCount > 0 && (
            <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-300">
              <div className="text-yellow-600 font-bold text-xl">{maniCount}</div>
              <div className="text-xs text-gray-600">Mani ✦</div>
            </div>
          )}
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="text-blue-600 font-bold text-xl">{totalPieces}</div>
            <div className="text-xs text-gray-600">Total Pieces</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
            <div className="text-purple-600 font-bold text-xl">{(totalLengthMM / 25.4).toFixed(2)}"</div>
            <div className="text-xs text-gray-600">{totalLengthMM.toFixed(1)}mm</div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500 mb-2 font-medium">Pattern Legend</div>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Kadi representation */}
            {kadiSettings.enabled && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)' }}
                />
                <span className="text-sm text-gray-700">= Kadi (Joint)</span>
              </div>
            )}
            
            {/* Set representation */}
            {setCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {hasCaps && <div className="w-2 h-4 rounded-l-full" style={{ backgroundColor: capItem?.color || '#F59E0B' }} />}
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: beadItems[0]?.item.color || '#92400E' }} />
                  {hasCaps && <div className="w-2 h-4 rounded-r-full" style={{ backgroundColor: capItem?.color || '#F59E0B' }} />}
                </div>
                <span className="text-sm text-gray-700">= Bead {hasCaps ? 'with Caps' : ''} ({setCount})</span>
              </div>
            )}
            
            {/* Mani representation */}
            {maniCount > 0 && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: maniItemsList[0]?.item.color || '#FBBF24',
                    border: '2px solid #B8860B'
                  }}
                >
                  <span className="text-[8px]">✦</span>
                </div>
                <span className="text-sm text-gray-700">= Mani ({maniCount})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Circular view
  const radius = 110;
  const centerX = 150;
  const centerY = 150;

  // For circular, show units in the proper pattern
  const circularUnits = displayUnits.slice(0, 60);

  return (
    <div className="space-y-4">
      {/* Circular Preview */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm font-medium text-gray-700 mb-3">⭕ Mala Preview (Circular)</div>
        
        <div className="flex justify-center">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Background circle */}
            <circle cx={centerX} cy={centerY} r={radius + 25} fill="#fafafa" stroke="#e5e5e5" strokeWidth="1" />
            
            {/* Thread circle */}
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={radius} 
              fill="none" 
              stroke="#d4d4d4" 
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Kadi (Joint) at top - Gold colored */}
            {kadiSettings.enabled && (
              <g>
                {/* Kadi circle with gradient */}
                <defs>
                  <linearGradient id="kadiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#B8860B" />
                  </linearGradient>
                </defs>
                <circle
                  cx={centerX}
                  cy={centerY - radius}
                  r={8}
                  fill="url(#kadiGradient)"
                  stroke="#8B6914"
                  strokeWidth="2"
                />
                <text
                  x={centerX}
                  y={centerY - radius + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fill="#5D4E37"
                  fontWeight="bold"
                >
                  ◉
                </text>
              </g>
            )}

            {/* Place units around the circle in proper pattern */}
            {circularUnits.map((unit, idx) => {
              const totalUnits = circularUnits.length;
              // Start from top (after kadi) and go clockwise
              const startOffset = kadiSettings.enabled ? 0.05 : 0;
              const angle = -Math.PI / 2 + startOffset + ((idx + 0.5) / totalUnits) * 2 * Math.PI * (1 - startOffset * 2);
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              
              if (unit.type === 'set' && unit.beadItem) {
                // Draw a bead with enhanced cap visualization
                const beadSize = Math.min(10, Math.max(6, getItemDiameter(unit.beadItem.item) * 0.7));
                
                return (
                  <g key={idx}>
                    {/* Cap ring around bead */}
                    {unit.capColor && (
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r={beadSize + 4}
                          fill="none"
                          stroke={unit.capColor}
                          strokeWidth="3"
                          strokeDasharray={`${beadSize * 1.5} ${beadSize * 3}`}
                          strokeLinecap="round"
                          transform={`rotate(${(angle * 180 / Math.PI) - 90} ${x} ${y})`}
                        />
                        {/* Inner glow for cap */}
                        <circle
                          cx={x}
                          cy={y}
                          r={beadSize + 2}
                          fill="none"
                          stroke={unit.capColor}
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      </>
                    )}
                    {/* Bead */}
                    <circle
                      cx={x}
                      cy={y}
                      r={beadSize}
                      fill={unit.beadItem.item.color}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="0.5"
                    />
                  </g>
                );
              } else if (unit.type === 'mani' && unit.maniItem) {
                // Draw mani with distinct styling
                const size = Math.min(7, Math.max(4, unit.lengthMM * 0.5));
                
                return (
                  <g key={idx}>
                    {/* Glow effect */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size + 2}
                      fill="rgba(255,215,0,0.4)"
                    />
                    {/* Mani ball */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size}
                      fill={unit.maniItem.item.color}
                      stroke="#B8860B"
                      strokeWidth="1.5"
                    />
                    {/* Star symbol */}
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="5"
                      fill="#5D4E37"
                      fontWeight="bold"
                    >
                      ✦
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Center info */}
            <text x={centerX} y={centerY - 15} textAnchor="middle" className="text-lg font-bold fill-gray-700">
              {setCount}
            </text>
            <text x={centerX} y={centerY + 3} textAnchor="middle" className="text-xs fill-gray-500">
              sets
            </text>
            {maniCount > 0 && (
              <text x={centerX} y={centerY + 18} textAnchor="middle" className="text-xs fill-yellow-600">
                + {maniCount} mani
              </text>
            )}
            <text x={centerX} y={centerY + 35} textAnchor="middle" className="text-xs fill-gray-400">
              {(totalLengthMM / 25.4).toFixed(2)}"
            </text>
          </svg>
        </div>

        {displayUnits.length > 60 && (
          <div className="text-center text-xs text-gray-400 mt-2">
            Showing first 60 of {displayUnits.length} units
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white p-3 rounded-lg border">
        <div className="text-xs text-gray-500 mb-2 font-medium">Pattern Legend</div>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Kadi representation */}
          {kadiSettings.enabled && (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)' }}
              />
              <span className="text-sm text-gray-700">= Kadi ({kadiSettings.sizeMM}mm)</span>
            </div>
          )}
          
          {/* Set representation */}
          {setCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative">
                {hasCaps && (
                  <div 
                    className="absolute inset-0 rounded-full" 
                    style={{ 
                      border: `3px solid ${capItem?.color || '#F59E0B'}`,
                      margin: '-3px'
                    }}
                  />
                )}
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: beadItems[0]?.item.color || '#92400E' }} />
              </div>
              <span className="text-sm text-gray-700">= Bead {hasCaps ? '+ Caps' : ''} ({setCount})</span>
            </div>
          )}
          
          {/* Mani representation */}
          {maniCount > 0 && (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: maniItemsList[0]?.item.color || '#FBBF24',
                  border: '2px solid #B8860B'
                }}
              >
                <span className="text-[8px]">✦</span>
              </div>
              <span className="text-sm text-gray-700">= Mani ({maniCount})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
