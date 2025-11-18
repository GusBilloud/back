const fs = require('fs');
const path = require('path');
const ProductsManager = require('./ProductsManager');

const CARTS_PATH = path.join(__dirname, '../data/carts.json');
const productsManager = new productsManager();

class CartsManager {
    async read (){
        const raw = await fs.promises.readFile(CARTS_PATH, 'utf-8');
        return JSON.parse (raw);
    }

    async write (data){
        await fs.promises.writeFile (CARTS_PATH, JSON.stringify (data, null, 2), 'utf-8');
    }

    async createCart (){
        const carts = await this.read();
        const nextId = carts.length ? Math.max(...carts.map(c=>c.id)) + 1 : 1;
        const newCart = {
            id: nextId,
            products: []
        };
        carts.push(newCart);
        await this.write(carts);
        return newCart;
    }

    async getCartById (id){
        const carts = await this.read();
        return carts.find(c => c.id === Number(id)) || null;
    }

    async addProductToCart (cartId, productId){
        const carts = await this.read();
        const cartIdx = carts.findIndex(c => c.id === Number(cartId));
        if (cartIdx === -1) return {error: 'Carrito no encontrado'};

        const product = await productsManager.getById(productId);
        if (!product) return {error: 'Producto no encontrado'};

        const cart = carts[cartIdx];
        const line = cart.products.find(p => p.productId === productId);
        if (line) {
            line.quantity += 1;
        } else {
            cart.products.push({productId, quantity: 1});
        }

        await this.write(carts);
        return cart;
    }
}

module.exports = CartsManager;