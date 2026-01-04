# API Mate & Co. (Backend)

Backend en Node.js + Express + MongoDB para la tienda de mates **Mate & Co.**.  
Incluye:

- API REST de productos y carritos.
- Vistas con Handlebars.
- Actualización en tiempo real de productos usando Socket.IO.

---

## Tecnologías principales

- **Node.js**
- **Express 5**
- **MongoDB + Mongoose**
- **mongoose-paginate-v2**
- **Socket.IO**
- **Express-Handlebars**

---

## Requisitos previos

- Node.js instalado (versión 18+ recomendada).
- MongoDB en ejecución (local o remoto).
- Archivo `.env` con al menos:

```env
MONGO_URL=mongodb://localhost:27017/mi_tienda
PORT=3000
PORT es opcional, por defecto se usa 3000.

Instalación
Clonar el repositorio o copiar los archivos del proyecto.

Instalar dependencias:

bash
Copiar código
npm install
Crear el archivo .env en la raíz del proyecto (junto a index.js):

env
Copiar código
MONGO_URL=<cadena de conexión a MongoDB>
PORT=3000
Iniciar el servidor:

bash
Copiar código
# Modo normal
npm start

# Modo desarrollo con nodemon
npm run dev

# Modo watch nativo
npm run devB
La aplicación quedará escuchando en:

text
Copiar código
http://localhost:3000
Estructura del proyecto
text
Copiar código
root
├── index.js                 # Punto de entrada, levanta Express y Socket.IO
├── package.json
├── README.md
├── public/
│   ├── css/
│   │   └── styles.css       # Estilos para las vistas
│   └── js/
│       └── realTimeProducts.js  # Lógica del front para Socket.IO
└── src/
    ├── app.js               # Configuración de Express y middlewares
    ├── config/
    │   └── db.js            # Conexión a MongoDB con Mongoose
    ├── models/
    │   ├── Product.model.js # Modelo Product
    │   └── Cart.model.js    # Modelo Cart
    ├── routes/
    │   ├── products.js      # Rutas REST de productos (/api/products)
    │   ├── carts.js         # Rutas REST de carritos (/api/carts)
    │   └── views.js         # Rutas para vistas Handlebars (/)
    └── views/
        ├── layouts/
        │   └── main.handlebars
        ├── home.handlebars
        ├── index.handlebars
        ├── productDetail.handlebars
        └── realTimeProducts.handlebars
Modelos de datos
Product
Definido en src/models/Product.model.js:

js
Copiar código
{
  title: String,       // obligatorio
  description: String, // obligatorio
  code: String,        // único, indexado; si no se envía, se autogenera PROD-...
  price: Number,       // obligatorio
  status: Boolean,     // por defecto true
  stock: Number,       // obligatorio
  category: String,    // obligatorio
  thumbnails: [String] // opcional, array de URLs
}
Usa mongoose-paginate-v2 para paginar resultados (ProductModel.paginate).

Cart
Definido en src/models/Cart.model.js:

js
Copiar código
{
  products: [
    {
      product: ObjectId('Product'), // referencia al modelo Product
      quantity: Number              // cantidad, mínimo 1
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
API REST
La API REST principal cuelga de:

/api/products

/api/carts

Las respuestas devuelven JSON con la forma general:

json
Copiar código
{
  "status": "success" | "error",
  "payload": ...,
  "message": "...",
  "error": "..."
}
1. Productos – /api/products
GET /api/products
Lista de productos con paginación y filtros.

Query params:

limit: cantidad por página (default 10).

page: número de página (default 1).

sort: orden por precio, asc o desc.

query: filtro flexible:

"true" o "false" → filtra por status.

"campo:valor" → filtra por ese campo (ej: category:mates).

cualquier otro string → se usa como category.

Ejemplos:

GET /api/products

GET /api/products?limit=5&page=2

GET /api/products?sort=asc

GET /api/products?query=mates

GET /api/products?query=status:true

GET /api/products?query=true → status = true

Respuesta:

json
Copiar código
{
  "status": "success",
  "payload": [ /* array de productos */ ],
  "totalPages": 3,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "/api/products?limit=10&page=1",
  "nextLink": "/api/products?limit=10&page=3"
}
GET /api/products/:pid
Obtiene un producto por su ID de MongoDB.

Valida que :pid sea un ObjectId válido.

400 si el ID es inválido.

404 si no se encuentra el producto.

POST /api/products
Crea un producto nuevo.

Body obligatorio (JSON):

json
Copiar código
{
  "title": "Mate Imperial",
  "description": "Mate de calabaza con virola",
  "code": "MATE-001",
  "price": 12000,
  "stock": 25,
  "category": "mates",
  "status": true,
  "thumbnails": ["https://.../foto1.jpg"]
}
Campos obligatorios: title, description, code, price, stock, category.

status por defecto es true si no se envía.

thumbnails puede omitirse (por defecto array vacío).

Devuelve 201 con el producto creado.

Devuelve 409 si el code ya existe (único).

PUT /api/products/:pid
Actualiza un producto existente.

:pid debe ser un ObjectId válido.

Body: cualquier subconjunto de campos del producto (se usa $set).

Ejemplo:

json
Copiar código
{
  "price": 13500,
  "stock": 30
}
404 si el producto no existe.

409 si se intenta actualizar a un code duplicado.

DELETE /api/products/:pid
Elimina un producto por ID.

400 si el ID es inválido.

404 si no se encuentra el producto.

200 con mensaje de éxito si se elimina correctamente.

2. Carritos – /api/carts
POST /api/carts
Crea un carrito vacío.

Respuesta:

json
Copiar código
{
  "status": "success",
  "payload": {
    "_id": "...",
    "products": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
GET /api/carts/:cid
Obtiene un carrito por ID, con productos populados.

:cid debe ser un ObjectId válido.

Devuelve los productos con products.product populado (datos completos del producto).

POST /api/carts/:cid/products/:pid
Agrega un producto al carrito:

Si el producto ya está en el carrito → incrementa quantity en 1.

Si no está → lo agrega con quantity = 1.

Valida:

Que :cid y :pid sean ObjectId válidos.

Que existan tanto el carrito como el producto.

PUT /api/carts/:cid
Reemplaza completamente el contenido del carrito.

Body esperado:

json
Copiar código
{
  "products": [
    { "product": "ID_PRODUCTO_1", "quantity": 2 },
    { "product": "ID_PRODUCTO_2", "quantity": 1 }
  ]
}
products debe ser un array.

Cada product debe ser un ObjectId válido.

quantity debe ser número ≥ 1 (o se usa 1 por defecto).

Devuelve el carrito populado.

PUT /api/carts/:cid/products/:pid
Actualiza solo la cantidad de un producto dentro del carrito.

Body:

json
Copiar código
{
  "quantity": 5
}
quantity debe ser un número ≥ 1.

404 si el carrito o el producto dentro del carrito no existe.

DELETE /api/carts/:cid/products/:pid
Elimina un producto puntual del carrito.

404 si el carrito no existe o el producto no está en el carrito.

Devuelve el carrito populado resultante.

DELETE /api/carts/:cid
Vacía completamente el carrito (deja products = []).

Vistas (Handlebars)
Rutas manejadas en src/routes/views.js:

GET /

Renderiza home.handlebars con listado de productos.

GET /realtimeproducts

Renderiza realTimeProducts.handlebars (página que escucha eventos de Socket.IO).

GET /products

Lista paginada de productos, usando los mismos parámetros que la API (limit, page, sort, query, cartId).

GET /products/:pid

Renderiza productDetail.handlebars para un producto.

GET /carts/:cid

Renderiza cart.handlebars para un carrito específico.

Los archivos de vistas se encuentran en src/views.

WebSockets (Socket.IO)
Configurados en index.js y usados en public/js/realTimeProducts.js.

Eventos:

Al conectar un cliente:

El servidor ejecuta ProductModel.find() y emite:

products → con el listado completo de productos actuales.

Eventos que el cliente puede emitir:

newProduct
Envía un objeto:

js
Copiar código
{
  title,
  description,
  code,
  price,
  stock,
  category,
  status // opcional
}
El servidor valida datos obligatorios.

Si todo está OK, crea el producto y emite a todos los clientes:

products → con la lista actualizada.

deleteProduct
Envía:

js
Copiar código
pid // ID del producto en MongoDB
El servidor elimina el producto y vuelve a emitir products con la lista actualizada.

En caso de error (validación, DB, etc.), el servidor emite:

js
Copiar código
socket.emit('socketError', {
  action: 'newProduct' | 'deleteProduct' | 'init',
  message: 'Descripción del error'
});
Manejo de errores global
En src/app.js:

Middleware 404:

Si no se encuentra la ruta: res.status(404).send('Ruta no encontrada').

Middleware 500:

Loguea el error y devuelve res.status(500).send('Error interno del servidor').

Autor
Proyecto backend desarrollado por Gustavo Billoud.