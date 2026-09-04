type GradientStop = {
  offset: string;
  color: string;
  opacity?: number;
};

type ChartLinearGradientProps = {
  id: string;
  direction?: "vertical" | "horizontal";
  stops: readonly GradientStop[];
};

export function ChartLinearGradient({
  id,
  direction = "vertical",
  stops,
}: ChartLinearGradientProps) {
  const horizontal = direction === "horizontal";

  return (
    <linearGradient
      id={id}
      x1="0"
      y1="0"
      x2={horizontal ? "1" : "0"}
      y2={horizontal ? "0" : "1"}
    >
      {stops.map((stop) => (
        <stop
          key={stop.offset}
          offset={stop.offset}
          stopColor={stop.color}
          {...(stop.opacity != null ? { stopOpacity: stop.opacity } : {})}
        />
      ))}
    </linearGradient>
  );
}
