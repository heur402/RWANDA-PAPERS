const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const controllerPath = path.resolve(__dirname, '../controllers/document.controller.js')
const documentModelPath = path.resolve(__dirname, '../models/Document.model.js')
const downloadModelPath = path.resolve(__dirname, '../models/Download.model.js')
const cloudinaryPath = path.resolve(__dirname, '../config/cloudinary.js')

const loadController = ({ documentModel, downloadModel, cloudinary }) => {
  delete require.cache[controllerPath]

  require.cache[documentModelPath] = {
    id: documentModelPath,
    filename: documentModelPath,
    loaded: true,
    exports: documentModel,
  }
  require.cache[downloadModelPath] = {
    id: downloadModelPath,
    filename: downloadModelPath,
    loaded: true,
    exports: downloadModel,
  }
  require.cache[cloudinaryPath] = {
    id: cloudinaryPath,
    filename: cloudinaryPath,
    loaded: true,
    exports: cloudinary,
  }

  return require(controllerPath)
}

test('downloadDocument redirects to a signed Cloudinary attachment URL', async () => {
  const calls = { privateDownloadUrl: [], downloadCreate: [], updates: [] }
  const document = {
    _id: 'doc-1',
    cloudinaryId: 'papers/doc-1',
    fileUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/papers/doc-1.pdf',
  }

  const Document = {
    findOne: async (query) => {
      assert.deepEqual(query, { _id: 'doc-1', status: 'approved' })
      return document
    },
    findByIdAndUpdate: async (id, update) => {
      calls.updates.push({ id, update })
    },
  }

  const Download = {
    create: async (payload) => {
      calls.downloadCreate.push(payload)
    },
  }

  const cloudinary = {
    utils: {
      private_download_url: (publicId, format, options) => {
        calls.privateDownloadUrl.push({ publicId, format, options })
        return 'https://signed.example.com/download-url'
      },
    },
  }

  const { downloadDocument } = loadController({
    documentModel: Document,
    downloadModel: Download,
    cloudinary,
  })

  const req = { params: { id: 'doc-1' }, ip: '127.0.0.1' }
  const res = {
    redirectUrl: null,
    redirect(url) {
      this.redirectUrl = url
    },
  }

  let forwardedError = null
  await downloadDocument(req, res, (error) => {
    forwardedError = error
  })

  assert.equal(forwardedError, null)
  assert.equal(res.redirectUrl, 'https://signed.example.com/download-url')
  assert.deepEqual(calls.downloadCreate, [
    { documentId: 'doc-1', ipAddress: '127.0.0.1' },
  ])
  assert.deepEqual(calls.updates, [
    { id: 'doc-1', update: { $inc: { downloads: 1 } } },
  ])
  assert.equal(calls.privateDownloadUrl.length, 1)
  assert.equal(calls.privateDownloadUrl[0].publicId, 'papers/doc-1')
  assert.equal(calls.privateDownloadUrl[0].format, 'pdf')
  assert.equal(calls.privateDownloadUrl[0].options.resource_type, 'raw')
  assert.equal(calls.privateDownloadUrl[0].options.type, 'upload')
  assert.equal(calls.privateDownloadUrl[0].options.attachment, true)
  assert.ok(Number.isInteger(calls.privateDownloadUrl[0].options.expires_at))
})

test('downloadDocument returns 404 when the document does not exist', async () => {
  const Document = {
    findOne: async () => null,
    findByIdAndUpdate: async () => {
      throw new Error('should not update download count')
    },
  }
  const Download = {
    create: async () => {
      throw new Error('should not create download record')
    },
  }
  const cloudinary = {
    utils: {
      private_download_url: () => {
        throw new Error('should not sign URL for missing document')
      },
    },
  }

  const { downloadDocument } = loadController({
    documentModel: Document,
    downloadModel: Download,
    cloudinary,
  })

  const req = { params: { id: 'missing-doc' }, ip: '127.0.0.1' }
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }

  let forwardedError = null
  await downloadDocument(req, res, (error) => {
    forwardedError = error
  })

  assert.equal(forwardedError, null)
  assert.equal(res.statusCode, 404)
  assert.deepEqual(res.body, {
    success: false,
    message: 'Document not found',
  })
})
