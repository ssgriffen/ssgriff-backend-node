const blogRoutes = require('./blog_routes');
const userRoutes = require('./user_routes');
const mailRoutes = require('./mail_routes');

module.exports = function(app, db) {
    blogRoutes(app, db);
    userRoutes(app, db);
    mailRoutes(app, db);
}