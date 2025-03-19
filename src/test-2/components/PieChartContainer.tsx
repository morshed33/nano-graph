"use client";

import React, { useState, useRef, useEffect } from "react";
import PieChart from "./PieChart";
import PieChartLegend from "./PieChartLegend";
import PieChartDetails from "./PieChartDetails";
import { AnimationOptions, ChartSegment } from "../types";

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
  animate?: boolean;
  animation?: AnimationOptions;
  segmentAnimation?: AnimationOptions;
  activeAnimation?: AnimationOptions;
  selectedAnimation?: AnimationOptions;
  enableNavigationOnDoubleClick?: boolean;
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
  animate = true,
  animation,
  segmentAnimation,
  activeAnimation,
  selectedAnimation,
  enableNavigationOnDoubleClick = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [readyToNavigate, setReadyToNavigate] = useState<boolean>(false);
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
        setReadyToNavigate(false);
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
      // Clicked outside any segment
      setSelectedSegment(null);
      setReadyToNavigate(false);
      if (onSegmentSelect) {
        onSegmentSelect(null);
      }
      return;
    }

    if (selectedSegment === segmentIndex) {
      // Clicked on the already selected segment - this is a second click
      if (readyToNavigate && enableNavigationOnDoubleClick) {
        // Navigate to the segment's path
        if (onSegmentSelect) {
          onSegmentSelect(segments[segmentIndex]);
        }

        // Reset state after navigation
        setReadyToNavigate(false);
      } else {
        // First click on selected segment, prepare for navigation
        setReadyToNavigate(true);
      }
    } else {
      // Clicked on a different segment than the one currently selected
      setSelectedSegment(segmentIndex);
      setReadyToNavigate(false);

      // Notify parent but don't navigate yet
      if (onSegmentSelect) {
        onSegmentSelect(null);
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
        <div className="flex flex-wrap gap-6 mb-6 px-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animations
            </label>
            <button
              className={`px-3 py-1 rounded text-sm font-medium ${
                animate ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                // This would be controlled from props in real usage
                // For demo, allow toggling
                // animate = !animate;
              }}
            >
              {animate ? "ON" : "OFF"}
            </button>
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
            animate={animate}
            animation={animation}
            segmentAnimation={segmentAnimation}
            activeAnimation={activeAnimation}
            selectedAnimation={selectedAnimation}
          />

          {/* Center Information */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-[60%] pointer-events-none">
            <PieChartDetails
              segments={segments}
              selectedSegment={selectedSegment}
              defaultTitle={defaultDetailsTitle}
              defaultContent={defaultDetailsContent}
              renderSegmentDetails={renderSegmentDetails}
              animate={animate}
              animation={animation}
            />
          </div>

          {/* Navigation guidance tooltip */}
          {readyToNavigate && selectedSegment !== null && (
            <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm animate-pulse">
              Click again to navigate
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/2">
          <PieChartLegend
            segments={segments}
            activeSegment={activeSegment}
            selectedSegment={selectedSegment}
            onSegmentHover={handleSegmentHover}
            onSegmentClick={handleSegmentClick}
            animate={animate}
            animation={animation}
          />
        </div>
      </div>
    </div>
  );
};

export default PieChartContainer;
