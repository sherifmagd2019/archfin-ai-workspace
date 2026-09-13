import { useState, useEffect } from 'react';
import {
  Building2,
  Home,
  Store,
  Factory,
  Compass,
  Layers,
  ArrowUpDown,
  Plus,
  Minus,
  RotateCcw,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Check,
  Info
} from 'lucide-react';

const STACKING_PRESETS = [
  {
    id: 'logistics-base',
    name: 'Logistics Base (Industrial Ground)',
    order: ['Industrial', 'Commercial', 'Residential'],
    description: 'Urban fulfillment & heavy logistics at ground/sub-grade, retail mid-levels, apartments above.'
  },
  {
    id: 'podium-first',
    name: 'Active Retail Podium (Commercial Ground)',
    order: ['Commercial', 'Industrial', 'Residential'],
    description: 'High-footfall commercial retail & dining on ground/podium, flex-work mid, residences in upper sky.'
  },
  {
    id: 'skyline-commercial',
    name: 'Skyline Commercial (Executive Tower)',
    order: ['Industrial', 'Residential', 'Commercial'],
    description: 'Logistics at ground, residential mid-rise, executive penthouses & commercial offices on top.'
  },
  {
    id: 'residential-pod',
    name: 'Residential Base & Upper Commerce',
    order: ['Residential', 'Commercial', 'Industrial'],
    description: 'Townhouse/residential base with elevated commercial and rooftop research facilities.'
  }
];

