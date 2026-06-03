const Document = require("../models/Document.model");
const Download = require("../models/Download.model");
const cloudinary = require("../config/cloudinary");

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Get a short-lived signed download URL for a Cloudinary raw resource.
 * Works even when the account has strict access mode enabled.
 */
function getSignedUrl(publicId, { attachment = false } = {}) {
  return cloudinary.utils.private_download_url(publicId, "pdf", {
    resource_type: "raw",
    type: "upload",
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    attachment,
  });
}

/**
 * Pipe a remote HTTPS URL through our server response.
 * Handles redirects and forwards content headers.
 */
function proxyUrl(remoteUrl, res, next, depth = 0) {
  if (depth > 5) return next(new Error("Too many redirects"));
  const https = require("https");
  const http = require("http");
  const get = remoteUrl.startsWith("https") ? https.get : http.get;

  get(
    remoteUrl,
    { headers: { "User-Agent": "Rwanda-Papers-Server/1.0" } },
    (upstream) => {
      if (
        upstream.statusCode >= 300 &&
        upstream.statusCode < 400 &&
        upstream.headers.location
      ) {
        upstream.resume();
        return proxyUrl(upstream.headers.location, res, next, depth + 1);
      }
      if (upstream.statusCode !== 200) {
        upstream.resume();
        return res
          .status(upstream.statusCode || 502)
          .json({
            success: false,
            message: "Could not fetch file from storage",
          });
      }

      res.setHeader(
        "Content-Type",
        upstream.headers["content-type"] || "application/pdf",
      );
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.setHeader("X-Download-Options", "noopen");
      res.setHeader("Accept-Ranges", "none");
      if (upstream.headers["content-length"]) {
        res.setHeader("Content-Length", upstream.headers["content-length"]);
      }
      upstream.pipe(res);
      upstream.on("error", next);
    },
  ).on("error", next);
}

// ── controllers ──────────────────────────────────────────────────────────────

// @desc    Get all approved documents (search + pagination)
// @route   GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const { search, category, subject, year, page = 1, limit = 12 } = req.query;
    const query = { status: "approved" };

    if (category) query.category = category;
    if (year) query.year = Number(year);
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: documents,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("category", "name description");

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }
    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

// @desc    Preview — proxies via signed Cloudinary URL (no CORS, no IDM, no 401)
// @route   GET /api/documents/:id/preview
const previewDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      status: "approved",
    });
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Generate a short-lived signed URL then proxy it through our server
    const signedUrl = getSignedUrl(document.cloudinaryId, {
      attachment: false,
    });
    proxyUrl(signedUrl, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Download — tracks count then redirects to Cloudinary for direct download
// @route   GET /api/documents/:id/download
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Track
    await Download.create({
      documentId: document._id,
      ipAddress: req.ip || "",
    });
    await Document.findByIdAndUpdate(document._id, { $inc: { downloads: 1 } });

    // Generate a short-lived signed download URL so private/raw assets work reliably.
    const signedUrl = getSignedUrl(document.cloudinaryId, { attachment: true });
    res.redirect(signedUrl);
  } catch (error) {
    next(error);
  }
};

// @desc    Featured (most downloaded)
// @route   GET /api/documents/featured
const getFeaturedDocuments = async (req, res, next) => {
  try {
    const featured = await Document.find({ status: "approved" })
      .populate("category", "name")
      .sort({ downloads: -1 })
      .limit(6);
    res.json({ success: true, data: featured });
  } catch (error) {
    next(error);
  }
};

// @desc    Latest uploads
// @route   GET /api/documents/latest
const getLatestDocuments = async (req, res, next) => {
  try {
    const latest = await Document.find({ status: "approved" })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(8);
    res.json({ success: true, data: latest });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getDocument,
  previewDocument,
  downloadDocument,
  getFeaturedDocuments,
  getLatestDocuments,
};
