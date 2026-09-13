import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ScaledFrameProps = {
  src: string;
  title: string;
  width: number;
  height: number;
  className?: string;
  frameClassName?: string;
};

export function ScaledFrame({
  src,
  title,
  width,
  height,
  className,
  frameClassName,
}: ScaledFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const syncScale = () => {
      const next = host.clientWidth / width;
      setScale(next > 0 ? next : 1);
    };

    syncScale();
    const observer = new ResizeObserver(syncScale);
    observer.observe(host);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={hostRef}
      className={cn("relative w-full overflow-hidden bg-background", className)}
      style={{ height: Math.round(height * scale) }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 z-10 animate-pulse bg-muted/60"
          aria-hidden
        />
      )}
      <iframe
        src={src}
        title={title}
        className={cn("absolute left-0 top-0 border-0", frameClassName)}
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
