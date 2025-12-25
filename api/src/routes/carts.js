const { Router } = require('express');
const mongoose = require('mongoose');
const CartModel = require('../models/Cart.model');
const ProductModel = require('../models/Product.model');

const router = Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/', async (req, res) => {
  try {
    const cart = await CartModel.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error al crear carrito', error);
    res.status(500).json({ status: 'error', error: 'Error al crear carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    if (!isValidObjectId(cid)) {
      return res.status(400).json({ status: 'error', error: 'ID de carrito inválido' });
    }

    const cart = await CartModel.findById(cid).populate('products.product').lean();

    if (!cart) {
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    }

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error al obtener carrito', error);
    res.status(500).json({ status: 'error', error: 'Error al obtener carrito' });
  }
});

router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({ status: 'error', error: 'ID inválido' });
    }

    const [cart, product] = await Promise.all([
      CartModel.findById(cid),
      ProductModel.findById(pid)
    ]);

    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });

    const itemIndex = cart.products.findIndex((p) => String(p.product) === String(pid));

    if (itemIndex >= 0) {
      cart.products[itemIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    const populate = await CartModel.findById(cart._id).populate('products.product').lean();

    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error al agregar producto al carrito', error);
    res.status(500).json({ status: 'error', error: 'Error al agregar producto' });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ status: 'error', error: 'ID de carrito inválido' });
    }

    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', error: 'Body inválido: products debe ser un array' });
    }

    for (const item of products) {
      if (!item?.product || !isValidObjectId(item.product)) {
        return res.status(400).json({ status: 'error', error: 'Hay products con productId inválido' });
      }
      if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity < 1)) {
        return res.status(400).json({ status: 'error', error: 'Hay products con quantity inválida' });
      }
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    cart.products = products.map((p) => ({
      product: p.product,
      quantity: p.quantity ?? 1
    }));

    await cart.save();
    const populated = await CartModel.findById(cart._id).populate('products.product').lean();

    res.json({ status: 'success', payload: populated });
  } catch (error) {
    console.error('Error al actualizar carrito', error);
    res.status(500).json({ status: 'error', error: 'Error al actualizar carrito' });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({ status: 'error', error: 'ID inválido' });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ status: 'error', error: 'quantity debe ser un número >= 1' });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const itemIndex = cart.products.findIndex((p) => String(p.product) === String(pid));
    if (itemIndex < 0) return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });

    cart.products[itemIndex].quantity = qty;

    await cart.save();
    const populated = await CartModel.findById(cart._id).populate('products.product').lean();

    res.json({ status: 'success', payload: populated });
  } catch (error) {
    console.error('Error al actualizar quantity', error);
    res.status(500).json({ status: 'error', error: 'Error al actualizar quantity' });
  }
});


router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({ status: 'error', error: 'ID inválido' });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const before = cart.products.length;
    cart.products = cart.products.filter((p) => String(p.product) !== String(pid));

    if (cart.products.length === before) {
      return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });
    }

    await cart.save();
    const populated = await CartModel.findById(cart._id).populate('products.product').lean();

    res.json({ status: 'success', payload: populated });
  } catch (error) {
    console.error('Error al eliminar producto del carrito', error);
    res.status(500).json({ status: 'error', error: 'Error al eliminar producto del carrito' });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ status: 'error', error: 'ID de carrito inválido' });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    cart.products = [];
    await cart.save();

    const populated = await CartModel.findById(cart._id).populate('products.product').lean();
    res.json({ status: 'success', payload: populated });
  } catch (error) {
    console.error('Error al vaciar carrito', error);
    res.status(500).json({ status: 'error', error: 'Error al vaciar carrito' });
  }
});

module.exports = router;