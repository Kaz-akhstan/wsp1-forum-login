const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')

const db = require('../utils/database');
const promisePool = db.promise();
const validator = require('validator');
const { response } = require('express');

router.get('/', async function (req, res, next) {
    const [posts] = await promisePool.query('SELECT rj28forum.*, rj28users.name FROM rj28forum JOIN rj28users ON rj28forum.AuthorId = rj28users.id ORDER BY createdAt DESC')
    const [tags] = await promisePool.query('SELECT DISTINCT tag FROM rj28forum')
    console.log(tags)
    res.render('index.njk', {
        posts: posts,
        title: 'Forum',
        index: true,
        tags: tags,
        user: req.session.user || 0
    })
})

router.get('/tag/:tag', async function (req, res) {
    const [posts] = await promisePool.query('SELECT rj28forum.*, rj28users.name FROM rj28forum JOIN rj28users ON rj28forum.AuthorId = rj28users.id WHERE tag = (?) ORDER BY createdAt DESC', [req.params.tag])
    const [tags] = await promisePool.query('SELECT DISTINCT tag FROM rj28forum')
    console.log(tags)
    res.render('index.njk', {
        posts: posts,
        title: 'Forum',
        index: true,
        tags: tags,
        user: req.session.user || 0
    })
})

router.get('/login', async function (req, res, next) {
    res.render('login.njk'), {
        title: 'Login',
        user: req.session.user || 0
    }
});

router.post('/login', async function (req, res, next) {
    const { username, password } = req.body;
    if (username === "" && password === "") {
        return res.send('Username is Required')
    }
    else if (username === "") {
        return res.send('Username is Required')
    }
    else if (password === "") {
        return res.send('Password is Required')
    }
    else {
        const [user] = await promisePool.query(`SELECT * FROM rj28users WHERE name = ?`, [username])
        console.log(user[0])
        if (user[0] !== undefined) {
            bcrypt.compare(password, user[0].password, function (err, result) {
                if (result === true) {
                    req.session.user = user[0]
                    return res.redirect('/')
                }
                else {
                    return res.send('Invalid username or password')
                }
            })
        }
        else {
            return res.send('Invalid username or password')
        }
    }
})

router.get('/profile', async function (req, res, next) {
    if (req.session.user) {
        res.render('profile.njk', {
            name: req.session.user.name,
            user: req.session.user || 0,
            posts: await promisePool.query(`SELECT * FROM rj28forum WHERE AuthorId = ?`, [req.session.user.id])
        })
    }
    else {
        return res.status(401).send('Access denied')
    }
})

router.post('/logout', async function (req, res, next) {
    if (req.session.user) {
        req.session.destroy()
        return res.redirect('/')
    }
    else {
        return res.status(401).send('Access denied')
    }
})

router.get('/register', async function (req, res, next) {
    res.render('register.njk', {
        user: req.session.user || 0
    })
})

router.post('/register', async function (req, res, next) {
    const { username, password, passwordConfirmation } = req.body;
    if (username === "" && password === "" && passwordConfirmation === "") {
        return res.send('Username is Required')
    }
    else if (username === "") {
        return res.send('Username is Required')
    }
    else if (password === "") {
        return res.send('Password is Required')
    }
    else if (passwordConfirmation === "") {
        return res.send('Passwords should match')
    }
    else if (password.length <= 8)
    {
        return res.send('Password must be 8 characters or longer')
    }

    if (validator.isAlphanumeric(username, 'sv-SE')) {
        if (password == passwordConfirmation) {
            bcrypt.hash(password, 10, async function (err, hash) {
                console.log(hash)
                const [rows] = await promisePool.query("SELECT * FROM rj28users WHERE name = ?", [username])
                console.log(rows[0])
                if (rows.length === 0) {
                    const [user] = await promisePool.query("INSERT INTO rj28users (name, password) VALUES (?, ?)", [username, hash])
                    const [sessionUser] = await promisePool.query(`SELECT * FROM rj28users WHERE name = ?`, [username])
                    req.session.user = sessionUser[0]
                    return res.redirect('/profile')
                }
                else {
                    return res.send('Username is already taken')
                }
            });
        }
        else {
            return res.send('Passwords do not match')
        }
    }
    else {
        return res.send('Username is not allowed')
    }
})

router.get('/new', async function (req, res, next) {
    const [users] = await promisePool.query("SELECT * FROM rj28users")
    const [tags] = await promisePool.query('SELECT DISTINCT tag FROM rj28forum')
    if (req.session.user) {
        res.render('new.njk', {
            title: 'Nytt inlägg',
            tags: tags,
            user: req.session.user || 0
        })
    }
    else {
        return res.status(401).send('Access denied')
    }
})

router.post('/new', async function (req, res, next) {
    const {tag, title, content } = req.body
    let errors = []
    if (!title || !content) errors.push("Title and content required")
    if (title && title.length > 80) errors.push("Title must be less than 80 characters")
    if (errors.length === 0) {
        const sanitize = (str) => {
            let temp = str.trim()
            temp = validator.stripLow(temp)
            temp = validator.escape(temp)
            return temp
        }
        if (title) sanitizedTitle = sanitize(title)
        if (content) sanitizedContent = sanitize(content)
        const [rows] = await promisePool.query("INSERT INTO rj28forum (AuthorId, title, content, tag) VALUES (?, ?, ?, ?)", [req.session.user.id, sanitizedTitle, sanitizedContent, tag])
        res.redirect('/')
    }
    else {
        res.send(errors)
    }
})

router.get('/post/:id', async function (req, res) {
    var loggedInOnPost = false
    console.log(req.params.id)
    const [rows] = await promisePool.query('SELECT rj28forum.*, rj28users.name AS username FROM rj28forum JOIN rj28users ON rj28forum.AuthorId = rj28users.id WHERE rj28forum.id = ?', [req.params.id])
    if(req.session.user) {
        if(req.session.user.name === rows[0].username) {
            loggedInOnPost = true
        }
    }
    res.render('post.njk', {
        post: rows[0],
        title: 'Forum',
        user: req.session.user || 0,
        loggedIn: loggedInOnPost
    });
})

router.post('/edit/:id', async function (req, res) {
    const { edit } = req.body
    const [rows] = await promisePool.query("UPDATE rj28forum SET content = ? WHERE id = ?", [edit, req.params.id])
    res.redirect('/')
})

router.get('/delete/:id', async function (req, res) {
    const [rows] = await promisePool.query("DELETE FROM rj28forum WHERE id = ?", [req.params.id])
    res.redirect('/')
})

router.post('/comment', async function (req, res)
{
    const { comment } = req.body
    res.send(comment)
})

router.get('/like/:id', async function (req, res) {
    console.log(req.params.id)
    const [rows] = await promisePool.query('UPDATE rj28forum SET likes = likes + 1 WHERE id = ?', [req.params.id])
    res.redirect('/')
})

module.exports = router;
