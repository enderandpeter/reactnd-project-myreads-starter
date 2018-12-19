import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import * as BooksAPI from './BooksAPI';
import './App.css';

class BookShelves extends Component {
  render() {
    return (
      <div className="list-books-content">
        <div>
        {
          Object.keys(this.props.shelves).map((shelf) => (
            <BookShelf
              key={shelf}
              shelf={this.props.shelves[shelf]}
              books={this.props.shelves[shelf].books}
              shelves={this.props.shelves}
              moveBookToShelf={this.props.moveBookToShelf}
            />
          ))
        }
        </div>
        <div className="open-search">
          <Link to="/search">Search for a book</Link>
        </div>
      </div>
    );
  }
}

class BookShelf extends Component {
  render() {
    return (
      <div className='bookshelf'>
        <h2 className="bookshelf-title">{this.props.shelf.name}</h2>
        <div className="bookshelf-books">
          <BookGrid
            books={this.props.books}
            shelves={this.props.shelves}
            moveBookToShelf={this.props.moveBookToShelf}
          />
        </div>
      </div>
    );
  }
}

class BookGrid extends Component {
  render() {
    return (
      <ol className='books-grid'>
        {
          this.props.books.map((book) => (
            <Book
              book={book}
              shelves={this.props.shelves}
              key={book.id}
              moveBookToShelf={this.props.moveBookToShelf}
            />
          ))
        }
      </ol>
    );
  }
}

class Book extends Component {
  constructor(props){
    super(props);
    this.moveBookToShelf = this.moveBookToShelf.bind(this);
  }
  moveBookToShelf(event){
    this.props.moveBookToShelf(
      this.props.book,
      event.target.options[event.target.selectedIndex].value
    );
  }
  render() {
    return (
      <li className='bookListItem'>
        <div className="book">
          <div className="book-top">
          <div
            className="book-cover"
            style={{
              width: 128,
              height: 193,
              backgroundImage: `url(${this.props.book.imageLinks.smallThumbnail})`
            }}
            ></div>
          <div className="book-shelf-changer">
            <select onChange={this.moveBookToShelf} value={this.props.searchGrid ? 'none' : this.props.book.shelf}>
              {
                Object.keys(this.props.shelves).reduce((optionArray, shelfId) => {
                  optionArray.push(
                    <option key={shelfId} value={shelfId}>
                      {this.props.shelves[shelfId].name}
                    </option>
                  );
                  return optionArray;
                }, [<option key="1-move" value="move" disabled>Move to...</option>])
              }
            </select>
           </div>
         </div>
         <div className="book-title">{this.props.book.title}</div>
         <div className="book-authors">
          {
            this.props.book.authors.reduce(
              (authorStringList, authorName) => `${authorStringList}, ${authorName}`
            )
          }
         </div>
        </div>
      </li>
    );
  }
}

class BookSearch extends Component {
  constructor(props){
    super(props);

    this.getSearchResults = this.getSearchResults.bind(this);
    this.getBooks = this.getBooks.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
  }

  state = { query: '' }

  componentDidMount() {
    this.setState((currentState) => ({query: this.props.query}));
  }

  getSearchResults(event){
    event.persist();
    this.setState((currentState) => {
      let query = event.target.value;
      this.props.getSearchResults(query);

      return { query };
    });
  }

  getBooks(event){
    this.props.getBooks(true);
  }

  render(){
    return (
      <div className="search-books">
        <div className="search-books-bar">
          <Link to='/' onClick={this.getBooks} className="close-search">Close</Link>
          <div className="search-books-input-wrapper">
            {/*
              NOTES: The search from BooksAPI is limited to a particular set of search terms.
              You can find these search terms here:
              https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

              However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
              you don't find a specific author or title. Every search is limited by search terms.
            */}
            <input type="text" onChange={this.getSearchResults} value={this.state.query} placeholder="Search by title or author"/>

          </div>
        </div>
        <div className="search-books-results">
          <ol className="books-grid"></ol>
        </div>
      </div>
    );
  }
}

