import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Tracks whether a scroll container can scroll left/right.
 * Returns { scrollRef, canScrollLeft, canScrollRight, scroll }
 */
const useScrollRow = () => {
  const scrollRef      = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Initial check after a short paint delay
    const t = setTimeout(update, 100)
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // Re-check when children finish rendering (ResizeObserver)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      clearTimeout(t)
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [update])

  const scroll = useCallback((dir) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('[data-card]')
    const w = card?.offsetWidth || 200
    el.scrollBy({ left: dir * (w + 12), behavior: 'smooth' })
  }, [])

  return { scrollRef, canLeft, canRight, scroll }
}

export default useScrollRow