export default function UrbanLayoutVisualizer({ allocations, onAllocationsChange }) {
  const initialRes = parseFloat(allocations?.Res) || 33.3;
  const initialComm = parseFloat(allocations?.Comm) || 33.3;
  const initialInd = parseFloat(allocations?.Ind) || 33.4;

  const [totalLevels, setTotalLevels] = useState(20);
  const [stackingOrder, setStackingOrder] = useState(['Industrial', 'Commercial', 'Residential']);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [isCustomFloors, setIsCustomFloors] = useState(false);

  // Discrete floor counts
  const [floorCounts, setFloorCounts] = useState(() => {
    const resLvl = Math.max(1, Math.round((initialRes / 100) * 20));
    const commLvl = Math.max(1, Math.round((initialComm / 100) * 20));
    const indLvl = Math.max(1, 20 - resLvl - commLvl);
    return { Residential: resLvl, Commercial: commLvl, Industrial: indLvl };
  });

  // Individual floor override array (from ground Lvl 1 up to Lvl N)
  const [customFloorList, setCustomFloorList] = useState([]);

  // Sync with incoming AI allocations when not in manual custom mode
  useEffect(() => {
    if (!isCustomFloors) {
      const resLvl = Math.max(1, Math.round((initialRes / 100) * totalLevels));
      const commLvl = Math.max(1, Math.round((initialComm / 100) * totalLevels));
      const indLvl = Math.max(1, totalLevels - resLvl - commLvl);
      setFloorCounts({ Residential: resLvl, Commercial: commLvl, Industrial: indLvl });
    }
  }, [initialRes, initialComm, initialInd, totalLevels, isCustomFloors]);

  // Generate the active vertical mass floor stack from ground (index 0) to roof (index N-1)
  const generateFloorStack = () => {
    if (isCustomFloors && customFloorList.length === totalLevels) {
      return customFloorList;
    }

    const stack = [];
    stackingOrder.forEach((zoneType) => {
      const count = floorCounts[zoneType] || 0;
      for (let i = 0; i < count; i++) {
        stack.push(zoneType);
      }
    });

    // Pad or trim to exactly match totalLevels
    while (stack.length < totalLevels) {
      stack.push(stackingOrder[0]);
    }
    return stack.slice(0, totalLevels);
  };

  const currentStack = generateFloorStack();

  // Color mapping
  const zoneMeta = {
    Residential: {
      color: '#89b4fa',
      label: 'Residential Zoning',
      sublabel: 'High-density apartments & penthouses',
      icon: Home
    },
    Commercial: {
      color: '#f9e2af',
      label: 'Commercial & Retail',
      sublabel: 'Ground retail, food hall & office space',
      icon: Store
    },
    Industrial: {
      color: '#f38ba8',
      label: 'Industrial / Logistics',
      sublabel: 'Urban fulfillment & flex-research',
      icon: Factory
    }
  };

  // Re-calculate percentages based on actual stack
  const actualResCount = currentStack.filter(z => z === 'Residential').length;
  const actualCommCount = currentStack.filter(z => z === 'Commercial').length;
  const actualIndCount = currentStack.filter(z => z === 'Industrial').length;

  const calculatedRes = ((actualResCount / totalLevels) * 100).toFixed(1);
  const calculatedComm = ((actualCommCount / totalLevels) * 100).toFixed(1);
  const calculatedInd = (100 - parseFloat(calculatedRes) - parseFloat(calculatedComm)).toFixed(1);

  // Propagate changes to parent allocations if available
  const notifyAllocationsChange = (res, comm, ind) => {
    if (onAllocationsChange) {
      onAllocationsChange({
        Res: res,
        Comm: comm,
        Ind: ind
      });
    }
  };

  // Change individual floor assignment on click
  const handleFloorClick = (levelIndex) => {
    const stack = [...currentStack];
    const currentZone = stack[levelIndex];
    const zoneTypes = ['Residential', 'Commercial', 'Industrial'];
    const nextZone = zoneTypes[(zoneTypes.indexOf(currentZone) + 1) % zoneTypes.length];
    stack[levelIndex] = nextZone;

    setIsCustomFloors(true);
    setCustomFloorList(stack);

    const newRes = stack.filter(z => z === 'Residential').length;
    const newComm = stack.filter(z => z === 'Commercial').length;
    const newInd = stack.filter(z => z === 'Industrial').length;
    setFloorCounts({ Residential: newRes, Commercial: newComm, Industrial: newInd });

    setSelectedFloor({
      level: levelIndex + 1,
      elevation: (levelIndex * 3.8).toFixed(1),
      zone: nextZone
    });

    const resPct = ((newRes / totalLevels) * 100).toFixed(1);
    const commPct = ((newComm / totalLevels) * 100).toFixed(1);
    const indPct = (100 - parseFloat(resPct) - parseFloat(commPct)).toFixed(1);
    notifyAllocationsChange(resPct, commPct, indPct);
  };

  // Handle floor count stepper adjustments
  const handleAdjustFloorCount = (zone, delta) => {
    setIsCustomFloors(false);
    const newCount = Math.max(1, (floorCounts[zone] || 1) + delta);
    const updated = { ...floorCounts, [zone]: newCount };
    const newTotal = updated.Residential + updated.Commercial + updated.Industrial;
    setTotalLevels(newTotal);
    setFloorCounts(updated);

    const resPct = ((updated.Residential / newTotal) * 100).toFixed(1);
    const commPct = ((updated.Commercial / newTotal) * 100).toFixed(1);
    const indPct = (100 - parseFloat(resPct) - parseFloat(commPct)).toFixed(1);
    notifyAllocationsChange(resPct, commPct, indPct);
  };

  // Reorder stacking sequence
  const moveZone = (index, direction) => {
    setIsCustomFloors(false);
    const newOrder = [...stackingOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setStackingOrder(newOrder);
  };

  // Apply preset
  const applyPreset = (presetId) => {
    const preset = STACKING_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setIsCustomFloors(false);
      setStackingOrder(preset.order);
    }
  };

  // Reset to original MPT AI distribution
  const handleResetToAI = () => {
    setIsCustomFloors(false);
    setTotalLevels(20);
    setStackingOrder(['Industrial', 'Commercial', 'Residential']);
    const resLvl = Math.max(1, Math.round((initialRes / 100) * 20));
    const commLvl = Math.max(1, Math.round((initialComm / 100) * 20));
    const indLvl = Math.max(1, 20 - resLvl - commLvl);
    setFloorCounts({ Residential: resLvl, Commercial: commLvl, Industrial: indLvl });
    notifyAllocationsChange(initialRes.toFixed(1), initialComm.toFixed(1), initialInd.toFixed(1));
    setSelectedFloor(null);
  };

  // Floor-to-floor height: 3.8m
  const totalBuildingHeight = (totalLevels * 3.8).toFixed(1);
  const calculatedFAR = ((totalLevels * 2200) / 10000).toFixed(2); // FAR calculation for 10,000 m² site

  return (
    <div id="revit-bim-canvas-card" className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-[#313244]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#89b4fa]/15 text-[#89b4fa] rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-[#cdd6f4]">Revit BIM Physical Canvas Simulation</h3>
              {isCustomFloors && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f9e2af]/20 text-[#f9e2af] border border-[#f9e2af]/30 font-semibold">
                  Custom Massing Override
                </span>
              )}
            </div>
            <p className="text-xs text-[#a6adc8]">Dynamic Spatial Parcel & Mass Floor Stacking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#a6adc8] bg-[#181825] px-2.5 py-1.5 rounded-lg border border-[#313244]">
            <Compass className="w-3.5 h-3.5 text-[#89b4fa]" />
            <span>FAR {calculatedFAR} / 4.5 Target</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 text-xs bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] px-3 py-1.5 rounded-lg border border-[#45475a] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#89b4fa]" />
            <span>Change Stacking</span>
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mass Floor Stacking Configuration Drawer */}
      {showConfig && (
        <div className="bg-[#181825] p-4 rounded-xl border border-[#45475a] mb-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-bold text-[#cdd6f4] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#89b4fa]" />
              <span>Mass Floor Stacking & Vertical Zoning Sequence</span>
            </div>
            <button
              type="button"
              onClick={handleResetToAI}
              className="flex items-center gap-1 text-[11px] text-[#a6adc8] hover:text-[#cdd6f4] bg-[#313244] hover:bg-[#45475a] px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to AI MPT Allocation</span>
            </button>
          </div>

          {/* Stacking Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a6adc8] mb-1.5">
              Stacking Strategy Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STACKING_PRESETS.map((preset) => {
                const isActive = !isCustomFloors && stackingOrder.join('-') === preset.order.join('-');
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#89b4fa]/15 border-[#89b4fa] text-[#cdd6f4]'
                        : 'bg-[#11111b] border-[#313244] text-[#a6adc8] hover:border-[#45475a] hover:text-[#cdd6f4]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5">
                      <span>{preset.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#89b4fa]" />}
                    </div>
                    <p className="text-[10px] text-[#6c7086] leading-snug">{preset.description}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                      <span className="text-[#6c7086]">Sequence (Base→Sky):</span>
                      <span className="text-[#cdd6f4]">{preset.order.join(' → ')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Order & Floor Count Adjustments */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a6adc8] mb-1.5">
              Adjust Layer Sequence & Floor Levels:
            </label>
            <div className="space-y-2">
              {stackingOrder.map((zone, idx) => {
                const meta = zoneMeta[zone];
                const count = floorCounts[zone] || 0;
                const Icon = meta.icon;
                return (
                  <div
                    key={zone}
                    className="flex items-center justify-between p-2.5 bg-[#11111b] rounded-lg border border-[#313244]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      <div>
                        <div className="text-xs font-bold text-[#cdd6f4] flex items-center gap-1.5">
                          <span>{meta.label}</span>
                          <span className="text-[10px] text-[#6c7086] font-normal">
                            (Position: {idx === 0 ? 'Ground / Base' : idx === 1 ? 'Mid-Rise' : 'Upper / Sky'})
                          </span>
                        </div>
                        <div className="text-[10px] text-[#a6adc8] font-mono">
                          {count} Floors · {((count / totalLevels) * 100).toFixed(1)}% GFA
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Floor Stepper */}
                      <div className="flex items-center gap-1 bg-[#1e1e2e] border border-[#313244] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustFloorCount(zone, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] transition-colors cursor-pointer"
                          title="Decrease floors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold text-[#cdd6f4]">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustFloorCount(zone, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] transition-colors cursor-pointer"
                          title="Increase floors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Move Order Up / Down */}
                      <div className="flex items-center gap-0.5 bg-[#1e1e2e] border border-[#313244] rounded-lg p-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveZone(idx, -1)}
                          className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                            idx === 0
                              ? 'text-[#45475a] cursor-not-allowed'
                              : 'text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] cursor-pointer'
                          }`}
                          title="Move lower in stack (toward ground)"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === stackingOrder.length - 1}
                          onClick={() => moveZone(idx, 1)}
                          className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                            idx === stackingOrder.length - 1
                              ? 'text-[#45475a] cursor-not-allowed'
                              : 'text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] cursor-pointer'
                          }`}
                          title="Move higher in stack (toward sky)"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#a6adc8] pt-1 border-t border-[#313244]">
            <span className="flex items-center gap-1 text-[#89b4fa]">
              <Info className="w-3.5 h-3.5" />
              Tip: You can also click directly on any floor in the massing tower below to cycle its zoning type!
            </span>
            <span className="font-mono text-[#cdd6f4]">
              Total Height: {totalBuildingHeight}m ({totalLevels} Stories)
            </span>
          </div>
        </div>
      )}

      {/* Main Split Display: Vertical Tower Mass + Horizontal Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
        {/* Vertical Tower Stacking Column */}
        <div className="sm:col-span-5 bg-[#11111b] p-3.5 rounded-xl border border-[#313244] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#a6adc8] flex items-center gap-1">
                <span>Revit 2027 Mass Floors</span>
              </div>
              <span className="text-[10px] text-[#6c7086] font-mono">
                Click floor to cycle zone
              </span>
            </div>

            {/* Mass Floor Tower visualization (rendered from Top Level down to Level 1) */}
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto px-1 py-1 scrollbar-thin">
              {currentStack.slice().reverse().map((zoneType, revIdx) => {
                const levelIndex = totalLevels - 1 - revIdx;
                const levelNumber = levelIndex + 1;
                const elevation = (levelIndex * 3.8).toFixed(1);
                const meta = zoneMeta[zoneType];
                const isSelected = selectedFloor?.level === levelNumber;

                return (
                  <div
                    key={levelIndex}
                    onClick={() => handleFloorClick(levelIndex)}
                    className={`group relative flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#cdd6f4] shadow-md brightness-110'
                        : 'hover:brightness-125'
                    }`}
                    style={{ backgroundColor: meta.color }}
                    title={`Level ${levelNumber} (+${elevation}m): ${meta.label} — Click to cycle zoning`}
                  >
                    <span className="text-[9px] font-mono font-bold text-[#11111b] opacity-80 w-6 shrink-0">
                      L{levelNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-[#11111b] truncate">
                      {zoneType}
                    </span>
                    <span className="ml-auto text-[9px] font-mono text-[#11111b]/75 shrink-0 hidden sm:inline">
                      +{elevation}m
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tower Footnotes & Stats */}
          <div className="mt-3 pt-2.5 border-t border-[#313244] flex items-center justify-between text-[11px] font-mono text-[#a6adc8]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#a6e3a1]" />
              <span>{totalLevels} Massing Levels</span>
            </div>
            <span className="text-[#89b4fa] font-bold">
              +{totalBuildingHeight}m Elev.
            </span>
          </div>
        </div>

        {/* Spatial Parcel Breakdown & Asset Cards Column */}
        <div className="sm:col-span-7 flex flex-col gap-3">
          {/* Proportional Segment Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#a6adc8] mb-1 font-mono">
              <span>Dynamic GFA Distribution</span>
              <span className="text-[#cdd6f4]">Total 100%</span>
            </div>
            <div className="h-7 w-full flex rounded-lg overflow-hidden border border-[#45475a] shadow-inner">
              <div
                className="bg-[#89b4fa] flex items-center justify-center text-[11px] font-bold text-[#11111b] transition-all duration-300"
                style={{ width: `${calculatedRes}%` }}
                title={`Residential: ${calculatedRes}%`}
              >
                {parseFloat(calculatedRes) > 12 ? `Res ${calculatedRes}%` : `${calculatedRes}%`}
              </div>
              <div
                className="bg-[#f9e2af] flex items-center justify-center text-[11px] font-bold text-[#11111b] transition-all duration-300"
                style={{ width: `${calculatedComm}%` }}
                title={`Commercial: ${calculatedComm}%`}
              >
                {parseFloat(calculatedComm) > 12 ? `Comm ${calculatedComm}%` : `${calculatedComm}%`}
              </div>
              <div
                className="bg-[#f38ba8] flex items-center justify-center text-[11px] font-bold text-[#11111b] transition-all duration-300"
                style={{ width: `${calculatedInd}%` }}
                title={`Industrial: ${calculatedInd}%`}
              >
                {parseFloat(calculatedInd) > 12 ? `Ind ${calculatedInd}%` : `${calculatedInd}%`}
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Cards */}
          <div className="space-y-2">
            {/* Residential Card */}
            <div className="p-3 bg-[#181825] rounded-xl border-l-4 border-[#89b4fa] border-t border-r border-b border-[#313244] hover:border-[#45475a] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#89b4fa]/15 rounded-lg text-[#89b4fa]">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#89b4fa]">Residential Zoning</div>
                    <div className="text-[11px] text-[#a6adc8]">
                      High-density apartments & penthouses ({actualResCount} floors)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#cdd6f4] font-mono">{calculatedRes}%</div>
                  <div className="text-[10px] text-[#6c7086] font-mono">
                    ~{(actualResCount * 2200).toLocaleString()} m²
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Card */}
            <div className="p-3 bg-[#181825] rounded-xl border-l-4 border-[#f9e2af] border-t border-r border-b border-[#313244] hover:border-[#45475a] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#f9e2af]/15 rounded-lg text-[#f9e2af]">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#f9e2af]">Commercial & Retail</div>
                    <div className="text-[11px] text-[#a6adc8]">
                      Ground retail, food hall & office space ({actualCommCount} floors)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#cdd6f4] font-mono">{calculatedComm}%</div>
                  <div className="text-[10px] text-[#6c7086] font-mono">
                    ~{(actualCommCount * 2200).toLocaleString()} m²
                  </div>
                </div>
              </div>
            </div>

            {/* Industrial Card */}
            <div className="p-3 bg-[#181825] rounded-xl border-l-4 border-[#f38ba8] border-t border-r border-b border-[#313244] hover:border-[#45475a] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#f38ba8]/15 rounded-lg text-[#f38ba8]">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#f38ba8]">Industrial / Logistics</div>
                    <div className="text-[11px] text-[#a6adc8]">
                      Urban fulfillment & flex-research ({actualIndCount} floors)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#cdd6f4] font-mono">{calculatedInd}%</div>
                  <div className="text-[10px] text-[#6c7086] font-mono">
                    ~{(actualIndCount * 2200).toLocaleString()} m²
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Active Selection Inspector or Info Pill */}
          {selectedFloor ? (
            <div className="bg-[#11111b] p-2.5 rounded-lg border border-[#89b4fa]/40 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: zoneMeta[selectedFloor.zone].color }}
                />
                <span className="text-[#cdd6f4] font-semibold">
                  Level {selectedFloor.level} (+{selectedFloor.elevation}m)
                </span>
                <span className="text-[#a6adc8]">assigned to</span>
                <strong className="text-[#89b4fa]">{selectedFloor.zone}</strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFloor(null)}
                className="text-[10px] text-[#6c7086] hover:text-[#cdd6f4] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-[#11111b] rounded-lg border border-[#313244] text-[11px] text-[#a6adc8]">
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#89b4fa]" />
                <span>Base-to-Sky: {stackingOrder.join(' → ')}</span>
              </span>
              <span className="text-[#a6e3a1] font-mono">FAR Compliant</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
