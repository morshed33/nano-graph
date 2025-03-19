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

  // More specific animation controls
  initialAnimation?: AnimationOptions;
  segmentAnimation?: AnimationOptions;
  activeSegmentAnimation?: AnimationOptions;
  selectedSegmentAnimation?: AnimationOptions;
  innerArcAnimation?: AnimationOptions;
  outerArcAnimation?: AnimationOptions;
  showCursorPointer?: boolean;

  enableNavigationOnDoubleClick?: boolean;
  animationControlPanel?: boolean;
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
  initialAnimation,
  segmentAnimation,
  activeSegmentAnimation,
  selectedSegmentAnimation,
  innerArcAnimation,
  outerArcAnimation,
  showCursorPointer = true,
  enableNavigationOnDoubleClick = true,
  animationControlPanel = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [readyToNavigate, setReadyToNavigate] = useState<boolean>(false);
  const [chartThickness, setChartThickness] = useState(thickness);
  const [chartOuterArcThickness, setChartOuterArcThickness] =
    useState(outerArcThickness);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(animate);

  // Animation control states
  const [initialAnimationType, setInitialAnimationType] = useState<string>(
    initialAnimation?.type || "spin"
  );
  const [segmentAnimationType, setSegmentAnimationType] = useState<string>(
    segmentAnimation?.type || "none"
  );
  const [activeAnimationType, setActiveAnimationType] = useState<string>(
    activeSegmentAnimation?.type || "pulse"
  );
  const [selectedAnimationType, setSelectedAnimationType] = useState<string>(
    selectedSegmentAnimation?.type || "scale"
  );
  const [innerArcAnimationType, setInnerArcAnimationType] = useState<string>(
    innerArcAnimation?.type || "pulse"
  );
  const [outerArcAnimationType, setOuterArcAnimationType] = useState<string>(
    outerArcAnimation?.type || "pulse"
  );
  const [cursorPointerEnabled, setCursorPointerEnabled] =
    useState(showCursorPointer);

  // Create animation options objects
  const getAnimationOptions = (
    type: string,
    duration: number
  ): AnimationOptions => ({
    type: type as any,
    duration,
    easing: "ease-in-out",
  });

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

  // Toggle animations
  const toggleAnimations = () => {
    setIsAnimationEnabled(!isAnimationEnabled);
  };

  // Animation type selector component
  const AnimationSelector = ({
    label,
    value,
    onChange,
    disabled = false,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full p-1 border rounded text-sm"
      >
        <option value="none">None</option>
        <option value="fade">Fade</option>
        <option value="scale">Scale</option>
        <option value="rotate">Rotate</option>
        <option value="spin">Spin</option>
        <option value="bounce">Bounce</option>
        <option value="pulse">Pulse</option>
      </select>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`w-full mx-auto bg-white rounded-lg shadow-lg ${className}`}
    >
      {title && (
        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      )}

      {/* Controls for thickness, animations and cursor */}
      {showControls && (
        <div className="mb-6 px-6">
          <div className="flex flex-wrap gap-6 mb-4">
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
                className="w-32"
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
                className="w-32"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                All Animations
              </label>
              <button
                className={`px-3 py-1 rounded text-sm font-medium ${
                  isAnimationEnabled
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={toggleAnimations}
              >
                {isAnimationEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cursor Pointer
              </label>
              <button
                className={`px-3 py-1 rounded text-sm font-medium ${
                  cursorPointerEnabled
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setCursorPointerEnabled(!cursorPointerEnabled)}
              >
                {cursorPointerEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Animation control panel */}
          {animationControlPanel && (
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimationSelector
                label="Initial Animation"
                value={initialAnimationType}
                onChange={setInitialAnimationType}
                disabled={!isAnimationEnabled}
              />
              <AnimationSelector
                label="Segment Animation"
                value={segmentAnimationType}
                onChange={setSegmentAnimationType}
                disabled={!isAnimationEnabled}
              />
              <AnimationSelector
                label="Hover Animation"
                value={activeAnimationType}
                onChange={setActiveAnimationType}
                disabled={!isAnimationEnabled}
              />
              <AnimationSelector
                label="Selected Animation"
                value={selectedAnimationType}
                onChange={setSelectedAnimationType}
                disabled={!isAnimationEnabled}
              />
              <AnimationSelector
                label="Inner Arc Animation"
                value={innerArcAnimationType}
                onChange={setInnerArcAnimationType}
                disabled={!isAnimationEnabled}
              />
              <AnimationSelector
                label="Outer Arc Animation"
                value={outerArcAnimationType}
                onChange={setOuterArcAnimationType}
                disabled={!isAnimationEnabled}
              />
            </div>
          )}
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
            animate={isAnimationEnabled}
            initialAnimation={getAnimationOptions(initialAnimationType, 1200)}
            segmentAnimation={getAnimationOptions(segmentAnimationType, 1000)}
            activeSegmentAnimation={getAnimationOptions(
              activeAnimationType,
              800
            )}
            selectedSegmentAnimation={getAnimationOptions(
              selectedAnimationType,
              1200
            )}
            innerArcAnimation={getAnimationOptions(innerArcAnimationType, 3000)}
            outerArcAnimation={getAnimationOptions(outerArcAnimationType, 1500)}
            showCursorPointer={cursorPointerEnabled}
          />

          {/* Center Information */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-[60%] pointer-events-none">
            <PieChartDetails
              segments={segments}
              selectedSegment={selectedSegment}
              defaultTitle={defaultDetailsTitle}
              defaultContent={defaultDetailsContent}
              renderSegmentDetails={renderSegmentDetails}
              animate={isAnimationEnabled}
              animation={{
                type: "fade",
                duration: 400,
                easing: "ease-in-out",
              }}
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
            animate={isAnimationEnabled}
            animation={{
              type: "fade",
              duration: 600,
              easing: "ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PieChartContainer;
