---
description: Cómo subir cambios a producción en Hostinger
---

# Deploy a Producción

## URLs de Producción
- **Frontend**: https://beige-dragonfly-722834.hostingersite.com
- **API**: https://paleturquoise-partridge-728576.hostingersite.com

## Datos del Servidor
- **SSH**: `ssh -p 65002 u435056931@193.203.180.87`
- **PHP**: Usar `/opt/alt/php84/usr/bin/php` para artisan
- **API Path**: `domains/paleturquoise-partridge-728576.hostingersite.com/apps/api`

---

## 🖥️ Frontend (React/Vite)

El frontend se deploya automáticamente via Git en Hostinger.

### Pasos:
1. Hacer commit y push de tus cambios al repositorio
2. Hostinger detecta el push y hace build automático
3. Usa el build command: `cd apps/web && npm install && npm run build`
4. Output directory: `dist`

> No necesitás SSH para el frontend. Hostinger lo hace todo.

---

## ⚙️ API (Laravel)

La API se sube manualmente via SSH.

### Opción A: Subir archivos modificados con SCP

// turbo
```
scp -P 65002 apps/api/app/Http/Controllers/MiController.php u435056931@193.203.180.87:domains/paleturquoise-partridge-728576.hostingersite.com/apps/api/app/Http/Controllers/
```

### Opción B: Subir carpeta completa

```
scp -r -P 65002 apps/api/app u435056931@193.203.180.87:domains/paleturquoise-partridge-728576.hostingersite.com/apps/api/
```

### Después de subir cambios al backend:

// turbo
```
ssh -p 65002 u435056931@193.203.180.87 "cd domains/paleturquoise-partridge-728576.hostingersite.com/apps/api && /opt/alt/php84/usr/bin/php artisan config:cache && /opt/alt/php84/usr/bin/php artisan route:cache"
```

### Si hay nuevas migraciones:

```
ssh -p 65002 u435056931@193.203.180.87 "cd domains/paleturquoise-partridge-728576.hostingersite.com/apps/api && /opt/alt/php84/usr/bin/php artisan migrate --force"
```

### Si hay nuevos paquetes (composer):

```
ssh -p 65002 u435056931@193.203.180.87 "cd domains/paleturquoise-partridge-728576.hostingersite.com/apps/api && /opt/alt/php84/usr/bin/php $(which composer) install --no-dev --optimize-autoloader"
```

---

## 🔍 Debugging en Producción

### Ver logs de errores:
```
ssh -p 65002 u435056931@193.203.180.87 "tail -50 domains/paleturquoise-partridge-728576.hostingersite.com/apps/api/storage/logs/laravel.log"
```

### Probar API desde terminal:
```powershell
Invoke-RestMethod -Uri "https://paleturquoise-partridge-728576.hostingersite.com/api/health"
```

---

## ⚠️ Notas Importantes
- Siempre usar PHP 8.4: `/opt/alt/php84/usr/bin/php`
- No tocar el dominio `pandorabycitygirl.com.ar`
- El `.env` de producción ya está configurado en el servidor, NO lo subas desde local
- Después de cambios en rutas o config, SIEMPRE correr `config:cache` y `route:cache`
