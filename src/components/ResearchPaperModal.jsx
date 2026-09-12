import { useState } from 'react';
import {
  FileText,
  Download,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  X,
  Award,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { downloadPaperPdf } from '../utils/generatePaperPdf';

export default function ResearchPaperModal({ isOpen, onClose }) {
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const apaCitation = `Magdaldin, S. A. (2026). A C# Application of Modern Portfolio Theory for Financial Risk-Return Optimization in Generative Urban BIM Layouts. Proceedings of the International Conference on Informatics, Civil and Parametric Engineering (ICICPE 2026).`;

  const bibtexCitation = `@inproceedings{magdaldin2026mptbim,
  author    = {Sherif Ahmad Magdaldin},
  title     = {A C\\# Application of Modern Portfolio Theory for Financial Risk-Return Optimization in Generative Urban BIM Layouts},
  booktitle = {Proceedings of the International Conference on Informatics, Civil and Parametric Engineering (ICICPE 2026)},
  year      = {2026},
  pages     = {1--3},
  publisher = {WorldQuant University & ICICPE},
  keywords  = {Revit API, C\\#, Modern Portfolio Theory, Generative BIM, Architectural Financial Engineering}
}`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(apaCitation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2200);
  };

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCitation);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2200);
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      downloadPaperPdf();
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#11111b]/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="research-paper-modal"
        className="relative w-full max-w-4xl bg-[#181825] border border-[#313244] rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#313244] bg-[#1e1e2e]/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#89b4fa]/15 text-[#89b4fa] rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#89b4fa]/20 text-[#89b4fa] border border-[#89b4fa]/30">
                  ICICPE 2026 Published Paper
                </span>
                <span className="text-xs text-[#a6adc8]">Peer-Reviewed Scientific Research</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#cdd6f4] mt-0.5 line-clamp-1">
                Modern Portfolio Theory in Generative Urban BIM Layouts
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#a6e3a1] text-[#11111b] text-xs font-bold shadow hover:bg-[#a6e3a1]/90 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Preparing PDF...' : 'Download Paper (PDF)'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable Paper Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#cdd6f4]">
          {/* Author Banner */}
          <div className="bg-[#1e1e2e] border border-[#313244] p-5 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#313244]">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#a6adc8] font-semibold mb-1">
                  Author & Principal Investigator
                </div>
                <div className="text-lg font-extrabold text-[#cdd6f4] flex items-center gap-2">
                  <span>Eng. Sherif Ahmad Magdaldin</span>
                  <Award className="w-4 h-4 text-[#f9e2af]" />
                </div>
                <div className="text-xs text-[#a6adc8] space-y-0.5 mt-1">
                  <div>Civil and Structural Engineer</div>
                  <div>Master of Financial Engineering Program, WorldQuant University</div>
                  <div className="text-[#89b4fa] font-mono">sherifmagd@gmail.com · New Orleans, Louisiana, USA</div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2 text-xs">
                <div className="bg-[#11111b] px-3 py-1.5 rounded-lg border border-[#313244] text-[#a6adc8]">
                  Target API: <span className="text-[#89b4fa] font-mono font-bold">Autodesk Revit 2027</span>
                </div>
                <div className="bg-[#11111b] px-3 py-1.5 rounded-lg border border-[#313244] text-[#a6adc8]">
                  Runtime: <span className="text-[#a6e3a1] font-mono font-bold">C# / .NET 8 / Math.NET</span>
                </div>
              </div>
            </div>

            {/* Quick Citations Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
              <div className="text-[#a6adc8]">
                Cite this work in academic research, AEC publications, or BIM development:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCitation}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#11111b] hover:bg-[#313244] text-[#cdd6f4] rounded-md border border-[#313244] transition-colors cursor-pointer"
                >
                  {copiedCitation ? <Check className="w-3.5 h-3.5 text-[#a6e3a1]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCitation ? 'APA Copied!' : 'Copy APA Citation'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyBibtex}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#11111b] hover:bg-[#313244] text-[#cdd6f4] rounded-md border border-[#313244] transition-colors cursor-pointer"
                >
                  {copiedBibtex ? <Check className="w-3.5 h-3.5 text-[#a6e3a1]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBibtex ? 'BibTeX Copied!' : 'Copy BibTeX'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Paper Full Content Presentation */}
          <article className="bg-[#11111b] p-6 rounded-xl border border-[#313244] space-y-6 font-serif leading-relaxed text-[#cdd6f4]">
            {/* Title Block */}
            <div className="text-center space-y-2 border-b border-[#313244] pb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-[#cdd6f4] tracking-tight">
                A C# Application of Modern Portfolio Theory for Financial Risk-Return Optimization in Generative Urban BIM Layouts
              </h1>
              <div className="text-sm font-sans text-[#bac2de]">
                <strong>Sherif Ahmad Magdaldin</strong>
              </div>
              <div className="text-xs font-sans text-[#a6adc8]">
                Civil and Structural Engineer · Master of Financial Engineering Program, WorldQuant University
              </div>
              <div className="text-xs font-sans text-[#89b4fa]">
                sherifmagd@gmail.com · New Orleans, Louisiana, USA
              </div>
            </div>

            {/* Abstract Section */}
            <div className="bg-[#181825] p-4 rounded-lg border border-[#313244] font-sans">
              <div className="text-xs uppercase font-bold text-[#89b4fa] tracking-wider mb-1.5">
                Abstract
              </div>
              <p className="text-xs text-[#bac2de] leading-relaxed italic text-justify">
                Traditional cost estimation techniques within Architecture, Engineering, and Construction (AEC) frameworks
                typically treat generative design variations as isolated assets, ignoring the financial dependencies and systematic
                risks embedded across large-scale urban developments. This paper introduces an automated software application built
                in C# using the Revit API that implements quantitative financial frameworks to optimize design selection. By parsing
                geometric and material parameters from generative BIM instances, the engine applies Harry Markowitz’s Modern Portfolio
                Theory (MPT) to evaluate multiple building design layouts as an investment portfolio. The software programmatically
                computes historical price variances and cross-asset correlation matrices to establish an optimal financial risk-return
                profile. The final software execution maps an “Efficient Frontier” directly within the designer’s environment,
                allowing developers to visually isolate layouts that maximize yield while minimizing downside market risk exposure.
                This methodology establishes an objective, data-driven link between spatial generative design and advanced asset-portfolio engineering.
              </p>
              <div className="mt-3 pt-2 border-t border-[#313244] text-[11px] text-[#a6adc8]">
                <strong className="text-[#cdd6f4]">Keywords:</strong> ICICPE 2026, Revit API, C#, Modern Portfolio Theory, Generative BIM, Architectural Financial Engineering
              </div>
            </div>

            {/* Section 1: Introduction */}
            <section className="space-y-3 font-sans">
              <h3 className="text-base font-bold text-[#cdd6f4] border-b border-[#313244] pb-1">
                1. Introduction
              </h3>
              <p className="text-xs text-[#a6adc8] leading-relaxed text-justify">
                The convergence of algorithmic architectural creation and computational finance represents a new paradigm shift for the Architecture, Engineering, and Construction (AEC) software domain. Historically, structural design platforms and capital deployment calculation channels have operated in isolated silos. Designers leverage parametric Building Information Modeling (BIM) programs to modify spatial arrangements based on structural efficiency, volume limits, or aesthetic objectives.
              </p>
              <p className="text-xs text-[#a6adc8] leading-relaxed text-justify">
                Concurrently, investment analysts rely on disconnected matrix computations via standard spreadsheets to measure project feasibility. This data silo introduces structural fragmentation into multi-asset real estate portfolio evaluations, rendering real-time adjustments highly error-prone.
              </p>
              <p className="text-xs text-[#a6adc8] leading-relaxed text-justify">
                Furthermore, traditional infrastructure financial frameworks are bound to static Net Present Value (NPV) formulas. These procedures fail to model risk dynamics and covariance behaviors that arise when multi-building developments are executed simultaneously in a volatile marketplace. If raw steel prices skyrocket or localized rental absorption rates change, separate structures within the same blueprint exhibit strong financial correlations. To bridge this analytical disconnect, this paper presents an interconnected runtime engine compiled in C# that exposes real-time portfolio optimization analytics directly inside standard BIM development environments.
              </p>
            </section>

            {/* Section 2: System Framework and Methodology */}
            <section className="space-y-3 font-sans">
              <h3 className="text-base font-bold text-[#cdd6f4] border-b border-[#313244] pb-1">
                2. System Framework and Methodology
              </h3>
              <p className="text-xs text-[#a6adc8] leading-relaxed text-justify">
                The application pipeline relies on direct integration with the Autodesk Revit development sandbox using native .NET libraries. The framework extracts geometric parameter fields across generative variations and converts raw data footprints into discrete inputs for a quantitative financial engine based on Markowitz’s Modern Portfolio Theory (MPT).
              </p>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#89b4fa] uppercase tracking-wide">
                  2.1 Mathematical Model Formulation
                </h4>
                <p className="text-xs text-[#a6adc8]">
                  Let <code className="text-[#89b4fa]">n</code> represent the total number of distinct generative structural layouts identified across the spatial schema. The calculated financial output matrix relies on optimizing the weight allocations vector <code className="text-[#89b4fa]">w</code>, formulated as:
                </p>
                <div className="bg-[#181825] p-3 rounded-lg text-center font-mono text-xs border border-[#313244] text-[#a6e3a1]">
                  min_w &nbsp;&nbsp; σ²_p = w^T Σ w &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (1)
                </div>
                <p className="text-xs text-[#a6adc8]">
                  Subject to the structural budget configuration limits:
                </p>
                <div className="bg-[#181825] p-3 rounded-lg text-center font-mono text-xs border border-[#313244] text-[#a6e3a1]">
                  w^T 1 = 1, &nbsp;&nbsp;&nbsp;&nbsp; w^T R = μ_p &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (2)
                </div>
                <p className="text-xs text-[#a6adc8] text-justify">
                  Where <code className="text-[#89b4fa]">Σ</code> establishes the variance-covariance matrix extracted from localized structural commodity inputs and market indexes, <code className="text-[#89b4fa]">R</code> models expected yield vectors, and <code className="text-[#89b4fa]">μ_p</code> defines the user-targeted returns limit. The software translates spatial overlaps and design complexities into corresponding covariance boundaries dynamically via the API.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-[#89b4fa] uppercase tracking-wide">
                  2.2 Architecture Data Flow Mapping
                </h4>
                <p className="text-xs text-[#a6adc8] text-justify">
                  The system layout uses an asymmetric data execution loop divided across separate boundaries to prevent design workspace latency. The C# Plug-in Middleware extracts spatial volumes and JSON streams them into the Quantitative Engine loop solving <code className="text-[#89b4fa]">w = g + h·μ_p</code>, returning graphical feedback to map the Efficient Frontier directly within Revit.
                </p>
              </div>

              {/* Listing 1 Code block */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-[#89b4fa] uppercase tracking-wide">
                  2.3 Algorithmic Optimization Pipeline (C# / Math.NET)
                </h4>
                <div className="bg-[#181825] p-4 rounded-xl border border-[#313244] overflow-x-auto text-[11px] font-mono text-[#cdd6f4] leading-normal">
                  <div className="text-[10px] text-[#6c7086] pb-2 mb-2 border-b border-[#313244]">
                    Listing 1. C Sharp Matrix Core for Mean-Variance Portfolio Frontier Calculation
                  </div>
                  <pre>{`public Vector<double> CalculateEfficientFrontier(double maxRiskBound, double[,] covarianceMatrix) {
    int n = _assets.Count;
    var M = Matrix<double>.Build; var V = Vector<double>.Build;
    
    // Populate the expected return vector R from spatial assets
    Vector<double> R = V.Dense(_assets.Select(a => a.ExpectedYield).ToArray());
    double[,] covMatrix = new double[n, n];
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            covMatrix[i, j] = (i == j) ? Math.Pow(_assets[i].HistoricalVolatility, 2) : covarianceMatrix[i, j];
        }
    }
    
    // High-performance matrix inversion using Math.NET
    Matrix<double> sigmaInverse = M.DenseOfArray(covMatrix).Inverse();
    Vector<double> ones = V.Dense(n, 1.0);
    
    Vector<double> invSigmaOnes = sigmaInverse * ones;
    Vector<double> invSigmaR = sigmaInverse * R;
    
    // Compute scalar analytical components for Markowitz solution
    double A = ones.DotProduct(invSigmaR);       // 1^T * Sigma^-1 * R
    double B = R.DotProduct(invSigmaR);          // R^T * Sigma^-1 * R
    double C = ones.DotProduct(invSigmaOnes);    // 1^T * Sigma^-1 * 1
    double D = (B * C) - (A * A);                // Parabolic determinant
    
    double minVolBound = 1.0 / Math.Sqrt(C);
    if (maxRiskBound < minVolBound) {
        maxRiskBound = minVolBound; // Guard against NaN
    }
    
    // Evaluate target return matching true curvature of frontier hyperbola
    double targetReturn = (A + Math.Sqrt(Math.Max(0, D * (maxRiskBound * maxRiskBound * C - 1)))) / C;
    
    // Solve two-constraint analytic weight system vectors (g and h subspaces)
    Vector<double> g = (invSigmaOnes * (B / D)) - (invSigmaR * (A / D));
    Vector<double> h = (invSigmaR * (C / D)) - (invSigmaOnes * (A / D));
    
    return g + (h * targetReturn); // Finalized allocation weight vector w
}`}</pre>
                </div>
              </div>
            </section>

            {/* Section 3: Simulation Experiment Results */}
            <section className="space-y-3 font-sans">
              <h3 className="text-base font-bold text-[#cdd6f4] border-b border-[#313244] pb-1">
                3. Simulation Experiment Results
              </h3>
              <p className="text-xs text-[#a6adc8] leading-relaxed text-justify">
                The software platform was validated using a synthetic generative parcel design layout inside Revit containing three distinct structural zone types: residential properties, premium commercial zones, and industrial storage formats. Volatility indices (σ) were configured based on real-world asset pricing shifts.
              </p>
              <p className="text-xs text-[#a6adc8] leading-relaxed text-justify">
                As detailed in Table 1, evaluating the system across variable covariance regimes alters allocation geometry. Under a dynamic, low-covariance framework where structural assets are uncorrelated, the MPT engine maximizes asset diversification benefits. This yields a superior Sharpe Ratio of 0.934 and brings the systemic volatility exposure down to 10.12%. In contrast, simulating a highly-correlated market environment compresses the portfolio’s risk-mitigation properties, lowering the Sharpe Ratio to 0.715.
              </p>

              {/* Table 1 */}
              <div className="bg-[#181825] p-3 rounded-xl border border-[#313244] overflow-x-auto">
                <div className="text-[11px] font-bold text-[#cdd6f4] mb-2">
                  Table 1. Simulation Analytics: Portfolio Optimization Variations Under Variable Covariance
                </div>
                <table className="w-full text-xs font-mono text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#313244] text-[#89b4fa]">
                      <th className="py-1.5 px-2">BIM Opt. Metric</th>
                      <th className="py-1.5 px-2 text-right">Baseline</th>
                      <th className="py-1.5 px-2 text-right">High-Yield</th>
                      <th className="py-1.5 px-2 text-right">MPT (High Corr.)</th>
                      <th className="py-1.5 px-2 text-right text-[#a6e3a1]">MPT (Low Corr.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#313244]/50 text-[#cdd6f4]">
                    <tr>
                      <td className="py-1 px-2 text-[#a6adc8]">Res. Footprint (m²)</td>
                      <td className="py-1 px-2 text-right">12,500</td>
                      <td className="py-1 px-2 text-right">5,000</td>
                      <td className="py-1 px-2 text-right">8,100</td>
                      <td className="py-1 px-2 text-right font-bold text-[#a6e3a1]">8,750</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-[#a6adc8]">Comm. Footprint (m²)</td>
                      <td className="py-1 px-2 text-right">3,000</td>
                      <td className="py-1 px-2 text-right">11,000</td>
                      <td className="py-1 px-2 text-right">5,150</td>
                      <td className="py-1 px-2 text-right font-bold text-[#a6e3a1]">5,500</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-[#a6adc8]">Ind. Footprint (m²)</td>
                      <td className="py-1 px-2 text-right">1,500</td>
                      <td className="py-1 px-2 text-right">1,000</td>
                      <td className="py-1 px-2 text-right">2,250</td>
                      <td className="py-1 px-2 text-right font-bold text-[#a6e3a1]">2,750</td>
                    </tr>
                    <tr className="bg-[#11111b]">
                      <td className="py-1 px-2 text-[#a6adc8]">Expected Return (μ_p)</td>
                      <td className="py-1 px-2 text-right">6.82%</td>
                      <td className="py-1 px-2 text-right font-bold">14.15%</td>
                      <td className="py-1 px-2 text-right">10.90%</td>
                      <td className="py-1 px-2 text-right font-bold text-[#a6e3a1]">11.45%</td>
                    </tr>
                    <tr className="bg-[#11111b]">
                      <td className="py-1 px-2 text-[#a6adc8]">Portfolio Volatility (σ_p)</td>
                      <td className="py-1 px-2 text-right">8.41%</td>
                      <td className="py-1 px-2 text-right text-[#f38ba8]">22.38%</td>
                      <td className="py-1 px-2 text-right">12.45%</td>
                      <td className="py-1 px-2 text-right font-bold text-[#a6e3a1]">10.12%</td>
                    </tr>
                    <tr className="bg-[#11111b]/80 border-t border-[#45475a]">
                      <td className="py-1.5 px-2 font-bold text-[#cdd6f4]">Sharpe Ratio (Rf = 2%)</td>
                      <td className="py-1.5 px-2 text-right font-bold">0.573</td>
                      <td className="py-1.5 px-2 text-right font-bold text-[#f38ba8]">0.543</td>
                      <td className="py-1.5 px-2 text-right font-bold">0.715</td>
                      <td className="py-1.5 px-2 text-right font-bold text-[#a6e3a1] bg-[#a6e3a1]/10">0.934</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Conclusion & Acknowledgements */}
            <section className="space-y-3 font-sans">
              <h3 className="text-base font-bold text-[#cdd6f4] border-b border-[#313244] pb-1">
                4. Conclusion and Future Horizons
              </h3>
              <p className="text-xs text-[#a6adc8] leading-relaxed text-justify">
                By embedding computational financial engineering directly inside parametric BIM software code pipelines via C#, developers can transcend old static cash-flow paradigms. This research successfully proves that integrating Modern Portfolio Theory with generative design yields an automated method to mitigate downstream real estate exposure before breaking ground. Future updates will incorporate direct web API asset pricing loops to refine cross-commodity calculations dynamically.
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#f9e2af] uppercase tracking-wide mb-1">
                  Acknowledgements
                </h4>
                <p className="text-xs text-[#a6adc8] italic">
                  The author would like to acknowledge WorldQuant University for providing the computational research platform and quantitative training that made the financial engine integration model possible.
                </p>
              </div>

              {/* References */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#89b4fa] uppercase tracking-wide mb-2">
                  References
                </h4>
                <ol className="text-[11px] text-[#6c7086] space-y-1 font-mono list-none">
                  <li>[1] H. Markowitz, “Portfolio Selection,” The Journal of Finance, vol. 7, no. 1, pp. 77–91, 1952.</li>
                  <li>[2] C. Eastman, P. Teicholz, R. Sacks, and K. Liston, BIM Handbook: A Guide to Building Information Modeling for Owners, Managers, Designers, Engineers and Contractors. John Wiley & Sons, 2011.</li>
                  <li>[3] Autodesk, “Revit API Developer Guide,” Autodesk Developer Network, 2024.</li>
                  <li>[4] A. Nagy, “Generative Design for Architectural Layouts,” International Journal of Architectural Computing, vol. 15, no. 4, pp. 321–335, 2017.</li>
                  <li>[5] J. Hull, Options, Futures, and Other Derivatives, 11th ed. New York, NY, USA: Pearson, 2021.</li>
                  <li>[6] S. Azhar, “Building Information Modeling (BIM): Trends, Benefits, Risks, and Challenges for the AEC Industry,” Leadership and Management in Engineering, vol. 11, no. 3, pp. 241–252, 2011.</li>
                  <li>[7] C. Lovett, “Math.NET Numerics: Advanced Matrix Mathematics for .NET Frameworks,” Open Source Software Review, vol. 14, pp. 45–52, 2020.</li>
                  <li>[8] M. Koenig and J. Schmitt, “Automated Urban Layout Generation and Optimization Frameworks,” Automation in Construction, vol. 92, pp. 112–125, 2018.</li>
                  <li>[9] T. Ho and S. Lee, “Real Estate Portfolio Optimization Under Parametric Covariance Structures,” Journal of Real Estate Portfolio Management, vol. 22, no. 2, pp. 101–115, 2016.</li>
                  <li>[10] R. Sacks et al., “Evaluation of Parametric BIM Variants Using Financial Engineering Metrics,” Advanced Engineering Informatics, vol. 44, p. 101085, 2020.</li>
                </ol>
              </div>
            </section>
          </article>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#313244] bg-[#1e1e2e]/90 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-[#a6adc8]">
            Author: <strong className="text-[#cdd6f4]">Eng. Sherif Ahmad Magdaldin</strong> · ICICPE 2026
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a6e3a1] text-[#11111b] font-bold shadow hover:bg-[#a6e3a1]/90 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Generating PDF...' : 'Download Full PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#313244] text-[#cdd6f4] hover:bg-[#45475a] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
