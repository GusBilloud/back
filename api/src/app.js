const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const ProductsManager = require ('./managers/ProductsManager');
const app = express();
const productsManager = new ProductsManager();


app.use (express.json());
app.use (express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.get('/', async (req, res) => {
    try{
        let products = await productsManager.getAll();
        products = products.sort((a, b) => a.producto.localeCompare(b.producto));
        res.render('home', { 
            title: 'Mate & Te Co.',
            message: 'Bienvenido a la API de Mate & Te Co.',
            description: 'API para la gestión de una tienda de mates y tés.',
            version: '1.0.0',
            products
        });
    } catch (error) {
        res.status(500).send('Error al cargar la página principal');
    }    
});

app.get('/realTimeProducts', async (req, res) => {
    try{
        const products = await productsManager.getAll();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).send('Error al cargar la página de productos en tiempo real');
    }    
});

app.use((req, res, next) => {
    res.status(404).send('Ruta no encontrada');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

module.exports = app;