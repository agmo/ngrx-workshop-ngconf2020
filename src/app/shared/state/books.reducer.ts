import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { BookModel, calculateBooksGrossEarnings } from 'src/app/shared/models';
import { BooksPageActions, BooksApiActions } from 'src/app/books/actions';

// These methods modify the state in an immutable way:
const createBook = (books: BookModel[], book: BookModel) => [...books, book]; // Inserts a book into the collection in an immutable way. Using push() would mutate the previous state.
const updateBook = (books: BookModel[], changes: BookModel) =>
  books.map(book => {
    return book.id === changes.id ? Object.assign({}, book, changes) : book;
  });
const deleteBook = (books: BookModel[], bookId: string) =>
  books.filter(book => bookId !== book.id);

export interface State {
  collection: BookModel[];
  activeBookId: string | null;
}

export const initialState: State = {
  collection: [],
  activeBookId: null
};

const booksReducer = createReducer(
  initialState,
  on(
    BooksPageActions.enter,
    BooksPageActions.clearSelectedBook,
    state => {
      return {
        ...state,
        activeBookId: null
      };
    }),
  on(BooksPageActions.selectBook, (state, action) => {
    return {
      ...state,
      activeBookId: action.bookId
    };
  }),
  on(BooksApiActions.booksLoaded, (state, action) => {
    return {
      ...state,
      collection: action.books
    };
  }),
  on(BooksApiActions.bookCreated, (state, action) => {
    return {
      ...state,
      collection: createBook(state.collection, action.book),
      activeBookId: null
    };
  }),
  on(BooksApiActions.bookUpdated, (state, action) => {
    return {
      ...state,
      collection: updateBook(state.collection, action.book),
      activeBookId: null
    };
  }),
  on(BooksApiActions.bookDeleted, (state, action) => {
    return {
      ...state,
      collection: deleteBook(state.collection, action.bookId)
    };
  })
);

// An AOT-compatible wrapper function for non-Ivy versions of Angular:
export function reducer(state: State | undefined, action: Action) {
  return booksReducer(state, action);
}

/**
 * "Getter" Selectors (simple selectors that just return a property on state)
 */
export const selectAll = (state: State) => state.collection;
export const selectActiveBookId = (state: State) => state.activeBookId;

/**
 * Complex Selectors (merge multiple - up to 8 - inputs into a result)
 */
export const selectActiveBook = createSelector(
  selectAll,
  selectActiveBookId,
  (books, activeBookId) => books.find(book => book.id === activeBookId) || null
);

const selectEarningsTotals_unoptimized = (state: State) => {
  const books = selectAll(state);

  return calculateBooksGrossEarnings(books);
}

// This is the more optimised version because NgRx will only call the projector function if selectAll changes.
export const selectEarningsTotals = createSelector(
  selectAll,
  calculateBooksGrossEarnings // A shorthand for a projector function that takes in "books".
);
