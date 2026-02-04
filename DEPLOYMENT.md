# 🚀 Guía de Despliegue - LA CANASTA POS

Esta guía te llevará paso a paso para desplegar tu sistema POS en producción **completamente gratis**.

---

## 📋 Requisitos Previos

- Cuenta de GitHub (para subir el código)
- Cuenta de Supabase (base de datos PostgreSQL gratis)
- Cuenta de Railway (backend API gratis)
- Cuenta de Vercel (frontend gratis)

---

## Paso 1: Preparar el Repositorio Git

### 1.1 Inicializar Git (si no lo has hecho)

```bash
cd "c:\Users\eduar\Saved Games\la-canasta-pos"
git init
git add .
git commit -m "Initial commit - LA CANASTA POS v1.0"
```

### 1.2 Crear repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repositorio: `la-canasta-pos`
3. Privacidad: **Privado** (recomendado)
4. No inicialices con README (ya lo tienes)
5. Clic en **Create repository**

### 1.3 Subir código a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/la-canasta-pos.git
git branch -M main
git push -u origin main
```

---

## Paso 2: Configurar Base de Datos (Supabase)

### 2.1 Crear proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Clic en **New Project**
3. Configuración:
   - **Name**: `la-canasta-pos`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Elige la más cercana a ti
   - **Pricing Plan**: Free
4. Espera 2-3 minutos mientras se crea

### 2.2 Obtener URL de conexión

1. En tu proyecto de Supabase, ve a **Settings** → **Database**
2. En la sección **Connection string**, selecciona **URI**
3. Copia la URL que se ve así:
   ```
   postgresql://postgres:[TU-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. **Guarda esta URL** - la necesitarás en el siguiente paso

---

## Paso 3: Desplegar Backend (Railway)

### 3.1 Crear cuenta y proyecto

