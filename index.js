import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
app.use(bodyParser.json());

const checkAuth = (req, res, next) => {
    const { username } = req.body;
    if (loggedInUsers.includes(username)) {
        next();
    } else {
        res.status(403).json({ message: 'Unauthorized' });
    }
};

let books = [
    { isbn: '123', title: 'Call of the Wild', author: 'Author One', reviews: [{ review: "Good" }] },
    { isbn: '456', title: 'Children of the Lamp', author: 'Author Two', reviews: ["Gripping"] },
    { isbn: '459', title: 'City Lights', author: 'Author Three', reviews: ["Must Read", "Gripping Tale"] },
    { isbn: '452', title: 'Lucifer', author: 'Author Two', reviews: ["Must Read"] },
    { isbn: '356', title: 'Talking With God', author: 'Author One', reviews: ["Must Read"] },

];

let users = [];
let loggedInUsers = [];


app.get('/books', async (req, res) => {
    res.json(books);
});


app.get('/books/isbn/:isbn', async (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

app.get('/books/author/:author', async (req, res) => {
    const authorBooks = books.filter(b => b.author === req.params.author);
    res.json(authorBooks);
});


app.get('/books/title/:title', async (req, res) => {
    const titleBooks = books.filter(b => b.title === req.params.title);
    res.json(titleBooks);
});


app.get('/books/:isbn/reviews', async (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users.push({ username, password });
    res.status(201).json({ message: 'User registered successfully' });
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        loggedInUsers.push(username);
        res.json({ message: 'Login successful' });
    } else {
        res.status(400).json({ message: 'Invalid username or password' });
    }
});



app.post('/books/:isbn/reviews', checkAuth, async (req, res) => {
    const { isbn } = req.params;
    const { username, review } = req.body;
    const book = books.find(b => b.isbn === isbn);
    if (book) {
        const existingReview = book.reviews.find(r => r.username === username);
        if (existingReview) {
            existingReview.review = review;
        } else {
            book.reviews.push({ username, review });
        }
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

app.delete('/books/:isbn/reviews', checkAuth, async (req, res) => {
    const { isbn } = req.params;
    const { username } = req.body;
    const book = books.find(b => b.isbn === isbn);
    if (book) {
        book.reviews = book.reviews.filter(r => r.username !== username);
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});


app.get('/async-books', (req, res) => {
    (async () => {
        res.json(books);
    })();
});


app.get('/promise-books/isbn/:isbn', (req, res) => {
    new Promise((resolve, reject) => {
        const book = books.find(b => b.isbn === req.params.isbn);
        if (book) {
            resolve(book);
        } else {
            reject('Book not found');
        }
    })
        .then(book => res.json(book))
        .catch(err => res.status(404).json({ message: err }));
});


app.get('/async-books/author/:author', async (req, res) => {
    const authorBooks = books.filter(b => b.author === req.params.author);
    res.json(authorBooks);
});

app.get('/async-books/title/:title', async (req, res) => {
    const titleBooks = books.filter(b => b.title === req.params.title);
    res.json(titleBooks);
});





app.listen(3000, () => {
    console.log("Server listening on port 3000");
})
