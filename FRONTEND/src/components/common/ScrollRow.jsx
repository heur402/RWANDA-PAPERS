import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useScrollRow from '../../hooks/useScrollRow.js'

/**
 * Horizontal snap-scroll row with chevrons that only appear when needed.
 *
 * Usage:
 *   <ScrollRow>
 *     {items.map(item => (
 *       <div key={item.id} data-card className="flex-shrink-0 snap-start w-[48vw] sm:w-56">
 *         <Card item={item} />
 *       </div>
 *     ))}
 *   </ScrollRow>
 */
const ChevronBtn = ({ dir, visible, onClick }) => (
  <button
    onClick={onClick}
    aria-label={dir === -1 ? 'Scroll left' : 'Scroll right'}
    className={`absolute z-10 top-1/2 -translate-y-1/2
                w-8 h-8 bg-white shadow-md rounded-full
                flex items-center justify-center
                hover:bg-gray-50 transition-all duration-200
                ${dir === -1 ? 'left-0 -translate-x-4' : 'right-0 translate-x-4'}
                ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
  >
    {dir === -1
      ? <ChevronLeft  className="w-4 h-4 text-gray-600" />
      : <ChevronRight className="w-4 h-4 text-gray-600" />
    }
  </button>
)

const ScrollRow = ({ children, className = '' }) => {
  const { scrollRef, canLeft, canRight, scroll } = useScrollRow()

  return (
    <div className={`relative ${className}`}>
      <ChevronBtn dir={-1} visible={canLeft}  onClick={() => scroll(-1)} />

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      <ChevronBtn dir={1} visible={canRight} onClick={() => scroll(1)} />
    </div>
  )
}

export default ScrollRow
