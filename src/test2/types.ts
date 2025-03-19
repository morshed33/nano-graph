export interface ChartSegment {
    id: string | number;
    name: string;
    percentage: number;
    color: string;
    data?: Record<string, any>; // Additional data for the segment
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
}

export interface PieChartLegendProps {
    segments: ChartSegment[];
    activeSegment?: number | null;
    selectedSegment?: number | null;
    onSegmentHover?: (segmentIndex: number | null) => void;
    onSegmentClick?: (segmentIndex: number | null) => void;
    className?: string;
}

export interface PieChartDetailsProps {
    segments: ChartSegment[];
    selectedSegment: number | null;
    defaultTitle?: string;
    defaultContent?: React.ReactNode;
    renderSegmentDetails?: (segment: ChartSegment) => React.ReactNode;
    className?: string;
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