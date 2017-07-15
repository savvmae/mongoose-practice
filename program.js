const mongoose = require('mongoose');
const express = require('express');
mongoose.Promise = require('bluebird');
const data = require('./models/data');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');

const application = express();

application.engine('mustache', mustacheExpress());
application.set('views', './views');
application.set('view engine', 'mustache');

application.use(bodyParser.urlencoded());

mongoose.connect('mongodb://localhost:27017/CollectionsApplication');

application.use('/public', express.static('./public'));

application.get('/', async (request, response) => {
    var books = await data.Books.find()
        .populate("relatedBooks")
        .exec(function (err, result) {
        });
    var model = { books: books }
    response.render('index', model);
});

application.get('/new-collection', (request, response) => {
    response.render('new-collection');
});

application.get('/edit-collection/:id', async (request, response) => {
    var bookId = request.params.id;
    var book = await data.Books.find({ _id: bookId })
        .populate("relatedBooks")
        .exec(function (err, result) {
        });
    var model = {
        result: book,
        bookId: bookId
    };
    response.render('edit-collection', model);
});
application.get('/add-related/:id', async (request, response) => {
    var bookId = request.params.id;
    var book = await data.Books.find({ _id: bookId })
        .populate("relatedBooks")
        .exec(function (err, result) {
        });
    var model = { result: book }
    response.render('add-related', model);
});

application.post('/new-collection', async (request, response) => {
    var newBook = new data.Books({
        author: request.body.author,
        title: request.body.title,
        genre: request.body.genre,
        length: request.body.length
    })
    newBook.save();
    var book = await data.Books.find({ title: request.body.title });

    var related = new data.RelatedBooks({
        title: request.body.relatedTitle,
        author: request.body.relatedAuthor
    });
    related.save(function (err, data) {
        book[0].relatedBooks.push(data._id);
        book[0].save();
        response.redirect('/');
    });
});

application.post('/edit-collection/:id', async (request, response) => {
    var bookId = request.params.id;
    await data.Books.findOneAndUpdate({ _id: bookId },
        {
            title: request.body.newTitle,
            author: request.body.newAuthor,
            length: request.body.newLength,
            genre: request.body.newGenre
        })
    response.redirect('/');
});



application.post('/edit-related/:relatedId', async (request, response) => {
    var relatedId = request.params.relatedId;
    var related = await data.RelatedBooks.findOneAndUpdate({ _id: relatedId },
        {
            title: request.body.newRelatedTitle,
            author: request.body.newRelatedAuthor
        }
    );
    response.redirect('/');
});

application.post('/delete/:id', async (request, response) => {
    var bookId = request.params.id;
    await data.Books.deleteOne({ _id: bookId });
    response.redirect('/');
});

application.post('/add-related/:id', async (request, response) => {
    var bookId = request.params.id;
    var book = await data.Books.findOne({ _id: bookId });

    var related = await new data.RelatedBooks({
        title: request.body.title,
        author: request.body.author
    });
    related.save(async (err, data) => {
        book.relatedBooks.push(related._id);
        book.save();
        response.redirect('/');
    });
});

application.listen(3000);
