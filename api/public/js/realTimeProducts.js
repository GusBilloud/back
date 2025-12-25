const socket = io();

const productsList = document.getElementById('productsList'); 
const form = document.getElementById('productForm');

function renderProducts(products) {
  if (!productsList) return;

  if (!products || products.length === 0) {
    productsList.innerHTML = '<li>No hay productos.</li>';
    return;
  }


  productsList.innerHTML = products
    .map(
      (p) => `
        <li data-id="${p._id}">
        <strong>${p.title}</strong>
        - $${p.price}
        - Stock: ${p.stock ?? 0}
        - Categoría: ${p.category ?? '-'}
        <br/>
        <small>Descripción: ${p.description ?? '-'}</small>
        <br/>
        <small>Código: ${p.code ?? '-'}</small>

        <button class="delete-product" data-id="${p._id}" aria-label="Eliminar ${p.title}">
          Eliminar
        </button>
      </li>
      `
    )
    .join('');


  document.querySelectorAll('.delete-product').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-id');
      socket.emit('deleteProduct', pid);
    });
  });
}

socket.on('products', (products) => {
  renderProducts(products);
});

socket.on('socketError', (err) => {
  console.error('Socket error:', err);
  alert(err?.message || 'Error desconocido');
});

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    const title = String(fd.get('title') || '').trim();
    const description = String(fd.get('description') || '').trim();
    const code = String(fd.get('code') || '').trim();

    const price = Number(fd.get('price'));
    const stock = Number(fd.get('stock'));

    const category = String(fd.get('category') || '').trim();


    const statusRaw = String(fd.get('status') || 'true');
    const status = statusRaw === 'true';

    if (!title || !description || !code || !category || Number.isNaN(price) || Number.isNaN(stock)) {
      alert('Datos inválidos: title/description/code/category obligatorios y price/stock numéricos.');
      return;
    }

    socket.emit('newProduct', {
      title,
      description,
      code,
      price,
      stock,
      category,
      status,
    });

    form.reset();
  });
}
