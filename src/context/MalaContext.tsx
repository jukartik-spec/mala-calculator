import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  ItemType, 
  BeadItem, 
  ManiItem, 
  CapItem,
  GapSettings, 
  Pattern, 
  CalculationResult, 
  MalaConfig,
  GoldRates,
  ExpandedItem,
  getItemDiameter,
  isGoldItem,
  WIRE_GAUGE_MM,
  KadiSettings
} from '../types/mala';

interface MalaContextType {
  items: ItemType[];
  setItems: React.Dispatch<React.SetStateAction<ItemType[]>>;
  addItem: (item: ItemType) => void;
  updateItem: (id: string, updates: Partial<ItemType>) => void;
  deleteItem: (id: string) => void;
  gapSettings: GapSettings;
  setGapSettings: React.Dispatch<React.SetStateAction<GapSettings>>;
  patterns: Pattern[];
  setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
  currentPattern: Pattern | null;
  setCurrentPattern: React.Dispatch<React.SetStateAction<Pattern | null>>;
  malaConfig: MalaConfig;
  setMalaConfig: React.Dispatch<React.SetStateAction<MalaConfig>>;
  goldRates: GoldRates;
  setGoldRates: React.Dispatch<React.SetStateAction<GoldRates>>;
  calculateMala: () => CalculationResult | null;
}

const MalaContext = createContext<MalaContextType | null>(null);

const defaultBeads: BeadItem[] = [
  {
    id: 'bead-6mm',
    type: 'bead',
    name: 'bead',
    displayName: 'Rudraksha 6mm',
    diameterMM: 6,
    holeDiameterMM: 1.5,
    weightGrams: 0.5,
    color: '#8B4513',
    material: 'Rudraksha',
  },
  {
    id: 'bead-8mm',
    type: 'bead',
    name: 'bead',
    displayName: 'Rudraksha 8mm',
    diameterMM: 8,
    holeDiameterMM: 1.8,
    weightGrams: 0.8,
    color: '#A0522D',
    material: 'Rudraksha',
  },
  {
    id: 'bead-10mm',
    type: 'bead',
    name: 'bead',
    displayName: 'Rudraksha 10mm',
    diameterMM: 10,
    holeDiameterMM: 2.0,
    weightGrams: 1.2,
    color: '#CD853F',
    material: 'Rudraksha',
  },
];

const defaultMani: ManiItem[] = [
  {
    id: 'mani-4mm',
    type: 'mani',
    name: 'mani',
    displayName: 'Mani 4mm',
    ballGauge: 4,
    height: 4,
    wireGauge: 24,
    wireGaugeMM: WIRE_GAUGE_MM[24],
    holeDiameterMM: 1.2,
    weightGrams: 0.35,
    color: '#FFD700',
  },
  {
    id: 'mani-5mm',
    type: 'mani',
    name: 'mani',
    displayName: 'Mani 5mm',
    ballGauge: 5,
    height: 5,
    wireGauge: 22,
    wireGaugeMM: WIRE_GAUGE_MM[22],
    holeDiameterMM: 1.5,
    weightGrams: 0.55,
    color: '#FFC125',
  },
  {
    id: 'mani-6mm',
    type: 'mani',
    name: 'mani',
    displayName: 'Mani 6mm',
    ballGauge: 6,
    height: 6,
    wireGauge: 20,
    wireGaugeMM: WIRE_GAUGE_MM[20],
    holeDiameterMM: 1.8,
    weightGrams: 0.85,
    color: '#FFB90F',
  },
];

const defaultCaps: CapItem[] = [
  {
    id: 'cap-5.2mm',
    type: 'cap',
    name: 'cap',
    displayName: 'Cap 5.2mm',
    outerDiameterMM: 5.2,
    innerDiameterMM: 4,
    height: 2.46,
    wireGauge: 26,
    wireGaugeMM: WIRE_GAUGE_MM[26],
    holeDiameterMM: 1.2,
    weightGrams: 0.120,
    color: '#DAA520',
  },
  {
    id: 'cap-8mm',
    type: 'cap',
    name: 'cap',
    displayName: 'Cap 8mm',
    outerDiameterMM: 8,
    innerDiameterMM: 5,
    height: 3,
    wireGauge: 24,
    wireGaugeMM: WIRE_GAUGE_MM[24],
    holeDiameterMM: 1.5,
    weightGrams: 0.4,
    color: '#B8860B',
  },
];

