const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const ProductsManager = require('./src/managers/ProductsManager');
const { parse } = require('path');

const PORT = 3000;

const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

const productsManager = new ProductsManager();

io.on('connection', async(socket) => {
    console.log('Nuevo cliente conectado');

    try {
        const products = await productsManager.getAll();
        socket.emit('products', products);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }

    socket.on('newProduct', async (productData) => {
        try{
            console.log('Nuevo producto recibido:', productData);
            await productsManager.create(productData)
            const updated= await productsManager.getAll();
            io.emit('products', updated);
        } catch (error) { 
            console.error('Error al crear el producto:', error)
        }
    });    

    socket.on('deleteProduct', async (productId) => {
        try {
            console.log('Eliminar producto con ID:', productId);
            const id = parseInt(productId, 10);
            await productsManager.delete(id);
            const updated = await productsManager.getAll();
            io.emit('products', updated);
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});