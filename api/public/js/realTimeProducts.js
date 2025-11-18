const socket = io();

socket.on('product', (products) => {
    const list = document.getElementById('productList');
    list.innerHTML = '';

    products.forEach((p) => {
        const li = document.createElement('li');
        li.dataset.id = p.id;
        li.innerHTML = `
            <strong>${p.name}</strong>
            - $${p.price}
            - Stock: ${p.stock}
            - Categoria: ${p.category}
            <button class="delete-product" data-id="${p.id}">Delete</button>`;
        list.appendChild(li);
    });
});

const form = document.getElementById('productForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const product = Object.fromEntries(formData.entries());

    // Aseguramos las claves correctas para price y stock
    product.price = Number(product.price || product.precio || 0);
    product.stock = Number(product.stock);

    socket.emit('newProduct', product);
    form.reset();
});

document.addEventListener('click', (e) => {
    if (e.target.matches('.delete-product')) {
        const productId = e.target.dataset.id;
        socket.emit('deleteProduct', productId);
    }
});