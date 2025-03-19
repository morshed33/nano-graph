"use client";

import type React from "react";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Investment data
const investments = [
  {
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

export default function InvestmentPortfolio() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeInvestment, setActiveInvestment] = useState<number | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<number | null>(
    null
  );
  const [thickness, setThickness] = useState(0.2); // 0.2 means 20% of radius
  const [outerArcThickness, setOuterArcThickness] = useState(0.5); // 0.5 means 50% of segment angle

  // Memoize chart dimensions calculation
  const getChartDimensions = useCallback(
    (canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) * 0.7;
      const innerRadius = radius * (1 - thickness); // Use thickness state
      const outerArcRadius = radius * 1.1;

      return {
        dpr,
        rect,
        centerX,
        centerY,
        radius,
        innerRadius,
        outerArcRadius,
      };
    },
    [thickness]
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveInvestment(null);
        setSelectedInvestment(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Draw the pie chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = getChartDimensions(canvas);
    const { dpr, rect, centerX, centerY, radius, innerRadius, outerArcRadius } =
      dimensions;

    // Set canvas dimensions with device pixel ratio for sharp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw pie segments
    let startAngle = 0;
    investments.forEach((investment, index) => {
      const segmentAngle = (investment.percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + segmentAngle;
      const isActive = index === activeInvestment;
      const isSelected = index === selectedInvestment;
      const midAngle = startAngle + segmentAngle / 2;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Fill segment with opacity for selected state
      ctx.fillStyle = isSelected ? `${investment.color}CC` : investment.color;
      ctx.fill();

      // Draw outer arc for active or selected state
      if (isActive || isSelected) {
        const outerArcAngleStart = midAngle - segmentAngle * outerArcThickness;
        const outerArcAngleEnd = midAngle + segmentAngle * outerArcThickness;

        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          outerArcRadius,
          outerArcAngleStart,
          outerArcAngleEnd
        );
        ctx.lineWidth = 12;
        ctx.strokeStyle = investment.color;
        ctx.stroke();

        // // Draw connecting lines
        // ctx.beginPath()
        // // First connecting line
        // const startLineX1 = centerX + Math.cos(outerArcAngleStart) * radius
        // const startLineY1 = centerY + Math.sin(outerArcAngleStart) * radius
        // const endLineX1 = centerX + Math.cos(outerArcAngleStart) * outerArcRadius
        // const endLineY1 = centerY + Math.sin(outerArcAngleStart) * outerArcRadius

        // ctx.moveTo(startLineX1, startLineY1)
        // ctx.lineTo(endLineX1, endLineY1)

        // // Second connecting line
        // const startLineX2 = centerX + Math.cos(outerArcAngleEnd) * radius
        // const startLineY2 = centerY + Math.sin(outerArcAngleEnd) * radius
        // const endLineX2 = centerX + Math.cos(outerArcAngleEnd) * outerArcRadius
        // const endLineY2 = centerY + Math.sin(outerArcAngleEnd) * outerArcRadius

        // ctx.moveTo(startLineX2, startLineY2)
        // ctx.lineTo(endLineX2, endLineY2)

        // ctx.lineWidth = 1
        // ctx.strokeStyle = investment.color
        // ctx.stroke()
      }

      startAngle = endAngle;
    });

    // Draw inner circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  }, [
    activeInvestment,
    selectedInvestment,
    getChartDimensions,
    outerArcThickness,
  ]);

  // Handle mouse move to detect hovering over segments
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dimensions = getChartDimensions(canvas);
      const { centerX, centerY, radius, innerRadius } = dimensions;

      // Calculate distance from center
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      // Check if mouse is within the donut
      if (distance > innerRadius && distance < radius) {
        // Calculate angle
        let angle = Math.atan2(y - centerY, x - centerX);
        if (angle < 0) angle += 2 * Math.PI;

        // Find which segment the angle corresponds to
        let startAngle = 0;
        for (let i = 0; i < investments.length; i++) {
          const endAngle =
            startAngle + (investments[i].percentage / 100) * 2 * Math.PI;
          if (angle >= startAngle && angle < endAngle) {
            setActiveInvestment(i);
            return;
          }
          startAngle = endAngle;
        }
      } else {
        setActiveInvestment(null);
      }
    },
    [getChartDimensions]
  );

  // Handle click on segments
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dimensions = getChartDimensions(canvas);
      const { centerX, centerY, radius, innerRadius } = dimensions;

      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      if (distance > innerRadius && distance < radius) {
        let angle = Math.atan2(y - centerY, x - centerX);
        if (angle < 0) angle += 2 * Math.PI;

        let startAngle = 0;
        for (let i = 0; i < investments.length; i++) {
          const endAngle =
            startAngle + (investments[i].percentage / 100) * 2 * Math.PI;
          if (angle >= startAngle && angle < endAngle) {
            if (selectedInvestment === i) {
              // Navigate to investment page
              router.push(investments[i].path);
            } else {
              setSelectedInvestment(i);
            }
            return;
          }
          startAngle = endAngle;
        }
      } else {
        // Deselect if click is not within pie segments
        setSelectedInvestment(null);
      }
    },
    [getChartDimensions, selectedInvestment, router]
  );
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setActiveInvestment(null);
  }, []);

  // Handle legend item click
  const handleLegendClick = useCallback(
    (index: number) => {
      if (selectedInvestment === index) {
        router.push(investments[index].path);
      } else {
        setSelectedInvestment(index);
      }
    },
    [selectedInvestment, router]
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold text-center mb-8">Asset Portfolio</h2>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Pie Chart Container */}
        <div className="relative w-full md:w-1/2 aspect-square">
          <canvas
            ref={canvasRef}
            className="w-full h-full "
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          />

          {/* Center Information */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-[60%] pointer-events-none">
            {selectedInvestment !== null ? (
              <>
                <h3 className="text-xs md:text-sm  font-bold uppercase mb-2">
                  {investments[selectedInvestment].name}
                </h3>
                <div className=" text-sm">
                  <p>Units: {investments[selectedInvestment].units}</p>
                  <p>
                    Investment:{" "}
                    {investments[
                      selectedInvestment
                    ].investment.toLocaleString()}
                  </p>
                  <p>
                    Maturity Date:{" "}
                    {investments[selectedInvestment].maturityDate}
                  </p>
                  <p>
                    Expected Earnings:{" "}
                    {investments[selectedInvestment].expectedEarnings}
                  </p>
                  <p>Risk Score: {investments[selectedInvestment].riskScore}</p>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2">INVESTMENTS</h3>
                <div className="space-y-1 text-sm">
                  <p>Investment Assets: {investments.length}</p>
                  <p>Highest Return: {highestReturn}</p>
                  <p>Lowest Return: {lowestReturn}</p>
                  <p>Investment: {totalInvestment.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend and Controls */}
        <div className="w-full md:w-1/2">
          {/* Thickness Controls */}
          {/* <div className="mb-6 space-y-4 flex ">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pie Thickness: {(thickness * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={thickness}
                onChange={(e) =>
                  setThickness(Number.parseFloat(e.target.value))
                }
                className="w-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outer Arc Width: {(outerArcThickness * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={outerArcThickness}
                onChange={(e) =>
                  setOuterArcThickness(Number.parseFloat(e.target.value))
                }
                className="w-20"
              />
            </div>
          </div> */}

          {/* Legend */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="space-y-4">
              {investments.map((investment, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    selectedInvestment === index
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setActiveInvestment(index)}
                  onMouseLeave={() => setActiveInvestment(null)}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent div's onClick
                    handleLegendClick(index);
                  }}
                >
                  <div className="flex items-center gap-3 cursor-pointer ">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: investment.color }}
                    />
                    <span className="text-lg">{investment.name}</span>
                  </div>
                  <span className="text-lg">{investment.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
