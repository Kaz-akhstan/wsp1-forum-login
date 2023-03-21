const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')

const db = require('../utils/database');
const promisePool = db.promise();

router.get('/', async function (req, res, next) {
    const [posts] = await promisePool.query('SELECT rj28forum.*, rj28users.name FROM rj28forum JOIN rj28users ON rj28forum.AuthorId = rj28users.id ORDER BY createdAt DESC')
    res.render('index.njk', {
        posts: posts,
        title: 'Forum',
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
        if(user[0] !== undefined)
        {
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
            user: req.session.user || 0
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
        user: req.session.user || 0})
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
})

router.get('/new', async function (req, res, next) {
    const [users] = await promisePool.query("SELECT * FROM rj28users")
    if(req.session.user) {
        res.render('new.njk', {
            title: 'Nytt inlägg',
            user: req.session.user || 0
        })
    }
    else {
        return res.status(401).send('Access denied')
    }
})

router.post('/new', async function (req, res, next){
    const { title, content } = req.body
    const [rows] = await promisePool.query("INSERT INTO rj28forum (AuthorId, title, content) VALUES (?, ?, ?)", [req.session.user.id, title, content])
    res.redirect('/')
})

router.get('/post/:id', async function (req, res) {
    console.log(req.params.id)
    const [rows] = await promisePool.query('SELECT rj28forum.*, rj28users.name AS username FROM rj28forum JOIN rj28users ON rj28forum.AuthorId = rj28users.id WHERE rj28forum.id = ?', [req.params.id])
    res.render('post.njk', {
        post: rows[0],
        title: 'Forum',
        user: req.session.user || 0
    });
})

router.get('/like/:id', async function (req, res) {
    if(req.session.user)
    {
        const [rows] = await promisePool.query('UPDATE rj28forum SET likes = likes + 1 WHERE id = ?', [req.params.id])
        res.redirect('/')
    }
    else {
        res.redirect('/')
    }
})

// async function like(id)
// {
//     console.log(id)
//     const [rows] = await promisePool.query('UPDATE rj28forum SET likes = likes + 1 WHERE id = ?', [id])
// }

module.exports = router;
