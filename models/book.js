const mongoose = require('mongoose');

const booksSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true},
    length: { type: Number, default: 1},
    relatedBooks: [ {title: String, author: String}]

});

const Book = mongoose.model('Book', booksSchema);

module.exports = Book;