import React from 'react'

const Spinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div
      className={`${sizeMap[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex justify-center items-center py-10">{spinner}</div>
}

export default Spinner
