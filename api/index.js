require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const app = require('./src/app');

const ProductModel = require('./src/models/Product.model');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  try {
    const products = await ProductModel.find().lean();
    socket.emit('products', products);
  } catch (err) {
    console.error('Error enviando productos iniciales:', err.message);
    socket.emit('socketError', { action: 'init', message: err.message });
  }

  socket.on('newProduct', async (data) => {
    try {
      const title = String(data?.title || '').trim();
      const description = String(data?.description || '').trim();
      const code = String(data?.code || '').trim();

      const price = Number(data?.price);
      const stock = Number(data?.stock);
      const category = String(data?.category || '').trim();

      const statusRaw = data?.status;
      const status = statusRaw === undefined ? true : statusRaw === true || statusRaw === 'true';

      if (!title || !description || !code || !category || Number.isNaN(price) || Number.isNaN(stock)) {
        socket.emit('socketError', {
          action: 'newProduct',
          message: 'Datos inválidos: title/description/code/category obligatorios y price/stock numéricos.',
        });
        return;
      }

      await ProductModel.create({
        title,
        description,
        price,
        stock,
        category,
        status,
        thumbnails: [],
      });

      const products = await ProductModel.find().lean();
      io.emit('products', products);
    } catch (err) {
      console.error('Error newProduct:', err.message);
      socket.emit('socketError', { action: 'newProduct', message: err.message });
    }
  });

  socket.on('deleteProduct', async (pid) => {
    try {
      if (!pid) {
        socket.emit('socketError', {
          action: 'deleteProduct',
          message: 'Falta pid para eliminar.',
        });
        return;
      }

      await ProductModel.findByIdAndDelete(pid);

      const products = await ProductModel.find().lean();
      io.emit('products', products);
    } catch (err) {
      console.error('Error deleteProduct:', err.message);
      socket.emit('socketError', { action: 'deleteProduct', message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor (DB)', error);
    process.exit(1);
  }
})();