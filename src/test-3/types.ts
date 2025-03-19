export interface ChartSegment {
    id: string | number;
    name: string;
    percentage: number;
    color: string;
    data?: Record<string, any>; // Additional data for the segment
}

export type AnimationType = 'none' | 'fade' | 'scale' | 'rotate' | 'spin' | 'bounce' | 'pulse';

export interface AnimationOptions {
    type: AnimationType;
    duration: number; // in milliseconds
    delay?: number; // in milliseconds
    easing?: string; // e.g., 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'
}

export interface PieChartProps {
    segments: ChartSegment[];
    thickness?: number; // Thickness of the donut (0-1), where 0 is a pie and 1 is a full circle
    outerArcThickness?: number; // Thickness of the highlighted arc (0-1)
    onSegmentHover?: (segmentIndex: number | null) => void;
    onSegmentClick?: (segmentIndex: number | null) => void;
    activeSegment?: number | null;
    selectedSegment?: number | null;
    className?: string;
    animate?: boolean;

    // More specific animation controls
    initialAnimation?: AnimationOptions; // Initial animation when chart renders
    segmentAnimation?: AnimationOptions; // Animation for all segments
    activeSegmentAnimation?: AnimationOptions; // Animation for hovered segment
    selectedSegmentAnimation?: AnimationOptions; // Animation for selected segment
    innerArcAnimation?: AnimationOptions; // Animation for inner arc
    outerArcAnimation?: AnimationOptions; // Animation for outer arc
    showCursorPointer?: boolean; // Whether to show cursor pointer on hover
}

export interface PieChartLegendProps {
    segments: ChartSegment[];
    activeSegment?: number | null;
    selectedSegment?: number | null;
    onSegmentHover?: (segmentIndex: number | null) => void;
    onSegmentClick?: (segmentIndex: number | null) => void;
    className?: string;
    animate?: boolean;
    animation?: AnimationOptions;
}

export interface PieChartDetailsProps {
    segments: ChartSegment[];
    selectedSegment: number | null;
    defaultTitle?: string;
    defaultContent?: React.ReactNode;
    renderSegmentDetails?: (segment: ChartSegment) => React.ReactNode;
    className?: string;
    animate?: boolean;
    animation?: AnimationOptions;
}

export interface ChartDimensions {
    dpr: number;
    rect: DOMRect;
    centerX: number;
    centerY: number;
    radius: number;
    innerRadius: number;
    outerArcRadius: number;
}

export interface SegmentAnimationState {
    radiusOffset: number;
    angleOffset: number;
    opacity: number;
    rotation: number;
} 