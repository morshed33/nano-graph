"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { PieChartProps } from "../types";
import { drawPieChart, findHoveredSegment, getChartDimensions } from "../utils";

const PieChart: React.FC<PieChartProps> = ({
  segments,
  thickness = 0.2,
  outerArcThickness = 0.5,
  onSegmentHover,
  onSegmentClick,
  activeSegment,
  selectedSegment,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Memoize chart dimensions calculation
  const getChartDims = useCallback(
    (canvas: HTMLCanvasElement) => {
      return getChartDimensions(canvas, thickness);
    },
    [thickness]
  );

  // Draw the pie chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = getChartDims(canvas);
    const { dpr, rect } = dimensions;

    // Set canvas dimensions with device pixel ratio for sharp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Draw the chart
    drawPieChart(
      ctx,
      segments,
      dimensions,
      activeSegment ?? null,
      selectedSegment ?? null,
      outerArcThickness
    );
  }, [
    segments,
    activeSegment,
    selectedSegment,
    getChartDims,
    outerArcThickness,
  ]);

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
      className={`w-full h-full ${className} `}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
};

export default PieChart;
