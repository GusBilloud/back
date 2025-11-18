const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const ProductsManager = require ('./managers/ProductsManager');
const app = express();
const productsManager = new ProductsManager();


app.use (express.json());
app.use (express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.get('/', async (req, res) => {
    const products = await productsManager.getAll();
    res.render('home', { 
        title: 'Mate & Te Co.',
        message: 'Bienvenido a la API de Mate & Te Co.',
        description: 'API para la gestión de una tienda de mates y tés.',
        version: '1.0.0'
    });
});

app.get('/realTimeProducts', async (req, res) => {
    const products = await productsManager.getAll();
    res.render('realTimeProducts', { products });
});

module.exports = app;