class BookSearchGrid extends Component {
  componentDidMount(){
    this.props.setSearchState(true);
    this.props.getSearchResults(this.props.query);
  }

  render() {
    return (
      <div className='bookshelf'>
        <div className="bookshelf-books">
          <BookGrid
            books={this.props.books}
            shelves={this.props.shelves}
            moveBookToShelf={this.props.moveBookToShelf}
            searchGrid={true}
          />
        </div>
      </div>
    );
  }
}

class BooksApp extends Component {
  constructor(props){
    super(props);
    this.renderBookList = this.renderBookList.bind(this);
    this.renderSearch = this.renderSearch.bind(this);
    this.moveBookToShelf = this.moveBookToShelf.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
    this.getBooks = this.getBooks.bind(this);
    this.setSearchState = this.setSearchState.bind(this);
  }

  state = { books: [], query: '', searchActive: false }

  componentDidMount() {
    this.getBooks();
  }

  getBooks(deactivateSearch = false){
    this.setState((currentState) => {
      if(deactivateSearch || !currentState.searchActive){
        BooksAPI.getAll()
          .then((books) => {
            this.setState({ books });
          }
        );
      }

      return {
        searchActive: false
      };
    });
  }

  setSearchState(active) {
    this.setState(() => ({searchActive: active}));
  }

  moveBookToShelf(book, shelf){
    BooksAPI.update(book, shelf)
      .then((response) => {
        if(response[shelf].find((bookId) => (
          bookId === book.id
        )) !== undefined){
          // The book was successfully moved
          this.getBooks();
        }
      });
  }

  getSearchResults(query){
    this.setState((currentState) => {
      let booksWithShelves = [];
      BooksAPI.search(query)
        .then((searchResultBooks) => {
          let currentBooks = [];
          BooksAPI.getAll()
            .then((books) => {
              currentBooks = books;
          });

          if(query){
            booksWithShelves = searchResultBooks.map((searchResultBook) => {
              let currentBookInResults = currentBooks.find(
                (currentBook) => currentBook.id === searchResultBook.id
              );

              if(currentBookInResults){
                searchResultBook.shelf = currentBookInResults.shelf;
              }
              return searchResultBook;
            });
          }

          this.setState(() => ({
              query: query,
              searchActive: true,
              books: booksWithShelves
            }));
        });
    });

  }

  getShelves(addNone = false) {
    const getPrettyShelfName = this.getPrettyShelfName;
    let shelves = this.state.books.reduce(function(acc, curr){
      acc[curr.shelf] ? acc[curr.shelf].books.push(curr) : acc[curr.shelf] = {books: [curr]};

      acc[curr.shelf].name = getPrettyShelfName(curr.shelf ? curr.shelf : 'none');
    	return acc;
    }, {});

    if(addNone){
      if(!shelves['none']){
        shelves['none'] = {
          books: [],
          name: 'None'
        };
      }
    }
    return shelves;
  }

  getPrettyShelfName(shelf){
    return shelf.split(/(?=[A-Z])/)
      .map((word) => (
        word.charAt(0).toUpperCase() + word.substr(1)
      )).join(' ');
  }

  renderBookList() {
    return (
      <BookShelves
        shelves={this.getShelves()}
        moveBookToShelf={this.moveBookToShelf}
      />
    );
  }

  renderSearch(){
    return (
      <div>
        <BookSearch
          query={this.state.query}
          getBooks={this.getBooks}
          getSearchResults={this.getSearchResults}
        />
        <BookSearchGrid
          moveBookToShelf={this.moveBookToShelf}
          books={this.state.books}
          shelves={this.getShelves(true)}
          query={this.state.query}
          getSearchResults={this.getSearchResults}
          setSearchState={this.setSearchState}
        />
      </div>
    );
  }
  render() {
    return (
      <div className="books-app">
        <Route exact path='/' render={this.renderBookList} />
        <Route path='/search' render={this.renderSearch} />
      </div>
    );
  }
}

export default BooksApp;
