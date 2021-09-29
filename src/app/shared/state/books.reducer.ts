import { Action, createReducer, on } from '@ngrx/store';
import { BookModel } from 'src/app/shared/models';
import { BooksPageActions } from 'src/app/books/actions';

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
  })
);

// An AOT-compatible wrapper function for non-Ivy versions of Angular:
export function reducer(state: State | undefined, action: Action) {
  return booksReducer(state, action);
}
