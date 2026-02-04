# LA CANASTA - POS Cloud System

Sistema de Punto de Venta empresarial con gestión multi-sucursal, control de inventario, finanzas y reportes avanzados.

## 🚀 Tecnologías

- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Base de Datos**: PostgreSQL (Producción) / SQLite (Desarrollo)
- **Autenticación**: JWT

## 📦 Estructura del Proyecto

```
la-canasta-pos/
├── api/              # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.ts
│   └── prisma/
│       └── schema.prisma
└── admin-dashboard/  # Frontend Dashboard
    └── src/
        ├── pages/
        ├── components/
        └── services/
```

## 🛠️ Instalación Local

### Backend (API)
```bash
cd api
npm install
cp .env.example .env  # Configurar variables de entorno
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend (Dashboard)
```bash
cd admin-dashboard
npm install
npm run dev
```

## 🌐 Despliegue en Producción

### 1. Base de Datos (Supabase)
- Crear proyecto en [Supabase](https://supabase.com)
- Copiar la `DATABASE_URL` de PostgreSQL

### 2. Backend (Railway)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

### 3. Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd admin-dashboard
vercel
```

## 📝 Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=tu_clave_secreta
PORT=3000
CORS_ORIGIN=https://tu-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://tu-api.railway.app
```

## 🔐 Usuario por Defecto

- **Email**: admin@lacanasta.com
- **Password**: admin123

## 📄 Licencia

Propietario - Todos los derechos reservados
