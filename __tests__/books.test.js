process.env.NODE_ENV = "test"

const db = require("../db");
const Book = require("../models/book");
const request = require("supertest")
const app = require("../app")

let book_data;

beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) 
         VALUES ('979-8749522310','https://amazon.com/book', 'Lewis Carroll', 'English', 101, 'Independently published', 'Alice in Wonderland', 1985) 
         RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`
    );
    book_data = result.rows[0];
});


describe("GET /books", () => {
    test("Gets a list of all books", async () => {
        const res = await request(app).get('/books');
        const books = res.body.books;
        expect(res.statusCode).toBe(200);
        expect(books).toHaveLength(1);
        expect(res.body).toEqual({
            books: [{
                'isbn': '979-8749522310',
                'amazon_url': 'https://amazon.com/book',
                'author': 'Lewis Carroll',
                'language': 'English',
                'pages': 101,
                'publisher': 'Independently published',
                'title': 'Alice in Wonderland',
                'year': 1985
            }]
        })
    })
})


describe("GET /books/:isbn", () => {
    test("Get a book by isbn", async () => {
        const res = await request(app).get(`/books/${book_data.isbn}`)
        expect(res.statusCode).toBe(200);
        expect(res.body.book.isbn).toEqual('979-8749522310');
    })
    test("Responds with 404 if couldn't find the book with isbn", async () => {
        const res = await request(app).get('/books/0987654321')
        expect(res.statusCode).toBe(404);
    })
})


describe("POST /books", () => {
    test("Add a new book to books table", async () => {
        const res = await request(app)
            .post('/books')
            .send({
                isbn: '978-0736432337',
                amazon_url: 'https://amazon.com/book2',
                author: 'RH Disney',
                language: 'English',
                pages: 64,
                publisher: 'Golden/Disney',
                title: 'Sleeping Beauty',
                year: 2019
            })
        expect(res.statusCode).toBe(201);
        expect(res.body.book.title).toBe('Sleeping Beauty');
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body).toEqual({
            "book": {
                'isbn': '978-0736432337',
                'amazon_url': 'https://amazon.com/book2',
                'author': 'RH Disney',
                'language': 'English',
                'pages': 64,
                'publisher': 'Golden/Disney',
                'title': 'Sleeping Beauty',
                'year': 2019
            }
        })
    })

    test("Prevents creation of book without required data", async () => {
        const res = await request(app)
            .post('/books')
            .send({ isbn: '1234567892' });
        expect(res.statusCode).toBe(400);
    })
})


describe("PUT /books/:isbn", () => {
    test("Update single book details", async () => {
        const res = await request(app)
            .put(`/books/${book_data.isbn}`)
            .send({
                amazon_url: "https://amazon.com/book3",
                author: "Sir John Tenniel",
                language: "English",
                pages: 101,
                publisher: "Independently published",
                title: "Alice in Wonderland",
                year: 2021
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.book.isbn).toEqual('979-8749522310');
        expect(res.body.book.year).toBe(2021);
    })

    test("Responds with 404 for invalid update", async () => {
        const res = await request(app)
            .put(`/books/12674277`);
        expect(res.statusCode).toBe(400);
    })
})


describe("DELETE /books/:isbn", () => {
    test("Delete a book with isbn", async () => {
        const res = await request(app)
            .delete(`/books/${book_data.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: 'Book deleted' });
    })
})


afterEach(async function () {
    await db.query("DELETE FROM books");
});


afterAll(async () => {
    await db.end();
})