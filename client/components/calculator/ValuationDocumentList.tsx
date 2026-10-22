"use client";

import { useState } from "react";
import { Trash2, Download, Eye, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useValuationDocuments, useDeleteValuationDocument } from "@/app/hooks/useValuations";
import { formatFileSize, formatDocumentDate, type ValuationDocument } from "@/app/services/valuations";

interface ValuationDocumentListProps {
  onViewDocument?: (doc: ValuationDocument) => void;
  onDownloadDocument?: (doc: ValuationDocument) => void;
  onEditDocument?: (doc: ValuationDocument) => void;
  retailValuationEnabled?: boolean;
  retailValuationDocumentId?: string | null;
}

export function ValuationDocumentList({ onViewDocument, onDownloadDocument, onEditDocument, retailValuationEnabled, retailValuationDocumentId }: ValuationDocumentListProps) {
  const pageSize = 10;
  const { data: documents, isLoading, error } = useValuationDocuments();
  const deleteDocument = useDeleteValuationDocument();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ValuationDocument | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleDeleteClick = (doc: ValuationDocument) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    setDeletingId(documentToDelete.id);
    try {
      await deleteDocument.mutateAsync(documentToDelete.id);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Failed to load documents</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No valuation documents yet</p>
        <p className="text-sm mt-1">Complete the steps above to generate your first document</p>
      </div>
    );
  }

  const pageCount = Math.ceil(documents.length / pageSize);
  const page = Math.min(currentPage, pageCount);
  const visibleDocuments = documents.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="space-y-3">
        {visibleDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{doc.companyName} valuation document</h4>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>PDF</span>
                {doc.fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{formatDocumentDate(doc.createdAt)}</p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {doc.inputData && onEditDocument && (!retailValuationEnabled || doc.id === retailValuationDocumentId) && <Button variant="outline" size="sm" onClick={() => onEditDocument(doc)}>Correct valuation</Button>}
              <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(doc)} disabled={deletingId === doc.id} className="text-gray-400 hover:text-red-500">
                {deletingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>

              {doc.fileUrl && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => onDownloadDocument?.(doc)} className="text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => onViewDocument?.(doc)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View document
                  </Button>
                </>
              )}

              {!doc.fileUrl && <span className="text-xs text-gray-400 italic">PDF not stored</span>}
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <nav className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-label="Previous valuations pagination">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Previous page"
            onClick={() => setCurrentPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === page ? "default" : "outline"}
              size="sm"
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
              onClick={() => setCurrentPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Next page"
            onClick={() => setCurrentPage(page + 1)}
            disabled={page === pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm text-gray-500">{documents.length} valuations</span>
        </nav>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete valuation document?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the valuation document for {documentToDelete?.companyName}. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
