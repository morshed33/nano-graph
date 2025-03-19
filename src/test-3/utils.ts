import { AnimationOptions, ChartDimensions, ChartSegment, SegmentAnimationState } from "./types";

/**
 * Calculates the dimensions for the pie chart
 */
export function getChartDimensions(
    canvas: HTMLCanvasElement,
    thickness: number = 0.2
): ChartDimensions {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;
    const innerRadius = radius * (1 - thickness);
    const outerArcRadius = radius * 1.1;

    return {
        dpr,
        rect,
        centerX,
        centerY,
        radius,
        innerRadius,
        outerArcRadius,
    };
}

/**
 * Finds which segment the cursor is hovering over
 */
export function findHoveredSegment(
    x: number,
    y: number,
    segments: ChartSegment[],
    dimensions: ChartDimensions
): number | null {
    const { centerX, centerY, radius, innerRadius } = dimensions;

    // Calculate distance from center
    const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    // Check if mouse is within the donut
    if (distance > innerRadius && distance < radius) {
        // Calculate angle
        let angle = Math.atan2(y - centerY, x - centerX);
        if (angle < 0) angle += 2 * Math.PI;

        // Find which segment the angle corresponds to
        let startAngle = 0;
        for (let i = 0; i < segments.length; i++) {
            const endAngle = startAngle + (segments[i].percentage / 100) * 2 * Math.PI;
            if (angle >= startAngle && angle < endAngle) {
                return i;
            }
            startAngle = endAngle;
        }
    }

    return null;
}

/**
 * Calculate animation progress
 */
export function getAnimationProgress(
    startTime: number,
    animation: AnimationOptions
): number {
    const { duration, delay = 0, easing = 'ease-out' } = animation;
    const elapsed = Math.max(0, Date.now() - startTime - delay);
    const progress = Math.min(1, elapsed / duration);

    // Apply easing function
    return applyEasing(progress, easing);
}

/**
 * Apply easing function to animation progress
 */
function applyEasing(progress: number, easing: string): number {
    switch (easing) {
        case 'linear':
            return progress;
        case 'ease-in':
            return Math.pow(progress, 2);
        case 'ease-out':
            return 1 - Math.pow(1 - progress, 2);
        case 'ease-in-out':
            return progress < 0.5
                ? 2 * Math.pow(progress, 2)
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        case 'bounce':
            if (progress < 1 / 2.75) {
                return 7.5625 * progress * progress;
            } else if (progress < 2 / 2.75) {
                const t = progress - 1.5 / 2.75;
                return 7.5625 * t * t + 0.75;
            } else if (progress < 2.5 / 2.75) {
                const t = progress - 2.25 / 2.75;
                return 7.5625 * t * t + 0.9375;
            } else {
                const t = progress - 2.625 / 2.75;
                return 7.5625 * t * t + 0.984375;
            }
        default: // 'ease'
            return progress < 0.5
                ? 4 * Math.pow(progress, 3)
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    }
}

/**
 * Calculates animation transformations for pie segments
 */
export function calculateSegmentAnimation(
    index: number,
    isActive: boolean,
    isSelected: boolean,
    initialAnimation: AnimationOptions | undefined,
    segmentAnimation: AnimationOptions | undefined,
    activeSegmentAnimation: AnimationOptions | undefined,
    selectedSegmentAnimation: AnimationOptions | undefined,
    animationProgress: number,
    initialRenderTime: number
): SegmentAnimationState {
    let radiusOffset = 0;
    let angleOffset = 0;
    let opacity = 1;
    let rotation = 0;

    // Apply initial animation to all segments
    if (initialAnimation && initialAnimation.type !== 'none') {
        const initialProgress = getAnimationProgress(initialRenderTime, {
            ...initialAnimation,
            delay: initialAnimation.delay || (index * 100) // Stagger the segments
        });

        switch (initialAnimation.type) {
            case 'scale':
                radiusOffset = (1 - initialProgress) * -0.3;
                opacity = initialProgress;
                break;
            case 'rotate':
            case 'spin':
                rotation = (1 - initialProgress) * Math.PI * 2;
                opacity = initialProgress;
                break;
            case 'fade':
                opacity = initialProgress;
                break;
            // Add other initial animations as needed
        }
    }

    // Apply segment animation (ongoing)
    if (segmentAnimation && segmentAnimation.type !== 'none') {
        const cycleProgress = (animationProgress + (index * 0.1)) % 1; // Offset each segment slightly

        switch (segmentAnimation.type) {
            case 'pulse':
                // Subtle continuous pulse for all segments
                radiusOffset += Math.sin(cycleProgress * Math.PI * 2) * 0.02;
                break;
            case 'rotate':
                // Slight rotation effect
                angleOffset += Math.sin(cycleProgress * Math.PI * 2) * 0.02;
                break;
            // Add more continuous animations
        }
    }

    // Apply active segment animation
    if (isActive && activeSegmentAnimation && activeSegmentAnimation.type !== 'none') {
        switch (activeSegmentAnimation.type) {
            case 'pulse':
                // More noticeable pulse effect
                radiusOffset += Math.sin(animationProgress * Math.PI * 4) * 0.04;
                break;
            case 'scale':
                // Expand when active
                radiusOffset += 0.05;
                break;
            case 'rotate':
                // Slight wiggle on hover
                angleOffset += Math.sin(animationProgress * Math.PI * 6) * 0.03;
                break;
        }
    }

    // Apply selected segment animation
    if (isSelected && selectedSegmentAnimation && selectedSegmentAnimation.type !== 'none') {
        switch (selectedSegmentAnimation.type) {
            case 'scale':
                // More significant expansion when selected
                radiusOffset += 0.1;
                break;
            case 'pulse':
                // Stronger pulse for selected
                radiusOffset += Math.sin(animationProgress * Math.PI * 2) * 0.07 + 0.05;
                break;
            case 'bounce':
                // Bounce effect for selected
                radiusOffset += Math.abs(Math.sin(animationProgress * Math.PI * 3)) * 0.09;
                break;
            case 'rotate':
                // Slight continuous rotation for selected
                angleOffset += Math.sin(animationProgress * Math.PI * 2) * 0.05;
                break;
        }
    }

    return { radiusOffset, angleOffset, opacity, rotation };
}

