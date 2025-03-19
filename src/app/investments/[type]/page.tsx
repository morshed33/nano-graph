"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Define types for investment data
type PerformanceData = {
  month: string;
  year: number;
  value: number;
  date: string;
};

type Investment = {
  name: string;
  color: string;
  maturityDate: string;
  roi: string;
  basePerformance: { month: string; value: number }[];
  performance: PerformanceData[];
};

// Generate multi-year investment data
const generatePerformanceData = (
  baseData: { month: string; value: number }[],
  years: number = 2
): PerformanceData[] => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const result: PerformanceData[] = [];

  for (let year = 2025; year < 2025 + years; year++) {
    for (let i = 0; i < 12; i++) {
      const monthIndex = i % baseData.length;
      const variation = Math.random() * 10 - 5; // Random value between -5 and 5
      result.push({
        month: months[i],
        year,
        value: Math.max(5, baseData[monthIndex].value + variation),
        date: `${months[i]}/${year}`, // Consistent date format
      });
    }
  }

  return result;
};

// Investment data with multi-year performance history
const investmentData: Record<string, Investment> = {
  "real-estate": {
    name: "Real Estate",
    color: "#F5A623",
    maturityDate: "15/12/2026",
    roi: "145000-150000",
    basePerformance: [
      { month: "Jan", value: 17 },
      { month: "Feb", value: 15 },
      { month: "Mar", value: 8 },
      { month: "Apr", value: 11 },
      { month: "May", value: 20 },
      { month: "Jun", value: 15 },
    ],
    performance: [], // Initialized empty, populated below
  },
  "ppf-bag": {
    name: "PPF Bag Manufacturing",
    color: "#F8D57E",
    maturityDate: "10/01/2027",
    roi: "100000-110000",
    basePerformance: [
      { month: "Jan", value: 12 },
      { month: "Feb", value: 18 },
      { month: "Mar", value: 20 },
      { month: "Apr", value: 31 },
      { month: "May", value: 15 },
      { month: "Jun", value: 17 },
    ],
    performance: [],
  },
  "daily-farm": {
    name: "Daily Farm",
    color: "#F7B955",
    maturityDate: "05/03/2026",
    roi: "150000-160000",
    basePerformance: [
      { month: "Jan", value: 14 },
      { month: "Feb", value: 10 },
      { month: "Mar", value: 25 },
      { month: "Apr", value: 30 },
      { month: "May", value: 12 },
      { month: "Jun", value: 18 },
    ],
    performance: [],
  },
  antopolis: {
    name: "Founding For Antopolis",
    color: "#8B5A00",
    maturityDate: "30/06/2026",
    roi: "50000-55000",
    basePerformance: [
      { month: "Jan", value: 10 },
      { month: "Feb", value: 15 },
      { month: "Mar", value: 8 },
      { month: "Apr", value: 15 },
      { month: "May", value: 20 },
      { month: "Jun", value: 30 },
    ],
    performance: [],
  },
  livestock: {
    name: "Live Stock Farming",
    color: "#A67C00",
    maturityDate: "25/02/2026",
    roi: "50000-51000",
    basePerformance: [
      { month: "Jan", value: 15 },
      { month: "Feb", value: 19 },
      { month: "Mar", value: 8 },
      { month: "Apr", value: 15 },
      { month: "May", value: 20 },
      { month: "Jun", value: 13 },
    ],
    performance: [],
  },
};

// Populate performance data
Object.keys(investmentData).forEach((key) => {
  const investment = investmentData[key as keyof typeof investmentData];
  investment.performance = generatePerformanceData(
    investment.basePerformance,
    3
  );
});

