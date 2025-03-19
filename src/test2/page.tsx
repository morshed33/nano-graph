"use client";

import { InvestmentPortfolio } from "./index";

export default function PieChartDemo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Pie Chart Components Demo</h1>
      <InvestmentPortfolio />
    </div>
  );
}
