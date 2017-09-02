var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: 'Study Node JS',
    completed: false
},{
    id: 2,
    description: 'Clean room',
    completed: false
},{
    id: 3,
    description: 'Eat lunch',
    completed: true
}]

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
    var matchedTodo;
    todos.forEach((todo) => {
        if (todo.id === todoId) {
            matchedTodo = todo
        }
    });
    if (matchedTodo){
        res.json(matchedTodo);
    } else{
        res.status(400).send();
    }
        
});

app.listen(PORT, () => {
    console.log('Express listening on PORT ' + PORT + '!');
});