import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileSearch,
  ArrowRight,
  GraduationCap,
  School,
  Wrench,
  BookOpen,
  ClipboardList,
  BookMarked,
  PenTool,
  Layers,
  FlaskConical,
  FileText,
} from "lucide-react";
import { getDocuments } from "../../api/documents.js";
import { getCategories } from "../../api/categories.js";
import DocumentCard from "../../components/documents/DocumentCard.jsx";
import SearchBar from "../../components/documents/SearchBar.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import ScrollRow from "../../components/common/ScrollRow.jsx";
import {
  buildDocumentsSearchParams,
  hasActiveDocumentFilters,
} from "../../utils/documentsPage.js";

const categoryIcons = {
  "Primary School": School,
  "Secondary School": GraduationCap,
  TVET: Wrench,
  University: BookOpen,
  "National Exams": ClipboardList,
  Notes: BookMarked,
  Assignments: PenTool,
  Modules: Layers,
  "Research Papers": FlaskConical,
};
const categoryColors = [
  "bg-blue-50 text-blue-600",
  "bg-green-50 text-green-600",
  "bg-purple-50 text-purple-600",
  "bg-orange-50 text-orange-600",
  "bg-red-50 text-red-600",
  "bg-cyan-50 text-cyan-600",
  "bg-pink-50 text-pink-600",
  "bg-indigo-50 text-indigo-600",
  "bg-yellow-50 text-yellow-600",
];

// ── One category section with smart-chevron scroll row ───────────────────────
const CategorySection = ({ category, colorClass, onFilterCategory }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const Icon = categoryIcons[category.name] || FileText;

  useEffect(() => {
    getDocuments({ category: category._id, limit: 20, page: 1 })
      .then((r) => setDocs(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category._id]);

  if (!loading && docs.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onFilterCategory(category._id)}
          className="flex items-center gap-3 group"
        >
          <div
            className={`w-9 h-9 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h2>
            {!loading && (
              <p className="text-xs text-gray-400">
                {docs.length}
                {docs.length === 20 ? "+" : ""} document
                {docs.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </button>
        <button
          onClick={() => onFilterCategory(category._id)}
          className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700 flex-shrink-0"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-400 rounded-full animate-spin" />
        </div>
      ) : (
        <ScrollRow>
          {docs.map((doc) => (
            <div
              key={doc._id}
              data-card
              className="flex-shrink-0 snap-start w-[48vw] sm:w-52 md:w-56 lg:w-60"
            >
              <DocumentCard document={doc} />
            </div>
          ))}
        </ScrollRow>
      )}
    </section>
  );
};

// ── Flat filtered results ─────────────────────────────────────────────────────
const FilteredView = ({
  documents,
  loading,
  error,
  pagination,
  onPageChange,
}) => {
  if (loading) return <Spinner />;
  if (error)
    return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!documents.length)
    return (
      <div className="text-center py-20">
        <FileSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No documents found
        </h3>
        <p className="text-gray-500">Try adjusting your search or filters.</p>
      </div>
    );
  return (
    <>
      {/* Mobile smart-scroll */}
      <div className="sm:hidden mb-6">
        <ScrollRow>
          {documents.map((doc) => (
            <div
              key={doc._id}
              data-card
              className="flex-shrink-0 w-[48vw] snap-start"
            >
              <DocumentCard document={doc} />
            </div>
          ))}
        </ScrollRow>
      </div>
      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {documents.map((doc) => (
          <DocumentCard key={doc._id} document={doc} />
        ))}
      </div>
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={onPageChange}
      />
    </>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";
  const yearFilter = searchParams.get("year") || "";
  const subjectFilter = searchParams.get("subject") || "";
  const hasFilter = hasActiveDocumentFilters({
    search: searchQuery,
    category: categoryFilter,
    year: yearFilter,
    subject: subjectFilter,
  });

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasFilter) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: currentPage, limit: 12 };
        if (searchQuery) params.search = searchQuery;
        if (categoryFilter) params.category = categoryFilter;
        if (yearFilter) params.year = yearFilter;
        if (subjectFilter) params.subject = subjectFilter;
        const { data } = await getDocuments(params);
        setDocuments(data.data);
        setPagination(data.pagination);
      } catch {
        setError("Failed to load documents. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [
    currentPage,
    searchQuery,
    categoryFilter,
    yearFilter,
    subjectFilter,
    hasFilter,
  ]);

  const handleSearch = useCallback(
    (filters) => {
      setSearchParams(buildDocumentsSearchParams(filters));
    },
    [setSearchParams],
  );

  const handlePageChange = (page) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", page);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterCategory = (catId) => {
    const p = new URLSearchParams();
    p.set("category", catId);
    p.set("page", "1");
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCategory = categories.find((c) => c._id === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {activeCategory ? activeCategory.name : "Documents"}
        </h1>
        <p className="text-gray-500 text-sm">
          {hasFilter
            ? loading
              ? "Loading..."
              : `${pagination.total.toLocaleString()} document${pagination.total !== 1 ? "s" : ""} found`
            : "Browse by category below"}
        </p>
      </div>

      <div className="mb-10">
        <SearchBar
          onSearch={handleSearch}
          categories={categories}
          initialValues={{
            search: searchQuery,
            category: categoryFilter,
            year: yearFilter,
            subject: subjectFilter,
          }}
        />
      </div>

      {hasFilter ? (
        <FilteredView
          documents={documents}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      ) : categories.length === 0 ? (
        <Spinner />
      ) : (
        categories.map((cat, idx) => (
          <CategorySection
            key={cat._id}
            category={cat}
            colorClass={categoryColors[idx % categoryColors.length]}
            onFilterCategory={handleFilterCategory}
          />
        ))
      )}
    </div>
  );
};

export default DocumentsPage;
