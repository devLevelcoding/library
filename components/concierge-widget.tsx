"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { BookOpen, RotateCcw, Send, X } from "lucide-react"
import { ConciergeMessageView } from "./concierge/concierge-message"
import { CONCIERGE_URL, useConcierge } from "./concierge/use-concierge"

const SAMPLES = [
  "A gift for a 10-year-old who loves dragons, under $20",
  "Something like The Silent Patient",
  "What do I pay for 3 books with code SAVE10?",
]

export function ConciergeWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const { messages, busy, send, reset } = useConcierge()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }) }, [messages])
  if (!CONCIERGE_URL || pathname?.startsWith("/admin")) return null

  const ask = (text: string) => { setInput(""); send(text) }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-label="Open the book concierge"
              className="fixed bottom-20 right-5 z-50 flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-gray-800">
        <BookOpen size={18} /> Ask the concierge
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[min(620px,calc(100dvh-6rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <BookOpen size={18} />
        <div className="flex-1">
          <p className="text-sm font-semibold">Book concierge</p>
          <p className="text-xs text-gray-500">Tell me what you like, I&apos;ll find it on our shelves</p>
        </div>
        <button type="button" onClick={reset} aria-label="New conversation" className="p-1 text-gray-500 hover:text-black"><RotateCcw size={16} /></button>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 text-gray-500 hover:text-black"><X size={18} /></button>
      </div>

      <div ref={logRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="m-auto flex flex-col gap-2 text-center text-sm text-gray-500">
            <p>Ask for a gift, a mood, an author you love, or a price.</p>
            {SAMPLES.map(q => (
              <button key={q} type="button" onClick={() => ask(q)}
                      className="rounded-full border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">{q}</button>
            ))}
          </div>
        ) : messages.map((m, i) => <ConciergeMessageView key={i} msg={m} onNavigate={() => setOpen(false)} />)}
      </div>

      <form className="flex gap-2 border-t p-3" onSubmit={e => { e.preventDefault(); ask(input) }}>
        <input value={input} onChange={e => setInput(e.target.value)} maxLength={1000} disabled={busy}
               placeholder="What would you like to read?"
               className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:border-black" />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send"
                className="rounded-full bg-black p-2.5 text-white disabled:opacity-40"><Send size={16} /></button>
      </form>
    </div>
  )
}
