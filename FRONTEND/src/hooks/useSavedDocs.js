import { useState, useEffect, useCallback } from 'react'

const KEY = 'rp_saved_docs'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] }
  catch { return [] }
}

const useSavedDocs = () => {
  const [saved, setSaved] = useState(load)

  // Keep other tabs in sync
  useEffect(() => {
    const handler = () => setSaved(load())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const save = useCallback((doc) => {
    setSaved((prev) => {
      if (prev.find((d) => d._id === doc._id)) return prev
      const next = [doc, ...prev].slice(0, 50) // cap at 50
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const unsave = useCallback((id) => {
    setSaved((prev) => {
      const next = prev.filter((d) => d._id !== id)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isSaved = useCallback((id) => saved.some((d) => d._id === id), [saved])

  return { saved, save, unsave, isSaved }
}

export default useSavedDocs
