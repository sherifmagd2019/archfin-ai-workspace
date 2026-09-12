import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Layers, Target, Info } from 'lucide-react';

export default function MPTEfficientFrontier({ allocations, covarianceMatrix, industrialRiskScale }) {
  const [chartView, setChartView] = useState('all');

  const res = parseFloat(allocations.Res) || 33.3;
  const comm = parseFloat(allocations.Comm) || 33.3;
  const ind = parseFloat(allocations.Ind) || 33.4;

  const expectedReturns = { res: 0.068, comm: 0.082, ind: 0.095 };
  const riskFreeRate = 2.5;

  const portfolioReturn = ((res * expectedReturns.res + comm * expectedReturns.comm + ind * expectedReturns.ind) / 100) * 100;
  const w = [res / 100, comm / 100, ind / 100];
  let portfolioVar = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      portfolioVar += w[i] * covarianceMatrix[i][j] * w[j];
    }
  }
  const portfolioVol = Math.sqrt(Math.max(0.0001, portfolioVar)) * 100;
  const sharpe = ((portfolioReturn - riskFreeRate) / Math.max(0.1, portfolioVol)).toFixed(2);

  const { feasiblePoints, frontierPoints, singleAssets, currentPoint } = useMemo(() => {
    const points = [];
    const step = 0.04;

    for (let r = 0; r <= 1.001; r += step) {
      for (let c = 0; c <= 1.001 - r; c += step) {
        const i = Math.max(0, 1.0 - r - c);
        const weights = [r, c, i];

        const ret = (r * expectedReturns.res + c * expectedReturns.comm + i * expectedReturns.ind) * 100;

        let variance = 0;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            variance += weights[row] * covarianceMatrix[row][col] * weights[col];
          }
        }
        const vol = Math.sqrt(Math.max(0.0001, variance)) * 100;
        const sr = (ret - riskFreeRate) / Math.max(0.1, vol);

        points.push({
          vol: parseFloat(vol.toFixed(2)),
          ret: parseFloat(ret.toFixed(2)),
          sharpe: parseFloat(sr.toFixed(2)),
          res: Math.round(r * 100),
          comm: Math.round(c * 100),
          ind: Math.round(i * 100),
          type: 'feasible'
        });
      }
    }

    const frontier = [];
    let minVolSeen = Infinity;
    const sortedDesc = [...points].sort((a, b) => b.ret - a.ret || a.vol - b.vol);
    for (const pt of sortedDesc) {
      if (pt.vol < minVolSeen) {
        frontier.unshift({
          ...pt,
          type: 'frontier'
        });
        minVolSeen = pt.vol;
      }
    }

    const single = [
      {
        name: "100% Residential",
        vol: parseFloat((Math.sqrt(covarianceMatrix[0][0]) * 100).toFixed(2)),
        ret: parseFloat((expectedReturns.res * 100).toFixed(2)),
        sharpe: parseFloat(((expectedReturns.res * 100 - riskFreeRate) / (Math.sqrt(covarianceMatrix[0][0]) * 100)).toFixed(2)),
        res: 100,
        comm: 0,
        ind: 0,
        color: '#89b4fa'
      },
      {
        name: "100% Commercial",
        vol: parseFloat((Math.sqrt(covarianceMatrix[1][1]) * 100).toFixed(2)),
        ret: parseFloat((expectedReturns.comm * 100).toFixed(2)),
        sharpe: parseFloat(((expectedReturns.comm * 100 - riskFreeRate) / (Math.sqrt(covarianceMatrix[1][1]) * 100)).toFixed(2)),
        res: 0,
        comm: 100,
        ind: 0,
        color: '#f9e2af'
      },
      {
        name: "100% Industrial",
        vol: parseFloat((Math.sqrt(covarianceMatrix[2][2]) * 100).toFixed(2)),
        ret: parseFloat((expectedReturns.ind * 100).toFixed(2)),
        sharpe: parseFloat(((expectedReturns.ind * 100 - riskFreeRate) / (Math.sqrt(covarianceMatrix[2][2]) * 100)).toFixed(2)),
        res: 0,
        comm: 0,
        ind: 100,
        color: '#f38ba8'
      }
    ];

    const current = [
      {
        name: "Active Optimized Allocation",
        vol: parseFloat(portfolioVol.toFixed(2)),
        ret: parseFloat(portfolioReturn.toFixed(2)),
        sharpe: parseFloat(sharpe),
        res: Math.round(res),
        comm: Math.round(comm),
        ind: Math.round(ind),
        color: '#a6e3a1'
      }
    ];

    return {
      feasiblePoints: points,
      frontierPoints: frontier,
      singleAssets: single,
      currentPoint: current
    };
  }, [covarianceMatrix, portfolioReturn, portfolioVol, res, comm, ind, sharpe]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCurrent = data.name === "Active Optimized Allocation";

      return (
        <div className="bg-[#181825] border border-[#45475a] p-3 rounded-lg shadow-2xl text-xs font-mono text-[#cdd6f4] max-w-xs z-50">
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-[#313244]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color || (isCurrent ? '#a6e3a1' : '#89b4fa') }}
            />
            <span className="font-bold text-[#cdd6f4]">
              {data.name || (data.type === 'frontier' ? 'Efficient Frontier Candidate' : 'Simulated Portfolio')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
            <div>
              <span className="text-[#a6adc8]">Return E(R): </span>
              <span className="text-[#a6e3a1] font-bold">{data.ret}%</span>
            </div>
            <div>
              <span className="text-[#a6adc8]">Volatility (σ): </span>
              <span className="text-[#f9e2af] font-bold">{data.vol}%</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#a6adc8]">Sharpe Ratio: </span>
              <span className="text-[#89b4fa] font-bold">{data.sharpe}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#313244] text-[11px]">
            <span className="text-[#a6adc8] block mb-0.5">Asset Allocation Mix:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#89b4fa]">Res: {data.res}%</span>
              <span className="text-[#f9e2af]">Comm: {data.comm}%</span>
              <span className="text-[#f38ba8]">Ind: {data.ind}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#a6e3a1]/15 text-[#a6e3a1] rounded-md">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#cdd6f4]">MPT Markowitz Efficient Frontier</h3>
            <p className="text-xs text-[#a6adc8]">Risk-Return Optimization Curve & Attainable Set</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#11111b] p-1 rounded-lg border border-[#313244]">
          <button
            type="button"
            onClick={() => setChartView('all')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
              chartView === 'all'
                ? 'bg-[#89b4fa] text-[#11111b] font-bold shadow'
                : 'text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            Chart & Matrix
          </button>
          <button
            type="button"
            onClick={() => setChartView('frontier')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
              chartView === 'frontier'
                ? 'bg-[#89b4fa] text-[#11111b] font-bold shadow'
                : 'text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            Frontier Focus
          </button>
          <button
            type="button"
            onClick={() => setChartView('matrix')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
              chartView === 'matrix'
                ? 'bg-[#89b4fa] text-[#11111b] font-bold shadow'
                : 'text-[#a6adc8] hover:text-[#cdd6f4]'
            }`}
          >
            Σ Matrix Only
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#181825] p-3 rounded-lg border border-[#313244]">
          <div className="flex items-center gap-1 text-[11px] text-[#a6adc8] mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#a6e3a1]" />
            <span>Expected Return E(R)</span>
          </div>
          <div className="text-xl font-bold text-[#a6e3a1]">
            {portfolioReturn.toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#6c7086] mt-0.5">Weighted Cap Yield</div>
        </div>

        <div className="bg-[#181825] p-3 rounded-lg border border-[#313244]">
          <div className="flex items-center gap-1 text-[11px] text-[#a6adc8] mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#f9e2af]" />
            <span>Portfolio Volatility (σ)</span>
          </div>
          <div className="text-xl font-bold text-[#f9e2af]">
            {portfolioVol.toFixed(2)}%
          </div>
          <div className="text-[10px] text-[#6c7086] mt-0.5">Standard Deviation</div>
        </div>

        <div className="bg-[#181825] p-3 rounded-lg border border-[#313244]">
          <div className="flex items-center gap-1 text-[11px] text-[#a6adc8] mb-1">
            <Layers className="w-3.5 h-3.5 text-[#89b4fa]" />
            <span>Sharpe Ratio</span>
          </div>
          <div className="text-xl font-bold text-[#89b4fa]">
            {sharpe}
          </div>
          <div className="text-[10px] text-[#6c7086] mt-0.5">Rf = 2.5% Benchmark</div>
        </div>
      </div>

      {chartView !== 'matrix' && (
        <div className="bg-[#11111b] p-4 rounded-xl border border-[#313244]">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold text-[#cdd6f4]">
                <Target className="w-3.5 h-3.5 text-[#a6e3a1]" />
                Efficient Frontier Curve
              </span>
              <span className="text-[#6c7086] hidden sm:inline">|</span>
              <span className="text-[#a6adc8] text-[11px]">
                Higher Sharpe = Superior Risk-Adjusted Spatial Yield
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-[#89b4fa]">
                <span className="w-2 h-2 rounded-full bg-[#89b4fa]" />
                Frontier
              </span>
              <span className="flex items-center gap-1 text-[#a6e3a1]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a6e3a1] ring-2 ring-[#a6e3a1]/40" />
                Current w*
              </span>
              <span className="flex items-center gap-1 text-[#45475a] hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45475a]" />
                Feasible Mixes
              </span>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#313244" />
                <XAxis
                  type="number"
                  dataKey="vol"
                  name="Volatility (σ)"
                  unit="%"
                  domain={['dataMin - 0.5', 'dataMax + 0.8']}
                  stroke="#6c7086"
                  tick={{ fill: '#a6adc8', fontSize: 11 }}
                  tickFormatter={(val) => `${val}%`}
                  label={{
                    value: 'Portfolio Volatility / Risk σ (%)',
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#a6adc8',
                    fontSize: 11
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="ret"
                  name="Expected Return"
                  unit="%"
                  domain={['dataMin - 0.4', 'dataMax + 0.5']}
                  stroke="#6c7086"
                  tick={{ fill: '#a6adc8', fontSize: 11 }}
                  tickFormatter={(val) => `${val}%`}
                  label={{
                    value: 'Expected Return E(R) (%)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: '#a6adc8',
                    fontSize: 11
                  }}
                />
                <ZAxis range={[20, 200]} />
                <Tooltip content={<CustomTooltip />} />

                <ReferenceLine
                  y={riskFreeRate}
                  stroke="#f38ba8"
                  strokeDasharray="4 4"
                  label={{
                    value: `Risk-Free Benchmark (${riskFreeRate}%)`,
                    fill: '#f38ba8',
                    fontSize: 10,
                    position: 'insideBottomRight'
                  }}
                />

                <Scatter
                  name="Feasible Portfolios"
                  data={feasiblePoints}
                  fill="#45475a"
                  opacity={0.35}
                />

                <Scatter
                  name="Efficient Frontier"
                  data={frontierPoints}
                  line={{ stroke: '#89b4fa', strokeWidth: 2 }}
                  fill="#89b4fa"
                  shape="circle"
                >
                  {frontierPoints.map((entry, index) => (
                    <Cell key={`frontier-${index}`} fill="#89b4fa" />
                  ))}
                </Scatter>

                <Scatter
                  name="Individual Asset Classes"
                  data={singleAssets}
                  shape="diamond"
                >
                  {singleAssets.map((entry, index) => (
                    <Cell key={`single-${index}`} fill={entry.color} />
                  ))}
                </Scatter>

                <Scatter
                  name="Active Allocation"
                  data={currentPoint}
                  shape="star"
                >
                  <Cell fill="#a6e3a1" stroke="#ffffff" strokeWidth={1.5} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6c7086] pt-2 border-t border-[#313244] flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#89b4fa]" />
              <span>
                Active Portfolio is marked at <strong className="text-[#a6e3a1]">σ = {portfolioVol.toFixed(2)}%, E(R) = {portfolioReturn.toFixed(2)}%</strong> (Sharpe: {sharpe})
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#89b4fa]">◆ Res (6.8%)</span>
              <span className="text-[#f9e2af]">◆ Comm (8.2%)</span>
              <span className="text-[#f38ba8]">◆ Ind (9.5%)</span>
            </div>
          </div>
        </div>
      )}

      {chartView !== 'frontier' && (
        <div className="bg-[#11111b] p-3.5 rounded-lg border border-[#313244]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#bac2de]">
              Covariance Matrix Σ (3x3 Real Estate Assets)
            </span>
            <span className="text-[11px] text-[#f38ba8] font-mono">
              Industrial Multiplier: {industrialRiskScale.toFixed(2)}x
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
            <div className="text-[#6c7086] py-1 text-center font-bold">Zoning</div>
            <div className="text-[#89b4fa] py-1 text-center font-bold">Residential</div>
            <div className="text-[#f9e2af] py-1 text-center font-bold">Commercial</div>
            <div className="text-[#f38ba8] py-1 text-center font-bold">Industrial</div>

            {['Residential', 'Commercial', 'Industrial'].map((rowLabel, i) => (
              <div key={rowLabel} className="contents">
                <div className="text-[#a6adc8] font-semibold py-1.5 px-2 bg-[#181825] rounded text-[11px]">
                  {rowLabel}
                </div>
                {covarianceMatrix[i].map((val, j) => (
                  <div
                    key={j}
                    className={`py-1.5 px-2 text-center rounded text-[11px] transition-colors ${
                      i === j
                        ? 'bg-[#313244] text-[#cdd6f4] font-bold border border-[#45475a]'
                        : 'bg-[#181825] text-[#a6adc8]'
                    }`}
                  >
                    {val.toFixed(4)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
