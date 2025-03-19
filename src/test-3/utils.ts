import { AnimationOptions, ChartDimensions, ChartSegment } from "./types";

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
export function getSegmentAnimationTransform(
    index: number,
    isActive: boolean,
    isSelected: boolean,
    animation: AnimationOptions | undefined,
    activeAnimation: AnimationOptions | undefined,
    selectedAnimation: AnimationOptions | undefined,
    progress: number
): { radiusOffset: number; angleOffset: number } {
    let radiusOffset = 0;
    let angleOffset = 0;

    // Apply entrance animation to all segments
    if (animation && animation.type !== 'none') {
        const entryProgress = getAnimationProgress(Date.now() - index * 100, animation);

        switch (animation.type) {
            case 'scale':
                radiusOffset = (1 - entryProgress) * -0.2;
                break;
            case 'rotate':
                angleOffset = (1 - entryProgress) * Math.PI * 0.2;
                break;
            // Add other entrance animations as needed
        }
    }

    // Apply active segment animation
    if (isActive && activeAnimation && activeAnimation.type !== 'none') {
        switch (activeAnimation.type) {
            case 'pulse':
                // Subtle pulse effect
                radiusOffset += Math.sin(progress * Math.PI * 4) * 0.03;
                break;
            case 'scale':
                // Slightly expand
                radiusOffset += 0.05;
                break;
        }
    }

    // Apply selected segment animation
    if (isSelected && selectedAnimation && selectedAnimation.type !== 'none') {
        switch (selectedAnimation.type) {
            case 'scale':
                // Expand more significantly
                radiusOffset += 0.1;
                break;
            case 'pulse':
                // Stronger pulse
                radiusOffset += Math.sin(progress * Math.PI * 2) * 0.05 + 0.05;
                break;
            case 'bounce':
                // Bounce effect
                radiusOffset += Math.abs(Math.sin(progress * Math.PI * 3)) * 0.08;
                break;
        }
    }

    return { radiusOffset, angleOffset };
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
    animation?: AnimationOptions,
    segmentAnimation?: AnimationOptions,
    activeAnimation?: AnimationOptions,
    selectedAnimation?: AnimationOptions
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
        const { radiusOffset, angleOffset } = animate
            ? getSegmentAnimationTransform(
                index,
                isActive,
                isSelected,
                animation,
                activeAnimation,
                selectedAnimation,
                animationProgress
            )
            : { radiusOffset: 0, angleOffset: 0 };

        // Apply transformations
        const effectiveRadius = radius * (1 + radiusOffset);
        const adjustedStartAngle = startAngle + angleOffset;
        const endAngle = adjustedStartAngle + segmentAngle;
        const midAngle = adjustedStartAngle + segmentAngle / 2;

        // Draw segment
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

        // Draw outer arc for active or selected state
        if (isActive || isSelected) {
            const outerArcAngleStart = midAngle - segmentAngle * outerArcThickness;
            const outerArcAngleEnd = midAngle + segmentAngle * outerArcThickness;

            // Animate arc width for selected segments
            const arcWidth = isSelected && animate && selectedAnimation
                ? 12 + Math.sin(animationProgress * Math.PI * 2) * 4
                : 12;

            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                outerArcRadius + (isSelected ? 0.05 * radius : 0),
                outerArcAngleStart,
                outerArcAngleEnd
            );
            ctx.lineWidth = arcWidth;
            ctx.strokeStyle = segment.color;
            ctx.stroke();
        }

        startAngle = startAngle + segmentAngle; // Increment without animation offset
    });

    // Draw inner circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
} 