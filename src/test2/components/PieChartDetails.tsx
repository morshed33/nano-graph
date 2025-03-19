"use client";

import React from "react";
import { PieChartDetailsProps } from "../types";

const PieChartDetails: React.FC<PieChartDetailsProps> = ({
  segments,
  selectedSegment,
  defaultTitle = "OVERVIEW",
  defaultContent,
  renderSegmentDetails,
  className = "",
}) => {
  // If a segment is selected and we have a custom renderer, use it
  if (selectedSegment !== null && renderSegmentDetails) {
    return (
      <div className={`text-center ${className}`}>
        {renderSegmentDetails(segments[selectedSegment])}
      </div>
    );
  }

  // If a segment is selected but no custom renderer, show default details
  if (selectedSegment !== null) {
    const segment = segments[selectedSegment];
    return (
      <div className={`text-center ${className}`}>
        <h3 className="text-xs md:text-sm font-bold uppercase mb-2">
          {segment.name}
        </h3>
        <div className="text-sm">
          {segment.data && (
            <>
              {Object.entries(segment.data).map(([key, value]) => (
                <p key={key}>
                  {key}: {value}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // Default view when no segment is selected
  return (
    <div className={`text-center ${className}`}>
      <h3 className="text-xl font-bold mb-2">{defaultTitle}</h3>
      {defaultContent}
    </div>
  );
};

export default PieChartDetails;
