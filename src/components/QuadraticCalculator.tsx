import React, { useState } from 'react';
import { FaCheckCircle, FaInfoCircle, FaHistory, FaTimes } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const QuadraticCalculator: React.FC = () => {
  const [coefficients, setCoefficients] = useState({ a: '', b: '', c: '' });
  const [result, setResult] = useState<{ x1: number | null; x2: number | null; discriminant: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [signB, setSignB] = useState<'+' | '-'>('+');
  const [signC, setSignC] = useState<'+' | '-'>('+');
  const [zoom, setZoom] = useState(4); 
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Live update 
  React.useEffect(() => {
    const a = parseFloat(coefficients.a);
    let b = parseFloat(coefficients.b);
    let c = parseFloat(coefficients.c);
    if (signB === '-') b = -b;
    if (signC === '-') c = -c;
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError('Please enter valid numbers for all coefficients');
      setResult(null);
      setShowResult(false);
      return;
    }
    if (a === 0) {
      setError('Coefficient "a" cannot be zero as this would not be a quadratic equation');
      setResult(null);
      setShowResult(false);
      return;
    }
    const discriminant = b * b - 4 * a * c;
    let x1: number | null = null;
    let x2: number | null = null;
    if (discriminant > 0) {
      x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    } else if (discriminant === 0) {
      x1 = x2 = -b / (2 * a);
    }
    setResult({ x1, x2, discriminant });
    setError('');
    setShowResult(false);
    setTimeout(() => setShowResult(true), 100);
  }, [coefficients, signB, signC]);

  // Pang show sa history
  React.useEffect(() => {
    if (lastSaved) {
      setShowHistory(false);
      setTimeout(() => setShowHistory(true), 300);
    }
  }, [lastSaved]);

  React.useEffect(() => {
    const saved = localStorage.getItem('quadratic_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) setShowHistory(true);
      } catch {}
    }
    setHistoryLoaded(true);
  }, []);

  // Save history sa localstorage
  React.useEffect(() => {
    if (historyLoaded) {
      localStorage.setItem('quadratic_history', JSON.stringify(history));
    }
  }, [history, historyLoaded]);

  function deleteHistoryItem(idx: number) {
    setHistory(prev => prev.filter((_, i) => i !== idx));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoefficients(prev => ({ ...prev, [name]: value }));
  };

  const getResultText = () => {
    if (!result) return '';
    const a = parseFloat(coefficients.a);
    let b = parseFloat(coefficients.b);
    let c = parseFloat(coefficients.c);
    if (signB === '-') b = -b;
    if (signC === '-') c = -c;
    if (isNaN(a) || isNaN(b) || isNaN(c)) return '';
    const D = result.discriminant;
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const sumRoots = (-b / a).toFixed(4);
    const prodRoots = (c / a).toFixed(4);
    let x1 = '';
    let x2 = '';
    let rootPairText = '';
    let x1Label = '';
    let x2Label = '';
    if (D > 0) {
      x1 = `${result.x1?.toFixed(4)}`;
      x2 = `${result.x2?.toFixed(4)}`;
      x1Label = `x₁: ${x1}`;
      x2Label = `x₂: ${x2}`;
      rootPairText = `(${x1}, ${x2})`;
    } else if (D === 0) {
      x1 = `${result.x1?.toFixed(4)}`;
      x2 = `${result.x2?.toFixed(4)}`;
      x1Label = `x₁: ${x1}`;
      x2Label = `x₂: ${x2}`;
      rootPairText = `(${x1}, ${x2})`;
    } else {
      // Complex roots
      const real = (-b / (2 * a)).toFixed(4);
      const imag = (Math.sqrt(-D) / (2 * a)).toFixed(4);
      x1 = `${real} + ${imag}i`;
      x2 = `${real} - ${imag}i`;
      x1Label = `x₁: ${x1}`;
      x2Label = `x₂: ${x2}`;
      rootPairText = `${real} ± ${imag}i`;
    }
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left">
        <div className="font-semibold">Roots:</div>
        <div className="font-semibold">Vertex:</div>
        <div>{x1Label}</div>
        <div>({vertexX.toFixed(4)}, {vertexY.toFixed(4)})</div>
        <div>{x2Label}</div>
        <div>Sum of Roots: {sumRoots}</div>
        <div>Root Pair: {rootPairText}</div>
        <div>Product of Roots: {prodRoots}</div>
      </div>
    );
  };

  // graph visualization
  const getGraphData = () => {
    const a = parseFloat(coefficients.a);
    let b = parseFloat(coefficients.b);
    let c = parseFloat(coefficients.c);
    if (signB === '-') b = -b;
    if (signC === '-') c = -c;
    if (isNaN(a) || isNaN(b) || isNaN(c)) return [];
    const vertexX = -b / (2 * a);
    const range = zoom;
    const step = 0.05;
    const data = [];
    for (let x = vertexX - range; x <= vertexX + range; x += step) {
      const y = a * x * x + b * x + c;
      data.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(4)) });
    }
    return data;
  };

  // dynamic calculate
  const graphData = getGraphData();
  const a = parseFloat(coefficients.a);
  let b = parseFloat(coefficients.b);
  let c = parseFloat(coefficients.c);
  if (signB === '-') b = -b;
  if (signC === '-') c = -c;
  const vertexX = (!isNaN(a) && a !== 0) ? -b / (2 * a) : 0;
  const xDomain = [vertexX - zoom, vertexX + zoom];
  const xTicks = [];
  for (let i = -zoom; i <= zoom; i += 2) {
    xTicks.push(parseFloat((vertexX + i).toFixed(2)));
  }
  const yValues = graphData.map(pt => pt.y);
  let minY = Math.min(...yValues, 0);
  let maxY = Math.max(...yValues, 0);
  if (!isFinite(minY)) minY = -2;
  if (!isFinite(maxY)) maxY = 6;
  const yPadding = (maxY - minY) * 0.1 || 1;
  const yDomain = [Math.floor(minY - yPadding), Math.ceil(maxY + yPadding)];
  const yTicks = [];
  const yStep = Math.max(1, Math.round((yDomain[1] - yDomain[0]) / 4));
  for (let y = yDomain[0]; y <= yDomain[1]; y += yStep) {
    yTicks.push(y);
  }
  const axisBlue = '#6366f1'; 
  const axisRed = '#f43f5e'; 
  const gridColor = '#64748b'; 
  const tickColor = '#cbd5e1'; 

  // parse history
  function parseHistoryItem(item: string) {
    const match = item.match(/([\-\d\.]+)x² ([\+\-]) ([\d\.]+)x ([\+\-]) ([\d\.]+) = 0/);
    if (!match) return;
    const [, a, signBstr, b, signCstr, c] = match;
    setCoefficients({ a, b, c });
    setSignB(signBstr as '+' | '-');
    setSignC(signCstr as '+' | '-');
  }

  //step by step modal and solution
  const getStepByStepSolution = () => {
    if (!result) return null;
    
    const a = parseFloat(coefficients.a);
    let b = parseFloat(coefficients.b);
    let c = parseFloat(coefficients.c);
    if (signB === '-') b = -b;
    if (signC === '-') c = -c;
    
    const discriminant = result.discriminant;
    const steps = [];
    
    // Step 1: Identify coefficients
    steps.push({
      title: "Step 1: Identify the coefficients",
      content: `Given the quadratic equation: ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
      details: [
        `Standard form: ax² + bx + c = 0`,
        `Comparing with our equation: ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
        `Therefore:`,
        `  a = ${a} (coefficient of x²)`,
        `  b = ${b} (coefficient of x)`,
        `  c = ${c} (constant term)`
      ]
    });
    
    // Step 2: Verify a ≠ 0
    steps.push({
      title: "Step 2: Verify the equation is quadratic",
      content: `For an equation to be quadratic, the coefficient 'a' must not be zero.`,
      details: [
        `Check: a = ${a}`,
        `Since ${a} ≠ 0, this is a valid quadratic equation.`,
        `If a = 0, the equation would be linear, not quadratic.`
      ]
    });
    
    // Step 3: Calculate discriminant
    steps.push({
      title: "Step 3: Calculate the discriminant",
      content: `The discriminant (D) determines the nature of the roots.`,
      details: [
        `Formula: D = b² - 4ac`,
        `Substitute our values:`,
        `  D = (${b})² - 4(${a})(${c})`,
        `  D = ${b * b} - 4(${a * c})`,
        `  D = ${b * b} - ${4 * a * c}`,
        `  D = ${discriminant}`,
        ``,
        `The discriminant tells us:`,
        `  • If D > 0: Two distinct real roots`,
        `  • If D = 0: One real root (repeated)`,
        `  • If D < 0: Two complex conjugate roots`
      ]
    });
    
    // Step 4: Determine solution type and solve
    if (discriminant > 0) {
      steps.push({
        title: "Step 4: Analyze the discriminant",
        content: `Since D = ${discriminant} > 0, the equation has two distinct real roots.`,
        details: [
          `D = ${discriminant} > 0`,
          `This means the quadratic equation intersects the x-axis at two different points.`,
          `We will use the quadratic formula to find both roots.`
        ]
      });
      
      // Step 5: Apply quadratic formula
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      const sqrtDisc = Math.sqrt(discriminant);
      const numerator1 = -b + sqrtDisc;
      const numerator2 = -b - sqrtDisc;
      
      steps.push({
        title: "Step 5: Apply the quadratic formula",
        content: `For D > 0, use: x = (-b ± √D) / (2a)`,
        details: [
          `Quadratic formula: x = (-b ± √D) / (2a)`,
          `Substitute our values:`,
          `  x = (-${b} ± √${discriminant}) / (2 × ${a})`,
          `  x = (-${b} ± ${sqrtDisc.toFixed(6)}) / ${2 * a}`,
          ``,
          `Calculate both roots:`,
          `  x₁ = (-${b} + ${sqrtDisc.toFixed(6)}) / ${2 * a}`,
          `  x₁ = ${numerator1.toFixed(6)} / ${2 * a}`,
          `  x₁ = ${x1.toFixed(6)}`,
          ``,
          `  x₂ = (-${b} - ${sqrtDisc.toFixed(6)}) / ${2 * a}`,
          `  x₂ = ${numerator2.toFixed(6)} / ${2 * a}`,
          `  x₂ = ${x2.toFixed(6)}`,
          ``,
          `Final answer: x = ${x1.toFixed(4)} or x = ${x2.toFixed(4)}`
        ]
      });
      
      // Step 6: Verification
      steps.push({
        title: "Step 6: Verify the solutions",
        content: `Let's verify by substituting the roots back into the original equation.`,
        details: [
          `Original equation: ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
          ``,
          `Check x₁ = ${x1.toFixed(4)}:`,
          `  ${a}(${x1.toFixed(4)})² ${b >= 0 ? '+' : ''}${b}(${x1.toFixed(4)}) ${c >= 0 ? '+' : ''}${c}`,
          `  = ${a}(${(x1 * x1).toFixed(6)}) ${b >= 0 ? '+' : ''}${(b * x1).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
          `  = ${(a * x1 * x1).toFixed(6)} ${b >= 0 ? '+' : ''}${(b * x1).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
          `  = ${(a * x1 * x1 + b * x1 + c).toFixed(6)} ≈ 0 ✓`,
          ``,
          `Check x₂ = ${x2.toFixed(4)}:`,
          `  ${a}(${x2.toFixed(4)})² ${b >= 0 ? '+' : ''}${b}(${x2.toFixed(4)}) ${c >= 0 ? '+' : ''}${c}`,
          `  = ${a}(${(x2 * x2).toFixed(6)}) ${b >= 0 ? '+' : ''}${(b * x2).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
          `  = ${(a * x2 * x2).toFixed(6)} ${b >= 0 ? '+' : ''}${(b * x2).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
          `  = ${(a * x2 * x2 + b * x2 + c).toFixed(6)} ≈ 0 ✓`
        ]
      });
      
    } else if (discriminant === 0) {
      steps.push({
        title: "Step 4: Analyze the discriminant",
        content: `Since D = ${discriminant} = 0, the equation has one real root (repeated).`,
        details: [
          `D = ${discriminant} = 0`,
          `This means the quadratic equation touches the x-axis at exactly one point.`,
          `The parabola is tangent to the x-axis at the vertex.`,
          `We can use either the quadratic formula or the vertex formula.`
        ]
      });
      
      // Step 5: Apply quadratic formula
      const x = -b / (2 * a);
      
      steps.push({
        title: "Step 5: Apply the quadratic formula",
        content: `For D = 0, both roots are equal: x = -b / (2a)`,
        details: [
          `When D = 0, the quadratic formula simplifies to:`,
          `  x = -b / (2a)`,
          ``,
          `Substitute our values:`,
          `  x = -${b} / (2 × ${a})`,
          `  x = -${b} / ${2 * a}`,
          `  x = ${x.toFixed(6)}`,
          ``,
          `Alternative method using vertex formula:`,
          `  The x-coordinate of the vertex is: x = -b / (2a)`,
          `  Since D = 0, the vertex lies on the x-axis,`,
          `  making this the only root.`,
          ``,
          `Final answer: x = ${x.toFixed(4)} (repeated root)`
        ]
      });
      
      // Step 6: Verification
      steps.push({
        title: "Step 6: Verify the solution",
        content: `Let's verify by substituting the root back into the original equation.`,
        details: [
          `Original equation: ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
          ``,
          `Check x = ${x.toFixed(4)}:`,
          `  ${a}(${x.toFixed(4)})² ${b >= 0 ? '+' : ''}${b}(${x.toFixed(4)}) ${c >= 0 ? '+' : ''}${c}`,
          `  = ${a}(${(x * x).toFixed(6)}) ${b >= 0 ? '+' : ''}${(b * x).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
          `  = ${(a * x * x).toFixed(6)} ${b >= 0 ? '+' : ''}${(b * x).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
          `  = ${(a * x * x + b * x + c).toFixed(6)} = 0 ✓`
        ]
      });
      
    } else {
      steps.push({
        title: "Step 4: Analyze the discriminant",
        content: `Since D = ${discriminant} < 0, the equation has no real roots (complex roots).`,
        details: [
          `D = ${discriminant} < 0`,
          `This means the quadratic equation never intersects the x-axis.`,
          `The parabola is entirely above or below the x-axis.`,
          `The roots are complex conjugate numbers.`
        ]
      });
      
      // Step 5: Complex roots
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      
      steps.push({
        title: "Step 5: Find complex roots",
        content: `For D < 0, use: x = (-b ± i√|D|) / (2a)`,
        details: [
          `When D < 0, the quadratic formula gives complex roots:`,
          `  x = (-b ± i√|D|) / (2a)`,
          ``,
          `Substitute our values:`,
          `  x = (-${b} ± i√|${discriminant}|) / (2 × ${a})`,
          `  x = (-${b} ± i√${-discriminant}) / ${2 * a}`,
          `  x = (-${b} ± i${Math.sqrt(-discriminant).toFixed(6)}) / ${2 * a}`,
          ``,
          `Calculate both complex roots:`,
          `  x₁ = (-${b} + i${Math.sqrt(-discriminant).toFixed(6)}) / ${2 * a}`,
          `  x₁ = ${realPart.toFixed(6)} + ${imagPart.toFixed(6)}i`,
          ``,
          `  x₂ = (-${b} - i${Math.sqrt(-discriminant).toFixed(6)}) / ${2 * a}`,
          `  x₂ = ${realPart.toFixed(6)} - ${imagPart.toFixed(6)}i`,
          ``,
          `Note: These are complex conjugate roots.`,
          `Final answer: x = ${realPart.toFixed(4)} ± ${imagPart.toFixed(4)}i`
        ]
      });
      
      // Step 6: Explanation of complex roots
      steps.push({
        title: "Step 6: Understanding complex roots",
        content: `Complex roots occur when the parabola doesn't intersect the x-axis.`,
        details: [
          `Why complex roots?`,
          `  • The quadratic equation ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
          `  • Has no real solutions because the parabola never crosses the x-axis`,
          `  • In the complex plane, there are still two solutions`,
          `  • They come in conjugate pairs: a ± bi`,
          ``,
          `Geometric interpretation:`,
          `  • The parabola opens ${a > 0 ? 'upward' : 'downward'}`,
          `  • Its vertex is at (${realPart.toFixed(4)}, ${(a * realPart * realPart + b * realPart + c).toFixed(4)})`,
          `  • The entire parabola is ${a > 0 ? 'above' : 'below'} the x-axis`,
          `  • Therefore, no real x-intercepts exist.`
        ]
      });
    }
    
    // Additional step: Properties of the quadratic
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const sumRoots = -b / a;
    const prodRoots = c / a;
    
    // Calculate verification values based on discriminant type
    let sumVerification = '';
    let prodVerification = '';
    
    if (discriminant >= 0) {
      const x1 = result.x1 || 0;
      const x2 = result.x2 || 0;
      sumVerification = `• Verification: ${x1.toFixed(4)} + ${x2.toFixed(4)} = ${(x1 + x2).toFixed(4)}`;
      prodVerification = `• Verification: ${x1.toFixed(4)} × ${x2.toFixed(4)} = ${(x1 * x2).toFixed(4)}`;
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      sumVerification = `• For complex roots: sum = 2 × real part = ${(2 * realPart).toFixed(4)}`;
      prodVerification = `• For complex roots: product = |root|² = ${(realPart * realPart + imagPart * imagPart).toFixed(4)}`;
    }
    
    steps.push({
      title: "Step 7: Calculate the vertex",
      content: `The vertex is the turning point of the parabola.`,
      details: [
        `Vertex formula: x = -b/(2a)`,
        `Substitute our values:`,
        `  x = -${b}/(2 × ${a})`,
        `  x = -${b}/${2 * a}`,
        `  x = ${vertexX.toFixed(6)}`,
        ``,
        `To find the y-coordinate, substitute x = ${vertexX.toFixed(6)} into the equation:`,
        `  y = ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}`,
        `  y = ${a}(${vertexX.toFixed(6)})² ${b >= 0 ? '+' : ''}${b}(${vertexX.toFixed(6)}) ${c >= 0 ? '+' : ''}${c}`,
        `  y = ${a}(${(vertexX * vertexX).toFixed(6)}) ${b >= 0 ? '+' : ''}${(b * vertexX).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
        `  y = ${(a * vertexX * vertexX).toFixed(6)} ${b >= 0 ? '+' : ''}${(b * vertexX).toFixed(6)} ${c >= 0 ? '+' : ''}${c}`,
        `  y = ${vertexY.toFixed(6)}`,
        ``,
        `Therefore, the vertex is at (${vertexX.toFixed(4)}, ${vertexY.toFixed(4)})`
      ]
    });
    
    steps.push({
      title: "Step 8: Calculate sum and product of roots",
      content: `Using Vieta's formulas to verify our solution:`,
      details: [
        `Vieta's formulas:`,
        `  • Sum of roots: x₁ + x₂ = -b/a`,
        `  • Product of roots: x₁ × x₂ = c/a`,
        ``,
        `Calculate sum of roots:`,
        `  x₁ + x₂ = -b/a = -${b}/${a} = ${sumRoots.toFixed(6)}`,
        sumVerification,
        ``,
        `Calculate product of roots:`,
        `  x₁ × x₂ = c/a = ${c}/${a} = ${prodRoots.toFixed(6)}`,
        prodVerification
      ]
    });
    
    // Add step for root pair calculation
    let rootPairStep = '';
    if (discriminant > 0) {
      const x1 = result.x1 || 0;
      const x2 = result.x2 || 0;
      rootPairStep = `Root pair: (${x1.toFixed(4)}, ${x2.toFixed(4)})`;
    } else if (discriminant === 0) {
      const x = result.x1 || 0;
      rootPairStep = `Root pair: (${x.toFixed(4)}, ${x.toFixed(4)}) - repeated root`;
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      rootPairStep = `Root pair: ${realPart.toFixed(4)} ± ${imagPart.toFixed(4)}i`;
    }
    
    steps.push({
      title: "Step 9: Summary of all results",
      content: `Complete solution summary:`,
      details: [
        `Original equation: ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`,
        `Discriminant: D = ${discriminant.toFixed(6)}`,
        ``,
        `Roots:`,
        discriminant > 0 ? [
          `  x₁ = ${(result.x1 || 0).toFixed(4)}`,
          `  x₂ = ${(result.x2 || 0).toFixed(4)}`
        ] : discriminant === 0 ? [
          `  x = ${(result.x1 || 0).toFixed(4)} (repeated root)`
        ] : [
          `  x₁ = ${(-b / (2 * a)).toFixed(4)} + ${(Math.sqrt(-discriminant) / (2 * a)).toFixed(4)}i`,
          `  x₂ = ${(-b / (2 * a)).toFixed(4)} - ${(Math.sqrt(-discriminant) / (2 * a)).toFixed(4)}i`
        ],
        ``,
        `Vertex: (${vertexX.toFixed(4)}, ${vertexY.toFixed(4)})`,
        `Sum of roots: ${sumRoots.toFixed(4)}`,
        `Product of roots: ${prodRoots.toFixed(4)}`,
        `Root pair: ${rootPairStep}`
      ].flat()
    });
    
    return steps;
  };

  return (
    <div className={
      `w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex flex-col md:flex-row gap-6 items-center md:items-stretch px-2 sm:px-4 md:px-8 pt-8 sm:pt-16 md:pt-24` +
      (history.length > 0 ? '' : '')
    }>
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 border border-gray-200/20 mx-auto overflow-y-auto max-h-[80vh] min-h-[340px] flex flex-col justify-center"
        style={{ maxHeight: '80vh' }}>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2 flex items-center justify-center gap-2">
          <span>Quadratic Equation Solver</span>
        </h2>
        <p className="text-center text-gray-300 mb-2 text-sm sm:text-base">Enter your quadratic equation:</p>
        <form className="flex flex-col gap-4 items-center" onSubmit={e => { e.preventDefault();
          // Save to history
          if (!result) return;
          const a = parseFloat(coefficients.a);
          let b = parseFloat(coefficients.b);
          let c = parseFloat(coefficients.c);
          if (signB === '-') b = -b;
          if (signC === '-') c = -c;
          const discriminant = result.discriminant;
          let resultText = '';
          if (discriminant > 0) {
            resultText = `x₁ = ${result.x1?.toFixed(4)}, x₂ = ${result.x2?.toFixed(4)}`;
          } else if (discriminant === 0) {
            resultText = `x = ${result.x1?.toFixed(4)}`;
          } else {
            resultText = 'No real solutions';
          }
          const saveString = `${a}x² ${signB} ${Math.abs(parseFloat(coefficients.b))}x ${signC} ${Math.abs(parseFloat(coefficients.c))} = 0 → ${resultText} (D=${discriminant})`;
          setHistory(prev => [saveString, ...prev].slice(0, 10));
          setLastSaved(saveString);
        }}>
          <div className="flex items-center gap-0 text-lg sm:text-2xl text-white font-mono flex-wrap justify-center">
            <input
              className="w-8 text-center bg-transparent text-white border-0 focus:outline-none placeholder-gray-400 appearance-none shadow-none"
              placeholder="a"
              name="a"
              value={coefficients.a}
              onChange={handleInputChange}
              type="number"
              required
              style={{ boxShadow: 'none' }}
            />
            <span>x²</span>
            <button
              type="button"
              className="mx-0.5 px-1 py-0.5 rounded text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setSignB(signB === '+' ? '-' : '+')}
              tabIndex={0}
              aria-label="Toggle sign for b"
            >
              {signB}
            </button>
            <input
              className="w-8 text-center bg-transparent text-white border-0 focus:outline-none placeholder-gray-400 appearance-none shadow-none"
              placeholder="b"
              name="b"
              value={coefficients.b}
              onChange={handleInputChange}
              type="number"
              required
              style={{ boxShadow: 'none' }}
            />
            <span>x</span>
            <button
              type="button"
              className="mx-0.5 px-1 py-0.5 rounded text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setSignC(signC === '+' ? '-' : '+')}
              tabIndex={0}
              aria-label="Toggle sign for c"
            >
              {signC}
            </button>
            <input
              className="w-8 text-center bg-transparent text-white border-0 focus:outline-none placeholder-gray-400 appearance-none shadow-none"
              placeholder="c"
              name="c"
              value={coefficients.c}
              onChange={handleInputChange}
              type="number"
              required
              style={{ boxShadow: 'none' }}
            />
            <span>= 0</span>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform mt-2 flex items-center justify-center gap-2"
          >
            <FaCheckCircle className="inline-block text-lg" />
            Save
          </button>
        </form>
        {error && <div className="text-red-400 text-center mt-2">{error}</div>}
        {result && (
          <div className={`mt-4 text-center transition-all duration-500 ease-out ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} `}>
            <div className="text-lg text-white font-semibold mb-1 flex items-center justify-center gap-2">
              <FaInfoCircle className="inline-block text-blue-200" />
              Result
            </div>
            <div className="text-gray-200">{getResultText()}</div>
            <div className="text-xs text-gray-400 mt-1">Discriminant: {result.discriminant}</div>
            {/* Quadratic Graph */}
            {/* Zoom Slider */}
            <div className="flex items-center justify-center gap-2 mt-2 mb-2">
              <label htmlFor="zoom" className="text-xs text-gray-300">Zoom:</label>
              <input
                id="zoom"
                type="range"
                min={2}
                max={10}
                step={0.5}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-32 accent-blue-500"
              />
              <span className="text-xs text-gray-300">{zoom}x</span>
            </div>
            <div className="w-full h-64 bg-white/5 rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={graphData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  {/* X axis */}
                  <ReferenceLine y={0} stroke={axisBlue} strokeWidth={2} />
                  {/* Y axis */}
                  <ReferenceLine x={0} stroke={axisRed} strokeWidth={2} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={xDomain}
                    ticks={xTicks}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisBlue, fontSize: 16 }}
                    interval={0}
                  />
                  <YAxis
                    domain={yDomain}
                    ticks={yTicks}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisRed, fontSize: 16 }}
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value, name) => [value, name === 'y' ? 'y' : name]}
                  />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke={axisBlue}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease"
                    key={`line-${coefficients.a}-${signB}${coefficients.b}-${signC}${coefficients.c}-${zoom}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Step by Step Solution Button */}
            <button
              onClick={() => setShowSolutionModal(true)}
              className="w-full mt-4 py-2 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <FaInfoCircle className="inline-block text-lg" />
              Show Step by Step Solution
            </button>
          </div>
        )}
      </div>
      {/* History Sidebar */}
      {history.length > 0 && (
        <div className={`flex flex-col w-full max-w-xs sm:max-w-sm md:w-80 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-200/20 h-full max-h-[32rem] overflow-y-auto mt-4 md:mt-0 transition-all duration-500 ease-out ${showHistory ? 'opacity-100 translate-x-0' : 'opacity-0 md:translate-x-8'}`}
          style={{ maxHeight: '60vh' }}>
          <div className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaHistory className="inline-block text-blue-200" />
            History
          </div>
          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li
                key={idx}
                className="group text-white/90 text-xs bg-black/30 rounded px-2 py-1 text-center relative cursor-pointer hover:bg-blue-900/40 transition"
                onClick={e => {
                  if ((e.target as HTMLElement).closest('.delete-btn')) return;
                  parseHistoryItem(item);
                }}
                title="Restore this equation"
              >
                {idx === 0 && (
                  <div className="w-full flex justify-start mb-1">
                    <span className="inline-block px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full font-semibold shadow">Latest</span>
                  </div>
                )}
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1 text-left">{item}</span>
                  <button
                    className="delete-btn ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-base px-1"
                    onClick={e => { e.stopPropagation(); deleteHistoryItem(idx); }}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Step by Step Solution Modal */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-lg rounded-t-2xl p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Step by Step Solution</h3>
                <button
                  onClick={() => setShowSolutionModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {getStepByStepSolution()?.map((step, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h4 className="text-base sm:text-lg font-semibold text-blue-600 mb-2">{step.title}</h4>
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-3">
                    <p className="text-gray-800 font-medium">{step.content}</p>
                  </div>
                  {step.details.length > 0 && (
                    <div className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <p className="text-gray-700 font-mono text-xs sm:text-sm">{detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuadraticCalculator;
