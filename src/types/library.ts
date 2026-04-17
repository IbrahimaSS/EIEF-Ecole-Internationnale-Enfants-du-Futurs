// Types pour la bibliothèque (Resources et Books)

export interface Resource {
  id: string;
  title: string;
  type: string;
  fileUrl: string | null;
  classId: string | null;
  className: string | null;
  uploadedByName: string;
  createdAt: string;
}

export interface ResourceRequest {
  title: string;
  type: string;
  fileUrl?: string;
  classId?: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string | null;
  totalCopies: number;
  availableCopies: number;
}

export interface BookRequest {
  title: string;
  isbn: string;
  author?: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  fineAmount: number | null;
  status: string;
}

// Types pour les filtres
export interface ResourceFilters {
  type?: string;
  classId?: string;
  search?: string;
}