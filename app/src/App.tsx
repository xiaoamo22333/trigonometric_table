import { useEffect, useRef, useState } from "react";
import { Calculator, FunctionSquare, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import "katex/dist/katex.min.css";
import katex from "katex";
import "./App.css";

// 数学符号按钮
const MATH_BUTTONS = [
  { label: "π", value: "pi" },
  { label: "°", value: "deg" },
  { label: "sin", value: "sin(" },
  { label: "cos", value: "cos(" },
  { label: "tan", value: "tan(" },
  { label: "cot", value: "cot(" },
  { label: "sec", value: "sec(" },
  { label: "csc", value: "csc(" },
  { label: "+", value: "+" },
  { label: "-", value: "-" },
  { label: "×", value: "*" },
  { label: "÷", value: "/" },
  { label: "(", value: "(" },
  { label: ")", value: ")" },
  { label: "^", value: "^" },
  { label: "√", value: "sqrt(" },
];

// 常用三角函数值表
const TRIG_TABLE = [
  {
    angle: "0°",
    rad: "0",
    sin: "0",
    cos: "1",
    tan: "0",
    cot: "∞",
    sec: "1",
    csc: "∞",
  },
  {
    angle: "30°",
    rad: "π/6",
    sin: "1/2",
    cos: "√3/2",
    tan: "√3/3",
    cot: "√3",
    sec: "2√3/3",
    csc: "2",
  },
  {
    angle: "45°",
    rad: "π/4",
    sin: "√2/2",
    cos: "√2/2",
    tan: "1",
    cot: "1",
    sec: "√2",
    csc: "√2",
  },
  {
    angle: "60°",
    rad: "π/3",
    sin: "√3/2",
    cos: "1/2",
    tan: "√3",
    cot: "√3/3",
    sec: "2",
    csc: "2√3/3",
  },
  {
    angle: "90°",
    rad: "π/2",
    sin: "1",
    cos: "0",
    tan: "∞",
    cot: "0",
    sec: "∞",
    csc: "1",
  },
  {
    angle: "180°",
    rad: "π",
    sin: "0",
    cos: "-1",
    tan: "0",
    cot: "∞",
    sec: "-1",
    csc: "∞",
  },
  {
    angle: "270°",
    rad: "3π/2",
    sin: "-1",
    cos: "0",
    tan: "∞",
    cot: "0",
    sec: "∞",
    csc: "-1",
  },
  {
    angle: "360°",
    rad: "2π",
    sin: "0",
    cos: "1",
    tan: "0",
    cot: "∞",
    sec: "1",
    csc: "∞",
  },
];

interface CalculationResult {
  fraction: string;
  decimal: string;
}

function App() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fractionRef = useRef<HTMLDivElement>(null);
  const decimalRef = useRef<HTMLDivElement>(null);

  // 渲染数学公式
  const renderMath = (latex: string, element: HTMLElement | null) => {
    if (!element) return;
    try {
      katex.render(latex, element, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (e) {
      element.textContent = latex;
    }
  };

  // 计算三角函数值
  const calculateTrig = async (expression: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression }),
      });

      if (!response.ok) {
        throw new Error("计算失败");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      try {
        const evaluated = evaluateExpression(expression);
        setResult({
          fraction: expressionToFraction(expression),
          decimal: evaluated.toFixed(20),
        });
      } catch (e) {
        setError("表达式无效，请检查输入");
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // 前端表达式求值（备用）
  const evaluateExpression = (expr: string): number => {
    let processed = expr
      .replace(/pi/gi, "Math.PI")
      .replace(/deg/g, "*Math.PI/180")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/cot\(/g, "1/Math.tan(")
      .replace(/sec\(/g, "1/Math.cos(")
      .replace(/csc\(/g, "1/Math.sin(")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/\^/g, "**");

    return Function(`"use strict"; return (${processed})`)();
  };

  // 表达式转分数（简化版）
  const expressionToFraction = (expr: string): string => {
    const commonValues: Record<string, string> = {
      "sin(0)": "0",
      "sin(30)": "\\frac{1}{2}",
      "sin(45)": "\\frac{\\sqrt{2}}{2}",
      "sin(60)": "\\frac{\\sqrt{3}}{2}",
      "sin(90)": "1",
      "cos(0)": "1",
      "cos(30)": "\\frac{\\sqrt{3}}{2}",
      "cos(45)": "\\frac{\\sqrt{2}}{2}",
      "cos(60)": "\\frac{1}{2}",
      "cos(90)": "0",
      "tan(0)": "0",
      "tan(30)": "\\frac{\\sqrt{3}}{3}",
      "tan(45)": "1",
      "tan(60)": "\\sqrt{3}",
      "tan(90)": "\\infty",
    };

    const normalized = expr.replace(/\s/g, "").toLowerCase();
    return commonValues[normalized] || expr;
  };

  // 处理数学按钮点击
  const handleMathButtonClick = (value: string) => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;
    const newValue = input.slice(0, start) + value + input.slice(end);

    setInput(newValue);

    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start + value.length, start + value.length);
    }, 0);
  };

  // 处理输入提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      calculateTrig(input);
    }
  };

  // 处理表格行点击
  const handleTableRowClick = (row: typeof TRIG_TABLE[0]) => {
    setInput(`sin(${row.angle})`);
    calculateTrig(`sin(${row.angle.replace("°", "")})`);
  };

  // 渲染分数结果
  useEffect(() => {
    if (result?.fraction) {
      renderMath(result.fraction, fractionRef.current);
    }
  }, [result?.fraction]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isDark ? "bg-[#1a1a1a] text-[#f5f5f5]" : "bg-[#f8f9fa] text-[#1a1a1a]"
      }`}
    >
      {/* 头部导航 */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 backdrop-blur-md z-50 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isDark
            ? "bg-[#1a1a1a]/90 border-b border-[#3a3a3a]"
            : "bg-white/90 border-b border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* 左侧：主题切换按钮 + 网站标题 */}
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <div className="flex items-center gap-3">
              <FunctionSquare
                className={`w-7 h-7 transition-colors duration-500 ${
                  isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                }`}
              />
              <h1
                className={`text-xl font-medium transition-colors duration-500 ${
                  isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                }`}
              >
                数学三角函数表
              </h1>
            </div>
          </div>

          {/* 右侧：导航链接 */}
          <nav className="flex items-center gap-6">
            <a
              href="#calculator"
              className={`transition-colors duration-200 ${
                isDark
                  ? "text-[#b0b0b0] hover:text-[#f5f5f5]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              计算器
            </a>
            <a
              href="#table"
              className={`transition-colors duration-200 ${
                isDark
                  ? "text-[#b0b0b0] hover:text-[#f5f5f5]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              函数表
            </a>
          </nav>
        </div>
      </header>

      {/* 英雄区 */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h1
            className={`text-5xl font-medium mb-6 transition-colors duration-500 ${
              isDark ? "text-[#f5f5f5]" : "text-gray-900"
            }`}
          >
            数学三角函数表
          </h1>
          <p
            className={`text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-500 ${
              isDark ? "text-[#b0b0b0]" : "text-gray-600"
            }`}
          >
            精确计算三角函数值，支持分数和小数点后20位精度
          </p>
        </div>
      </section>

      {/* 计算器区 */}
      <section id="calculator" className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Card
            className={`shadow-xl transition-colors duration-500 ${
              isDark
                ? "bg-[#2a2a2a] border-[#3a3a3a]"
                : "bg-white border-gray-200"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-3 transition-colors duration-500 ${
                  isDark ? "text-[#f5f5f5]" : "text-gray-900"
                }`}
              >
                <Calculator
                  className={`w-6 h-6 transition-colors duration-500 ${
                    isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                  }`}
                />
                三角函数计算器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 输入框 */}
              <form onSubmit={handleSubmit}>
                <label
                  className={`block text-sm mb-2 transition-colors duration-500 ${
                    isDark ? "text-[#808080]" : "text-gray-500"
                  }`}
                >
                  输入角度或表达式
                </label>
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="例如: sin(30) 或 pi/4"
                    className={`flex-1 text-lg h-14 transition-colors duration-500 ${
                      isDark
                        ? "bg-[#1a1a1a] border-[#4a4a4a] text-[#f5f5f5] focus:border-[#d4a373] focus:ring-[#d4a373]"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#b8860b] focus:ring-[#b8860b]"
                    }`}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`h-14 px-8 font-medium transition-all duration-300 ${
                      isDark
                        ? "bg-[#d4a373] hover:bg-[#e8c4a0] text-[#1a1a1a]"
                        : "bg-[#b8860b] hover:bg-[#d4a373] text-white"
                    }`}
                  >
                    {loading ? "计算中..." : "计算"}
                  </Button>
                </div>
              </form>

              {/* 数学符号按钮 */}
              <div>
                <label
                  className={`block text-sm mb-3 transition-colors duration-500 ${
                    isDark ? "text-[#808080]" : "text-gray-500"
                  }`}
                >
                  数学符号
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {MATH_BUTTONS.map((btn, index) => (
                    <button
                      key={index}
                      onClick={() => handleMathButtonClick(btn.value)}
                      className={`h-10 rounded-lg text-sm font-medium transition-all duration-100 active:scale-95 ${
                        isDark
                          ? "bg-[#4a4a4a] hover:bg-[#5a5a5a] text-[#f5f5f5]"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              {/* 结果展示区 */}
              {result && (
                <div className="space-y-4 animate-fade-in-up">
                  {/* 分数值 */}
                  <Card
                    className={`transition-colors duration-500 ${
                      isDark
                        ? "bg-[#1a1a1a] border-[#4a4a4a]"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle
                        className={`text-sm font-normal transition-colors duration-500 ${
                          isDark ? "text-[#808080]" : "text-gray-500"
                        }`}
                      >
                        分数值
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        ref={fractionRef}
                        className={`text-2xl katex-display transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        {result.fraction}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 小数值 */}
                  <Card
                    className={`transition-colors duration-500 ${
                      isDark
                        ? "bg-[#1a1a1a] border-[#4a4a4a]"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle
                        className={`text-sm font-normal transition-colors duration-500 ${
                          isDark ? "text-[#808080]" : "text-gray-500"
                        }`}
                      >
                        小数值 (20位精度)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        ref={decimalRef}
                        className={`text-xl font-mono break-all transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        {result.decimal}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 三角函数表 */}
      <section id="table" className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Card
            className={`shadow-xl transition-colors duration-500 ${
              isDark
                ? "bg-[#2a2a2a] border-[#3a3a3a]"
                : "bg-white border-gray-200"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-3 transition-colors duration-500 ${
                  isDark ? "text-[#f5f5f5]" : "text-gray-900"
                }`}
              >
                <Table
                  className={`w-6 h-6 transition-colors duration-500 ${
                    isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                  }`}
                />
                常用三角函数值表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`transition-colors duration-500 ${
                        isDark ? "bg-[#3a3a3a]" : "bg-gray-100"
                      }`}
                    >
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        角度
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        弧度
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        sin
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        cos
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        tan
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        cot
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        sec
                      </th>
                      <th
                        className={`px-4 py-3 text-left font-medium transition-colors duration-500 ${
                          isDark ? "text-[#d4a373]" : "text-[#b8860b]"
                        }`}
                      >
                        csc
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRIG_TABLE.map((row, index) => (
                      <tr
                        key={index}
                        onClick={() => handleTableRowClick(row)}
                        className={`cursor-pointer transition-colors duration-200 ${
                          isDark
                            ? "border-b border-[#3a3a3a] hover:bg-[#353535]"
                            : "border-b border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#f5f5f5]" : "text-gray-900"
                          }`}
                        >
                          {row.angle}
                        </td>
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#b0b0b0]" : "text-gray-500"
                          }`}
                        >
                          {row.rad}
                        </td>
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#e8c4a0]" : "text-amber-600"
                          }`}
                        >
                          {row.sin}
                        </td>
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#e8c4a0]" : "text-amber-600"
                          }`}
                        >
                          {row.cos}
                        </td>
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#e8c4a0]" : "text-amber-600"
                          }`}
                        >
                          {row.tan}
                        </td>
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#e8c4a0]" : "text-amber-600"
                          }`}
                        >
                          {row.cot}
                        </td>
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#e8c4a0]" : "text-amber-600"
                          }`}
                        >
                          {row.sec}
                        </td>
                        <td
                          className={`px-4 py-3 transition-colors duration-500 ${
                            isDark ? "text-[#e8c4a0]" : "text-amber-600"
                          }`}
                        >
                          {row.csc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                className={`mt-4 text-sm transition-colors duration-500 ${
                  isDark ? "text-[#808080]" : "text-gray-500"
                }`}
              >
                点击表格行可快速填充到计算器
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 页脚 */}
      <footer
        className={`py-8 px-6 border-t transition-colors duration-500 ${
          isDark ? "border-[#3a3a3a]" : "border-gray-200"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p
            className={`text-sm transition-colors duration-500 ${
              isDark ? "text-[#808080]" : "text-gray-500"
            }`}
          >
            数学三角函数表 | 使用 React + Python + Deno 构建
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
