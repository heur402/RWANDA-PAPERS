# RWANDA-PAPERS

Based on where the project stands, here's what I'd prioritize next:

Immediate (must-fix before launch)
1. Fix the download endpoint The preview uses cloudinaryId for the signed URL, but download currently redirects to document.fileUrl (which 401s). Same fix — use getSignedUrl(document.cloudinaryId, { attachment: true }) and redirect to that.

2. Handle old local documents Documents uploaded before Cloudinary have fileUrl: /uploads/filename.pdf and no cloudinaryId. The preview/download will fail for them. Either write a migration script to re-upload them to Cloudinary, or add a fallback in the controllers that serves from local disk if cloudinaryId is empty.

3. Seed the database Run node utils/seed.js to create default categories and the first admin account if not done yet.

Core missing features
4. Search not working on /documents category view When browsing by category (no filter), the CategorySection components each make their own API call but bypass the SearchBar. A search from the bar should switch to filtered view — this already works, just needs testing.

5. Document count on categories The getCategories API returns documentCount but it counts approved docs. If no docs are approved yet, all categories show 0. Once documents are approved, this should auto-populate.

6. Admin dashboard download now also 401s Since file links in AdminDocuments and AdminCategoryDocuments point to /api/documents/:id/preview, but those endpoints require status: 'approved' — pending documents can't be previewed by admin. The admin needs a separate preview endpoint that doesn't check status.

Polish & UX
7. Upload progress indicator Large PDFs can take 5–10s to upload to Cloudinary. A progress bar on the upload form would prevent users thinking it froze.

8. Error message when PDF preview fails The PdfViewer shows a generic error. Show a "Retry" button and a direct download link as fallback.

9. Mobile navbar search input missing On /upload, the search appears in the navbar on desktop (after scroll) but on mobile it only shows in the hamburger menu. Consider making it always visible on mobile for /upload.

10. Seed categories not showing If the DB was never seeded, /documents and the home page show nothing. Add a "no categories yet" state that guides admin to seed or create categories.

Before going live
11. Environment variables for production

Set CLOUDINARY_* vars on your hosting platform
Change JWT_SECRET to something strong
Set NODE_ENV=production
Update CORS origin from localhost:3000 to your production domain
12. Rate limiting Add express-rate-limit to the upload and login endpoints to prevent abuse.

13. Input sanitization The document title/description fields should be sanitized before storing (strip HTML tags) to prevent XSS if content is ever rendered as HTML.