const { Router } = require('express');
const ProductsManager = require('../managers/ProductsManager');
const router = Router();

const productsManager = new ProductsManager();


router.get('/', async (req, res) => {
    try {
        const products = await productsManager.getAll();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});


router.get('/:pid', async (req, res) => {
    try {
        const product = await productsManager.getById(req.params.pid);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error al obtener producto', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});


router.post('/', async (req, res) => {
    try {
        const data = req.body;
        if (!data.producto || !data.precio || !data.stock) {
            return res.status(400).json({ error: 'Faltan datos obligatorios: producto, precio, stock' });
        }
        const newProduct = await productsManager.create(data);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error al crear producto', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});


router.put('/:pid', async (req, res) => {
    try {
        const updated = await productsManager.update(req.params.pid, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(updated);
    } catch (error) {
        console.error('Error al actualizar producto', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const deleted = await productsManager.delete(req.params.pid);
        if (!deleted) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;