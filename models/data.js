const mongoose = require('mongoose')
        , Schema = mongoose.Schema;

const booksSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true},
    length: { type: Number, default: 1},
    relatedBooks: [{type: Schema.Types.ObjectId, ref: "RelatedBooks"}]

});

const Book = mongoose.model('Book', booksSchema);

const RelatedBooksSchema = new mongoose.Schema({

        title: {type: String, required: true}, 
        author: {type: String}, 
        
});

const RelatedBooks = mongoose.model('RelatedBooks', RelatedBooksSchema);

module.exports = {
    Books: Book,
    RelatedBooks: RelatedBooks
};