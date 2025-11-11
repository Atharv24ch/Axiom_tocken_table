"use client";

import { Suspense, useState } from "react";
import TokenTable from "@/components/organisms/TokenTableNew";
import { SkeletonRow } from "@/components/molecules/SkeletonRow";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"trending" | "surge" | "early">("trending");
  const [timeFilter, setTimeFilter] = useState("5m");

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      {/* Top Navigation - Exact Axiom Copy */}
      <nav className="border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Logo and Nav */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">▲</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/" className="text-[#5b7cff] font-medium">Discover</a>
              <a href="#" className="text-gray-400 hover:text-white">Pulse</a>
              <a href="#" className="text-gray-400 hover:text-white">Trackers</a>
              <a href="#" className="text-gray-400 hover:text-white">Perpetuals</a>
              <a href="#" className="text-gray-400 hover:text-white">Yield</a>
              <a href="#" className="text-gray-400 hover:text-white">Vision</a>
              <a href="#" className="text-gray-400 hover:text-white">Portfolio</a>
              <a href="#" className="text-gray-400 hover:text-white">Rewards</a>
            </div>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-sm">
              <span className="text-orange-400">⚡</span>
              <span>SOL</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button className="px-4 py-1.5 bg-[#5b7cff] hover:bg-[#4a6bef] rounded-lg font-medium text-sm">
              Deposit
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-sm">⭐</button>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-sm">🔔</button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg text-sm">
              <span>💰</span>
              <span>0</span>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-sm">👤</button>
          </div>
        </div>
      </nav>

      {/* Sub Navigation - Tabs and Filters */}
      <div className="border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("trending")}
              className={`font-medium text-sm ${activeTab === "trending" ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab("surge")}
              className={`font-medium text-sm ${activeTab === "surge" ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              Surge
            </button>
            <button
              onClick={() => setActiveTab("early")}
              className={`font-medium text-sm ${activeTab === "early" ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              Early
            </button>
            <button className="text-gray-400 hover:text-white text-sm">DEX Screener</button>
            <button className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
              Pump Live
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Right Side Controls */}
          {activeTab === "trending" && (
            <div className="flex items-center gap-3">
              {/* Time Filters */}
              <div className="flex items-center gap-1.5">
                {["1m", "5m", "30m", "1h"].map((time) => (
                  <button
                    key={time}
                    onClick={() => setTimeFilter(time)}
                    className={`px-3 py-1 rounded-lg text-xs ${timeFilter === time
                        ? "bg-[#5b7cff] text-white"
                        : "text-gray-400 hover:text-white"
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs flex items-center gap-1.5">
                ⚙️ Filter
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg text-sm">📌</button>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg text-sm">👁️</button>
              <button className="px-2 py-1 bg-gray-800 rounded-lg text-xs">📁 1 ≡ 0 ▼</button>
              <span className="text-xs text-gray-400">Quick Buy 0.0</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-[#5b7cff]">P1</button>
                <button className="px-2 py-1 hover:bg-gray-800 rounded text-xs">P2</button>
                <button className="px-2 py-1 hover:bg-gray-800 rounded text-xs">P3</button>
              </div>
            </div>
          )}

          {activeTab === "surge" && (
            <div className="flex items-center gap-3">
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">➖</button>
              <button className="px-4 py-1 bg-[#5b7cff] hover:bg-[#4a6bef] rounded-lg font-medium text-sm">50K</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">➕</button>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg text-sm">ℹ️</button>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg text-sm">👁️</button>
              <button className="px-2 py-1 bg-gray-800 rounded-lg text-xs">📁 1 ≡ 0 ▼</button>
              <span className="text-xs text-gray-400">Quick Buy 0.0</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-[#5b7cff]">P1</button>
                <button className="px-2 py-1 hover:bg-gray-800 rounded text-xs">P2</button>
                <button className="px-2 py-1 hover:bg-gray-800 rounded text-xs">P3</button>
              </div>
            </div>
          )}

          {activeTab === "early" && (
            <div className="flex items-center gap-3">
              {/* Time Filters for Early */}
              <div className="flex items-center gap-1.5">
                {["1m", "5m", "30m", "1h"].map((time) => (
                  <button
                    key={time}
                    onClick={() => setTimeFilter(time)}
                    className={`px-3 py-1 rounded-lg text-xs ${timeFilter === time
                        ? "bg-[#5b7cff] text-white"
                        : "text-gray-400 hover:text-white"
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs flex items-center gap-1.5">
                ⚙️ Filter
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg text-sm">📌</button>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg text-sm">👁️</button>
              <button className="px-2 py-1 bg-gray-800 rounded-lg text-xs">📁 1 ≡ 0 ▼</button>
              <span className="text-xs text-gray-400">Quick Buy 0.0</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-[#5b7cff]">P1</button>
                <button className="px-2 py-1 hover:bg-gray-800 rounded text-xs">P2</button>
                <button className="px-2 py-1 hover:bg-gray-800 rounded text-xs">P3</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <Suspense fallback={
          <div className="w-full space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        }>
          <TokenTable mode={activeTab} />
        </Suspense>
      </main>
    </div>
  );
}
