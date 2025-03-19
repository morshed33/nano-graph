"use client";

import React, { useEffect, useState } from "react";
import { AnimationOptions, PieChartDetailsProps } from "../types";

// Default animation
const defaultAnimation: AnimationOptions = {
  type: "fade",
  duration: 400,
  easing: "ease-in-out",
};

const PieChartDetails: React.FC<PieChartDetailsProps> = ({
  segments,
  selectedSegment,
  defaultTitle = "OVERVIEW",
  defaultContent,
  renderSegmentDetails,
  className = "",
  animate = true,
  animation = defaultAnimation,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [displayedContent, setDisplayedContent] =
    useState<React.ReactNode>(null);
  const [prevSelectedSegment, setPrevSelectedSegment] = useState<number | null>(
    null
  );

  // Handle content transitions when selected segment changes
  useEffect(() => {
    if (prevSelectedSegment !== selectedSegment) {
      if (animate) {
        // Start transition
        setIsTransitioning(true);
        setShowContent(false);

        // Wait for exit animation to complete
        const timer = setTimeout(() => {
          // Update content after exit animation
          if (selectedSegment !== null && renderSegmentDetails) {
            setDisplayedContent(
              renderSegmentDetails(segments[selectedSegment])
            );
          } else if (selectedSegment !== null) {
            // Default display for selected segment
            const segment = segments[selectedSegment];
            setDisplayedContent(
              <>
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
              </>
            );
          } else {
            // Default content when no segment is selected
            setDisplayedContent(
              <>
                <h3 className="text-xl font-bold mb-2">{defaultTitle}</h3>
                {defaultContent}
              </>
            );
          }

          // Show new content with entry animation
          setShowContent(true);
          setPrevSelectedSegment(selectedSegment);

          // End transition
          setTimeout(() => {
            setIsTransitioning(false);
          }, animation.duration);
        }, animation.duration / 2);

        return () => clearTimeout(timer);
      } else {
        // No animation, just update content immediately
        if (selectedSegment !== null && renderSegmentDetails) {
          setDisplayedContent(renderSegmentDetails(segments[selectedSegment]));
        } else if (selectedSegment !== null) {
          const segment = segments[selectedSegment];
          setDisplayedContent(
            <>
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
            </>
          );
        } else {
          setDisplayedContent(
            <>
              <h3 className="text-xl font-bold mb-2">{defaultTitle}</h3>
              {defaultContent}
            </>
          );
        }
        setPrevSelectedSegment(selectedSegment);
      }
    }
  }, [
    selectedSegment,
    segments,
    renderSegmentDetails,
    defaultTitle,
    defaultContent,
    prevSelectedSegment,
    animate,
    animation,
  ]);

  // Initialize content on first render
  useEffect(() => {
    if (displayedContent === null) {
      if (selectedSegment !== null && renderSegmentDetails) {
        setDisplayedContent(renderSegmentDetails(segments[selectedSegment]));
      } else if (selectedSegment !== null) {
        const segment = segments[selectedSegment];
        setDisplayedContent(
          <>
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
          </>
        );
      } else {
        setDisplayedContent(
          <>
            <h3 className="text-xl font-bold mb-2">{defaultTitle}</h3>
            {defaultContent}
          </>
        );
      }
      setPrevSelectedSegment(selectedSegment);
    }
  }, [
    displayedContent,
    selectedSegment,
    segments,
    renderSegmentDetails,
    defaultTitle,
    defaultContent,
  ]);

  // Animation classes based on animation type
  const getAnimationClasses = () => {
    if (!animate || !animation) return "";

    const baseClasses = "transition-all duration-300";
    const animationClasses = {
      fade: showContent ? "opacity-100" : "opacity-0",
      scale: showContent ? "scale-100 opacity-100" : "scale-95 opacity-0",
      bounce: showContent
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-2",
    };

    switch (animation.type) {
      case "fade":
        return `${baseClasses} ${animationClasses.fade}`;
      case "scale":
        return `${baseClasses} ${animationClasses.scale} transform`;
      case "bounce":
        return `${baseClasses} ${animationClasses.bounce} transform`;
      default:
        return `${baseClasses} ${animationClasses.fade}`;
    }
  };

  return (
    <div
      className={`text-center ${className} ${getAnimationClasses()}`}
      style={{
        transitionDuration: animate ? `${animation.duration}ms` : "0ms",
      }}
    >
      {displayedContent}
    </div>
  );
};

export default PieChartDetails;
