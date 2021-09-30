import { Injectable } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { concatMap, exhaustMap, map, mergeMap } from 'rxjs/operators';
import { BooksService } from "../shared/services";
import { BooksPageActions, BooksApiActions } from "./actions";

@Injectable()
export class BooksApiEffects {
  constructor(private booksService: BooksService, private actions$: Actions) {}

  loadBooks$ = createEffect(() => // For easier debugging, it's a good idea to unwrap it to => { return this.actions$... }. You then get more meaningful errors, e.g. if you forget to import the map operator.
    this.actions$.pipe(
      ofType(BooksPageActions.enter),
      exhaustMap(() => // exhaustMap is a better fit here than mergeMap since we're dealing with a non-parameterized query
        this.booksService
          .all()
          .pipe(map(books => BooksApiActions.booksLoaded({ books })))
      )
    )
  );

  createBook$ = createEffect(() => // The variables (loadBooks$, createBook$ etc.) are not actually needed at runtime but they're useful when you write unit tests and want to test one effect in isolation from the others.
    this.actions$.pipe(
      ofType(BooksPageActions.createBook),
      concatMap(action =>
        this.booksService
          .create(action.book)
          .pipe(map(book => BooksApiActions.bookCreated({ book })))
      )
    )
  );

  updateBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksPageActions.updateBook),
      concatMap(({bookId, changes}) => // 'action' destructured for convenience
        this.booksService
          .update(bookId, changes)
          .pipe(map(book => BooksApiActions.bookUpdated({ book })))
      )
    )
  );

  deleteBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksPageActions.deleteBook),
      mergeMap(action =>
        this.booksService
          .delete(action.bookId)
          .pipe(
            map(() => BooksApiActions.bookDeleted({ bookId: action.bookId }))
          )
      )
    )
  );
}
