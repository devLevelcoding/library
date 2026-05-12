"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const prevPathname = useRef(pathname)
  const started = useRef(false)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  // complete bar when pathname changes (page rendered)
  useEffect(() => {
    if (pathname === prevPathname.current) return
    prevPathname.current = pathname
    if (!started.current) return

    clearTimers()
    setWidth(100)
    const t = setTimeout(() => {
      setVisible(false)
      setWidth(0)
      started.current = false
    }, 400)
    timers.current = [t]
  }, [pathname])

  // start bar on any internal link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a[href]")
      if (!link) return
      const href = link.getAttribute("href") ?? ""
      if (!href || href.startsWith("http") || href.startsWith("#") || href === pathname) return

      clearTimers()
      started.current = true
      setVisible(true)
      setWidth(0)

      const t1 = setTimeout(() => setWidth(15), 30)
      const t2 = setTimeout(() => setWidth(40), 300)
      const t3 = setTimeout(() => setWidth(65), 700)
      const t4 = setTimeout(() => setWidth(80), 1400)
      const t5 = setTimeout(() => setWidth(88), 2500)
      timers.current = [t1, t2, t3, t4, t5]
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 z-[200] h-[3px] bg-primary transition-[width] ease-out"
      style={{
        width: `${width}%`,
        transitionDuration: width === 100 ? "200ms" : "400ms",
        boxShadow: "0 0 8px 0 hsl(var(--primary) / 0.6)",
      }}
    />
  )
}
