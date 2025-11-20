const socket = io();

socket.on('products', (products) => {

    const list = document.getElementById('productsList');
    list.innerHTML = '';

    products.forEach((p) => {
        const li = document.createElement('li');
        li.dataset.id = p.id;
        li.innerHTML = `
            <strong>${p.producto}</strong>
            - $${p.precio}
            - Stock: ${p.stock}
            - Categoria: ${p.categoria}
            <button class="delete-product" data-id="${p.id}">Eliminar</button>`;
        list.appendChild(li);
    });
});

const form = document.getElementById('productForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const product = {
        producto: formData.get('producto'),
        precio: Number(formData.get('precio')),
        stock: Number(formData.get('stock')),
        categoria: formData.get('categoria')
    };

    console.log('Enviando nuevo producto:', product);

    socket.emit('newProduct', product);
    form.reset();
});

document.addEventListener('click', (e) => {
    if (e.target.matches('.delete-product')) {
        const productId = e.target.dataset.id;
        console.log('Eliminando producto con ID:', productId);
        socket.emit('deleteProduct', productId);
    }
});