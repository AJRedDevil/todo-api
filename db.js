var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        'dialect': 'postgres',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo');
db.user = sequelize.import(__dirname + '/models/user');
db.token = sequelize.import(__dirname + '/models/token');
db.sequelize = sequelize;
db.Sequelize = sequelize;

// Association
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;