import { Building2, Home, Store, Factory, Compass } from 'lucide-react';

export default function UrbanLayoutVisualizer({ allocations }) {
  const res = parseFloat(allocations.Res) || 33.3;
  const comm = parseFloat(allocations.Comm) || 33.3;
  const ind = parseFloat(allocations.Ind) || 33.4;

  const totalLevels = 20;
  const resLevels = Math.max(1, Math.round((res / 100) * totalLevels));
  const commLevels = Math.max(1, Math.round((comm / 100) * totalLevels));
  const indLevels = Math.max(1, totalLevels - resLevels - commLevels);

  // Stacking: Ground = Industrial/Logistics, Mid = Commercial/Retail, Upper = Residential Penthouse/Apartments
  const levels = [];
  for (let i = 0; i < indLevels; i++) {
    levels.push({ type: 'Industrial', color: '#f38ba8', label: `Lvl ${i + 1} Logistics/Tech` });
  }
  for (let i = 0; i < commLevels; i++) {
    levels.push({ type: 'Commercial', color: '#f9e2af', label: `Lvl ${indLevels + i + 1} Retail/Office` });
  }
  for (let i = 0; i < resLevels; i++) {
    levels.push({ type: 'Residential', color: '#89b4fa', label: `Lvl ${indLevels + commLevels + i + 1} Housing` });
  }

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#89b4fa]/15 text-[#89b4fa] rounded-md">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#cdd6f4]">Revit BIM Physical Canvas Simulation</h3>
            <p className="text-xs text-[#a6adc8]">Dynamic Spatial Parcel & Mass Floor Stacking</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#a6adc8] bg-[#181825] px-2.5 py-1 rounded border border-[#313244]">
          <Compass className="w-3.5 h-3.5 text-[#89b4fa]" />
          <span>FAR 4.5 Target</span>
        </div>
      </div>

      {/* Split Display: Vertical Tower Mass + Horizontal Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Vertical Tower Stacking */}
        <div className="sm:col-span-4 bg-[#11111b] p-3.5 rounded-lg border border-[#313244] flex flex-col justify-end">
          <div className="text-[10px] uppercase font-bold text-[#6c7086] text-center mb-2">
            Revit 2027 Mass Floors
          </div>
          
          <div className="flex flex-col-reverse gap-1 max-h-[260px] overflow-y-auto px-1 py-1">
            {levels.map((lvl, index) => (
              <div
                key={index}
                className="h-2.5 rounded transition-all duration-300 hover:brightness-125 cursor-help"
                style={{ backgroundColor: lvl.color }}
                title={lvl.label}
              />
            ))}
          </div>

          <div className="mt-2 text-center text-[10px] font-mono text-[#a6adc8] border-t border-[#313244] pt-1">
            20 Massing Levels
          </div>
        </div>

        {/* Spatial Parcel Breakdown & Asset Cards */}
        <div className="sm:col-span-8 flex flex-col gap-3">
          {/* Proportional Segment Bar */}
          <div className="h-7 w-full flex rounded-lg overflow-hidden border border-[#45475a] shadow-inner">
            <div
              className="bg-[#89b4fa] flex items-center justify-center text-[11px] font-bold text-[#11111b] transition-all duration-500"
              style={{ width: `${res}%` }}
            >
              {res > 15 ? `Res ${res}%` : `${res}%`}
            </div>
            <div
              className="bg-[#f9e2af] flex items-center justify-center text-[11px] font-bold text-[#11111b] transition-all duration-500"
              style={{ width: `${comm}%` }}
            >
              {comm > 15 ? `Comm ${comm}%` : `${comm}%`}
            </div>
            <div
              className="bg-[#f38ba8] flex items-center justify-center text-[11px] font-bold text-[#11111b] transition-all duration-500"
              style={{ width: `${ind}%` }}
            >
              {ind > 15 ? `Ind ${ind}%` : `${ind}%`}
            </div>
          </div>

          {/* Allocation Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-[#181825] rounded-lg border-l-4 border-[#89b4fa] border-t border-r border-b border-[#313244]">
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-[#89b4fa]" />
                <div>
                  <div className="text-xs font-bold text-[#89b4fa]">Residential Zoning</div>
                  <div className="text-[10px] text-[#a6adc8]">High-density apartments & penthouses ({resLevels} floors)</div>
                </div>
              </div>
              <span className="text-sm font-bold text-[#cdd6f4] font-mono">{res}%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#181825] rounded-lg border-l-4 border-[#f9e2af] border-t border-r border-b border-[#313244]">
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-[#f9e2af]" />
                <div>
                  <div className="text-xs font-bold text-[#f9e2af]">Commercial & Retail</div>
                  <div className="text-[10px] text-[#a6adc8]">Ground retail, food hall & office space ({commLevels} floors)</div>
                </div>
              </div>
              <span className="text-sm font-bold text-[#cdd6f4] font-mono">{comm}%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#181825] rounded-lg border-l-4 border-[#f38ba8] border-t border-r border-b border-[#313244]">
              <div className="flex items-center gap-2.5">
                <Factory className="w-4 h-4 text-[#f38ba8]" />
                <div>
                  <div className="text-xs font-bold text-[#f38ba8]">Industrial / Logistics</div>
                  <div className="text-[10px] text-[#a6adc8]">Urban fulfillment & flex-research ({indLevels} floors)</div>
                </div>
              </div>
              <span className="text-sm font-bold text-[#cdd6f4] font-mono">{ind}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
