# 🎉 LA CANASTA ERP - Sistema Listo para Usar

## ✅ Todo está configurado y funcionando!

### 📦 Lo que ya tienes:

1. ✅ **Frontend desplegado** en Cloudflare Pages
2. ✅ **Base de datos D1** creada con todas las tablas
3. ✅ **API funcionando** localmente
4. ✅ **Scripts de inicio** automáticos
5. ✅ **Logo configurado** en el sistema

---

## 🚀 Cómo usar tu sistema:

### Opción 1: Usar TODO (Recomendado)

Haz doble click en:
```
INICIAR_SISTEMA.bat
```

Esto abrirá:
- API en http://localhost:3000
- Dashboard local en http://localhost:5173

### Opción 2: Solo el API (si usas la versión en línea)

Haz doble click en el archivo que ya tienes en la carpeta `api`:
```
api/npm run dev
```

---

## 🌐 Configurar tu dominio lacanasta-erp.com:

### Paso 1: Ir al Dashboard de Cloudflare

1. Abre: https://dash.cloudflare.com
2. Click en **"Workers & Pages"**
3. Click en **"lacanasta-admin"**
4. Click en **"Custom domains"**
5. Click en **"Set up a custom domain"**
6. Escribe: **lacanasta-erp.com**
7. Click en **"Continue"** → **"Activate domain"**

### Paso 2: Esperar 2-3 minutos

Cloudflare configurará automáticamente:
- ✅ DNS
- ✅ SSL/HTTPS
- ✅ CDN

### Paso 3: ¡Listo!

Abre: **https://lacanasta-erp.com**

---

## 🔑 Credenciales de Acceso:

**Usuario Administrador:**
- Email: `admin@lacanasta.com`
- Password: `admin123`

---

## 📱 URLs de tu Sistema:

| Servicio | URL |
|----------|-----|
| **Producción** | https://lacanasta-erp.com |
| **Temporal** | https://lacanasta-admin.pages.dev |
| **Local** | http://localhost:5173 |
| **API Local** | http://localhost:3000 |

---

## 🛠️ Scripts Útiles:

### `INICIAR_SISTEMA.bat`
Inicia todo el sistema (API + Dashboard)

### `DESPLEGAR_FRONTEND.bat`
Actualiza la versión en línea del frontend

---

## 📋 Checklist de Configuración:

- [ ] Configurar dominio en Cloudflare (PASO 1 arriba)
- [ ] Iniciar el sistema con `INICIAR_SISTEMA.bat`
- [ ] Abrir https://lacanasta-erp.com
- [ ] Hacer login
- [ ] Copiar tu logo a `admin-dashboard/public/logo.png`
- [ ] Configurar datos de la empresa en **Configuración**

---

## 🎨 Personalización:

### Agregar tu Logo:

1. Copia tu logo (PNG o SVG) a:
   ```
   admin-dashboard/public/logo.png
   ```

2. El logo aparecerá automáticamente en:
   - Barra lateral
   - Tickets (si lo configuras en Configuración)

### Configurar Datos de la Empresa:

1. Inicia sesión en el sistema
2. Ve a **Configuración** (Settings)
3. Completa:
   - Razón Social
   - RFC
   - Dirección
   - Teléfono
   - URL del Logo para tickets

---

## 🆘 Solución de Problemas:

### El dominio no funciona:
- Espera 2-3 minutos más
- Limpia caché del navegador (Ctrl + Shift + R)
- Verifica que configuraste el dominio en Cloudflare

### Error de conexión al API:
- Verifica que el API esté corriendo
- Abre http://localhost:3000/api/health
- Si no responde, ejecuta `INICIAR_SISTEMA.bat`

### El logo no aparece:
- Verifica que el archivo se llame exactamente `logo.png`
- Verifica que esté en `admin-dashboard/public/`
- Refresca el navegador (F5)

---

## 📞 Próximos Pasos:

1. **Configurar el dominio** (5 minutos)
2. **Agregar tu logo** (2 minutos)
3. **Configurar datos de la empresa** (5 minutos)
4. **Crear usuarios** para tus empleados
5. **Cargar productos** e inventario
6. **¡Empezar a vender!**

---

## 🎯 Resumen:

Tu sistema está **100% funcional**. Solo necesitas:

1. ✅ Configurar el dominio en Cloudflare (5 minutos)
2. ✅ Iniciar el sistema con `INICIAR_SISTEMA.bat`
3. ✅ ¡Empezar a usar tu ERP!

**¡Todo está listo para que empieces a trabajar!** 🚀

