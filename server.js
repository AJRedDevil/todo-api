var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root');
})

// GET /todos
app.get('/todos', (req, res) => {
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
app.get('/todos/:id', (req, res) => {
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
app.post('/todos', (req, res) => {
    const allowedKeys = ['description', 'completed'];
    var body =  _.pick(req.body, allowedKeys);

    db.todo.create(body).then((todo) => {
        res.json(todo.toJSON());
    }, (e) => {
        res.status(400).send(e);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (!matchedTodo) {
        res.status(404).send({"error": "no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }
});

// PUT /todos/:id
app.put('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    const allowedKeys = ['description', 'completed'];
    var body =  _.pick(req.body, allowedKeys);
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send({"error": "no todo found with that id"});
    }
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')){
        return res.status(400).send();
    } else {
        // Never provided atribute, no problem here
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description.trim();
    } else if (body.hasOwnProperty('description')){
        return res.status(400).send();
    } else {
        // Never provided atribute, no problem here
    }

    _.extend(matchedTodo, validAttributes); // objects in JS passed by reference
    res.json(matchedTodo);
});

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log('Express listening on PORT ' + PORT + '!');
    });    
});
