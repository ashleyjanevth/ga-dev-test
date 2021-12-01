const config = require('./config');
const Koa = require('koa');
const app = new Koa();
const cors = require('@koa/cors')

app.use(cors())

// set up bookshelf + db
require('./bookshelf.js')();

// register routes
require('./routes.js')(app);

// start server
app.listen(config.port);