/**
 * Draws the pie chart on the canvas with animations
 */
export function drawPieChart(
    ctx: CanvasRenderingContext2D,
    segments: ChartSegment[],
    dimensions: ChartDimensions,
    activeSegment: number | null,
    selectedSegment: number | null,
    outerArcThickness: number = 0.5,
    animate: boolean = false,
    initialAnimation?: AnimationOptions,
    segmentAnimation?: AnimationOptions,
    activeSegmentAnimation?: AnimationOptions,
    selectedSegmentAnimation?: AnimationOptions,
    innerArcAnimation?: AnimationOptions,
    outerArcAnimation?: AnimationOptions,
    initialRenderTime: number = Date.now()
): void {
    const { rect, centerX, centerY, radius, innerRadius, outerArcRadius } = dimensions;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Animation progress for global effects
    const animationProgress = animate ? (Date.now() % 2000) / 2000 : 0;

    // Draw pie segments
    let startAngle = 0;
    segments.forEach((segment, index) => {
        const segmentAngle = (segment.percentage / 100) * 2 * Math.PI;
        const isActive = index === activeSegment;
        const isSelected = index === selectedSegment;

        // Calculate animation transformations
        const { radiusOffset, angleOffset, opacity, rotation } = animate
            ? calculateSegmentAnimation(
                index,
                isActive,
                isSelected,
                initialAnimation,
                segmentAnimation,
                activeSegmentAnimation,
                selectedSegmentAnimation,
                animationProgress,
                initialRenderTime
            )
            : { radiusOffset: 0, angleOffset: 0, opacity: 1, rotation: 0 };

        // Apply transformations
        const effectiveRadius = radius * (1 + radiusOffset);
        const adjustedStartAngle = startAngle + angleOffset + rotation;
        const endAngle = adjustedStartAngle + segmentAngle;
        const midAngle = adjustedStartAngle + segmentAngle / 2;

        // Draw segment with opacity
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, effectiveRadius, adjustedStartAngle, endAngle);
        ctx.closePath();

        // Fill segment with opacity for selected/active state
        if (isSelected) {
            ctx.fillStyle = `${segment.color}CC`; // Add opacity
        } else if (isActive) {
            ctx.fillStyle = `${segment.color}EE`; // A bit less opacity for active
        } else {
            ctx.fillStyle = segment.color;
        }
        ctx.fill();
        ctx.globalAlpha = 1; // Reset opacity

        // Draw outer arc for active or selected state
        if (isActive || isSelected) {
            const outerArcAngleStart = midAngle - segmentAngle * outerArcThickness;
            const outerArcAngleEnd = midAngle + segmentAngle * outerArcThickness;

            // Calculate outer arc animation
            let arcWidth = 12;
            let arcRadiusOffset = 0;
            let arcOpacity = 1;

            if (animate && outerArcAnimation && outerArcAnimation.type !== 'none') {
                if (outerArcAnimation.type === 'pulse') {
                    arcWidth = isSelected
                        ? 12 + Math.sin(animationProgress * Math.PI * 2) * 4
                        : 12 + Math.sin(animationProgress * Math.PI * 2) * 2;
                } else if (outerArcAnimation.type === 'scale') {
                    arcRadiusOffset = isSelected
                        ? Math.sin(animationProgress * Math.PI * 2) * 0.04
                        : Math.sin(animationProgress * Math.PI * 2) * 0.02;
                }
            }

            ctx.globalAlpha = arcOpacity;
            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                outerArcRadius * (1 + arcRadiusOffset),
                outerArcAngleStart,
                outerArcAngleEnd
            );
            ctx.lineWidth = arcWidth;
            ctx.strokeStyle = segment.color;
            ctx.stroke();
            ctx.globalAlpha = 1; // Reset opacity
        }

        startAngle = startAngle + segmentAngle; // Increment without animation offset
    });

    // Draw inner circle for donut effect with animation
    let innerArcScale = 1;
    let innerArcOpacity = 1;

    if (animate && innerArcAnimation && innerArcAnimation.type !== 'none') {
        if (innerArcAnimation.type === 'pulse') {
            innerArcScale = 1 + Math.sin(animationProgress * Math.PI * 2) * 0.03;
        } else if (innerArcAnimation.type === 'scale') {
            innerArcScale = 1 + Math.sin(animationProgress * Math.PI) * 0.05;
        } else if (innerArcAnimation.type === 'fade') {
            innerArcOpacity = 0.8 + Math.sin(animationProgress * Math.PI * 2) * 0.2;
        }
    }

    ctx.globalAlpha = innerArcOpacity;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius * innerArcScale, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.globalAlpha = 1; // Reset opacity
} 