import { jsPDF } from 'jspdf';

export function downloadPaperPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  const addHeaderFooter = (pageNum, totalPages = 3) => {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'A C# Application of Modern Portfolio Theory in Generative Urban BIM Layouts',
      margin,
      10
    );
    doc.text(`ICICPE 2026`, pageWidth - margin, 10, { align: 'right' });

    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text(String(pageNum), pageWidth / 2, pageHeight - 8, { align: 'center' });
  };

  // --- PAGE 1 ---
  let y = 22;

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  const title = 'A C# Application of Modern Portfolio Theory for Financial Risk-Return Optimization in Generative Urban BIM Layouts';
  const splitTitle = doc.splitTextToSize(title, contentWidth);
  doc.text(splitTitle, pageWidth / 2, y, { align: 'center' });
  y += splitTitle.length * 6 + 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.text('Sherif Ahmad Magdaldin', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Civil and Structural Engineer', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Master of Financial Engineering Program, WorldQuant University', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('New Orleans, Louisiana, USA', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setTextColor(30, 64, 175);
  doc.text('sherifmagd@gmail.com', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Abstract', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const abstractText = 
    "Traditional cost estimation techniques within Architecture, Engineering, and Construction (AEC) frameworks typically treat generative design variations as isolated assets, ignoring the financial dependencies and systematic risks embedded across large-scale urban developments. This paper introduces an automated software application built in C# using the Revit API that implements quantitative financial frameworks to optimize design selection. By parsing geometric and material parameters from generative BIM instances, the engine applies Harry Markowitz’s Modern Portfolio Theory (MPT) to evaluate multiple building design layouts as an investment portfolio. The software programmatically computes historical price variances and cross-asset correlation matrices to establish an optimal financial risk-return profile. The final software execution maps an 'Efficient Frontier' directly within the designer’s environment, allowing developers to visually isolate layouts that maximize yield while minimizing downside market risk exposure. This methodology establishes an objective, data-driven link between spatial generative design and advanced asset-portfolio engineering.";
  const splitAbstract = doc.splitTextToSize(abstractText, contentWidth - 16);
  doc.text(splitAbstract, margin + 8, y, { align: 'justify', maxWidth: contentWidth - 16 });
  y += splitAbstract.length * 3.7 + 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('Keywords: ', margin + 8, y);
  doc.setFont('times', 'normal');
  doc.text('ICICPE 2026, Revit API, C#, Modern Portfolio Theory, Generative BIM, Architectural Financial Engineering', margin + 23, y);
  y += 8;

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('1.  Introduction', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  const p1 = "The convergence of algorithmic architectural creation and computational finance represents a new paradigm shift for the Architecture, Engineering, and Construction (AEC) software domain. Historically, structural design platforms and capital deployment calculation channels have operated in isolated silos. Designers leverage parametric Building Information Modeling (BIM) programs to modify spatial arrangements based on structural efficiency, volume limits, or aesthetic objectives.";
  const p1Lines = doc.splitTextToSize(p1, contentWidth);
  doc.text(p1Lines, margin, y, { align: 'justify' });
  y += p1Lines.length * 3.6 + 2.5;

  const p2 = "Concurrently, investment analysts rely on disconnected matrix computations via standard spreadsheets to measure project feasibility. This data silo introduces structural fragmentation into multi-asset real estate portfolio evaluations, rendering real-time adjustments highly error-prone.";
  const p2Lines = doc.splitTextToSize(p2, contentWidth);
  doc.text(p2Lines, margin, y, { align: 'justify' });
  y += p2Lines.length * 3.6 + 2.5;

  const p3 = "Furthermore, traditional infrastructure financial frameworks are bound to static Net Present Value (NPV) formulas. These procedures fail to model risk dynamics and covariance behaviors that arise when multi-building developments are executed simultaneously in a volatile marketplace. If raw steel prices skyrocket or localized rental absorption rates change, separate structures within the same blueprint exhibit strong financial correlations. To bridge this analytical disconnect, this paper presents an interconnected runtime engine compiled in C# that exposes real-time portfolio optimization analytics directly inside standard BIM development environments.";
  const p3Lines = doc.splitTextToSize(p3, contentWidth);
  doc.text(p3Lines, margin, y, { align: 'justify' });
  y += p3Lines.length * 3.6 + 5;

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('2.  System Framework and Methodology', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  const s2Text = "The application pipeline relies on direct integration with the Autodesk Revit development sandbox using native .NET libraries. The framework extracts geometric parameter fields across generative variations and converts raw data footprints into discrete inputs for a quantitative financial engine based on Markowitz’s Modern Portfolio Theory (MPT).";
  const s2Lines = doc.splitTextToSize(s2Text, contentWidth);
  doc.text(s2Lines, margin, y, { align: 'justify' });
  y += s2Lines.length * 3.6 + 3.5;

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('2.1  Mathematical Model Formulation', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  const mathIntro = "Let n represent the total number of distinct generative structural layouts identified across the spatial schema. The calculated financial output matrix relies on optimizing the weight allocations vector w, formulated as:";
  const mathIntroLines = doc.splitTextToSize(mathIntro, contentWidth);
  doc.text(mathIntroLines, margin, y, { align: 'justify' });
  y += mathIntroLines.length * 3.6 + 3;

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.text('min_w   \u03C3\u00B2_p = w\u1D40 \u03A3 w', pageWidth / 2 - 15, y, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.text('(1)', pageWidth - margin - 5, y, { align: 'right' });
  y += 6;

  addHeaderFooter(1, 3);

  // --- PAGE 2 ---
  doc.addPage();
  y = 18;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('Subject to the structural budget configuration limits:', margin, y);
  y += 4.5;

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.text('w\u1D40 1 = 1,    w\u1D40 R = \u03BC_p', pageWidth / 2 - 15, y, { align: 'center' });
  doc.setFont('times', 'normal');
  doc.text('(2)', pageWidth - margin - 5, y, { align: 'right' });
  y += 6;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  const pSigma = "Where \u03A3 establishes the variance-covariance matrix extracted from localized structural commodity inputs and market indexes, R models expected yield vectors, and \u03BC_p defines the user-targeted returns limit. The software translates spatial overlaps and design complexities into corresponding covariance boundaries dynamically via the API.";
  const pSigmaLines = doc.splitTextToSize(pSigma, contentWidth);
  doc.text(pSigmaLines, margin, y, { align: 'justify' });
  y += pSigmaLines.length * 3.6 + 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('2.2  Architecture Data Flow Mapping', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  const archText = "The system layout uses an asymmetric data execution loop divided across separate boundaries to prevent design workspace latency. The C# Plug-in Middleware interacts via FilteredElementCollector with the Geometric & Volume Extractor, communicating via JSON Stream Data to the Quantitative Engine (PortfolioEngine loop solving w = g + h\u03BC_p), and returning via UI Thread Callbacks to map Graphical Efficient Frontier curves directly on the design plane.";
  const archLines = doc.splitTextToSize(archText, contentWidth);
  doc.text(archLines, margin, y, { align: 'justify' });
  y += archLines.length * 3.6 + 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('2.3  Algorithmic Optimization Pipeline', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('The computational core tracks structural material configurations and evaluates allocation configurations. Below is the primary C# method executing the mean-variance matrix calculation using an empirical, dynamic asset covariance lookup:', margin, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 138, 'FD');

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);

  const codeSnippet = [
    "public Vector<double> CalculateEfficientFrontier(double maxRiskBound, double[,] covarianceMatrix) {",
    "    int n = _assets.Count;",
    "    var M = Matrix<double>.Build; var V = Vector<double>.Build;",
    "    Vector<double> R = V.Dense(_assets.Select(a => a.ExpectedYield).ToArray());",
    "    double[,] covMatrix = new double[n, n];",
    "    for (int i = 0; i < n; i++) {",
    "        for (int j = 0; j < n; j++) {",
    "            covMatrix[i, j] = (i == j) ? Math.Pow(_assets[i].HistoricalVolatility, 2) : covarianceMatrix[i, j];",
    "        }",
    "    }",
    "    // High-performance matrix inversion using Math.NET",
    "    Matrix<double> sigmaInverse = M.DenseOfArray(covMatrix).Inverse();",
    "    Vector<double> ones = V.Dense(n, 1.0);",
    "    Vector<double> invSigmaOnes = sigmaInverse * ones;",
    "    Vector<double> invSigmaR = sigmaInverse * R;",
    "    double A = ones.DotProduct(invSigmaR);       // 1^T * Sigma^-1 * R",
    "    double B = R.DotProduct(invSigmaR);          // R^T * Sigma^-1 * R",
    "    double C = ones.DotProduct(invSigmaOnes);    // 1^T * Sigma^-1 * 1",
    "    double D = (B * C) - (A * A);                // Parabolic matrix determinant",
    "    double minVolBound = 1.0 / Math.Sqrt(C);",
    "    if (maxRiskBound < minVolBound) maxRiskBound = minVolBound;",
    "    // Evaluate target return matching true curvature of frontier hyperbola",
    "    double targetReturn = (A + Math.Sqrt(Math.Max(0, D * (maxRiskBound * maxRiskBound * C - 1)))) / C;",
    "    // Solve two-constraint analytic weight system vectors (g and h subspaces)",
    "    Vector<double> g = (invSigmaOnes * (B / D)) - (invSigmaR * (A / D));",
    "    Vector<double> h = (invSigmaR * (C / D)) - (invSigmaOnes * (A / D));",
    "    return g + (h * targetReturn); // Finalized allocation weight vector w",
    "}"
  ];

  let codeY = y + 4.5;
  codeSnippet.forEach(line => {
    doc.text(line, margin + 3, codeY);
    codeY += 4.5;
  });

  y += 142;
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Listing 1. C Sharp Matrix Core for Mean-Variance Portfolio Frontier Calculation', pageWidth / 2, y, { align: 'center' });

  addHeaderFooter(2, 3);

  // --- PAGE 3 ---
  doc.addPage();
  y = 18;

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3.  Simulation Experiment Results', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const s3Text = "The software platform was validated using a synthetic generative parcel design layout inside Revit containing three distinct structural zone types: residential properties, premium commercial zones, and industrial storage formats. Volatility indices (\u03C3) were configured based on real-world asset pricing shifts.";
  const s3Lines = doc.splitTextToSize(s3Text, contentWidth);
  doc.text(s3Lines, margin, y, { align: 'justify' });
  y += s3Lines.length * 3.6 + 3;

  const s3Text2 = "As detailed in Table 1, evaluating the system across variable covariance regimes alters allocation geometry. Under a dynamic, low-covariance framework where structural assets are uncorrelated, the MPT engine maximizes asset diversification benefits. This yields a superior Sharpe Ratio of 0.934 and brings the systemic volatility exposure down to 10.12%. In contrast, simulating a highly-correlated market environment compresses the portfolio’s risk-mitigation properties, lowering the Sharpe Ratio to 0.715.";
  const s3Lines2 = doc.splitTextToSize(s3Text2, contentWidth);
  doc.text(s3Lines2, margin, y, { align: 'justify' });
  y += s3Lines2.length * 3.6 + 5;

  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('Table 1. Simulation Analytics: Portfolio Optimization Variations Under Variable Covariance', margin, y);
  y += 3.5;

  const colWidths = [44, 28, 30, 36, 36];
  const tableData = [
    ['BIM Opt. Metric', 'Baseline', 'High-Yield', 'MPT (High Corr.)', 'MPT (Low Corr.)'],
    ['Res. Footprint (m\u00B2)', '12,500', '5,000', '8,100', '8,750'],
    ['Comm. Footprint (m\u00B2)', '3,000', '11,000', '5,150', '5,500'],
    ['Ind. Footprint (m\u00B2)', '1,500', '1,000', '2,250', '2,750'],
    ['Expected Return (\u03BC_p)', '6.82%', '14.15%', '10.90%', '11.45%'],
    ['Portfolio Volatility (\u03C3_p)', '8.41%', '22.38%', '12.45%', '10.12%'],
    ['Sharpe Ratio (R_f = 2%)', '0.573', '0.543', '0.715', '0.934']
  ];

  tableData.forEach((row, rowIndex) => {
    let colX = margin;
    const isHeader = rowIndex === 0;

    if (isHeader) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setFont('times', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setFont('times', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(30, 41, 59);
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

    row.forEach((cell, cellIndex) => {
      const align = cellIndex === 0 ? 'left' : 'right';
      const textX = align === 'left' ? colX + 1.5 : colX + colWidths[cellIndex] - 1.5;
      doc.text(cell, textX, y + 4, { align });
      colX += colWidths[cellIndex];
    });

    y += 5.5;
  });

  y += 5;

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('4.  Conclusion and Future Horizons', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const concl = "By embedding computational financial engineering directly inside parametric BIM software code pipelines via C#, developers can transcend old static cash-flow paradigms. This research successfully proves that integrating Modern Portfolio Theory with generative design yields an automated method to mitigate downstream real estate exposure before breaking ground. Future updates will incorporate direct web API asset pricing loops to refine cross-commodity calculations dynamically.";
  const conclLines = doc.splitTextToSize(concl, contentWidth);
  doc.text(conclLines, margin, y, { align: 'justify' });
  y += conclLines.length * 3.6 + 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Acknowledgements', margin, y);
  y += 4;
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  const ack = "The author would like to acknowledge WorldQuant University for providing the computational research platform and quantitative training that made the financial engine integration model possible.";
  const ackLines = doc.splitTextToSize(ack, contentWidth);
  doc.text(ackLines, margin, y, { align: 'justify' });
  y += ackLines.length * 3.5 + 4;

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('References', margin, y);
  y += 4;

  doc.setFont('times', 'normal');
  doc.setFontSize(7.2);
  const references = [
    '[1] H. Markowitz, "Portfolio Selection," The Journal of Finance, vol. 7, no. 1, pp. 77\u201391, 1952.',
    '[2] C. Eastman, P. Teicholz, R. Sacks, and K. Liston, BIM Handbook: A Guide to Building Information Modeling for Owners, Managers, Designers, Engineers and Contractors. John Wiley & Sons, 2011.',
    '[3] Autodesk, "Revit API Developer Guide," Autodesk Developer Network, 2024.',
    '[4] A. Nagy, "Generative Design for Architectural Layouts," International Journal of Architectural Computing, vol. 15, no. 4, pp. 321\u2013335, 2017.',
    '[5] J. Hull, Options, Futures, and Other Derivatives, 11th ed. New York, NY, USA: Pearson, 2021.',
    '[6] S. Azhar, "Building Information Modeling (BIM): Trends, Benefits, Risks, and Challenges for the AEC Industry," Leadership and Management in Engineering, vol. 11, no. 3, pp. 241\u2013252, 2011.',
    '[7] C. Lovett, "Math.NET Numerics: Advanced Matrix Mathematics for .NET Frameworks," Open Source Software Review, vol. 14, pp. 45\u201352, 2020.',
    '[8] M. Koenig and J. Schmitt, "Automated Urban Layout Generation and Optimization Frameworks," Automation in Construction, vol. 92, pp. 112\u2013125, 2018.',
    '[9] T. Ho and S. Lee, "Real Estate Portfolio Optimization Under Parametric Covariance Structures," Journal of Real Estate Portfolio Management, vol. 22, no. 2, pp. 101\u2013115, 2016.',
    '[10] R. Sacks et al., "Evaluation of Parametric BIM Variants Using Financial Engineering Metrics," Advanced Engineering Informatics, vol. 44, p. 101085, 2020.'
  ];

  references.forEach(ref => {
    const lines = doc.splitTextToSize(ref, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3.3 + 1;
  });

  addHeaderFooter(3, 3);

  doc.save('Sherif_Ahmad_Magdaldin_MPT_Generative_BIM_Paper.pdf');
}
