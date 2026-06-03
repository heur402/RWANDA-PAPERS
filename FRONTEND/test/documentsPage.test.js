import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildDocumentsSearchParams,
  hasActiveDocumentFilters,
} from '../src/utils/documentsPage.js'

test('documents page stays in category mode when no filters are active', () => {
  assert.equal(hasActiveDocumentFilters({}), false)
  assert.equal(
    hasActiveDocumentFilters({ search: '', category: '', year: '', subject: '' }),
    false,
  )
})

test('search from the documents page activates filtered view state', () => {
  const params = buildDocumentsSearchParams({ search: 'biology' })

  assert.equal(params.get('search'), 'biology')
  assert.equal(params.get('page'), '1')
  assert.equal(
    hasActiveDocumentFilters({
      search: params.get('search') || '',
      category: params.get('category') || '',
      year: params.get('year') || '',
      subject: params.get('subject') || '',
    }),
    true,
  )
})

test('building filtered search params preserves additional filters', () => {
  const params = buildDocumentsSearchParams({
    search: 'chemistry',
    category: 'cat-123',
    year: '2024',
    subject: 'organic',
  })

  assert.deepEqual(
    Object.fromEntries(params.entries()),
    {
      search: 'chemistry',
      category: 'cat-123',
      year: '2024',
      subject: 'organic',
      page: '1',
    },
  )
})
