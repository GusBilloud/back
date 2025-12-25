const { Router } = require('express');
const ProductModel = require('../models/Product.model');
const CartModel = require('../models/Cart.model');

const router = Router();

router.get('/', async (req, res) => {
  try {
    let products = await ProductModel.find().lean();
    products = products.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    res.render('home', {
      title: 'Mate & Co.',
      message: 'Bienvenidos a la tienda de mates más completa',
      description: 'Encuentra una amplia variedad de mates, bombillas y accesorios para disfrutar de tu mate al máximo.',
      version: '1.0.0',
      products
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar la página principal');
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar la página de productos en tiempo real');
  }
});

router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query, cartId } = req.query;

    const filter = {};
    if (query) {
      if (query === 'true' || query === 'false') filter.status = query === 'true';
        else filter.category = query;
      }
    
    const options = {
      limit: Number(limit),
      page: Number(page),
      lean: true
    };

    if (sort === 'asc' || sort === 'desc') {
      options.sort = { price: sort === 'asc' ? 1 : -1 };
    }

    const result = await ProductModel.paginate(filter, options);

    res.render('index', {
      products: result.docs,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      limit,
      sort,
      query,
      cartId
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar productos');
  }
});

router.get('/products/:pid', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');

    res.render('productDetail', {product, cartId: req.query.cartId});
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar producto');
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate('products.product')
      .lean();

    if (!cart) return res.status(404).send('Carrito no encontrado');

    res.render('cart', { cart });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar carrito');
  }
});

module.exports = router;