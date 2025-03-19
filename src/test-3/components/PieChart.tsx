"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { AnimationOptions, PieChartProps } from "../types";
import { drawPieChart, findHoveredSegment, getChartDimensions } from "../utils";

// Default animation options
const defaultAnimation: AnimationOptions = {
  type: "fade",
  duration: 800,
  easing: "ease-out",
};

const defaultSegmentAnimation: AnimationOptions = {
  type: "scale",
  duration: 1000,
  easing: "ease-out",
};

const defaultActiveAnimation: AnimationOptions = {
  type: "pulse",
  duration: 1000,
  easing: "ease-in-out",
};

const defaultSelectedAnimation: AnimationOptions = {
  type: "bounce",
  duration: 1200,
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
  animation = defaultAnimation,
  segmentAnimation = defaultSegmentAnimation,
  activeAnimation = defaultActiveAnimation,
  selectedAnimation = defaultSelectedAnimation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
      animation,
      segmentAnimation,
      activeAnimation,
      selectedAnimation
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
    animation,
    segmentAnimation,
    activeAnimation,
    selectedAnimation,
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
      if (!canvas || !onSegmentHover) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dimensions = getChartDims(canvas);
      const hoveredSegment = findHoveredSegment(x, y, segments, dimensions);

      onSegmentHover(hoveredSegment);
    },
    [getChartDims, segments, onSegmentHover]
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
    if (onSegmentHover) {
      onSegmentHover(null);
    }
  }, [onSegmentHover]);

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