1. Ve a [railway.app](https://railway.app)
2. Clic en **Start a New Project**
3. Selecciona **Deploy from GitHub repo**
4. Conecta tu cuenta de GitHub
5. Selecciona el repositorio `la-canasta-pos`

### 3.2 Configurar el servicio

1. Railway detectará automáticamente que es un proyecto Node.js
2. En **Settings**:
   - **Root Directory**: Cambia a `/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run db:push && npm start`

### 3.3 Agregar Variables de Entorno

1. Ve a la pestaña **Variables**
2. Agrega las siguientes variables:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_esto_12345
PORT=3000
NODE_ENV=production
```

**Importante**: Reemplaza `DATABASE_URL` con la URL que copiaste de Supabase.

### 3.4 Generar dominio público

1. Ve a **Settings** → **Networking**
2. Clic en **Generate Domain**
3. Railway te dará una URL como: `https://tu-app-production.up.railway.app`
4. **Guarda esta URL** - es tu API en producción

### 3.5 Verificar despliegue

1. Espera 2-3 minutos mientras se despliega
2. Visita: `https://tu-app-production.up.railway.app/api`
3. Deberías ver: `{"message":"La Canasta API v1"}`

---

## Paso 4: Desplegar Frontend (Vercel)

### 4.1 Instalar Vercel CLI (opcional, también puedes usar la web)

```bash
npm install -g vercel
```

### 4.2 Desplegar desde la terminal

```bash
cd admin-dashboard
vercel
```

Sigue las instrucciones:
- **Set up and deploy**: Yes
- **Which scope**: Tu cuenta personal
- **Link to existing project**: No
- **Project name**: `la-canasta-pos-dashboard`
- **Directory**: `./` (presiona Enter)
- **Override settings**: No

### 4.3 Configurar Variables de Entorno en Vercel

**Opción A: Desde la terminal**
```bash
vercel env add VITE_API_URL
# Pega: https://tu-app-production.up.railway.app/api
# Selecciona: Production, Preview, Development
```

**Opción B: Desde la web**
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `la-canasta-pos-dashboard`
3. Ve a **Settings** → **Environment Variables**
4. Agrega:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://tu-app-production.up.railway.app/api`
   - **Environments**: Production, Preview, Development

### 4.4 Redesplegar con la variable

```bash
vercel --prod
```

### 4.5 Obtener URL final

Vercel te dará una URL como:
```
https://la-canasta-pos-dashboard.vercel.app
```

---

## Paso 5: Configurar CORS en el Backend

### 5.1 Actualizar Railway

1. Ve a tu proyecto en Railway
2. En **Variables**, agrega:
   ```
   CORS_ORIGIN=https://la-canasta-pos-dashboard.vercel.app
   ```
3. El servicio se redesplegará automáticamente

---

## Paso 6: Crear Usuario Administrador

### 6.1 Ejecutar script de inicialización

Necesitas crear el primer usuario admin. Hay dos opciones:

**Opción A: Desde Railway CLI**
```bash
railway run npm run seed
```

**Opción B: Manualmente con Supabase**
1. Ve a Supabase → **Table Editor**
2. Selecciona la tabla `User`
3. Clic en **Insert row**
4. Agrega:
   ```
   email: admin@lacanasta.com
   password: $2b$10$... (hash de bcrypt para "admin123")
   name: Administrador
   role: ADMIN
   permissions: ["POS","INVENTORY","CUSTOMERS","USERS","SETTINGS"]
   ```

**Opción C: Usar la API directamente**

Puedes crear un endpoint temporal de registro o usar Postman/Thunder Client:

```bash
POST https://tu-app-production.up.railway.app/api/auth/register
Content-Type: application/json

{
  "email": "admin@lacanasta.com",
  "password": "admin123",
  "name": "Administrador",
  "role": "ADMIN",
  "permissions": ["POS","INVENTORY","CUSTOMERS","USERS","SETTINGS"]
}
```

---

## Paso 7: Probar el Sistema

### 7.1 Acceder al dashboard

1. Ve a: `https://la-canasta-pos-dashboard.vercel.app`
2. Inicia sesión con:
   - **Email**: admin@lacanasta.com
   - **Password**: admin123

### 7.2 Verificar funcionalidades

- ✅ Login funciona
- ✅ Dashboard carga datos
- ✅ Puedes crear productos
- ✅ Puedes crear sucursales
- ✅ Terminal POS funciona
- ✅ Reportes se generan

---

## 🎉 ¡Listo! Tu Sistema Está en Producción

### URLs Finales:
- **Dashboard**: https://la-canasta-pos-dashboard.vercel.app
- **API**: https://tu-app-production.up.railway.app/api
- **Base de Datos**: Supabase (PostgreSQL)

---

## 📱 Bonus: Convertir en PWA (App Instalable)

### Crear manifest.json

Crea el archivo `admin-dashboard/public/manifest.json`:

```json
{
  "name": "LA CANASTA POS",
  "short_name": "LA CANASTA",
  "description": "Sistema de Punto de Venta Empresarial",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#0F172A",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Agrega en `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0F172A">
```

Redesplegar:
```bash
vercel --prod
```

Ahora puedes "instalar" la app desde Chrome/Edge en cualquier dispositivo.

---

## 🔧 Mantenimiento

### Actualizar el código

```bash
# Hacer cambios en tu código local
git add .
git commit -m "Descripción de cambios"
git push

# Railway y Vercel se actualizarán automáticamente
```

### Ver logs

- **Railway**: Dashboard → Deployments → View Logs
- **Vercel**: Dashboard → Deployments → Function Logs

### Backup de base de datos

Supabase hace backups automáticos diarios. Para backup manual:
1. Supabase → Database → Backups
2. Clic en **Create backup**

---

## ⚠️ Límites del Plan Gratuito

- **Supabase**: 500 MB de base de datos, 2 GB de transferencia/mes
- **Railway**: 500 horas/mes, 1 GB RAM, 1 GB disco
- **Vercel**: 100 GB de ancho de banda/mes, builds ilimitados

Para la mayoría de negocios pequeños/medianos, esto es más que suficiente.

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que `DATABASE_URL` esté correctamente configurada en Railway
- Asegúrate de que la contraseña no tenga caracteres especiales sin escapar

### Error: "CORS policy"
- Verifica que `CORS_ORIGIN` en Railway coincida exactamente con tu URL de Vercel
- No incluyas `/` al final de la URL

### Error: "Module not found"
- Ejecuta `npm install` en ambos proyectos
- Verifica que `package.json` tenga todas las dependencias

### La app no carga datos
- Abre DevTools (F12) → Console
- Verifica que `VITE_API_URL` esté configurada correctamente
- Prueba la API directamente: `https://tu-api.railway.app/api`

---

## 📞 Soporte

Si encuentras problemas, revisa:
1. Logs de Railway
2. Console del navegador (F12)
3. Network tab para ver requests fallidos

---

**¡Felicidades! Tu sistema POS está ahora en la nube y accesible desde cualquier lugar del mundo.** 🌍
