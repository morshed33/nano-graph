"use client";

import React, { useState, useRef, useEffect } from "react";
import PieChart from "./PieChart";
import PieChartLegend from "./PieChartLegend";
import PieChartDetails from "./PieChartDetails";
import { ChartSegment } from "../types";

interface PieChartContainerProps {
  segments: ChartSegment[];
  title?: string;
  defaultDetailsTitle?: string;
  defaultDetailsContent?: React.ReactNode;
  renderSegmentDetails?: (segment: ChartSegment) => React.ReactNode;
  thickness?: number;
  outerArcThickness?: number;
  onSegmentSelect?: (segment: ChartSegment | null) => void;
  className?: string;
  legendPosition?: "right" | "bottom";
  showControls?: boolean;
}

const PieChartContainer: React.FC<PieChartContainerProps> = ({
  segments,
  title = "Chart",
  defaultDetailsTitle = "OVERVIEW",
  defaultDetailsContent,
  renderSegmentDetails,
  thickness = 0.2,
  outerArcThickness = 0.5,
  onSegmentSelect,
  className = "",
  legendPosition = "right",
  showControls = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [chartThickness, setChartThickness] = useState(thickness);
  const [chartOuterArcThickness, setChartOuterArcThickness] =
    useState(outerArcThickness);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveSegment(null);
        setSelectedSegment(null);
        if (onSegmentSelect) {
          onSegmentSelect(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onSegmentSelect]);

  const handleSegmentHover = (segmentIndex: number | null) => {
    setActiveSegment(segmentIndex);
  };

  const handleSegmentClick = (segmentIndex: number | null) => {
    if (segmentIndex === null) {
      setSelectedSegment(null);
      if (onSegmentSelect) {
        onSegmentSelect(null);
      }
      return;
    }

    // If clicking the already selected segment, deselect it
    if (selectedSegment === segmentIndex) {
      setSelectedSegment(null);
      if (onSegmentSelect) {
        onSegmentSelect(null);
      }
    } else {
      setSelectedSegment(segmentIndex);
      if (onSegmentSelect) {
        onSegmentSelect(segments[segmentIndex]);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full mx-auto bg-white rounded-lg shadow-lg ${className}`}
    >
      {title && (
        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      )}

      {/* Controls for thickness */}
      {showControls && (
        <div className="flex gap-6 mb-6 px-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pie Thickness: {(chartThickness * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={chartThickness}
              onChange={(e) =>
                setChartThickness(Number.parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outer Arc Width: {(chartOuterArcThickness * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={chartOuterArcThickness}
              onChange={(e) =>
                setChartOuterArcThickness(Number.parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      <div
        className={`flex ${
          legendPosition === "right" ? "flex-col md:flex-row" : "flex-col"
        } items-center justify-between gap-8 p-6`}
      >
        {/* Pie Chart Container */}
        <div className="relative w-full md:w-1/2 aspect-square">
          <PieChart
            segments={segments}
            thickness={chartThickness}
            outerArcThickness={chartOuterArcThickness}
            activeSegment={activeSegment}
            selectedSegment={selectedSegment}
            onSegmentHover={handleSegmentHover}
            onSegmentClick={handleSegmentClick}
          />

          {/* Center Information */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-[60%] pointer-events-none">
            <PieChartDetails
              segments={segments}
              selectedSegment={selectedSegment}
              defaultTitle={defaultDetailsTitle}
              defaultContent={defaultDetailsContent}
              renderSegmentDetails={renderSegmentDetails}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/2">
          <PieChartLegend
            segments={segments}
            activeSegment={activeSegment}
            selectedSegment={selectedSegment}
            onSegmentHover={handleSegmentHover}
            onSegmentClick={handleSegmentClick}
          />
        </div>
      </div>
    </div>
  );
};

export default PieChartContainer;
