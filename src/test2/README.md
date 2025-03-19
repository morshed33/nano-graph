# Pie Chart Component Library

A flexible, interactive pie chart component library built with React and Canvas.

## Components

### PieChartContainer

The main component that combines all pie chart sub-components. It handles state management and coordination between components.

```tsx
import { PieChartContainer } from "@/test-2";

<PieChartContainer
  segments={segments}
  title="My Chart"
  showControls={true}
  legendPosition="right"
  onSegmentSelect={(segment) => console.log("Selected:", segment)}
/>;
```

#### Props

- `segments`: Array of chart segments (required)
- `title`: Chart title
- `defaultDetailsTitle`: Title displayed in center when no segment is selected
- `defaultDetailsContent`: Content displayed in center when no segment is selected
- `renderSegmentDetails`: Custom renderer for segment details
- `thickness`: Donut thickness (0-1)
- `outerArcThickness`: Highlighted arc thickness (0-1)
- `onSegmentSelect`: Callback when a segment is selected
- `className`: Additional CSS classes
- `legendPosition`: "right" | "bottom"
- `showControls`: Show thickness controls

### PieChart

The core chart component that renders the pie/donut chart using Canvas.

```tsx
import { PieChart } from "@/test-2";

<PieChart
  segments={segments}
  thickness={0.2}
  outerArcThickness={0.5}
  activeSegment={activeSegment}
  selectedSegment={selectedSegment}
  onSegmentHover={handleSegmentHover}
  onSegmentClick={handleSegmentClick}
/>;
```

### PieChartLegend

Renders the legend for the pie chart with interactive elements.

```tsx
import { PieChartLegend } from "@/test-2";

<PieChartLegend
  segments={segments}
  activeSegment={activeSegment}
  selectedSegment={selectedSegment}
  onSegmentHover={handleSegmentHover}
  onSegmentClick={handleSegmentClick}
/>;
```

### PieChartDetails

Displays details in the center of the pie chart.

```tsx
import { PieChartDetails } from "@/test-2";

<PieChartDetails
  segments={segments}
  selectedSegment={selectedSegment}
  defaultTitle="Overview"
  defaultContent={<p>Select a segment to see details</p>}
  renderSegmentDetails={(segment) => (
    <div>
      <h3>{segment.name}</h3>
      <p>{segment.percentage}%</p>
    </div>
  )}
/>;
```

## Example Usage

```tsx
import { PieChartContainer } from "@/test-2";

const segments = [
  { id: "segment1", name: "Segment 1", percentage: 30, color: "#F5A623" },
  { id: "segment2", name: "Segment 2", percentage: 40, color: "#F8D57E" },
  { id: "segment3", name: "Segment 3", percentage: 30, color: "#F7B955" },
];

export default function ChartDemo() {
  return (
    <div className="p-6">
      <PieChartContainer
        segments={segments}
        title="My Chart"
        showControls={true}
      />
    </div>
  );
}
```

## Types

### ChartSegment

```ts
interface ChartSegment {
  id: string | number;
  name: string;
  percentage: number;
  color: string;
  data?: Record<string, any>; // Additional data
}
```

## Features

- Interactive pie/donut chart with hover and click effects
- Customizable thickness for the donut chart
- Highlight effect for active/selected segments
- Detailed information display for selected segments
- Interactive legend that synchronizes with the chart
- Responsive design that works on all screen sizes
- TypeScript support with full type definitions
