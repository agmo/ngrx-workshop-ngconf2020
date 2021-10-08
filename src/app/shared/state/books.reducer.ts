import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { BookModel, calculateBooksGrossEarnings } from 'src/app/shared/models';
import { BooksPageActions, BooksApiActions } from 'src/app/books/actions';

export interface State extends EntityState<BookModel>{
  activeBookId: string | null;
}

// Out-of the box the entity adapter uses the "id" property. To specify a different key, e.g. "name",
// pass in a config object:
// { selectId: (model: BookModel) => model.name }
const adapter = createEntityAdapter<BookModel>(); // Unsorted adapter. Use sortComparer on the config object to have items sorted as they're inserted.

export const initialState: State = adapter.getInitialState({
  activeBookId: null
});

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
    return adapter.setAll(action.books, state);
  }),
  on(BooksApiActions.bookCreated, (state, action) => {
    return adapter.addOne(action.book, {
      ...state,
      activeBookId: null
    });
  }),
  on(BooksApiActions.bookUpdated, (state, action) => {
    return adapter.updateOne({id: action.book.id, changes: action.book}, {
      ...state,
      activeBookId: null
    });
  }),
  on(BooksApiActions.bookDeleted, (state, action) => {
    return adapter.removeOne(action.bookId, state);
  })
);

// An AOT-compatible wrapper function for non-Ivy versions of Angular:
export function reducer(state: State | undefined, action: Action) {
  return booksReducer(state, action);
}

/**
 * "Getter" Selectors (simple selectors that just return a property on state)
 */
export const { selectAll, selectEntities } = adapter.getSelectors();
export const selectActiveBookId = (state: State) => state.activeBookId;

/**
 * Complex Selectors (merge multiple - up to 8 - inputs into a result)
 */
export const selectActiveBook = createSelector(
  selectEntities,
  selectActiveBookId,
  (entities, activeBookId) => activeBookId ? entities[activeBookId] : null
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
