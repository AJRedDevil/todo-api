var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db');
var middleware = require('./middleware')(db);

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root');
})

// GET /todos
app.get('/todos', middleware.requireAuthentication, (req, res) => {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({where: where}).then((todos) => {
        res.json(todos);
    }, (e) => {
        res.status(500).send(e);
    });
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    db.todo.findById(todoId).then((todo) => {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(400).send();
        }
    }, (e) => {
        res.status(500).send(e);
    });   
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, (req, res) => {
    const allowedKeys = ['description', 'completed'];
    var body =  _.pick(req.body, allowedKeys);

    db.todo.create(body).then((todo) => {
        req.user.addTodo(todo).then(() => {
            return todo.reload(); // todo referenced is different; load latest
        }).then((todo) => {
            res.json(todo.toJSON());
        });
    }, (e) => {
        res.status(400).send(e);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, (req, res) => {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({where:{
        id: todoId
    }}).then((rowsDeleted) => {
        if (rowsDeleted === 0) {
            res.status(400).send({
                error: 'No todo with id'
            });
        } else {
            res.status(204).send();
        }
    }, () => {
        res.status(500).send();
    });
});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    const allowedKeys = ['description', 'completed'];
    var body =  _.pick(req.body, allowedKeys);
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description.trim();
    }

    db.todo.findById(todoId).then((todo) => {
        if (todo) {
            todo.update(attributes).then((todo) => {
                res.json(todo.toJSON());
            },(e) => {
                res.status(400).send(e);
            });
        } else {
            res.status(400).send();
        }
    }, () => {
        res.status(500).send();
    });
});

app.post('/users', (req, res) => {
    const allowedKeys = ['email', 'password'];
    var body =  _.pick(req.body, allowedKeys);

    db.user.create(body).then((user) => {
        res.json(user.toPublicJSON());
    },(e) => {
        res.status(400).json(e);
    });
});

// POST /users/login
app.post('/users/login', (req, res) => {
    const allowedKeys = ['email', 'password'];
    var body =  _.pick(req.body, allowedKeys);

    db.user.authenticate(body).then((user) => {
        var token = user.generateToken('authentication');
        if (token) {
            res.header('Auth', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }
    }, () => {
        res.status(401).send();
    })
});

db.sequelize.sync({force: true}).then(() => {
    app.listen(PORT, () => {
        console.log('Express listening on PORT ' + PORT + '!');
    });    
});
