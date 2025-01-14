import { Component, OnInit } from '@angular/core';
import { BookModel, BookRequiredProps } from 'src/app/shared/models';
import { Store } from '@ngrx/store';
import { BooksPageActions } from '../../actions/';
import { selectActiveBook, selectAllBooks, selectBooksEarningsTotals, State } from '../../../shared/state';
import { Observable } from 'rxjs';

@Component({
  selector: "app-books",
  templateUrl: "./books-page.component.html",
  styleUrls: ["./books-page.component.css"]
})
export class BooksPageComponent implements OnInit {
  books$: Observable<BookModel[]>; // All three could also be declared here and not in the constructor: books$ = store.select(selectAllBooks) (type is going to be inferred)
  currentBook$: Observable<BookModel | null | undefined>;
  total$: Observable<number>;

  constructor(private store: Store<State>) {
    // Functionally, there is no difference between declaring these here or in ngOnInit, except that by declaring them here you can avoid using the ngOnInit hook.
    this.books$ = store.select(selectAllBooks);
    this.currentBook$ = store.select(selectActiveBook);
    this.total$ = store.select(selectBooksEarningsTotals);
  }

  ngOnInit() {
    this.store.dispatch(BooksPageActions.enter());
    this.removeSelectedBook();
  }

  onSelect(book: BookModel) {
    this.store.dispatch(BooksPageActions.selectBook({bookId: book.id}))
  }

  onCancel() {
    this.removeSelectedBook();
  }

  removeSelectedBook() {
    this.store.dispatch(BooksPageActions.clearSelectedBook());
  }

  onSave(book: BookRequiredProps | BookModel) {
    if ("id" in book) {
      this.updateBook(book);
    } else {
      this.saveBook(book);
    }
  }

  saveBook(bookProps: BookRequiredProps) {
    this.store.dispatch(BooksPageActions.createBook({book: bookProps}))
  }

  updateBook(book: BookModel) {
    this.store.dispatch(BooksPageActions.updateBook({bookId: book.id, changes: book}));
  }

  onDelete(book: BookModel) {
    this.store.dispatch(BooksPageActions.deleteBook({bookId: book.id}));
  }
}
