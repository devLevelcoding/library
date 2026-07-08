interface Tag { id: string; name: string; slug: string; color: string; group: string }

const TAG_GROUPS = ["Mood", "Audience", "Format", "Theme", "Length"]

interface TagGroupsProps {
  availableTags: Tag[]
  selectedTagIds: string[]
  onToggleTag: (id: string) => void
}

export function TagGroups({ availableTags, selectedTagIds, onToggleTag }: TagGroupsProps) {
  if (availableTags.length === 0) return null

  return (
    <div className="p-4 border-b">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Tags</p>
      <div className="space-y-3">
        {TAG_GROUPS.map(group => {
          const groupTags = availableTags.filter(t => t.group === group)
          if (groupTags.length === 0) return null
          return (
            <div key={group}>
              <p className="text-xs text-muted-foreground mb-1.5">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {groupTags.map(tag => {
                  const active = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => onToggleTag(tag.id)}
                      className="text-xs rounded-full px-2.5 py-1 border transition-all font-medium"
                      style={active
                        ? { backgroundColor: tag.color, borderColor: tag.color, color: "#fff" }
                        : { borderColor: tag.color, color: tag.color, backgroundColor: "transparent" }
                      }
                    >
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
