"use client"

import { useCallback, useRef, useState } from "react"

// The book concierge (devLevelcoding/book-concierge): a Python agent on Cloud Run that searches
// this shop's catalog by meaning. It only reads the shop's public API.
export const CONCIERGE_URL = (process.env.NEXT_PUBLIC_CONCIERGE_URL ?? "").replace(/\/$/, "")

export interface ConciergeBook {
  id: string
  title: string
  author: string | null
  price: number
  category: string
  image: string
  in_stock?: number
}

export interface ConciergeMessage {
  role: "user" | "model"
  text: string
  books?: ConciergeBook[]
  status?: string
  error?: boolean
}

const STATUS: Record<string, string> = {
  search_books: "Searching the shelves",
  book_details: "Checking the book",
  price_quote: "Working out the price",
  list_categories: "Looking at categories",
}

export function useConcierge() {
  const [messages, setMessages] = useState<ConciergeMessage[]>([])
  const [busy, setBusy] = useState(false)
  const log = useRef<ConciergeMessage[]>([])

  const patchLast = (patch: Partial<ConciergeMessage>) =>
    setMessages(ms => [...ms.slice(0, -1), { ...ms[ms.length - 1], ...patch }])

  const send = useCallback(async (text: string) => {
    const message = text.trim()
    if (!message || busy || !CONCIERGE_URL) return
    setBusy(true)
    const history = log.current.map(({ role, text }) => ({ role, text }))
    setMessages(ms => [...ms, { role: "user", text: message }, { role: "model", text: "", status: "Thinking" }])
    let answer = ""
    try {
      const res = await fetch(`${CONCIERGE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail ?? `The concierge answered ${res.status}`)
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split("\n\n")
        buffer = blocks.pop() ?? ""
        for (const block of blocks) {
          const data = block.split("\n").filter(l => l.startsWith("data: ")).map(l => l.slice(6)).join("\n")
          if (!data) continue
          const ev = JSON.parse(data)
          if (ev.type === "tool") patchLast({ status: STATUS[ev.name] ?? "Working" })
          else if (ev.type === "text") { answer = ev.text; patchLast({ text: answer, status: undefined }) }
          else if (ev.type === "books") patchLast({ books: ev.items })
          else if (ev.type === "error") throw new Error(ev.message)
        }
      }
      const turn: ConciergeMessage[] = [{ role: "user", text: message }, { role: "model", text: answer }]
      log.current = [...log.current, ...turn].slice(-10)
    } catch (e) {
      patchLast({ text: (e as Error).message, error: true, status: undefined })
    } finally {
      setBusy(false)
    }
  }, [busy])

  const reset = () => { log.current = []; setMessages([]) }

  return { messages, busy, send, reset }
}
