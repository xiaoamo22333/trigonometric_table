/**
 * Deno 服务器
 * 提供静态文件服务和 API 代理
 */

import { join } from "@std/path";

const PORT = 8000;
const STATIC_DIR = "./dist";
const PYTHON_API_PORT = 8001;

// MIME 类型映射
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

// 获取文件的 MIME 类型
function getMimeType(path: string): string {
  const ext = path.substring(path.lastIndexOf("."));
  return MIME_TYPES[ext] || "application/octet-stream";
}

// 提供静态文件
async function serveStaticFile(path: string): Promise<Response> {
  try {
    const filePath = join(STATIC_DIR, path);
    const file = await Deno.open(filePath, { read: true });
    const stat = await file.stat();

    if (stat.isDirectory) {
      file.close();
      return new Response("Not Found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", getMimeType(path));
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(file.readable, { headers });
  } catch (error) {
    return new Response("Not Found", { status: 404 });
  }
}

// 处理 API 请求
async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // 简单的三角函数计算 API（内嵌实现，不依赖 Python）
  if (url.pathname === "/api/calculate" && request.method === "POST") {
    try {
      const body = await request.json();
      const expression = body.expression || "";

      // 计算结果
      const result = calculateTrig(expression);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "计算失败",
          message: (error as Error).message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
  }

  // 健康检查
  if (url.pathname === "/api/health") {
    return new Response(
      JSON.stringify({ status: "healthy", service: "math-trig-api" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  // 三角函数表
  if (url.pathname === "/api/trig-table") {
    const tableData = [
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

    return new Response(JSON.stringify({ data: tableData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response("API endpoint not found", { status: 404 });
}

// 三角函数计算
function calculateTrig(
  expression: string,
): { fraction: string; decimal: string } {
  // 规范化表达式
  let expr = expression.toLowerCase().replace(/\s/g, "");

  // 常用值映射
  const commonValues: Record<string, { fraction: string; decimal: string }> = {
    "sin(0)": { fraction: "0", decimal: "0" },
    "sin(30)": { fraction: "\\frac{1}{2}", decimal: "0.50000000000000000000" },
    "sin(45)": {
      fraction: "\\frac{\\sqrt{2}}{2}",
      decimal: "0.70710678118654752440",
    },
    "sin(60)": {
      fraction: "\\frac{\\sqrt{3}}{2}",
      decimal: "0.86602540378443864676",
    },
    "sin(90)": { fraction: "1", decimal: "1.00000000000000000000" },
    "sin(180)": { fraction: "0", decimal: "0" },
    "sin(270)": { fraction: "-1", decimal: "-1.00000000000000000000" },
    "sin(360)": { fraction: "0", decimal: "0" },
    "cos(0)": { fraction: "1", decimal: "1.00000000000000000000" },
    "cos(30)": {
      fraction: "\\frac{\\sqrt{3}}{2}",
      decimal: "0.86602540378443864676",
    },
    "cos(45)": {
      fraction: "\\frac{\\sqrt{2}}{2}",
      decimal: "0.70710678118654752440",
    },
    "cos(60)": { fraction: "\\frac{1}{2}", decimal: "0.50000000000000000000" },
    "cos(90)": { fraction: "0", decimal: "0" },
    "cos(180)": { fraction: "-1", decimal: "-1.00000000000000000000" },
    "cos(270)": { fraction: "0", decimal: "0" },
    "cos(360)": { fraction: "1", decimal: "1.00000000000000000000" },
    "tan(0)": { fraction: "0", decimal: "0" },
    "tan(30)": {
      fraction: "\\frac{\\sqrt{3}}{3}",
      decimal: "0.57735026918962576451",
    },
    "tan(45)": { fraction: "1", decimal: "1.00000000000000000000" },
    "tan(60)": { fraction: "\\sqrt{3}", decimal: "1.73205080756887729353" },
    "tan(90)": { fraction: "\\infty", decimal: "Infinity" },
    "tan(180)": { fraction: "0", decimal: "0" },
    "tan(270)": { fraction: "\\infty", decimal: "Infinity" },
    "tan(360)": { fraction: "0", decimal: "0" },
    "cot(0)": { fraction: "\\infty", decimal: "Infinity" },
    "cot(30)": { fraction: "\\sqrt{3}", decimal: "1.73205080756887729353" },
    "cot(45)": { fraction: "1", decimal: "1.00000000000000000000" },
    "cot(60)": {
      fraction: "\\frac{\\sqrt{3}}{3}",
      decimal: "0.57735026918962576451",
    },
    "cot(90)": { fraction: "0", decimal: "0" },
    "sec(0)": { fraction: "1", decimal: "1.00000000000000000000" },
    "sec(30)": {
      fraction: "\\frac{2\\sqrt{3}}{3}",
      decimal: "1.15470053837925152902",
    },
    "sec(45)": { fraction: "\\sqrt{2}", decimal: "1.41421356237309504880" },
    "sec(60)": { fraction: "2", decimal: "2.00000000000000000000" },
    "sec(90)": { fraction: "\\infty", decimal: "Infinity" },
    "csc(0)": { fraction: "\\infty", decimal: "Infinity" },
    "csc(30)": { fraction: "2", decimal: "2.00000000000000000000" },
    "csc(45)": { fraction: "\\sqrt{2}", decimal: "1.41421356237309504880" },
    "csc(60)": {
      fraction: "\\frac{2\\sqrt{3}}{3}",
      decimal: "1.15470053837925152902",
    },
    "csc(90)": { fraction: "1", decimal: "1.00000000000000000000" },
  };

  // 检查常用值
  if (commonValues[expr]) {
    return commonValues[expr];
  }

  // 处理弧度输入
  if (expr.includes("pi")) {
    // 替换 pi 为 Math.PI
    let processed = expr.replace(/pi/g, `(${Math.PI})`);
    processed = processed.replace(/sin\(/g, "Math.sin(");
    processed = processed.replace(/cos\(/g, "Math.cos(");
    processed = processed.replace(/tan\(/g, "Math.tan(");
    processed = processed.replace(/cot\(/g, "1/Math.tan(");
    processed = processed.replace(/sec\(/g, "1/Math.cos(");
    processed = processed.replace(/csc\(/g, "1/Math.sin(");
    processed = processed.replace(/sqrt\(/g, "Math.sqrt(");
    processed = processed.replace(/\^/g, "**");

    try {
      const result = eval(processed);
      return {
        fraction: expr.replace(/pi/g, "\\pi"),
        decimal: result.toFixed(20),
      };
    } catch (e) {
      throw new Error("表达式计算失败");
    }
  }

  // 处理角度输入
  let processed = expr;
  processed = processed.replace(/sin\(/g, "Math.sin(Math.PI/180*");
  processed = processed.replace(/cos\(/g, "Math.cos(Math.PI/180*");
  processed = processed.replace(/tan\(/g, "Math.tan(Math.PI/180*");
  processed = processed.replace(/cot\(/g, "1/Math.tan(Math.PI/180*");
  processed = processed.replace(/sec\(/g, "1/Math.cos(Math.PI/180*");
  processed = processed.replace(/csc\(/g, "1/Math.sin(Math.PI/180*");
  processed = processed.replace(/sqrt\(/g, "Math.sqrt(");
  processed = processed.replace(/\^/g, "**");

  // 添加闭合括号
  const openCount = (processed.match(/\(/g) || []).length;
  const closeCount = (processed.match(/\)/g) || []).length;
  for (let i = 0; i < openCount - closeCount; i++) {
    processed += ")";
  }

  try {
    const result = eval(processed);
    return {
      fraction: expression,
      decimal: result.toFixed(20),
    };
  } catch (e) {
    throw new Error("表达式计算失败");
  }
}

// 主处理函数
async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // API 请求
  if (pathname.startsWith("/api/")) {
    return await handleApiRequest(request);
  }

  // 静态文件请求
  if (pathname === "/") {
    return await serveStaticFile("/index.html");
  }

  return await serveStaticFile(pathname);
}

// 启动服务器
console.log(`🚀 服务器启动在 http://localhost:${PORT}`);
console.log(`📁 静态文件目录: ${STATIC_DIR}`);
console.log(`🔢 数学三角函数表 API 可用`);

Deno.serve({ port: PORT }, handler);
