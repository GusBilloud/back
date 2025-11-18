# back

## Descripción

Este proyecto es el backend principal del usuario Gustavo Billoud. Sirve como API base para gestionar datos y lógica de negocio para aplicaciones relacionadas.

## Tecnologías y dependencias principales

- Node.js y JavaScript como lenguaje principal.
- Express (probable framework de servidor web para Node.js).



## Estructura de carpetas y archivos

La estructura principal del proyecto incluye:

```
back/
│
├── api/                 # Contiene los módulos y rutas principales de la API
│   └── ...              # Aquí estan los controladores, rutas, middlewares, etc.
│
├── package.json         # Lista las dependencias, scripts y metadatos del proyecto
├── index.js             # Archivo principal de inicio del servidor
└── README.md            # Este archivo
```



## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/GusBilloud/back.git
   cd back
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

Para iniciar el servidor, ejecuta:
```bash
npm start
```
o bien
```bash
node index.js
```

Por defecto, la API estará disponible en `http://localhost:3000`.


## Autor

[Gustavo Billoud](https://github.com/GusBilloud)