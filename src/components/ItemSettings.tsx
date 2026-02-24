import { useState } from 'react';
import { useMala } from '../context/MalaContext';
import { 
  ItemType, 
  BeadItem, 
  ManiItem, 
  CapItem, 
  WIRE_GAUGE_MM,
  getDisplayDiameter
} from '../types/mala';
import { NumberInput } from './NumberInput';

type ItemTab = 'beads' | 'mani' | 'caps' | 'kadi' | 'pendant' | 'gold-rate';

export function ItemSettings() {
  const { items, addItem, updateItem, deleteItem, goldRates, setGoldRates } = useMala();
  const [activeTab, setActiveTab] = useState<ItemTab>('beads');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCapsInfo, setShowCapsInfo] = useState(false);

  const beads = items.filter(i => i.type === 'bead') as BeadItem[];
  const manis = items.filter(i => i.type === 'mani') as ManiItem[];
  const caps = items.filter(i => i.type === 'cap') as CapItem[];

  // Keep for backward compatibility but not used in UI
  const _wireGauges = Object.keys(WIRE_GAUGE_MM).map(Number).sort((a, b) => a - b);
  void _wireGauges;

  const tabs = [
    { id: 'beads' as ItemTab, label: 'Beads', count: beads.length, color: 'bg-amber-600' },
    { id: 'mani' as ItemTab, label: 'Mani', count: manis.length, color: 'bg-yellow-500' },
    { id: 'caps' as ItemTab, label: 'Caps', count: caps.length, color: 'bg-orange-500' },
    { id: 'gold-rate' as ItemTab, label: 'Gold Rate', count: null, color: 'bg-yellow-600' },
  ];

  // New Bead Form
  const [newBead, setNewBead] = useState<Partial<BeadItem>>({
    type: 'bead',
    name: 'bead',
    displayName: '',
    diameterMM: 8,
    holeDiameterMM: 1.5,
    weightGrams: 0.8,
    color: '#8B4513',
    material: 'Rudraksha',
  });

  // New Mani Form
  const [newMani, setNewMani] = useState<Partial<ManiItem>>({
    type: 'mani',
    name: 'mani',
    displayName: '',
    ballGauge: 5,
    height: 5,
    wireGauge: 22,
    wireGaugeMM: WIRE_GAUGE_MM[22],
    holeDiameterMM: 1.5,
    weightGrams: 0.5,
    color: '#FFD700',
  });

  // New Cap Form
  const [newCap, setNewCap] = useState<Partial<CapItem>>({
    type: 'cap',
    name: 'cap',
    displayName: '',
    outerDiameterMM: 5.2,
    innerDiameterMM: 4,
    height: 2.46,
    wireGauge: 26,
    wireGaugeMM: WIRE_GAUGE_MM[26],
    holeDiameterMM: 1.2,
    weightGrams: 0.120,
    color: '#DAA520',
  });

  // Suppress unused variable warning
  void WIRE_GAUGE_MM;

  const handleAddBead = () => {
    if (!newBead.displayName) return;
    const bead: BeadItem = {
      id: `bead-${Date.now()}`,
      type: 'bead',
      name: 'bead',
      displayName: newBead.displayName,
      diameterMM: newBead.diameterMM || 8,
      holeDiameterMM: newBead.holeDiameterMM || 1.5,
      weightGrams: newBead.weightGrams || 0.8,
      color: newBead.color || '#8B4513',
      material: newBead.material || 'Rudraksha',
    };
    addItem(bead);
    setNewBead({
      type: 'bead', name: 'bead', displayName: '', diameterMM: 8,
      holeDiameterMM: 1.5, weightGrams: 0.8, color: '#8B4513', material: 'Rudraksha'
    });
    setShowAddForm(false);
  };

  const handleAddMani = () => {
    if (!newMani.displayName) return;
    const mani: ManiItem = {
      id: `mani-${Date.now()}`,
      type: 'mani',
      name: 'mani',
      displayName: newMani.displayName,
      ballGauge: newMani.ballGauge || 5,
      height: newMani.height || 5,
      wireGauge: newMani.wireGauge || 22,
      wireGaugeMM: WIRE_GAUGE_MM[newMani.wireGauge || 22],
      holeDiameterMM: newMani.holeDiameterMM || 1.5,
      weightGrams: newMani.weightGrams || 0.5,
      color: newMani.color || '#FFD700',
    };
    addItem(mani);
    setNewMani({
      type: 'mani', name: 'mani', displayName: '', ballGauge: 5, height: 5,
      wireGauge: 22, wireGaugeMM: WIRE_GAUGE_MM[22], holeDiameterMM: 1.5,
      weightGrams: 0.5, color: '#FFD700'
    });
    setShowAddForm(false);
  };

  const handleAddCap = () => {
    if (!newCap.displayName) return;
    const cap: CapItem = {
      id: `cap-${Date.now()}`,
      type: 'cap',
      name: 'cap',
      displayName: newCap.displayName,
      outerDiameterMM: newCap.outerDiameterMM || 5.2,
      innerDiameterMM: newCap.innerDiameterMM || 4,
      height: newCap.height || 2.46,
      wireGauge: newCap.wireGauge || 26,
      wireGaugeMM: WIRE_GAUGE_MM[newCap.wireGauge || 26],
      holeDiameterMM: newCap.holeDiameterMM || 1.2,
      weightGrams: newCap.weightGrams || 0.120,
      color: newCap.color || '#DAA520',
    };
    addItem(cap);
    setNewCap({
      type: 'cap', name: 'cap', displayName: '', outerDiameterMM: 5.2, innerDiameterMM: 4,
      height: 2.46, wireGauge: 26, wireGaugeMM: WIRE_GAUGE_MM[26], holeDiameterMM: 1.2,
      weightGrams: 0.120, color: '#DAA520'
    });
    setShowAddForm(false);
  };

  const renderItemIcon = (item: ItemType) => {
    const size = Math.min(40, Math.max(24, getDisplayDiameter(item) * 3));
    
    if (item.type === 'bead') {
      return (
        <div 
          className="rounded-full shadow-inner flex-shrink-0 border-2 border-black/10"
          style={{ 
            backgroundColor: item.color, 
            width: size, 
            height: size,
          }}
        />
      );
    }
    
    if (item.type === 'mani') {
      return (
        <div 
          className="rounded-full flex-shrink-0 border-2 border-yellow-700"
          style={{ 
            width: size, 
            height: size,
            backgroundColor: item.color,
          }}
        />
      );
    }
    
    if (item.type === 'cap') {
      return (
        <div 
          className="flex-shrink-0 relative"
          style={{ width: size, height: size / 2 }}
        >
          <div 
            className="absolute inset-0 rounded-t-full border-2 border-yellow-700"
            style={{ backgroundColor: item.color }}
          />
        </div>
      );
    }
    
    return <div className="w-8 h-8 rounded-full bg-gray-300" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowAddForm(false); setEditingId(null); }}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id 
                ? 'text-amber-600 bg-amber-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {tab.label}
              {tab.count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full text-white ${tab.color}`}>
                  {tab.count}
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Beads Tab */}
        {activeTab === 'beads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Bead Settings</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Bead
              </button>
            </div>

            {showAddForm && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-4">
                <h4 className="font-medium text-amber-800 mb-3">New Bead</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={newBead.displayName || ''}
                      onChange={e => setNewBead({ ...newBead, displayName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="e.g., Rudraksha 12mm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Diameter (mm)</label>
                    <NumberInput
                      value={newBead.diameterMM || 0}
                      onChange={val => setNewBead({ ...newBead, diameterMM: val })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hole Diameter (mm)</label>
                    <NumberInput
                      value={newBead.holeDiameterMM || 0}
                      onChange={val => setNewBead({ ...newBead, holeDiameterMM: val })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weight (g)</label>
                    <NumberInput
                      value={newBead.weightGrams || 0}
                      onChange={val => setNewBead({ ...newBead, weightGrams: val })}
                      min={0}
                      step={0.001}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={newBead.color || '#8B4513'}
                      onChange={e => setNewBead({ ...newBead, color: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleAddBead} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                    Add Bead
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {beads.map(bead => (
              <div key={bead.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {renderItemIcon(bead)}
                  <div className="flex-1 min-w-0">
                    {editingId === bead.id ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={bead.displayName}
                          onChange={e => updateItem(bead.id, { displayName: e.target.value })}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={bead.diameterMM}
                            onChange={e => updateItem(bead.id, { diameterMM: Number(e.target.value) })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                          <span className="text-xs text-gray-500">mm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={bead.weightGrams}
                            onChange={e => updateItem(bead.id, { weightGrams: Number(e.target.value) })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                          <span className="text-xs text-gray-500">g</span>
                        </div>
                        <button
                          onClick={() => setEditingId(null)}
                          className="col-span-2 md:col-span-3 px-3 py-1 bg-green-500 text-white rounded text-sm"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium text-gray-800">{bead.displayName}</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                          <div className="bg-white rounded px-2 py-1">
                            <span className="text-gray-400">Diameter:</span> {bead.diameterMM}mm
                          </div>
                          <div className="bg-white rounded px-2 py-1">
                            <span className="text-gray-400">Hole:</span> {bead.holeDiameterMM}mm
                          </div>
                          <div className="bg-white rounded px-2 py-1">
                            <span className="text-gray-400">Weight:</span> {bead.weightGrams}g
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(bead.id)} className="p-2 text-gray-400 hover:text-blue-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button onClick={() => deleteItem(bead.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mani Tab */}
        {activeTab === 'mani' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Mani (Gold Ball) Settings</h3>
                <p className="text-xs text-gray-500 mt-1">Configure ball gauge, wire gauge, height, and weight</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Mani
              </button>
            </div>

            {showAddForm && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-4">
                <h4 className="font-medium text-yellow-800 mb-3">New Mani (Gold Ball)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={newMani.displayName || ''}
                      onChange={e => setNewMani({ ...newMani, displayName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="e.g., Mani 5mm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Ball Gauge (mm)</label>
                    <NumberInput
                      value={newMani.ballGauge || 0}
                      onChange={val => setNewMani({ ...newMani, ballGauge: val, height: val })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height (mm)</label>
                    <NumberInput
                      value={newMani.height || 0}
                      onChange={val => setNewMani({ ...newMani, height: val })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weight (g)</label>
                    <NumberInput
                      value={newMani.weightGrams || 0}
                      onChange={val => setNewMani({ ...newMani, weightGrams: val })}
                      min={0}
                      step={0.001}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={newMani.color || '#FFD700'}
                      onChange={e => setNewMani({ ...newMani, color: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleAddMani} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                    Add Mani
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {manis.map(mani => (
              <div key={mani.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start gap-4">
                  {renderItemIcon(mani)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{mani.displayName}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs">
                      <div className="bg-white/80 rounded px-2 py-1">
                        <div className="text-gray-400">Ball Gauge</div>
                        <div className="font-medium">{mani.ballGauge}mm</div>
                      </div>
                      <div className="bg-white/80 rounded px-2 py-1">
                        <div className="text-gray-400">Height</div>
                        <div className="font-medium">{mani.height}mm</div>
                      </div>
                      <div className="bg-white/80 rounded px-2 py-1">
                        <div className="text-gray-400">Weight</div>
                        <div className="font-medium">{mani.weightGrams}g</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => deleteItem(mani.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Caps Tab */}
        {activeTab === 'caps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Cap (Half Round) Settings</h3>
                <p className="text-xs text-gray-500 mt-1">Caps are placed on BOTH sides of each bead automatically</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Cap
              </button>
            </div>

            {/* Visual explanation of cap placement - Collapsible */}
            <div className="mb-4">
              <button
                onClick={() => setShowCapsInfo(!showCapsInfo)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">How Caps Work</span>
                <svg className={`w-4 h-4 transition-transform ${showCapsInfo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCapsInfo && (
                <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-3">
                    When you add Cap + Bead in pattern, caps are automatically placed on <strong>BOTH sides</strong> of each bead.
                    <br />Example: 54 beads with caps = 54 beads + 108 caps (2 caps per bead)
                  </p>
                  <div className="flex items-center justify-center gap-1 bg-white rounded-lg p-3">
                    <div className="w-4 h-2 rounded-t-full bg-yellow-500 rotate-180" title="Left Cap" />
                    <div className="w-6 h-6 rounded-full bg-amber-700" title="Bead" />
                    <div className="w-4 h-2 rounded-t-full bg-yellow-500" title="Right Cap" />
                    <span className="text-xs text-gray-500 ml-3">= 1 Bead + 2 Caps</span>
                  </div>
                </div>
              )}
            </div>

            {showAddForm && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-4">
                <h4 className="font-medium text-orange-800 mb-3">New Cap (Half Round)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={newCap.displayName || ''}
                      onChange={e => setNewCap({ ...newCap, displayName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="e.g., Cap 5mm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Outer Diameter (mm)</label>
                    <NumberInput
                      value={newCap.outerDiameterMM || 0}
                      onChange={val => setNewCap({ ...newCap, outerDiameterMM: val })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Inner Diameter (mm)</label>
                    <NumberInput
                      value={newCap.innerDiameterMM || 0}
                      onChange={val => setNewCap({ ...newCap, innerDiameterMM: val })}
                      min={0}
                      step={0.1}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height (mm)</label>
                    <NumberInput
                      value={newCap.height || 0}
                      onChange={val => setNewCap({ ...newCap, height: val })}
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weight (g)</label>
                    <NumberInput
                      value={newCap.weightGrams || 0}
                      onChange={val => setNewCap({ ...newCap, weightGrams: val })}
                      min={0}
                      step={0.001}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <input
                      type="color"
                      value={newCap.color || '#DAA520'}
                      onChange={e => setNewCap({ ...newCap, color: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleAddCap} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                    Add Cap
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {caps.map(cap => (
              <div key={cap.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start gap-4">
                  {renderItemIcon(cap)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{cap.displayName}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                      <div className="bg-white/80 rounded px-2 py-1">
                        <div className="text-gray-400">Outer ⌀</div>
                        <div className="font-medium">{cap.outerDiameterMM}mm</div>
                      </div>
                      <div className="bg-white/80 rounded px-2 py-1">
                        <div className="text-gray-400">Inner ⌀</div>
                        <div className="font-medium">{cap.innerDiameterMM}mm</div>
                      </div>
                      <div className="bg-white/80 rounded px-2 py-1">
                        <div className="text-gray-400">Height</div>
                        <div className="font-medium">{cap.height}mm</div>
                      </div>
                      <div className="bg-white/80 rounded px-2 py-1">
                        <div className="text-gray-400">Weight</div>
                        <div className="font-medium">{cap.weightGrams}g</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => deleteItem(cap.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gold Rate Tab */}
        {activeTab === 'gold-rate' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Gold Rate Setting</h3>
              <p className="text-sm text-gray-600 mb-4">Set current gold rate per gram for cost calculations</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-yellow-800 mb-2">Gold Rate (per gram)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-gray-500">₹</span>
                  <NumberInput
                    value={goldRates.rate}
                    onChange={val => setGoldRates({ rate: val })}
                    min={0}
                    step={1}
                    className="w-full px-4 py-3 text-2xl font-bold border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">per gram</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
