"use client";

import * as React from "react";
import { Suspense } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import { NewPairsTable } from "@/components/organisms/NewPairsTable";
import { SkeletonRow } from "@/components/molecules/SkeletonRow";

export default function NewPairsPage() {
    return (
        <AppProviders>
            <main className="min-h-screen bg-[#0d0e12] text-white">
                {/* Header */}
                <header className="border-b border-[#1c1d21] bg-[#0f1012]">
                    <div className="mx-auto px-6 py-3">
                        <div className="flex items-center justify-between">
                            {/* Left: Logo + Navigation */}
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        A
                                    </div>
                                    <span className="text-lg font-bold text-white">Axiom Solana</span>
                                </div>
                                <nav className="hidden lg:flex items-center gap-6 text-sm">
                                    <a href="/" className="text-gray-400 hover:text-white transition-colors">Trending</a>
                                    <a href="/new-pairs" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">New Pairs</a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Pulse</a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Trackers</a>
                                </nav>
                            </div>

                            {/* Right: Network + Actions */}
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1a1b1f] border border-[#2a2b2f] rounded-lg hover:bg-[#1f2024] transition-colors">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm">⚡</span>
                                        <span className="text-sm font-medium">Solana</span>
                                    </div>
                                </button>
                                <button className="px-4 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                                    Connect Wallet
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="border-b border-[#1c1d21] bg-[#0f1012]">
                    <div className="mx-auto px-6 py-4">
                        <div className="grid grid-cols-5 gap-4">
                            <div className="bg-[#14151a] rounded-lg p-4">
                                <div className="text-gray-400 text-xs mb-1">24h Volume</div>
                                <div className="text-xl font-bold">$12.4M</div>
                                <div className="text-emerald-500 text-xs mt-1">+23.4%</div>
                            </div>
                            <div className="bg-[#14151a] rounded-lg p-4">
                                <div className="text-gray-400 text-xs mb-1">New Pairs</div>
                                <div className="text-xl font-bold">156</div>
                                <div className="text-gray-400 text-xs mt-1">Last 24h</div>
                            </div>
                            <div className="bg-[#14151a] rounded-lg p-4">
                                <div className="text-gray-400 text-xs mb-1">Avg. Market Cap</div>
                                <div className="text-xl font-bold">$428K</div>
                                <div className="text-gray-400 text-xs mt-1">Per token</div>
                            </div>
                            <div className="bg-[#14151a] rounded-lg p-4">
                                <div className="text-gray-400 text-xs mb-1">Success Rate</div>
                                <div className="text-xl font-bold">18%</div>
                                <div className="text-amber-500 text-xs mt-1">Graduated</div>
                            </div>
                            <div className="bg-[#14151a] rounded-lg p-4">
                                <div className="text-gray-400 text-xs mb-1">Holder Growth</div>
                                <div className="text-xl font-bold">+342%</div>
                                <div className="text-emerald-500 text-xs mt-1">Avg. 24h</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Token Table */}
                <div className="container mx-auto px-4 py-6">
                    <div className="bg-[#14151a] rounded-xl overflow-hidden border border-gray-800">
                        <Suspense fallback={
                            <div className="w-full space-y-2 p-4">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <SkeletonRow key={i} />
                                ))}
                            </div>
                        }>
                            <NewPairsTable />
                        </Suspense>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 text-center text-gray-500 text-xs">
                        <p>Real-time new pairs powered by Bitquery • Updates every 45 seconds</p>
                    </div>
                </div>
            </main>
        </AppProviders>
    );
}
