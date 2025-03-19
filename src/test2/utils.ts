import { ChartDimensions, ChartSegment } from "./types";

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
 * Draws the pie chart on the canvas
 */
export function drawPieChart(
    ctx: CanvasRenderingContext2D,
    segments: ChartSegment[],
    dimensions: ChartDimensions,
    activeSegment: number | null,
    selectedSegment: number | null,
    outerArcThickness: number = 0.5
): void {
    const { rect, centerX, centerY, radius, innerRadius, outerArcRadius } = dimensions;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw pie segments
    let startAngle = 0;
    segments.forEach((segment, index) => {
        const segmentAngle = (segment.percentage / 100) * 2 * Math.PI;
        const endAngle = startAngle + segmentAngle;
        const isActive = index === activeSegment;
        const isSelected = index === selectedSegment;
        const midAngle = startAngle + segmentAngle / 2;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // Fill segment with opacity for selected state
        ctx.fillStyle = isSelected ? `${segment.color}CC` : segment.color;
        ctx.fill();

        // Draw outer arc for active or selected state
        if (isActive || isSelected) {
            const outerArcAngleStart = midAngle - segmentAngle * outerArcThickness;
            const outerArcAngleEnd = midAngle + segmentAngle * outerArcThickness;

            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                outerArcRadius,
                outerArcAngleStart,
                outerArcAngleEnd
            );
            ctx.lineWidth = 12;
            ctx.strokeStyle = segment.color;
            ctx.stroke();
        }

        startAngle = endAngle;
    });

    // Draw inner circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
} 