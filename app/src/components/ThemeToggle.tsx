import { useState } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative w-[52px] h-[32px] rounded-full
        transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${theme === "dark" ? "bg-[#34C759]" : "bg-[#E5E5EA]"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a373] focus-visible:ring-offset-2
        active:scale-95
      `}
      aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
    >
      {/* 轨道背景 */}
      <span
        className={`
          absolute inset-0 rounded-full
          transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
          theme === "dark"
            ? "bg-gradient-to-r from-[#1a1a2e] to-[#16213e]"
            : "bg-gradient-to-r from-[#87CEEB] to-[#E0F6FF]"
        }
        `}
      />

      {/* 滑块 */}
      <span
        className={`
          absolute top-[2px] left-[2px]
          w-[28px] h-[28px]
          rounded-full
          bg-white
          shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)]
          transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
          flex items-center justify-center
          ${theme === "dark" ? "translate-x-[20px]" : "translate-x-0"}
          ${isAnimating ? "scale-90" : "scale-100"}
        `}
      >
        {/* 图标容器 */}
        <span className="relative w-full h-full flex items-center justify-center">
          {/* 太阳图标 */}
          <Sun
            className={`
              absolute w-[14px] h-[14px]
              text-[#F59E0B]
              transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${
              theme === "dark"
                ? "opacity-0 rotate-90 scale-50"
                : "opacity-100 rotate-0 scale-100"
            }
            `}
          />
          {/* 月亮图标 */}
          <Moon
            className={`
              absolute w-[14px] h-[14px]
              text-[#6366F1]
              transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${
              theme === "dark"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-50"
            }
            `}
          />
        </span>
      </span>

      {/* 星星装饰 (仅深色模式显示) */}
      <span
        className={`
          absolute top-[6px] left-[8px]
          transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
          theme === "dark"
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2"
        }
        `}
      >
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
          <circle cx="1" cy="1" r="1" fill="white" fillOpacity="0.8" />
          <circle cx="4" cy="3" r="0.8" fill="white" fillOpacity="0.6" />
          <circle cx="2" cy="5" r="0.6" fill="white" fillOpacity="0.4" />
        </svg>
      </span>

      {/* 云朵装饰 (仅浅色模式显示) */}
      <span
        className={`
          absolute top-[8px] right-[8px]
          transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
          theme === "light"
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2"
        }
        `}
      >
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <ellipse
            cx="6"
            cy="5"
            rx="4"
            ry="2.5"
            fill="white"
            fillOpacity="0.6"
          />
          <circle cx="4" cy="4" r="2" fill="white" fillOpacity="0.5" />
          <circle cx="8" cy="4" r="1.5" fill="white" fillOpacity="0.4" />
        </svg>
      </span>
    </button>
  );
}
