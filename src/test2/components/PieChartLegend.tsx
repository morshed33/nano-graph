"use client";

import React from "react";
import { PieChartLegendProps } from "../types";

const PieChartLegend: React.FC<PieChartLegendProps> = ({
  segments,
  activeSegment,
  selectedSegment,
  onSegmentHover,
  onSegmentClick,
  className = "",
}) => {
  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div
            key={segment.id || index}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
              selectedSegment === index ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
            onMouseEnter={() => onSegmentHover?.(index)}
            onMouseLeave={() => onSegmentHover?.(null)}
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent div's onClick
              onSegmentClick?.(index);
            }}
          >
            <div className="flex items-center gap-3 cursor-pointer">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-lg">{segment.name}</span>
            </div>
            <span className="text-lg">{segment.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartLegend;
