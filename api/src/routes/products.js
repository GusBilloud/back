const { Router } = require('express');
const ProductModel = require('../models/Product.model');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {};
    if (query) {
      const q = String(query).trim();

      if (q === 'true' || q === 'false') {
        filter.status = (q === 'true');
      } else if (q.includes(':')) {
        const [rawKey, ...rest] = q.split(':');
        const key = rawKey.trim();
        const valueRaw = rest.join(':').trim();

        let value = valueRaw;
        if (valueRaw === 'true') value = true;
        else if (valueRaw === 'false') value = false;
        else if (!Number.isNaN(Number(valueRaw)) && valueRaw !== '') value = Number(valueRaw);

        filter[key] = value;
      } else {
        filter.category = q;
      }
    }

    const options = {
      limit: parsedLimit,
      page: parsedPage,
      lean: true,
      sort: sort ? { price: sort === 'desc' ? -1 : 1 } : undefined
    };

    const result = await ProductModel.paginate(filter, options);

    const buildLink = (targetPage) => {
      const params = new URLSearchParams();
      params.set('limit', String(parsedLimit));
      params.set('page', String(targetPage));
      if (sort) params.set('sort', String(sort));
      if (query) params.set('query', String(query));
      return `/api/products?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
    });
  } catch (error) {
    console.error('Error al listar productos', error);
    res.status(500).json({ status: 'error', error: 'Error al listar productos' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: 'error', error: 'ID de producto inválido' });
    }

    const product = await ProductModel.findById(pid).lean();

    if (!product) {
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    }

    res.json({ status: 'success', payload: product });
  } catch (error) {
    console.error('Error al obtener producto', error);
    res.status(500).json({ status: 'error', error: 'Error al obtener producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;

    const required = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const missing = required.filter((k) => data?.[k] === undefined || data?.[k] === null || data?.[k] === '');

    if (missing.length) {
      return res.status(400).json({
        status: 'error',
        error: `Faltan datos obligatorios: ${missing.join(', ')}`
      });
    }

    const created = await ProductModel.create({
      title: data.title,
      description: data.description,
      code: data.code,
      price: Number(data.price),
      status: data.status ?? true,
      stock: Number(data.stock),
      category: data.category,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : []
    });

    res.status(201).json({ status: 'success', payload: created });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ status: 'error', error: 'El código ya existe (code debe ser único)' });
    }
    console.error('Error al crear producto', error);
    res.status(500).json({ status: 'error', error: 'Error al crear producto' });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: 'error', error: 'ID de producto inválido' });
    }

    const data = req.body;

    const updated = await ProductModel.findByIdAndUpdate(
      pid,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    }

    res.json({ status: 'success', payload: updated });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ status: 'error', error: 'El código ya existe (code debe ser único)' });
    }
    console.error('Error al actualizar producto', error);
    res.status(500).json({ status: 'error', error: 'Error al actualizar producto' });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: 'error', error: 'ID de producto inválido' });
    }

    const deleted = await ProductModel.findByIdAndDelete(pid);

    if (!deleted) {
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    }

    res.json({ status: 'success', message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto', error);
    res.status(500).json({ status: 'error', error: 'Error al eliminar producto' });
  }
});

module.exports = router;