interface ImageLoadingBarProps {
  settledCount: number
  totalImages: number
  progress: number
}

export function ImageLoadingBar({ settledCount, totalImages, progress }: ImageLoadingBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[300] h-[3px] bg-gray-200"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Images loading"
    >
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%`, boxShadow: "0 0 8px 0 hsl(var(--primary) / 0.7)" }}
      />
      <div className="absolute right-2 top-1 text-[10px] font-medium text-muted-foreground bg-background/80 px-1 rounded" aria-hidden="true">
        {settledCount} / {totalImages}
      </div>
    </div>
  )
}
