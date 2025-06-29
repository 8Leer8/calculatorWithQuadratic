import React, { useState } from "react";
import "../index.css";
import QuadraticCalculator from "./QuadraticCalculator";

// Button layout for iPhone calculator
const buttons = [
  ["AC", "+/-", "%", "/"],
  ["7", "8", "9", "x"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "="]
];

const getButtonClass = (btn: string) => {
  if (["/", "x", "-", "+", "="].includes(btn)) return "op-btn";
  if (["AC", "+/-", "%"].includes(btn)) return "func-btn";
  if (btn === "0") return "zero-btn";
  return "num-btn";
};

const IphoneCalculator: React.FC = () => {
  const [mode, setMode] = useState<'standard' | 'quadratic'>('standard');
  const [display, setDisplay] = useState("0");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [process, setProcess] = useState<string>("");
  const [expression, setExpression] = useState<string>("");
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [history, setHistory] = useState<string[]>([]); // Add history state
  const [showHistory, setShowHistory] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand || justEvaluated) {
      setDisplay(num);
      setWaitingForOperand(false);
      setJustEvaluated(false);
      setProcess((prev) => prev + num);
      setExpression((prev) => prev + num);
    } else {
      setDisplay(display === "0" ? num : display + num);
      setProcess((prev) => (display === "0" ? num : prev + num));
      setExpression((prev) => (display === "0" ? num : prev + num));
    }
  };

  const inputDot = () => {
    if (waitingForOperand || justEvaluated) {
      setDisplay("0.");
      setWaitingForOperand(false);
      setJustEvaluated(false);
      setProcess((prev) => prev + "0.");
      setExpression((prev) => prev + "0.");
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
      setProcess((prev) => prev + ".");
      setExpression((prev) => prev + ".");
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setWaitingForOperand(false);
    setProcess("");
    setExpression("");
    setJustEvaluated(false);
  };

  const toggleSign = () => {
    setDisplay((parseFloat(display) * -1).toString());
    setProcess((prev) => {
      const match = prev.match(/(-?\d*\.?\d*)$/);
      if (match) {
        const neg = (parseFloat(match[0]) * -1).toString();
        return prev.slice(0, -match[0].length) + neg;
      }
      return prev;
    });
    setExpression((prev) => {
      const match = prev.match(/(-?\d*\.?\d*)$/);
      if (match) {
        const neg = (parseFloat(match[0]) * -1).toString();
        return prev.slice(0, -match[0].length) + neg;
      }
      return prev;
    });
  };

  const inputPercent = () => {
    setDisplay((parseFloat(display) / 100).toString());
    setProcess((prev) => {
      const match = prev.match(/(\d*\.?\d*)$/);
      if (match) {
        const percent = (parseFloat(match[0]) / 100).toString();
        return prev.slice(0, -match[0].length) + percent;
      }
      return prev;
    });
    setExpression((prev) => {
      const match = prev.match(/(\d*\.?\d*)$/);
      if (match) {
        const percent = (parseFloat(match[0]) / 100).toString();
        return prev.slice(0, -match[0].length) + percent;
      }
      return prev;
    });
  };

  const performOperation = (nextOperator: string) => {
    if (justEvaluated) {
      setProcess(display + nextOperator);
      setExpression(display + nextOperator);
      setJustEvaluated(false);
    } else {
      setProcess((prev) => prev + nextOperator);
      setExpression((prev) => prev + nextOperator);
    }
    setWaitingForOperand(true);
  };

  const safeEval = (expr: string) => {
    // Replace x with * for multiplication
    const sanitized = expr.replace(/x/g, '*');
    try {
      // eslint-disable-next-line no-eval
      // Use eval instead of Function constructor to avoid 'no-new-func' warning
      // eslint-disable-next-line no-eval
      return eval(sanitized);
    } catch {
      return 'Error';
    }
  };

  const handleButtonClick = (btn: string) => {
    if (/^[0-9]$/.test(btn)) inputNumber(btn);
    else if (btn === ".") inputDot();
    else if (["+", "-", "x", "/"].includes(btn)) performOperation(btn);
    else if (btn === "=") {
      if (expression) {
        const result = safeEval(expression);
        setDisplay(result.toString());
        setProcess(expression + "=" + result);
        setExpression("");
        setWaitingForOperand(false);
        setJustEvaluated(true);
        setHistory(prev => [expression.replace(/([+\-x/=])/g, ' $1 ').replace(/\s+/g, ' ').trim() + ' = ' + result, ...prev].slice(0, 10));
        setShowHistory(false);
        setTimeout(() => setShowHistory(true), 200); // animate history in
      }
    } else if (btn === "AC") clearAll();
    else if (btn === "+/-") toggleSign();
    else if (btn === "%") inputPercent();
  };

  if (mode === 'quadratic') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 transition-all duration-700">
        <button
          className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform z-10"
          onClick={() => setMode('standard')}
        >
          Standard Calc
        </button>
        <QuadraticCalculator />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 transition-all duration-700">
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl items-center md:items-stretch justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-xs border border-gray-200/20 mx-auto">
          <button
            className="mb-4 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-transform"
            onClick={() => setMode('quadratic')}
          >
            Quadratic
          </button>
          <div className="text-xs text-gray-400 mb-1 text-right h-4 select-none">
            {process.replace(/([+\-x/=])/g, ' $1 ').replace(/\s+/g, ' ').trim()}
          </div>
          <div className="text-4xl font-mono font-bold text-right text-white mb-6 h-12 overflow-x-auto transition-all duration-200 bg-black/40 rounded-lg px-3 py-2 shadow-inner">
            {parseFloat(display).toLocaleString("en", { maximumFractionDigits: 8 })}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((row, i) =>
              row.map((btn, j) => (
                <button
                  key={btn + i + j}
                  className={`h-14 rounded-xl text-lg font-semibold shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${getButtonClass(btn)} ${btn === "0" ? "col-span-2" : ""} ${btn === "=" ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" : ""} ${btn === "AC" ? "bg-gradient-to-r from-red-400 to-pink-500 text-white" : ""} ${btn === "+/-" || btn === "%" ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800" : ""} ${["/", "x", "-", "+"].includes(btn) ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white" : "bg-white/80 text-gray-900"}`}
                  onClick={() => handleButtonClick(btn)}
                  style={btn === "0" ? { gridColumn: "span 2" } : {}}
                >
                  {btn}
                </button>
              ))
            )}
          </div>
        </div>
        {/* History Sidebar - now responsive */}
        {history.length > 0 && (
          <div className={`flex flex-col w-full max-w-xs md:w-56 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-gray-200/20 h-full max-h-[32rem] overflow-y-auto mt-4 md:mt-0 transition-all duration-500 ease-out ${showHistory ? 'opacity-100 translate-x-0' : 'opacity-0 md:translate-x-8'}`}>
            <div className="text-lg font-bold text-white mb-4">History</div>
            <ul className="space-y-2">
              {history.map((item, idx) => (
                <li key={idx} className="text-white/90 text-sm bg-black/30 rounded px-2 py-1">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default IphoneCalculator;

