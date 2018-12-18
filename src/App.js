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
          <BookGrid books={this.props.books} shelves={this.props.shelves} />
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
            <Book book={book} shelves={this.props.shelves} key={book.id} />
          ))
        }
      </ol>
    );
  }
}

class Book extends Component {
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
            <select>
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
            this.props.book.authors.reduce((authorStringList, authorName) => `${authorStringList}, ${authorName}`)
          }
         </div>
        </div>
      </li>
    );
  }
}

class BookSearch extends Component {
  render(){
    return (
      <div className="search-books">
        <div className="search-books-bar">
          <button className="close-search">Close</button>
          <div className="search-books-input-wrapper">
            {/*
              NOTES: The search from BooksAPI is limited to a particular set of search terms.
              You can find these search terms here:
              https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

              However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
              you don't find a specific author or title. Every search is limited by search terms.
            */}
            <input type="text" placeholder="Search by title or author"/>

          </div>
        </div>
        <div className="search-books-results">
          <ol className="books-grid"></ol>
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
  }

  state = { books: [] }

  componentDidMount() {
    BooksAPI.getAll()
      .then((books) => {
        this.setState({ books });
      });
  }

  getShelves() {
    const getPrettyShelfName = this.getPrettyShelfName;
    let shelves = this.state.books.reduce(function(acc, curr){
      acc[curr.shelf] ? acc[curr.shelf].books.push(curr) : acc[curr.shelf] = {books: [curr]};

      acc[curr.shelf].name = getPrettyShelfName(curr.shelf);
    	return acc;
    }, {});

    if(!shelves['none']){
      shelves['none'] = {
        books: [],
        name: 'None'
      };
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
      <BookShelves shelves={this.getShelves()} />
    );
  }

  renderSearch(){
    return (
      <BookSearch />
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