const defaultItems: ItemType[] = [...defaultBeads, ...defaultMani, ...defaultCaps];

const defaultGapSettings: GapSettings = {
  uniformGap: 0.5,
  capBeadGap: 0,
  capOverlap: 0,
  threadThickness: 0.8,
  threadWeightGrams: 0,
  setLengthMethod: 'components',
  useMeasuredSetLength: false,
  measuredSetLengthMM: 6.25,
  measuredSetIncludesGap: false,
};

const defaultConfig: MalaConfig = {
  targetType: 'pieces',
  targetPieces: 108,
};

const defaultGoldRates: GoldRates = {
  rate: 6600,
};

const defaultKadiSettings: KadiSettings = {
  enabled: false,
  sizeMM: 8,
  weightGrams: 0.5,
};

export function MalaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemType[]>(defaultItems);
  const [gapSettings, setGapSettings] = useState<GapSettings>(defaultGapSettings);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [malaConfig, setMalaConfig] = useState<MalaConfig>(defaultConfig);
  const [goldRates, setGoldRates] = useState<GoldRates>(defaultGoldRates);

  const addItem = useCallback((item: ItemType) => {
    setItems(prev => [...prev, item]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ItemType>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } as ItemType : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const getGap = useCallback((isCapBeadGap: boolean = false): number => {
    return isCapBeadGap ? gapSettings.capBeadGap : gapSettings.uniformGap;
  }, [gapSettings]);

  const calculateMala = useCallback((): CalculationResult | null => {
    if (!currentPattern || currentPattern.items.length === 0) {
      return null;
    }

    const expandedItems: ExpandedItem[] = [];
    
    // Check if caps are enabled
    const useCaps = currentPattern.includeCaps && currentPattern.selectedCapId;
    const capItem = useCaps ? items.find(i => i.id === currentPattern.selectedCapId) as CapItem | undefined : undefined;
    
    // Get kadi settings
    const kadiSettings = currentPattern.kadiSettings || defaultKadiSettings;
    
    let beadCount = 0;
    let capCount = 0;
    
    // Expand the pattern
    for (let r = 0; r < currentPattern.repeatCount; r++) {
      for (const patternItem of currentPattern.items) {
        const itemDef = items.find(i => i.id === patternItem.itemId);
        if (!itemDef) continue;
        
        for (let c = 0; c < patternItem.count; c++) {
          // If caps are enabled and this is a bead, add: Cap + Bead + Cap
          if (useCaps && capItem && itemDef.type === 'bead') {
            // Left cap (
            expandedItems.push({ 
              item: capItem, 
              isCapLeft: true,
              isCapRight: false
            });
            capCount++;
            
            // Bead o
            expandedItems.push({ item: itemDef });
            beadCount++;
            
            // Right cap )
            expandedItems.push({ 
              item: capItem, 
              isCapLeft: false,
              isCapRight: true
            });
            capCount++;
          } else {
            // Regular item (mani or bead without cap)
            expandedItems.push({ item: itemDef });
            if (itemDef.type === 'bead') beadCount++;
          }
        }
      }
    }

    let totalLengthMM = 0;
    const piecesByType: Record<string, number> = {};
    const weightByType: Record<string, number> = {};
    let totalWeightGrams = 0;
    let goldWeight = 0;
    let goldCost = 0;

    // Calculate effective cap height (cap height minus overlap)
    const effectiveCapHeight = capItem 
      ? Math.max(0, capItem.height - gapSettings.capOverlap) 
      : 0;

    for (let i = 0; i < expandedItems.length; i++) {
      const expandedItem = expandedItems[i];
      const item = expandedItem.item;
      
      // For caps, use the effective height (after overlap)
      if (item.type === 'cap') {
        totalLengthMM += effectiveCapHeight;
      } else {
        totalLengthMM += getItemDiameter(item);
      }
      
      // Add gap to next item if not the last
      if (i < expandedItems.length - 1) {
        const nextItem = expandedItems[i + 1];
        const isCapBead = (item.type === 'cap' && nextItem.item.type === 'bead') ||
                          (item.type === 'bead' && nextItem.item.type === 'cap');
        totalLengthMM += getGap(isCapBead);
      }

      piecesByType[item.displayName] = (piecesByType[item.displayName] || 0) + 1;
      weightByType[item.displayName] = (weightByType[item.displayName] || 0) + item.weightGrams;
      totalWeightGrams += item.weightGrams;

      if (isGoldItem(item)) {
        goldWeight += item.weightGrams;
        goldCost += item.weightGrams * goldRates.rate;
      }
    }

    // Add kadi if enabled
    if (kadiSettings.enabled) {
      totalLengthMM += kadiSettings.sizeMM;
      totalWeightGrams += kadiSettings.weightGrams;
      goldWeight += kadiSettings.weightGrams;
      goldCost += kadiSettings.weightGrams * goldRates.rate;
      piecesByType['Kadi (Joint)'] = 1;
      weightByType['Kadi (Joint)'] = kadiSettings.weightGrams;
    }

    // Add thread weight
    if (gapSettings.threadWeightGrams > 0) {
      weightByType['Thread/Wire'] = gapSettings.threadWeightGrams;
      totalWeightGrams += gapSettings.threadWeightGrams;
    }

    const totalLengthInches = totalLengthMM / 25.4;
    const totalPieces = expandedItems.length + (kadiSettings.enabled ? 1 : 0);
    const piecesPerInch = totalLengthInches > 0 ? totalPieces / totalLengthInches : 0;

    // Calculate set info
    let setLengthMM = 0;
    let setLengthWithGapMM = 0;
    let setCount = 0;
    
    if (useCaps && capItem && beadCount > 0) {
      const beadItem = currentPattern.items.find(pi => {
        const item = items.find(i => i.id === pi.itemId);
        return item?.type === 'bead';
      });
      
      if (beadItem) {
        const bead = items.find(i => i.id === beadItem.itemId) as BeadItem | undefined;
        if (bead) {
          if (gapSettings.setLengthMethod === 'measured' && gapSettings.measuredSetLengthMM > 0) {
            setLengthMM = gapSettings.measuredSetLengthMM;
          } else {
            setLengthMM = effectiveCapHeight + gapSettings.capBeadGap + bead.diameterMM + gapSettings.capBeadGap + effectiveCapHeight;
          }
          setLengthWithGapMM = setLengthMM + gapSettings.uniformGap;
          setCount = beadCount;
        }
      }
    }
    
    // If using measured set length, recalculate total length
    if (gapSettings.setLengthMethod === 'measured' && setCount > 0 && setLengthMM > 0) {
      let maniLengthMM = 0;
      let maniCount = 0;
      for (const ei of expandedItems) {
        if (ei.item.type === 'mani') {
          const maniItem = ei.item as { height?: number };
          maniLengthMM += maniItem.height || getItemDiameter(ei.item);
          maniCount++;
        }
      }
      
      const totalItemsForGaps = setCount + maniCount;
      const totalGaps = Math.max(0, totalItemsForGaps - 1);
      
      if (gapSettings.measuredSetIncludesGap) {
        totalLengthMM = (setCount * setLengthMM) + maniLengthMM + (maniCount * gapSettings.uniformGap);
      } else {
        totalLengthMM = (setCount * setLengthMM) + maniLengthMM + (totalGaps * gapSettings.uniformGap);
      }
      
      // Add kadi length if enabled
      if (kadiSettings.enabled) {
        totalLengthMM += kadiSettings.sizeMM;
      }
    }
    
    const finalTotalLengthInches = totalLengthMM / 25.4;
    const setsPerInch = setLengthWithGapMM > 0 ? 25.4 / setLengthWithGapMM : 0;

    return {
      totalPieces,
      piecesByType,
      totalLengthMM,
      totalLengthInches: finalTotalLengthInches,
      totalWeightGrams,
      weightByType,
      piecesPerInch,
      goldWeight,
      goldCost,
      expandedItems,
      beadCount,
      capCount,
      setCount,
      setLengthMM,
      setLengthWithGapMM,
      setsPerInch,
    };
  }, [currentPattern, items, getGap, gapSettings, goldRates]);

  return (
    <MalaContext.Provider
      value={{
        items,
        setItems,
        addItem,
        updateItem,
        deleteItem,
        gapSettings,
        setGapSettings,
        patterns,
        setPatterns,
        currentPattern,
        setCurrentPattern,
        malaConfig,
        setMalaConfig,
        goldRates,
        setGoldRates,
        calculateMala,
      }}
    >
      {children}
    </MalaContext.Provider>
  );
}

export function useMala() {
  const context = useContext(MalaContext);
  if (!context) {
    throw new Error('useMala must be used within a MalaProvider');
  }
  return context;
}
