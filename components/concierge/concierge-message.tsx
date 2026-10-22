"use client"

import { Fragment, type ReactNode } from "react"
import { ConciergeBookCard } from "./concierge-book-card"
import type { ConciergeMessage } from "./use-concierge"

// The model writes light markdown (**bold**, lists). Rendered as React elements, never as HTML.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <b key={i}>{part.slice(2, -2)}</b>
      : <Fragment key={i}>{part}</Fragment>)
}

function Answer({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").filter(l => l.trim()).map((line, i) => {
        const item = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.*)$/)
        return item
          ? <p key={i} className="pl-3 -indent-3">• {inline(item[1])}</p>
          : <p key={i} className="mb-1">{inline(line.replace(/^#+\s*/, ""))}</p>
      })}
    </>
  )
}

export function ConciergeMessageView({ msg, onNavigate }: { msg: ConciergeMessage; onNavigate: () => void }) {
  if (msg.role === "user") {
    return <div className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl bg-black px-3 py-2 text-sm text-white">
      {msg.text}
    </div>
  }
  return (
    <div className={`max-w-[95%] rounded-2xl border px-3 py-2 text-sm ${msg.error ? "border-red-200 bg-red-50 text-red-700" : "bg-gray-50"}`}>
      {msg.status
        ? <span className="animate-pulse text-gray-500">{msg.status}...</span>
        : <Answer text={msg.text} />}
      {!!msg.books?.length && (
        <div className="mt-2 flex flex-col gap-2">
          {msg.books.map(b => <ConciergeBookCard key={b.id} book={b} onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
  )
}
