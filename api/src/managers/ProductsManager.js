const fs = require('fs').promises;
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../data/products.json');

class ProductsManager {
    async read() {
        try{
            const data = await fs.readFile(PRODUCTS_PATH, 'utf-8');
            return JSON.parse(data || '[]');
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async write(products) {
        await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');
    }

    async getAll() {
        return await this.read();
    }

    async getById(id) {
        const products = await this.read();
        return products.find(p => String(p.id) === String(id)) || null;
    }

    async create(data){
        const products = await this.read();
        
        const nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;

        const newProduct = {
            id: nextId,
            producto: data.producto,
            precio: Number(data.precio),
            stock: Number(data.stock), 
            categoria: data.categoria || ''
        };

        products.push(newProduct);
        await this.write(products);
        return newProduct;
    }

    async update(id, data) {
        const products = await this.read();
        const idx = products.findIndex(p => String(p.id) === String(id));
        if (idx === -1) return null;

        products[idx] = { ...products[idx], ...data, id: products[idx].id };
    
        await this.write(products);
        return products[idx];
    }

    async delete(id) {
        const products = await this.read();
        const idx = products.findIndex(p => String(p.id) === String(id));
        if (idx === -1) return false;
        
        products.splice(idx, 1);
        await this.write(products);
        return true;
    }
}
 
module.exports = ProductsManager;