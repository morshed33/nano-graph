"use client";

import React from "react";
import { AnimationOptions, PieChartLegendProps } from "../types";

// Default animation
const defaultAnimation: AnimationOptions = {
  type: "fade",
  duration: 600,
  easing: "ease-out",
};

const PieChartLegend: React.FC<PieChartLegendProps> = ({
  segments,
  activeSegment,
  selectedSegment,
  onSegmentHover,
  onSegmentClick,
  className = "",
  animate = true,
  animation = defaultAnimation,
}) => {
  // Animation classes based on type
  const getItemAnimationClasses = (index: number) => {
    if (!animate) return "";

    const baseClasses = "transition-all";
    let animationClasses = "";

    switch (animation?.type) {
      case "fade":
        animationClasses = "animate-fadeIn";
        break;
      case "scale":
        animationClasses = "animate-scaleIn";
        break;
      case "bounce":
        animationClasses = "animate-bounceIn";
        break;
      default:
        animationClasses = "animate-fadeIn";
    }

    return `${baseClasses} ${animationClasses}`;
  };

  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div
            key={segment.id || index}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
              selectedSegment === index
                ? "bg-gray-100"
                : activeSegment === index
                ? "bg-gray-50"
                : "hover:bg-gray-50"
            } ${getItemAnimationClasses(index)}`}
            style={{
              animationDelay: animate ? `${index * 100}ms` : "0ms",
              animationDuration: animate
                ? `${animation?.duration || 600}ms`
                : "0ms",
            }}
            onMouseEnter={() => onSegmentHover?.(index)}
            onMouseLeave={() => onSegmentHover?.(null)}
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent div's onClick
              onSegmentClick?.(index);
            }}
          >
            <div className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  selectedSegment === index
                    ? "scale-125"
                    : activeSegment === index
                    ? "scale-110"
                    : ""
                }`}
                style={{
                  backgroundColor: segment.color,
                  transition: "transform 0.2s ease-out",
                }}
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
