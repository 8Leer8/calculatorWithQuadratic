import React, { useState } from 'react';

const QuadraticCalculator: React.FC<{ onStandardCalcClick?: () => void }> = ({ onStandardCalcClick }) => {
  const [coefficients, setCoefficients] = useState({ a: '', b: '', c: '' });
  const [result, setResult] = useState<{ x1: number | null; x2: number | null; discriminant: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const solveQuadratic = () => {
    const a = parseFloat(coefficients.a);
    const b = parseFloat(coefficients.b);
    const c = parseFloat(coefficients.c);
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError('Please enter valid numbers for all coefficients');
      return;
    }
    if (a === 0) {
      setError('Coefficient "a" cannot be zero as this would not be a quadratic equation');
      return;
    }
    const discriminant = b * b - 4 * a * c;
    let x1: number | null = null;
    let x2: number | null = null;
    let resultText = '';
    if (discriminant > 0) {
      x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      resultText = `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
    } else if (discriminant === 0) {
      x1 = x2 = -b / (2 * a);
      resultText = `x = ${x1.toFixed(4)}`;
    } else {
      resultText = 'No real solutions';
    }
    setResult({ x1, x2, discriminant });
    setError('');
    setHistory(prev => [
      `${a}x² + ${b}x + ${c} = 0 → ${resultText} (D=${discriminant})`,
      ...prev
    ].slice(0, 10));
    setShowResult(false);
    setShowHistory(false);
    setTimeout(() => setShowResult(true), 100); // trigger result animation
    setTimeout(() => setShowHistory(true), 300); // trigger history animation
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoefficients(prev => ({ ...prev, [name]: value }));
  };

  const getResultText = () => {
    if (!result) return '';
    if (result.discriminant < 0) {
      return 'This equation has no real solutions (complex roots)';
    } else if (result.discriminant === 0) {
      return `This equation has one repeated solution: x = ${result.x1?.toFixed(4)}`;
    } else {
      return `Solutions: x₁ = ${result.x1?.toFixed(4)}, x₂ = ${result.x2?.toFixed(4)}`;
    }
  };

  return (
    <div className={
      `w-full max-w-2xl mx-auto flex gap-6 items-center md:items-stretch relative overflow-hidden ` +
      (history.length > 0 ? 'md:flex-row flex-col' : 'flex-col')
    }>
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 animate-gradient-move bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 opacity-80 blur-2xl transition-transform duration-[4000ms] will-change-transform" />
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-200/20 mx-auto">
        <button
          className="mb-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform"
          onClick={onStandardCalcClick}
        >
          Standard Calc
        </button>
        <h2 className="text-3xl font-bold text-center text-white mb-2">Quadratic Equation Solver</h2>
        <p className="text-center text-gray-300 mb-2">Enter your quadratic equation:</p>
        <form className="flex flex-col gap-4 items-center" onSubmit={e => { e.preventDefault(); solveQuadratic(); }}>
          <div className="flex items-center gap-0 text-2xl text-white font-mono">
            <input
              className="w-10 text-center bg-transparent text-white border-0 focus:outline-none placeholder-gray-400 mx-0 appearance-none shadow-none"
              placeholder="a"
              name="a"
              value={coefficients.a}
              onChange={handleInputChange}
              type="number"
              required
              style={{ boxShadow: 'none' }}
            />
            <span>x² +</span>
            <input
              className="w-10 text-center bg-transparent text-white border-0 focus:outline-none placeholder-gray-400 mx-0 appearance-none shadow-none"
              placeholder="b"
              name="b"
              value={coefficients.b}
              onChange={handleInputChange}
              type="number"
              required
              style={{ boxShadow: 'none' }}
            />
            <span>x +</span>
            <input
              className="w-10 text-center bg-transparent text-white border-0 focus:outline-none placeholder-gray-400 mx-0 appearance-none shadow-none"
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
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform mt-2"
          >
            Solve
          </button>
        </form>
        {error && <div className="text-red-400 text-center mt-2">{error}</div>}
        {result && (
          <div className={`mt-4 text-center transition-all duration-500 ease-out ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} `}>
            <div className="text-lg text-white font-semibold mb-1">Result</div>
            <div className="text-gray-200">{getResultText()}</div>
            <div className="text-xs text-gray-400 mt-1">Discriminant: {result.discriminant}</div>
          </div>
        )}
      </div>
      {/* History Sidebar - responsive, like iPhoneCalc */}
      {history.length > 0 && (
        <div className={`flex flex-col w-full max-w-xs md:w-56 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-gray-200/20 h-full max-h-[32rem] overflow-y-auto mt-4 md:mt-0 transition-all duration-500 ease-out ${showHistory ? 'opacity-100 translate-x-0' : 'opacity-0 md:translate-x-8'}`}>
          <div className="text-lg font-bold text-white mb-4">History</div>
          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li key={idx} className="text-white/90 text-xs bg-black/30 rounded px-2 py-1 text-center">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuadraticCalculator;

/* Add to index.css (or global CSS):
@keyframes gradient-move {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-move {
  background-size: 200% 200%;
  animation: gradient-move 8s ease-in-out infinite;
}
*/
