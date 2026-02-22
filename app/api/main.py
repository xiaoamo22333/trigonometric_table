"""
数学三角函数计算 API
使用 FastAPI 构建
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import math
from fractions import Fraction
import re

app = FastAPI(title="数学三角函数 API", version="1.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CalculationRequest(BaseModel):
    expression: str


class CalculationResponse(BaseModel):
    fraction: str
    decimal: str


# 常用三角函数值的分数表示
TRIG_FRACTIONS = {
    # sin 值
    "sin(0)": "0",
    "sin(30)": "\\frac{1}{2}",
    "sin(45)": "\\frac{\\sqrt{2}}{2}",
    "sin(60)": "\\frac{\\sqrt{3}}{2}",
    "sin(90)": "1",
    "sin(180)": "0",
    "sin(270)": "-1",
    "sin(360)": "0",
    # cos 值
    "cos(0)": "1",
    "cos(30)": "\\frac{\\sqrt{3}}{2}",
    "cos(45)": "\\frac{\\sqrt{2}}{2}",
    "cos(60)": "\\frac{1}{2}",
    "cos(90)": "0",
    "cos(180)": "-1",
    "cos(270)": "0",
    "cos(360)": "1",
    # tan 值
    "tan(0)": "0",
    "tan(30)": "\\frac{\\sqrt{3}}{3}",
    "tan(45)": "1",
    "tan(60)": "\\sqrt{3}",
    "tan(90)": "\\infty",
    "tan(180)": "0",
    "tan(270)": "\\infty",
    "tan(360)": "0",
    # cot 值
    "cot(0)": "\\infty",
    "cot(30)": "\\sqrt{3}",
    "cot(45)": "1",
    "cot(60)": "\\frac{\\sqrt{3}}{3}",
    "cot(90)": "0",
    # sec 值
    "sec(0)": "1",
    "sec(30)": "\\frac{2\\sqrt{3}}{3}",
    "sec(45)": "\\sqrt{2}",
    "sec(60)": "2",
    "sec(90)": "\\infty",
    # csc 值
    "csc(0)": "\\infty",
    "csc(30)": "2",
    "csc(45)": "\\sqrt{2}",
    "csc(60)": "\\frac{2\\sqrt{3}}{3}",
    "csc(90)": "1",
}


def normalize_expression(expr: str) -> str:
    """规范化表达式"""
    # 移除空格
    expr = expr.replace(" ", "")
    # 转换为小写
    expr = expr.lower()
    return expr


def expression_to_fraction(expr: str) -> str:
    """将表达式转换为分数形式"""
    normalized = normalize_expression(expr)
    
    # 检查常用值
    if normalized in TRIG_FRACTIONS:
        return TRIG_FRACTIONS[normalized]
    
    # 尝试匹配模式
    # 处理 pi 相关表达式
    if "pi" in normalized:
        # 替换 pi 为 π 符号
        expr = expr.replace("pi", "\\pi")
        return f"{expr}"
    
    # 返回原表达式
    return expr


def safe_evaluate(expr: str) -> float:
    """安全地计算表达式"""
    normalized = normalize_expression(expr)
    
    # 替换数学常量和函数
    replacements = {
        "pi": str(math.pi),
        "sin(": "math.sin(",
        "cos(": "math.cos(",
        "tan(": "math.tan(",
        "cot(": "1/math.tan(",
        "sec(": "1/math.cos(",
        "csc(": "1/math.sin(",
        "sqrt(": "math.sqrt(",
        "^": "**",
        "deg": f"*{math.pi}/180",  # 角度转弧度
    }
    
    processed = normalized
    for old, new in replacements.items():
        processed = processed.replace(old, new)
    
    # 安全求值
    allowed_names = {
        "math": math,
        "__builtins__": {},
    }
    
    try:
        result = eval(processed, allowed_names)
        return float(result)
    except Exception as e:
        raise ValueError(f"表达式计算错误: {str(e)}")


def decimal_to_fraction_latex(decimal: float, max_denominator: int = 1000) -> str:
    """将小数转换为 LaTeX 分数形式"""
    # 处理特殊值
    if abs(decimal) < 1e-15:
        return "0"
    if abs(decimal - 1) < 1e-15:
        return "1"
    if abs(decimal + 1) < 1e-15:
        return "-1"
    if abs(decimal - math.sqrt(2)/2) < 1e-15:
        return "\\frac{\\sqrt{2}}{2}"
    if abs(decimal - math.sqrt(3)/2) < 1e-15:
        return "\\frac{\\sqrt{3}}{2}"
    if abs(decimal - math.sqrt(2)) < 1e-15:
        return "\\sqrt{2}"
    if abs(decimal - math.sqrt(3)) < 1e-15:
        return "\\sqrt{3}"
    if abs(decimal - math.sqrt(3)/3) < 1e-15:
        return "\\frac{\\sqrt{3}}{3}"
    if abs(decimal - 2*math.sqrt(3)/3) < 1e-15:
        return "\\frac{2\\sqrt{3}}{3}"
    
    # 使用 Fraction 转换为分数
    try:
        frac = Fraction(decimal).limit_denominator(max_denominator)
        if frac.denominator == 1:
            return str(frac.numerator)
        return f"\\frac{{{frac.numerator}}}{{{frac.denominator}}}"
    except:
        return str(decimal)


@app.post("/api/calculate", response_model=CalculationResponse)
async def calculate(request: CalculationRequest):
    """
    计算三角函数表达式
    
    返回分数形式和小数形式（20位精度）
    """
    try:
        expression = request.expression.strip()
        
        if not expression:
            raise HTTPException(status_code=400, detail="表达式不能为空")
        
        # 计算数值结果
        decimal_result = safe_evaluate(expression)
        
        # 获取分数形式
        fraction_result = expression_to_fraction(expression)
        
        # 如果分数形式就是原表达式，尝试从数值转换
        if fraction_result == expression:
            fraction_result = decimal_to_fraction_latex(decimal_result)
        
        # 格式化小数为20位
        decimal_str = f"{decimal_result:.20f}"
        
        # 移除末尾的0
        decimal_str = decimal_str.rstrip('0').rstrip('.')
        
        return CalculationResponse(
            fraction=fraction_result,
            decimal=decimal_str
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"计算错误: {str(e)}")


@app.get("/api/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "service": "math-trig-api"}


@app.get("/api/trig-table")
async def get_trig_table():
    """获取常用三角函数表"""
    table_data = [
        {"angle": "0°", "rad": "0", "sin": "0", "cos": "1", "tan": "0"},
        {"angle": "30°", "rad": "π/6", "sin": "1/2", "cos": "√3/2", "tan": "√3/3"},
        {"angle": "45°", "rad": "π/4", "sin": "√2/2", "cos": "√2/2", "tan": "1"},
        {"angle": "60°", "rad": "π/3", "sin": "√3/2", "cos": "1/2", "tan": "√3"},
        {"angle": "90°", "rad": "π/2", "sin": "1", "cos": "0", "tan": "∞"},
        {"angle": "180°", "rad": "π", "sin": "0", "cos": "-1", "tan": "0"},
        {"angle": "270°", "rad": "3π/2", "sin": "-1", "cos": "0", "tan": "∞"},
        {"angle": "360°", "rad": "2π", "sin": "0", "cos": "1", "tan": "0"},
    ]
    return {"data": table_data}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
