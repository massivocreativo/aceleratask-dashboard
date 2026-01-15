# Aceleratask - Supabase Setup Instructions

## 📋 Pasos para Configurar la Base de Datos

### 1. Ejecutar Migraciones SQL

Ve al **SQL Editor** de Supabase y ejecuta los siguientes archivos en orden:

1. **`supabase/migrations/01_initial_schema.sql`**
   - Crea todas las tablas
   - Configura índices
   - Agrega triggers automáticos
   - Inserta datos iniciales (statuses, labels)

2. **`supabase/migrations/02_rls_policies.sql`**
   - Configura Row Level Security
   - Define políticas de acceso por rol
   - Protege todas las tablas

### 2. Obtener la Anon Key

1. Ve a **Project Settings** → **API**
2. Copia la **anon/public key**
3. Pégala en `.env.local` reemplazando `YOUR_ANON_KEY_HERE`

### 3. Verificar Configuración

Ejecuta en el SQL Editor:

```sql
-- Verificar que las tablas se crearon
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar statuses
SELECT * FROM statuses ORDER BY order_index;

-- Verificar labels
SELECT * FROM labels;
```

Deberías ver:
- 10 tablas creadas
- 4 statuses
- 8 labels

## 🔐 Configuración de Autenticación

### Habilitar Email Auth

1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Email** esté habilitado
3. Configura **Confirm email** según prefieras

### Configurar Email Templates (Opcional)

Personaliza los templates de:
- Confirmación de email
- Reset de contraseña
- Invitación

## ✅ Checklist de Configuración

- [ ] Ejecutar `01_initial_schema.sql`
- [ ] Ejecutar `02_rls_policies.sql`
- [ ] Copiar anon key a `.env.local`
- [ ] Habilitar Email Auth
- [ ] Verificar tablas creadas
- [ ] Instalar dependencias (`npm install` completado)

## 🚀 Próximos Pasos

Una vez completada la configuración:
1. Crear páginas de login/registro
2. Implementar auth provider
3. Migrar store a Supabase
4. Actualizar componentes

## 📝 Notas Importantes

- **Anon Key**: Es segura para usar en el cliente
- **Service Role Key**: NUNCA expongas esta key en el cliente
- **RLS**: Todas las tablas están protegidas con políticas
- **Roles**: Designer, Content Manager, Creative Director, CEO
