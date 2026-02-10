# 🎯 Configuración Final - La Canasta ERP en lacanasta-erp.com

## ✅ Estado Actual:
- Frontend desplegado en: https://lacanasta-admin.pages.dev
- Base de datos D1 creada y lista
- API corriendo localmente en: http://localhost:3000

---

## 🌐 PASO 1: Configurar el Dominio (2 minutos)

### Opción A: Desde el Dashboard (MÁS FÁCIL)

1. Abre tu navegador y ve a: **https://dash.cloudflare.com**

2. En el menú izquierdo, click en **"Workers & Pages"**

3. Busca y click en **"lacanasta-admin"**

4. Click en la pestaña **"Custom domains"**

5. Click en el botón **"Set up a custom domain"**

6. Escribe: **lacanasta-erp.com**

7. Click en **"Continue"** y luego **"Activate domain"**

8. Espera 1-2 minutos mientras Cloudflare configura el SSL

✅ **¡Listo!** Tu frontend estará en https://lacanasta-erp.com

---

## 🔧 PASO 2: Configurar Variables de Entorno

Ahora necesitamos que el frontend sepa dónde está el API.

### Si quieres usar el API LOCAL (más fácil para desarrollo):

El frontend ya está configurado para usar `http://localhost:3000/api`

**No necesitas hacer nada más** - solo asegúrate de tener el API corriendo:
```bash
cd api
npm run dev
```

### Si quieres usar Cloudflare Tunnel (para que el API esté en línea):

1. Abre una nueva terminal

2. Ve a la carpeta del proyecto antiguo:
   ```bash
   cd "C:\intento 2"
   ```

3. Ejecuta el script de conexión:
   ```bash
   .\connect_website.bat
   ```

4. Cuando te pregunte por el dominio, usa: **api.lacanasta-erp.com**

5. Luego actualiza el frontend para usar el API en línea:
   
   Crea el archivo `.env.production` en `admin-dashboard`:
   ```env
   VITE_API_URL=https://api.lacanasta-erp.com/api
   ```

6. Reconstruye y redesplega:
   ```bash
   cd "C:\Users\eduar\Saved Games\la-canasta-pos.py\admin-dashboard"
   npx vite build
   npx wrangler pages deploy dist --project-name=lacanasta-admin --commit-dirty=true
   ```

---

## 📝 PASO 3: Verificar que Todo Funciona

1. Abre tu navegador en: **https://lacanasta-erp.com**

2. Deberías ver la pantalla de login

3. Inicia sesión con:
   - Email: admin@lacanasta.com
   - Password: admin123

4. Si todo funciona, ¡ya está listo!

---

## 🎉 URLs Finales:

- **Aplicación Principal:** https://lacanasta-erp.com
- **API:** http://localhost:3000 (o https://api.lacanasta-erp.com si usas tunnel)
- **Dashboard de Cloudflare:** https://dash.cloudflare.com

---

## 💡 Recomendación:

**Por ahora, usa el API LOCAL** (http://localhost:3000):
- ✅ Más rápido
- ✅ Más fácil de debuggear
- ✅ No requiere configuración adicional
- ✅ Funciona perfectamente

**Cuando necesites que esté 100% en línea**, usa Cloudflare Tunnel para el API.

---

## 🆘 Si algo no funciona:

1. **El frontend no carga:**
   - Espera 2-3 minutos (el DNS puede tardar)
   - Limpia el caché del navegador (Ctrl + Shift + R)

2. **Error de conexión al API:**
   - Verifica que el API esté corriendo: `cd api && npm run dev`
   - Verifica que esté en el puerto 3000

3. **Error de CORS:**
   - El API ya tiene CORS configurado para localhost

---

## ✅ Checklist Final:

- [ ] Configurar dominio en Cloudflare Dashboard
- [ ] Verificar que el API local está corriendo
- [ ] Abrir https://lacanasta-erp.com
- [ ] Hacer login
- [ ] Probar una venta en el POS

---

**¿Listo para configurar el dominio? Solo necesitas seguir el PASO 1 desde el dashboard de Cloudflare.**

