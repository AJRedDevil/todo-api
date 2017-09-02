var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root');
})

// GET /todos
app.get('/todos', (req, res) => {
    var queryParams = req.query;
    var filteredTodos = todos;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, (todo) => {
            return todo.description.tolowerCase().indexOf(queryParams.q.tolowerCase()) > -1;
        })
    }
    
    res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (matchedTodo){
        res.json(matchedTodo);
    } else{
        res.status(400).send();
    }
        
});

// POST /todos
app.post('/todos', (req, res) => {
    const allowedKeys = ['description', 'completed'];
    var body =  _.pick(req.body, allowedKeys);

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || !body.description.trim()) {
        return res.status(400).send();
    }

    body.description = body.description.trim();
    body.id = todoNextId++;
    todos.push(body);

    res.json(body);
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

app.listen(PORT, () => {
    console.log('Express listening on PORT ' + PORT + '!');
});