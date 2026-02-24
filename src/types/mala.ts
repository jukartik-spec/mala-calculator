// Wire gauge to mm conversion
export const WIRE_GAUGE_MM: Record<number, number> = {
  10: 2.588,
  12: 2.053,
  14: 1.628,
  16: 1.291,
  18: 1.024,
  20: 0.812,
  22: 0.644,
  24: 0.511,
  26: 0.405,
  28: 0.321,
  30: 0.255,
};

// Base item interface
interface BaseItem {
  id: string;
  type: 'bead' | 'mani' | 'cap' | 'kadi' | 'pendant';
  name: string;
  displayName: string;
  weightGrams: number;
  color: string;
}

// Bead item (Rudraksha, Tulsi, etc.)
export interface BeadItem extends BaseItem {
  type: 'bead';
  diameterMM: number;
  holeDiameterMM: number;
  material: string;
}

// Mani item (Gold ball)
export interface ManiItem extends BaseItem {
  type: 'mani';
  ballGauge: number; // Ball diameter in mm
  height: number; // Height/length contribution
  wireGauge: number; // AWG
  wireGaugeMM: number;
  holeDiameterMM: number;
}

// Cap item (Half round cap)
export interface CapItem extends BaseItem {
  type: 'cap';
  outerDiameterMM: number;
  innerDiameterMM: number; // Fits over bead
  height: number; // Height contribution to mala length
  wireGauge: number;
  wireGaugeMM: number;
  holeDiameterMM: number;
}

// Kadi item (Joint/Clasp) - simplified, just size settings
export interface KadiItem extends BaseItem {
  type: 'kadi';
  lengthMM: number; // Length contribution
  widthMM: number; // Width/diameter
}

export type ItemType = BeadItem | ManiItem | CapItem | KadiItem;

// Helper to get display diameter
export function getDisplayDiameter(item: ItemType): number {
  switch (item.type) {
    case 'bead':
      return item.diameterMM;
    case 'mani':
      return item.ballGauge;
    case 'cap':
      return item.outerDiameterMM;
    case 'kadi':
      return item.widthMM;
  }
}

// Helper to get height/length contribution (the dimension that adds to mala length)
export function getItemDiameter(item: ItemType): number {
  switch (item.type) {
    case 'bead':
      return item.diameterMM;
    case 'mani':
      return item.height;
    case 'cap':
      return item.height;
    case 'kadi':
      return item.lengthMM;
  }
}

// Check if item is gold
export function isGoldItem(item: ItemType): boolean {
  return item.type === 'mani' || item.type === 'cap' || item.type === 'kadi';
}

// Calculation method for set length
export type SetLengthMethod = 'components' | 'measured';

// Gap settings
export interface GapSettings {
  uniformGap: number; // Gap between items (mani to mani, bead to mani, etc.)
  capBeadGap: number; // Gap between cap and bead (usually 0 since cap sits on bead)
  capOverlap: number; // How much cap overlaps/fits INTO the bead hole (reduces effective height)
  threadThickness: number;
  threadWeightGrams: number; // Total weight of thread/wire
  setLengthMethod: SetLengthMethod; // Which method to use for set length calculation
  useMeasuredSetLength: boolean; // DEPRECATED - use setLengthMethod instead
  measuredSetLengthMM: number; // Physically measured set length ( o )
  measuredSetIncludesGap: boolean; // Does measured set length include the gap to next item?
}

// Pattern item (item in a pattern sequence) - NO CAPS, caps are a toggle
export interface PatternItem {
  itemId: string;
  count: number;
}

// Kadi settings (simpler than a full item dropdown)
export interface KadiSettings {
  enabled: boolean;
  sizeMM: number; // Length/size of the kadi
  weightGrams: number; // Weight of the kadi
}

// Pattern configuration
export interface Pattern {
  id: string;
  name: string;
  items: PatternItem[];
  repeatCount: number;
  includeCaps: boolean; // Toggle for caps on beads
  selectedCapId?: string; // Which cap to use
  kadiSettings: KadiSettings; // Kadi settings (single joint per mala)
}

// Mala configuration
export interface MalaConfig {
  targetType: 'pieces' | 'length';
  targetPieces?: number;
  targetLengthInches?: number;
}

// Gold rates
export interface GoldRates {
  rate: number; // Rate per gram
}

// Expanded item for calculation (includes position info)
export interface ExpandedItem {
  item: ItemType;
  isCapLeft?: boolean;
  isCapRight?: boolean;
}

// Calculation result
export interface CalculationResult {
  totalPieces: number;
  piecesByType: Record<string, number>;
  totalLengthMM: number;
  totalLengthInches: number;
  totalWeightGrams: number;
  weightByType: Record<string, number>;
  piecesPerInch: number;
  goldWeight: number;
  goldCost: number;
  expandedItems: ExpandedItem[];
  beadCount: number;
  capCount: number;
  // Set info - a "set" is ( o ) = cap + bead + cap
  setCount: number; // Number of complete sets
  setLengthMM: number; // Length of one set in mm (without gap)
  setLengthWithGapMM: number; // Length of one set in mm (with gap between sets)
  setsPerInch: number; // How many sets fit in one inch (using setLengthWithGap)
}
