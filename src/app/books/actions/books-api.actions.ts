import { createAction, props } from '@ngrx/store';
import { BookModel } from 'src/app/shared/models';

// For a production app, be sure to also add actions for failure.
export const booksLoaded = createAction(
  "[Books API] Books Loaded Success",
  props<{ books: BookModel[] }>()
);

export const bookCreated = createAction(
  "[Books API] Book Created Success",
  props<{ book: BookModel }>()
);

export const bookUpdated = createAction(
  "[Books API] Book Updated Success",
  props<{ book: BookModel }>()
);

export const bookDeleted = createAction(
  "[Books API] Book Deleted Success",
  props<{ bookId: string }>()
);
