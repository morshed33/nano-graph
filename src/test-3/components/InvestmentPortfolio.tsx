"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import PieChartContainer from "./PieChartContainer";
import { AnimationOptions, ChartSegment } from "../types";

// Investment data
const investments: (ChartSegment & {
  units: number;
  investment: number;
  maturityDate: string;
  expectedEarnings: string;
  riskScore: string;
  path: string;
})[] = [
  {
    id: "real-estate",
    name: "Real Estate",
    percentage: 30,
    color: "#F5A623",
    units: 3,
    investment: 135000,
    maturityDate: "15 Dec 25",
    expectedEarnings: "145000-150000",
    riskScore: "Medium",
    path: "/investments/real-estate",
  },
  {
    id: "ppf-bag",
    name: "PPF Bag Manufacturing",
    percentage: 20,
    color: "#F8D57E",
    units: 2,
    investment: 90000,
    maturityDate: "10 Jan 26",
    expectedEarnings: "100000-110000",
    riskScore: "Medium",
    path: "/investments/ppf-bag",
  },
  {
    id: "daily-farm",
    name: "Daily Farm",
    percentage: 30,
    color: "#F7B955",
    units: 1,
    investment: 135000,
    maturityDate: "05 Mar 25",
    expectedEarnings: "150000-160000",
    riskScore: "Low",
    path: "/investments/daily-farm",
  },
  {
    id: "antopolis",
    name: "Founding For Antopolis",
    percentage: 10,
    color: "#8B5A00",
    units: 5,
    investment: 45000,
    maturityDate: "30 Jun 25",
    expectedEarnings: "50000-55000",
    riskScore: "High",
    path: "/investments/antopolis",
  },
  {
    id: "livestock",
    name: "Live Stock Farming",
    percentage: 10,
    color: "#A67C00",
    units: 10,
    investment: 45000,
    maturityDate: "25 Feb 25",
    expectedEarnings: "50500-52000",
    riskScore: "Low",
    path: "/investments/livestock",
  },
];

// Calculate total investment
const totalInvestment = investments.reduce(
  (sum, inv) => sum + inv.investment,
  0
);

// Find highest and lowest return investments
const highestReturn = "Daily Farm";
const lowestReturn = "Real Estate";

// Default animation settings
const defaultAnimation: AnimationOptions = {
  type: "fade",
  duration: 800,
  easing: "ease-out",
};

const activeAnimation: AnimationOptions = {
  type: "pulse",
  duration: 1200,
  easing: "ease-in-out",
};

const selectedAnimation: AnimationOptions = {
  type: "bounce",
  duration: 1500,
  easing: "ease-in-out",
};

export default function InvestmentPortfolio() {
  const router = useRouter();

  // Custom renderer for the details in the center of the chart
  const renderInvestmentDetails = useCallback((segment: ChartSegment) => {
    const investment = segment as (typeof investments)[0];
    return (
      <>
        <h3 className="text-xs md:text-sm font-bold uppercase mb-2">
          {investment.name}
        </h3>
        <div className="text-sm">
          <p>Units: {investment.units}</p>
          <p>Investment: {investment.investment.toLocaleString()}</p>
          <p>Maturity Date: {investment.maturityDate}</p>
          <p>Expected Earnings: {investment.expectedEarnings}</p>
          <p>Risk Score: {investment.riskScore}</p>
        </div>
      </>
    );
  }, []);

  // Handle segment selection and navigation
  const handleSegmentSelect = useCallback(
    (segment: ChartSegment | null) => {
      // Navigate to the segment's path when a segment is selected twice
      if (segment) {
        const investment = segment as (typeof investments)[0];
        router.push(investment.path);
      }
    },
    [router]
  );

  // Default content for the center when no segment is selected
  const defaultDetailsContent = (
    <div className="space-y-1 text-sm">
      <p>Investment Assets: {investments.length}</p>
      <p>Highest Return: {highestReturn}</p>
      <p>Lowest Return: {lowestReturn}</p>
      <p>Investment: {totalInvestment.toLocaleString()}</p>
    </div>
  );

  return (
    <PieChartContainer
      segments={investments}
      title="Asset Portfolio"
      defaultDetailsTitle="INVESTMENTS"
      defaultDetailsContent={defaultDetailsContent}
      renderSegmentDetails={renderInvestmentDetails}
      onSegmentSelect={handleSegmentSelect}
      className="max-w-6xl p-6"
      showControls={true}
      animate={true}
      animation={defaultAnimation}
      activeAnimation={activeAnimation}
      selectedAnimation={selectedAnimation}
      enableNavigationOnDoubleClick={true}
      animationButtonControl={true}
    />
  );
}
