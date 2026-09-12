// src/components/UrbanLayoutVisualizer.jsx
import React from 'react';

export default function UrbanLayoutVisualizer({ allocations = { Res: "33.3", Comm: "33.3", Ind: "33.4" } }) {
  const res = parseFloat(allocations.Res) || 33.3;
  const comm = parseFloat(allocations.Comm) || 33.3;
  const ind = parseFloat(allocations.Ind) || 33.4;

  const totalFloors = 24;
  const resFloors = Math.max(1, Math.round((res / 100) * totalFloors));
  const commFloors = Math.max(1, Math.round((comm / 100) * totalFloors));
  const indFloors = Math.max(1, totalFloors - resFloors - commFloors);

  // Generate floor stack (from ground to top: Industrial -> Commercial -> Residential)
  const floorStack = [];
  for (let i = 0; i < indFloors; i++) floorStack.push({ type: 'Industrial', color: '#f38ba8', label: 'IND', bg: '#f38ba8' });
  for (let i = 0; i < commFloors; i++) floorStack.push({ type: 'Commercial', color: '#f9e2af', label: 'COMM', bg: '#f9e2af' });
  for (let i = 0; i < resFloors; i++) floorStack.push({ type: 'Residential', color: '#89b4fa', label: 'RES', bg: '#89b4fa' });

  return (
    <div style={{ background: '#1e1e2e', borderRadius: '12px', border: '1px solid #313244', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bac2de' }}>
          Physical BIM Mass & Zoning Spatial Distribution
        </h4>
        <span style={{ fontSize: '11px', color: '#89b4fa', background: '#313244', padding: '3px 8px', borderRadius: '4px' }}>
          24 Mass Floors (FAR 4.5)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '20px', alignItems: 'center' }}>
        {/* Isometric / Vertical Building Mass Stack */}
        <div style={{ background: '#11111b', borderRadius: '8px', padding: '12px 16px', border: '1px solid #313244', display: 'flex', flexDirection: 'column-reverse', gap: '2px', maxHeight: '280px', overflowY: 'auto' }}>
          {floorStack.map((floor, idx) => (
            <div 
              key={idx}
              style={{
                height: '8px',
                background: floor.bg,
                opacity: 0.85,
                borderRadius: '2px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease'
              }}
              title={`Level ${idx + 1}: ${floor.type}`}
            />
          ))}
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#6c7086', marginTop: '4px', textTransform: 'uppercase' }}>
            ▲ Revit Tower Core
          </div>
        </div>

        {/* Spatial Parcel Zoning Breakdown */}
        <div>
          {/* Visual Percentage Bar */}
          <div style={{ height: '24px', display: 'flex', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px', border: '1px solid #45475a' }}>
            <div style={{ width: `${res}%`, background: '#89b4fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#11111b', fontWeight: 'bold', transition: 'width 0.4s ease' }}>
              {res > 12 ? `${res}%` : ''}
            </div>
            <div style={{ width: `${comm}%`, background: '#f9e2af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#11111b', fontWeight: 'bold', transition: 'width 0.4s ease' }}>
              {comm > 12 ? `${comm}%` : ''}
            </div>
            <div style={{ width: `${ind}%`, background: '#f38ba8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#11111b', fontWeight: 'bold', transition: 'width 0.4s ease' }}>
              {ind > 12 ? `${ind}%` : ''}
            </div>
          </div>

          {/* Asset Class Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#181825', padding: '8px 12px', borderRadius: '6px', borderLeft: '4px solid #89b4fa' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#89b4fa' }}>Residential Zones</div>
                <div style={{ fontSize: '10px', color: '#a6adc8' }}>Levels {totalFloors - resFloors + 1}–{totalFloors} ({resFloors} Floors)</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#cdd6f4' }}>{res}%</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#181825', padding: '8px 12px', borderRadius: '6px', borderLeft: '4px solid #f9e2af' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f9e2af' }}>Commercial & Retail</div>
                <div style={{ fontSize: '10px', color: '#a6adc8' }}>Levels {indFloors + 1}–{indFloors + commFloors} ({commFloors} Floors)</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#cdd6f4' }}>{comm}%</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#181825', padding: '8px 12px', borderRadius: '6px', borderLeft: '4px solid #f38ba8' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f38ba8' }}>Industrial / Logistics Hub</div>
                <div style={{ fontSize: '10px', color: '#a6adc8' }}>Levels 1–{indFloors} ({indFloors} Floors)</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#cdd6f4' }}>{ind}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
