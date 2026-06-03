export const hasActiveDocumentFilters = ({
  search = '',
  category = '',
  year = '',
  subject = '',
} = {}) => Boolean(search || category || year || subject)

export const buildDocumentsSearchParams = (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.year) params.set('year', filters.year)
  if (filters.subject) params.set('subject', filters.subject)

  params.set('page', '1')
  return params
}
