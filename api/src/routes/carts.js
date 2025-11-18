const { Router } = require('express');
const CartsManager = require('../managers/CartsManager')
const router = Router();

const cartsManager = new CartsManager();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartsManager.createCart();
        res.status(201).json(newCart);
    }catch (error) {
        console.error('Error al crear carrito', error);
        res.status(500).json({ error: 'Error al crear carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartsManager.getCartById(req.params.cid);

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        return res.json(cart);

    } catch (error) {
        console.error('Error al obtener carrito', error);
        res.status(500).json({ error: 'Error al obtener carrito' });
    }
});
router.post('/:cid/products/:pid', async (req, res) => {
    try{
        const { cid, pid } = req.params;
        const quantity = Number(req.body.quantity) || 1;

        const updatedCart = await cartsManager.addProductToCart(cid, pid, quantity);

        if (!updatedCart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.json(updatedCart);
    }catch (error) {
        console.error('Error al agregar producto al carrito', error);
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

module.exports = router;