export default function InvestmentDetail({
  params: promiseParams,
}: {
  params: Promise<{ type: string }>;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null); // Changed to global index
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [viewRange, setViewRange] = useState({ start: 0, end: 11 }); // First 12 months
  const [yAxisScale, setYAxisScale] = useState({ min: 0, max: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentMonth] = useState(() => 1); // February (0-indexed)

  const params = use(promiseParams);
  const investmentType = params.type;
  const investment =
    investmentData[investmentType as keyof typeof investmentData];
  const [investmentFound, setInvestmentFound] = useState(!!investment);

  // Update investmentFound when investment changes
  useEffect(() => {
    setInvestmentFound(!!investment);
  }, [investment]);

  // Set initial highlighted index to current month
  useEffect(() => {
    if (investmentFound) {
      setHighlightedIndex(currentMonth);
    }
  }, [investmentFound, currentMonth]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => drawChart();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    investment,
    activePoint,
    highlightedIndex,
    viewRange,
    yAxisScale,
    investmentFound,
  ]);

  // Draw the line chart
  const drawChart = () => {
    if (!investmentFound || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const padding = { left: 60, right: 20, top: 40, bottom: 60 };
    const chartWidth = rect.width - (padding.left + padding.right);
    const chartHeight = rect.height - (padding.top + padding.bottom);

    const visibleData = investment.performance.slice(
      viewRange.start,
      viewRange.end + 1
    );
    const values = visibleData.map((item) => item.value);
    const minValue = yAxisScale.min;
    const maxValue = yAxisScale.max;

    // Draw grid lines
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight - (i / gridLines) * chartHeight);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);

      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(
        Math.round(
          (i / gridLines) * (maxValue - minValue) + minValue
        ).toString(),
        padding.left - 10,
        y + 4
      );
    }
    ctx.stroke();

    // Draw x-axis labels
    visibleData.forEach((item, index) => {
      const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${item.month}`, x, rect.height - padding.bottom + 20);
      if (
        index === 0 ||
        (index > 0 && item.year !== visibleData[index - 1].year)
      ) {
        ctx.fillText(`${item.year}`, x, rect.height - padding.bottom + 40);
      }
    });

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = investment.color;
    ctx.lineWidth = 2;
    visibleData.forEach((item, index) => {
      const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    visibleData.forEach((item, index) => {
      const x = padding.left + (index / (visibleData.length - 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
      const isActive = index === activePoint;
      const isHighlighted =
        highlightedIndex !== null &&
        viewRange.start + index === highlightedIndex;

      ctx.beginPath();
      ctx.arc(x, y, isActive || isHighlighted ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = isActive || isHighlighted ? investment.color : "#fff";
      ctx.strokeStyle = investment.color;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      if (isHighlighted) {
        ctx.beginPath();
        ctx.strokeStyle = "#9E9E9E";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        const gradient = ctx.createLinearGradient(
          x,
          y,
          x,
          padding.top + chartHeight
        );
        gradient.addColorStop(0, investment.color);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.moveTo(x, y);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = investment.color;
        ctx.lineWidth = 2;
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    drawChart();
  }, [
    investment,
    activePoint,
    highlightedIndex,
    viewRange,
    yAxisScale,
    investmentFound,
  ]);

  // Event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!investmentFound || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      if (Math.abs(deltaX) > 5) {
        const visibleCount = viewRange.end - viewRange.start + 1;
        const totalCount = investment.performance.length;
        const moveAmount = Math.round(deltaX / 20) * -1;

        if (moveAmount !== 0) {
          let newStart = Math.max(0, viewRange.start + moveAmount);
          let newEnd = newStart + visibleCount - 1;
          if (newEnd >= totalCount) {
            newEnd = totalCount - 1;
            newStart = Math.max(0, newEnd - visibleCount + 1);
          }
          setViewRange({ start: newStart, end: newEnd });
          setDragStart({ x, y });
        }
      }

      if (Math.abs(deltaY) > 5) {
        const scaleFactor = 1 + deltaY / 100;
        const newMax = Math.max(20, yAxisScale.max * scaleFactor);
        setYAxisScale({ min: yAxisScale.min, max: newMax });
        setDragStart({ x, y });
      }
      return;
    }

    const padding = { left: 60, right: 20, top: 40, bottom: 60 };
    const chartWidth = rect.width - (padding.left + padding.right);
    const chartHeight = rect.height - (padding.top + padding.bottom);
    const visibleData = investment.performance.slice(
      viewRange.start,
      viewRange.end + 1
    );
    const minValue = yAxisScale.min;
    const maxValue = yAxisScale.max;

    let closestPoint: number | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    visibleData.forEach((item, index) => {
      const pointX =
        padding.left + (index / (visibleData.length - 1)) * chartWidth;
      const pointY =
        padding.top +
        chartHeight -
        ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
      const distance = Math.sqrt(
        Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2)
      );

      if (distance < 20 && distance < minDistance) {
        closestPoint = index;
        minDistance = distance;
        setTooltipPosition({ x: pointX, y: pointY });
      }
    });

    setActivePoint(closestPoint);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => {
    setActivePoint(null);
    setIsDragging(false);
  };

  const handleClick = () => {
    if (activePoint !== null) {
      setHighlightedIndex(viewRange.start + activePoint); // Use global index
    }
  };

  const handleZoomIn = () => {
    const visibleCount = viewRange.end - viewRange.start + 1;
    if (visibleCount <= 6) return;

    const newVisibleCount = Math.max(6, Math.floor(visibleCount * 0.7));
    const midpoint = Math.floor((viewRange.start + viewRange.end) / 2);
    const halfNewCount = Math.floor(newVisibleCount / 2);
    let newStart = Math.max(0, midpoint - halfNewCount);
    let newEnd = newStart + newVisibleCount - 1;

    if (newEnd >= investment.performance.length) {
      newEnd = investment.performance.length - 1;
      newStart = Math.max(0, newEnd - newVisibleCount + 1);
    }
    setViewRange({ start: newStart, end: newEnd });
  };

  const handleZoomOut = () => {
    const visibleCount = viewRange.end - viewRange.start + 1;
    if (visibleCount >= investment.performance.length) return;

    const newVisibleCount = Math.min(
      investment.performance.length,
      Math.ceil(visibleCount * 1.5)
    );
    const midpoint = Math.floor((viewRange.start + viewRange.end) / 2);
    const halfNewCount = Math.floor(newVisibleCount / 2);
    let newStart = Math.max(0, midpoint - halfNewCount);
    let newEnd = newStart + newVisibleCount - 1;

    if (newEnd >= investment.performance.length) {
      newEnd = investment.performance.length - 1;
      newStart = Math.max(0, newEnd - newVisibleCount + 1);
    }
    setViewRange({ start: newStart, end: newEnd });
  };

  const handleScrollLeft = () => {
    const visibleCount = viewRange.end - viewRange.start + 1;
    const newStart = Math.max(0, viewRange.start - Math.ceil(visibleCount / 2));
    const newEnd = newStart + visibleCount - 1;
    setViewRange({ start: newStart, end: newEnd });
  };

  const handleScrollRight = () => {
    const visibleCount = viewRange.end - viewRange.start + 1;
    const newEnd = Math.min(
      investment.performance.length - 1,
      viewRange.end + Math.ceil(visibleCount / 2)
    );
    const newStart = Math.max(0, newEnd - visibleCount + 1);
    setViewRange({ start: newStart, end: newEnd });
  };

  const resetYScale = () => setYAxisScale({ min: 0, max: 40 });

  if (!investmentFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Investment Not Found</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Return to Portfolio
          </button>
        </div>
      </div>
    );
  }

  const visibleData = investment.performance.slice(
    viewRange.start,
    viewRange.end + 1
  );
  const activeData = activePoint !== null ? visibleData[activePoint] : null;

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-900">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
          <h1 className="text-2xl font-bold ml-4">
            {investment.name} Performance
          </h1>
        </div>

        <div className="relative h-[500px] w-full" ref={containerRef}>
          <div className="absolute top-0 right-0 flex gap-2 z-10 h-fit">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleScrollLeft}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              title="Scroll Left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleScrollRight}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              title="Scroll Right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={resetYScale}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-xs"
              title="Reset Y-Axis Scale"
            >
              Reset Y
            </button>
          </div>

          <div className="absolute top-0 left-0 text-xs text-gray-500 z-10 h-fit">
            <p>Drag to pan • Click to highlight</p>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-fit cursor-move overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          />

          {activeData && (
            <div
              className="absolute bg-white border border-gray-200 rounded-lg shadow-md p-3 pointer-events-none z-20"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y - 70,
                transform: "translateX(-50%)",
              }}
            >
              <div className="text-sm font-medium">Date: {activeData.date}</div>
              <div className="text-sm">ROI: Tk{investment.roi}</div>
              <div className="text-sm">
                Value: {activeData.value.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:hidden">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Investment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Maturity Date:</span>
                <span>{investment.maturityDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected ROI:</span>
                <span>Tk{investment.roi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performance Trend:</span>
                <span
                  className={
                    visibleData[visibleData.length - 1].value >
                    visibleData[0].value
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {visibleData[visibleData.length - 1].value >
                  visibleData[0].value
                    ? "Positive"
                    : "Negative"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Viewing Period:</span>
                <span>
                  {visibleData[0].date} -{" "}
                  {visibleData[visibleData.length - 1].date}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Performance Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Highest Value:</span>
                <span>
                  {Math.max(...visibleData.map((d) => d.value)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lowest Value:</span>
                <span>
                  {Math.min(...visibleData.map((d) => d.value)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Value:</span>
                <span>
                  {(
                    visibleData.reduce((sum, d) => sum + d.value, 0) /
                    visibleData.length
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volatility:</span>
                <span>
                  {(
                    Math.max(...visibleData.map((d) => d.value)) -
                    Math.min(...visibleData.map((d) => d.value))
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Uncomment and update table if needed */}
        {/* <div className="mt-6 hidden">
          <h3 className="text-lg font-medium mb-2">Monthly Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Value (%)</th>
                  <th className="py-2 px-4 border-b text-left">Change</th>
                </tr>
              </thead>
              <tbody>
                {visibleData.map((item, index) => {
                  const prevValue = index > 0 ? visibleData[index - 1].value : item.value;
                  const change = item.value - prevValue;
                  return (
                    <tr
                      key={index}
                      className={`
                        ${viewRange.start + index === highlightedIndex ? "bg-yellow-50" : "hover:bg-gray-50"}
                        ${index === activePoint ? "bg-blue-50" : ""}
                        cursor-pointer
                      `}
                      onClick={() => setHighlightedIndex(viewRange.start + index)}
                    >
                      <td className="py-2 px-4 border-b">{item.date}</td>
                      <td className="py-2 px-4 border-b">{item.value.toFixed(1)}</td>
                      <td className={`py-2 px-4 border-b ${change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : ""}`}>
                        {change !== 0 ? (change > 0 ? "+" : "") + change.toFixed(1) : "0"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
    </div>
  );
}
