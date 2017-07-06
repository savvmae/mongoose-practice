const mongoose = require('mongoose');
const express = require('express');
mongoose.Promise = require('bluebird');
const Book = require('./models/book');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');

const application = express();

application.engine('mustache', mustacheExpress());
application.set('views', './views');
application.set('view engine', 'mustache');

application.use(bodyParser.urlencoded());

//connects us to db
mongoose.connect('mongodb://localhost:27017/CollectionsApplication');

application.use('/public', express.static('./public'));

async function getBooks() {
    var books = await Book.find();
    return books;
};

application.get('/', async (request, response) => {
    var collections = await getBooks();

    var model = { books: collections}
    response.render('index', model);
});

application.get('/new-collection', (request, response) => {
    response.render('new-collection');
});

application.get('/edit-collection/:id', async (request, response) => {
    var bookId = request.params.id;
    var book = await Book.find({ _id: bookId });
    var model = { 
        result: book, 
        bookId: bookId
    };
    response.render('edit-collection', model);
});
application.get('/add-related/:id', async (request, response) => {
    var bookId = request.params.id;
    var book = await Book.find({ _id: bookId });
    var model = { result: book };
    response.render('add-related', model);
});

application.post('/new-collection', (request, response) => {
    var newBook = new Book({
        author: request.body.author,
        title: request.body.title,
        genre: request.body.genre,
        length: request.body.length
    })
    var related = { title: request.body.relatedTitle, author: request.body.relatedAuthor };
    newBook.relatedBooks.push(related);
    newBook.save();
    response.redirect('/');
});

application.post('/edit-collection/:id', async (request, response) => {
    var bookId = request.params.id;
    // bug in updating related books, will push all titles and authors to one object. help!
    // potentially have update button next to each related title input, add home button when done editting??
    await Book.findOneAndUpdate({ _id: bookId },
        {
            title: request.body.newTitle,
            author: request.body.newAuthor,
            length: request.body.newLength,
            genre: request.body.newGenre,
            relatedBooks: {
                title: request.body.newRelatedTitle,
                author: request.body.newRelatedAuthor
            }
        })
    response.redirect('/');
});

application.post('/edit-related/:bookId/:relatedId', async (request, response) => {
    var bookId = request.params.bookId;
    var relatedId = request.params.relatedId;
    // var related = { title: request.body.newRelatedTitle, author: request.body.newRelatedAuthor };

    var currentBook = await Book.findById(bookId);

    currentBook.relatedBooks.updateOne({_id: relatedId},
            {
                title: request.body.newRelatedTitle,
                author: request.body.newRelatedAuthor
            })

    // cannot perfrom updateone method on currentbook.relatedbooks
    response.redirect('/');
});

application.post('/delete/:id', async (request, response) => {
    var bookId = request.params.id;
    await Book.deleteOne({ _id: bookId });
    response.redirect('/');
});

application.post('/add-related/:id', async (request, response) => {
    var bookId = request.params.id;
    var relatedTitleObject = {"title": request.body.title, "author": request.body.author};
    await Book.findOneAndUpdate({ _id: bookId },
        {
            $push: {
                relatedBooks: relatedTitleObject
            }
        })
    response.redirect('/');
});

application.listen(3000);
