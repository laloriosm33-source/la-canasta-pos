# 🚀 Guía de Despliegue - La Canasta ERP

## Configuración de Dominio en Cloudflare

### Paso 1: Desplegar el Frontend (Admin Dashboard)

1. **Construir el proyecto:**
   ```bash
   cd admin-dashboard
   npm run build
   ```

2. **Desplegar a Cloudflare Pages:**
   ```bash
   npx wrangler pages deploy dist --project-name=lacanasta-admin
   ```

3. **Configurar dominio personalizado:**
   - Ve a Cloudflare Dashboard → Pages → lacanasta-admin
   - Click en "Custom domains"
   - Agrega: `lacanasta-erp.com` o `app.lacanasta-erp.com`

---

### Paso 2: Desplegar el API (Backend)

1. **Primero, necesitamos configurar las variables de entorno:**
   
   Crea un archivo `.dev.vars` en la carpeta `api`:
   ```env
   JWT_SECRET=supersecretkey
   DATABASE_URL=file:./dev.db
   ```

2. **Aplicar migraciones a D1 (si falla, usar método alternativo):**
   ```bash
   cd api
   wrangler d1 migrations apply lacanasta_api_db --remote
   ```

   **Método alternativo si falla:**
   ```bash
   # Exportar datos locales
   sqlite3 prisma/dev.db .dump > backup.sql
   
   # Importar a D1
   wrangler d1 execute lacanasta_api_db --remote --file=backup.sql
   ```

3. **Desplegar el Worker:**
   ```bash
   wrangler deploy
   ```

4. **Configurar dominio personalizado para el API:**
   - Ve a Cloudflare Dashboard → Workers & Pages → la-canasta-api
   - Click en "Settings" → "Triggers" → "Custom Domains"
   - Agrega: `api.lacanasta-erp.com`

---

### Paso 3: Actualizar Variables de Entorno

1. **En el frontend (admin-dashboard):**
   
   Crea un archivo `.env.production` en `admin-dashboard`:
   ```env
   VITE_API_URL=https://api.lacanasta-erp.com/api
   ```

2. **Reconstruir y redesplegar el frontend:**
   ```bash
   cd admin-dashboard
   npm run build
   npx wrangler pages deploy dist --project-name=lacanasta-admin
   ```

---

### Paso 4: Configurar DNS en Cloudflare

1. Ve a Cloudflare Dashboard → DNS
2. Asegúrate de tener estos registros:

   ```
   Type    Name    Content                         Proxy
   CNAME   @       lacanasta-admin.pages.dev       ✅ Proxied
   CNAME   api     la-canasta-api.workers.dev      ✅ Proxied
   CNAME   www     lacanasta-erp.com               ✅ Proxied
   ```

---

## 🔧 Solución de Problemas

### Error: "wrangler: command not found"
```bash
npm install -g wrangler
```

### Error en migraciones D1
Si las migraciones fallan, usa el método de exportación/importación:
```bash
# En la carpeta api
sqlite3 prisma/dev.db .dump > full_backup.sql
wrangler d1 execute lacanasta_api_db --remote --file=full_backup.sql
```

### Error de CORS
Asegúrate de que el API tenga configurado CORS para tu dominio en `src/server.ts`

---

## 📝 Checklist Final

- [ ] Frontend desplegado en Cloudflare Pages
- [ ] API desplegado en Cloudflare Workers
- [ ] Base de datos D1 creada y migrada
- [ ] Dominios personalizados configurados
- [ ] Variables de entorno actualizadas
- [ ] DNS configurado correctamente
- [ ] Probado el login y funcionalidad básica

---

## 🌐 URLs Finales

- **Frontend:** https://lacanasta-erp.com
- **API:** https://api.lacanasta-erp.com
- **Docs:** https://lacanasta-erp.com/docs (si lo configuras)

---

## 💡 Notas Importantes

1. **Seguridad:** Cambia `JWT_SECRET` a un valor seguro en producción
2. **Backups:** Configura backups automáticos de D1
3. **Monitoreo:** Activa Analytics en Cloudflare para monitorear tráfico
4. **SSL:** Cloudflare proporciona SSL automáticamente

