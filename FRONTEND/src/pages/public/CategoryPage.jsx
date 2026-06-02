import React from 'react'
import { useParams, Navigate } from 'react-router-dom'

const CategoryPage = () => {
  const { id } = useParams()
  return <Navigate to={`/documents?category=${id}`} replace />
}

export default CategoryPage
