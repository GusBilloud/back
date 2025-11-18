const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const ProductsManager = require('./src/managers/ProductsManager');

const PORT = 3000;

const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

const productsManager = new ProductsManager();

io.on('connection', async(socket) => {
    console.log('Nuevo cliente conectado');

    const products = await productsManager.getAll();
    socket.emit('products', products);

    socket.on('new-product', async (productData) => {
        try{
            await productsManager.create(productData)
            const updated= await productsManager.getAll();
            io.emit('products', updated);
        } catch (error) { 
            console.error('Error al crear el producto:', error)
        }
    });    

    socket.on('deleteProduct', async (productId) => {
        try {
            await productsManager.delete(productId);
            const updated = await productsManager.getAll();
            io.emit('products', updated);
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});