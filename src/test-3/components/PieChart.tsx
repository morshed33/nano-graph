"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { AnimationOptions, PieChartProps } from "../types";
import { drawPieChart, findHoveredSegment, getChartDimensions } from "../utils";

// Default animation options
const defaultInitialAnimation: AnimationOptions = {
  type: "spin",
  duration: 1200,
  easing: "ease-out",
};

const defaultSegmentAnimation: AnimationOptions = {
  type: "none",
  duration: 1000,
  easing: "ease-out",
};

const defaultActiveSegmentAnimation: AnimationOptions = {
  type: "pulse",
  duration: 800,
  easing: "ease-in-out",
};

const defaultSelectedSegmentAnimation: AnimationOptions = {
  type: "scale",
  duration: 1200,
  easing: "ease-in-out",
};

const defaultInnerArcAnimation: AnimationOptions = {
  type: "pulse",
  duration: 3000,
  easing: "ease-in-out",
};

const defaultOuterArcAnimation: AnimationOptions = {
  type: "pulse",
  duration: 1500,
  easing: "ease-in-out",
};

const PieChart: React.FC<PieChartProps> = ({
  segments,
  thickness = 0.2,
  outerArcThickness = 0.5,
  onSegmentHover,
  onSegmentClick,
  activeSegment,
  selectedSegment,
  className = "",
  animate = true,
  initialAnimation = defaultInitialAnimation,
  segmentAnimation = defaultSegmentAnimation,
  activeSegmentAnimation = defaultActiveSegmentAnimation,
  selectedSegmentAnimation = defaultSelectedSegmentAnimation,
  innerArcAnimation = defaultInnerArcAnimation,
  outerArcAnimation = defaultOuterArcAnimation,
  showCursorPointer = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const initialRenderTimeRef = useRef<number>(Date.now());

  // Memoize chart dimensions calculation
  const getChartDims = useCallback(
    (canvas: HTMLCanvasElement) => {
      return getChartDimensions(canvas, thickness);
    },
    [thickness]
  );

  // Animation loop
  const animationLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = getChartDims(canvas);

    // Draw the chart with animations
    drawPieChart(
      ctx,
      segments,
      dimensions,
      activeSegment ?? null,
      selectedSegment ?? null,
      outerArcThickness,
      animate,
      initialAnimation,
      segmentAnimation,
      activeSegmentAnimation,
      selectedSegmentAnimation,
      innerArcAnimation,
      outerArcAnimation,
      initialRenderTimeRef.current
    );

    // Continue animation loop if animation is enabled
    if (animate) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [
    segments,
    activeSegment,
    selectedSegment,
    getChartDims,
    outerArcThickness,
    animate,
    initialAnimation,
    segmentAnimation,
    activeSegmentAnimation,
    selectedSegmentAnimation,
    innerArcAnimation,
    outerArcAnimation,
  ]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isInitialized) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = getChartDims(canvas);
    const { dpr, rect } = dimensions;

    // Set canvas dimensions with device pixel ratio for sharp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Store the initial render time for animations
    initialRenderTimeRef.current = Date.now();

    setIsInitialized(true);
  }, [getChartDims, isInitialized]);

  // Start animation loop
  useEffect(() => {
    if (!isInitialized) return;

    // Start the animation loop
    if (animate) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else {
      // Just draw once if animations are disabled
      animationLoop();
    }

    // Clean up
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isInitialized,
    animationLoop,
    animate,
    segments,
    activeSegment,
    selectedSegment,
  ]);

  // Force redraw on size changes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dimensions = getChartDims(canvas);
      const { dpr, rect } = dimensions;

      // Resize canvas
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Force redraw
      if (!animate) {
        animationLoop();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [getChartDims, animate, animationLoop]);

  // Handle mouse move to detect hovering over segments
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dimensions = getChartDims(canvas);
      const hoveredIdx = findHoveredSegment(x, y, segments, dimensions);

      // Update cursor style based on whether a segment is hovered
      if (showCursorPointer) {
        canvas.style.cursor = hoveredIdx !== null ? "pointer" : "default";
      }

      setHoveredSegment(hoveredIdx);

      if (onSegmentHover) {
        onSegmentHover(hoveredIdx);
      }
    },
    [getChartDims, segments, onSegmentHover, showCursorPointer]
  );

  // Handle click on segments
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !onSegmentClick) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dimensions = getChartDims(canvas);
      const clickedSegment = findHoveredSegment(x, y, segments, dimensions);

      onSegmentClick(clickedSegment);
    },
    [getChartDims, segments, onSegmentClick]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (canvasRef.current && showCursorPointer) {
      canvasRef.current.style.cursor = "default";
    }

    setHoveredSegment(null);

    if (onSegmentHover) {
      onSegmentHover(null);
    }
  }, [onSegmentHover, showCursorPointer]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
};

export default PieChart;
