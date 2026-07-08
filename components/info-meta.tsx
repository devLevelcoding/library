interface InfoMetaProps {
  categoryName: string
  sizeName?: string
}

export function InfoMeta({ categoryName, sizeName }: InfoMetaProps) {
  return (
    <div className="flex flex-col gap-y-2 text-sm text-muted-foreground">
      <div className="flex gap-2">
        <span className="font-medium text-gray-700">Category:</span>
        <span>{categoryName}</span>
      </div>
      {sizeName && (
        <div className="flex gap-2">
          <span className="font-medium text-gray-700">Size:</span>
          <span>{sizeName}</span>
        </div>
      )}
    </div>
  )
}
