interface PageBarProps {
  currentPage: number
  loadedPages: number
  totalPages: number
}

export function PageBar({ currentPage, loadedPages, totalPages }: PageBarProps) {
  const useDots = totalPages <= 15
  const progress = (currentPage + 1) / totalPages

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 select-none">
      <span className="text-xs font-medium text-muted-foreground bg-background/80 backdrop-blur px-1.5 py-0.5 rounded">
        {currentPage + 1} / {totalPages}
      </span>
      {useDots ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-200 ${
              i === currentPage ? "h-3 w-3 bg-gray-900" : i < loadedPages ? "h-2 w-2 bg-gray-400" : "h-2 w-2 bg-gray-200"
            }`} />
          ))}
        </div>
      ) : (
        <div className="relative w-1 h-48 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full bg-gray-300 transition-all duration-300"
            style={{ height: `${(loadedPages / totalPages) * 100}%` }} />
          <div className="absolute left-0 w-full h-1.5 bg-gray-900 rounded-full transition-all duration-300"
            style={{ top: `${progress * 100}%`, transform: "translateY(-50%)" }} />
        </div>
      )}
    </div>
  )
}
