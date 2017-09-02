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
    res.json(todos);
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

app.listen(PORT, () => {
    console.log('Express listening on PORT ' + PORT + '!');
});