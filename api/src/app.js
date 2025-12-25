const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

const app = express();



app.use (express.json());
app.use (express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.use((req, res, next) => {
    res.status(404).send('Ruta no encontrada');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

module.exports = app;