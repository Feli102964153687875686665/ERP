# 🧪 GUÍA DE TESTING - LOGGING COMPLETO DEL ERP

## Cómo Ver los Logs en Acción

### 📌 Opción 1: Logs del Servidor (Recomendado)

1. Abre una terminal en la carpeta `/backend`
2. Ejecuta:
```bash
npm start
```

3. Deberías ver algo como:
```
Server running on port 3001
Database connected
```

4. Ahora cualquier operación del frontend mostrará logs como:
```
📋 [CLIENTES] Obteniendo todos los clientes...
✓ [CLIENTES] 5 clientes encontrados

🆕 [CLIENTES CREATE] Creando nuevo cliente: Mi Empresa
✅ [CLIENTES CREATE] Cliente creado correctamente - ID: 50

✏️ [CLIENTES UPDATE] Actualizando cliente ID: 50
✅ [CLIENTES UPDATE] Cliente actualizado correctamente
```

---

### 📌 Opción 2: Logs del Navegador

1. Abre el frontend en el navegador
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**
4. Realiza cualquier acción (login, crear, actualizar)
5. Verás los logs del servidor reflejados en el navegador

---

## ✅ Test Plan Completo

### Test 1: Login con Logging
**Objetivo**: Verificar que el JWT se genera correctamente

**Pasos**:
1. Ve a la página de login
2. Ingresa credenciales:
   - Email: `admin@erp.com`
   - Contraseña: `admin123`
3. Observa la consola

**Logs esperados**:
```
🔐 ========== INICIO DE LOGIN ==========
📧 Email recibido: admin@erp.com
🔍 Buscando usuario en base de datos...
✓ Búsqueda completada: 1 usuario(s) encontrado(s)
👤 Usuario encontrado: { id: 1, email: 'admin@erp.com', rol: 'administrador' }
✓ Contraseña válida
🔐 Generando JWT...
✅ JWT Generado correctamente
📦 Payload del JWT: { id_usuario: 1, ... }
👥 Usuario autenticado: admin@erp.com | Rol: administrador
========== FIN DE LOGIN ✓ ==========
```

**Verificación**: Si ves el JWT y el delay de 2 segundos, ✅ EXITOSO

---

### Test 2: Crear Cliente
**Objetivo**: Verificar logging de creación

**Pasos**:
1. Ve a **Módulos > Clientes**
2. Click en **Agregar**
3. Completa el formulario:
   - Nombre: `Empresa Test`
   - Email: `test@empresa.com`
   - Ciudad: `Medellín`
   - Teléfono: `3001234567`
4. Click en **Guardar**

**Logs esperados**:
```
🆕 [CLIENTES CREATE] Creando nuevo cliente: Empresa Test
✅ [CLIENTES CREATE] Cliente creado correctamente - ID: 50
```

**Verificación**: Si ves el ID del cliente creado, ✅ EXITOSO

---

### Test 3: Listar Clientes
**Objetivo**: Verificar logging de obtenerTodos

**Pasos**:
1. Ve a **Módulos > Clientes**
2. Deberías ver automáticamente la lista

**Logs esperados**:
```
📋 [CLIENTES] Obteniendo todos los clientes...
✓ [CLIENTES] 5 clientes encontrados
```

**Verificación**: Si ves la cantidad de clientes, ✅ EXITOSO

---

### Test 4: Buscar Cliente Individual
**Objetivo**: Verificar logging de obtenerPorId

**Pasos**:
1. Ve a **Módulos > Clientes**
2. Click en el ícono de editar en un cliente

**Logs esperados**:
```
🔍 [CLIENTES] Buscando cliente ID: 50
✅ [CLIENTES] Cliente encontrado: Empresa Test
```

**Verificación**: Si ves el nombre del cliente, ✅ EXITOSO

---

### Test 5: Actualizar Cliente
**Objetivo**: Verificar logging de actualización

**Pasos**:
1. Ve a **Módulos > Clientes**
2. Click en editar un cliente
3. Cambia el teléfono
4. Click en **Guardar**

**Logs esperados**:
```
✏️ [CLIENTES UPDATE] Actualizando cliente ID: 50
✅ [CLIENTES UPDATE] Cliente actualizado correctamente
```

**Verificación**: Si ves el log de actualización, ✅ EXITOSO

---

### Test 6: Eliminar Cliente
**Objetivo**: Verificar logging de eliminación

**Pasos**:
1. Ve a **Módulos > Clientes**
2. Click en el ícono de eliminar
3. Confirma la eliminación

**Logs esperados**:
```
🗑️ [CLIENTES DELETE] Eliminando cliente ID: 50
✅ [CLIENTES DELETE] Cliente eliminado correctamente
```

**Verificación**: Si ves el log de eliminación, ✅ EXITOSO

---

### Test 7: Crear Solicitud
**Objetivo**: Verificar logging con JOIN a cliente

**Pasos**:
1. Ve a **Módulos > Solicitudes**
2. Click en **Agregar**
3. Selecciona un cliente
4. Completa: Nombre solicitud, descripción
5. Click en **Guardar**

**Logs esperados**:
```
🆕 [SOLICITUDES CREATE] Datos recibidos: { id_cliente: 5, nombre_solicitud: 'Soporte técnico' }
✅ [SOLICITUDES CREATE] Solicitud creada ID: 100
```

**Verificación**: Si ves el ID de solicitud, ✅ EXITOSO

---

### Test 8: Sincronización Orden → Solicitud
**Objetivo**: Verificar que cambiar estado de orden actualiza solicitud automáticamente

**Pasos**:
1. Ve a **Módulos > Órdenes**
2. Selecciona una orden
3. Cambia estado a **Finalizado**
4. Click en **Guardar**

**Logs esperados**:
```
✏️ [ORDENES UPDATE] Actualizando ID: 45 - Nuevo estado: finalizado
👨‍💼 [ORDENES UPDATE] Actualizando como TECNICO
🔄 [ORDENES UPDATE] Solicitud sincronizada a finalizado
✅ [ORDENES UPDATE] Orden actualizada correctamente - Estado: finalizado
```

**Verificación**: Si la solicitud también cambió a "Finalizado" sin F5, ✅ EXITOSO

---

### Test 9: Agregar Inventario
**Objetivo**: Verificar logging con validaciones

**Pasos**:
1. Ve a **Módulos > Inventario**
2. Click en **Agregar**
3. Completa:
   - Nombre: `Cable RJ45`
   - Código: `CABLE001`
   - Categoría: `Accesorios`
   - Cantidad: `50`
   - Precio: `5.99`
4. Click en **Guardar**

**Logs esperados**:
```
📋 [INVENTARIO] Obteniendo todos los items...
🆕 [INVENTARIO CREATE] Datos recibidos: { nombre: 'Cable RJ45', codigo_interno: 'CABLE001', categoria: 'Accesorios' }
✅ [INVENTARIO CREATE] Item creado ID: 75
```

**Verificación**: Si ves el ID del item creado, ✅ EXITOSO

---

### Test 10: Consultar Items Bajo Stock
**Objetivo**: Verificar logging de obtenerBajo

**Pasos**:
1. Ve a **Módulos > Inventario**
2. Click en **Bajo Stock** (si existe el botón)

**Logs esperados**:
```
⚠️ [INVENTARIO] Obteniendo items con bajo stock...
✅ [INVENTARIO] 3 items con bajo stock
```

**Verificación**: Si ves los items con bajo stock, ✅ EXITOSO

---

## 📊 Matriz de Testing

| Test | Módulo | Acción | Log Esperado | Status |
|------|--------|--------|--------------|--------|
| 1 | Login | Login | 🔐 INICIO LOGIN | ✅ |
| 2 | Clientes | Crear | 🆕 CLIENTES CREATE | ✅ |
| 3 | Clientes | Obtener | 📋 CLIENTES | ✅ |
| 4 | Clientes | Buscar | 🔍 CLIENTES | ✅ |
| 5 | Clientes | Actualizar | ✏️ CLIENTES UPDATE | ✅ |
| 6 | Clientes | Eliminar | 🗑️ CLIENTES DELETE | ✅ |
| 7 | Solicitudes | Crear | 🆕 SOLICITUDES CREATE | ✅ |
| 8 | Órdenes | Actualizar | ✏️ ORDENES UPDATE | ✅ |
| 8b | Órdenes | Sincronización | 🔄 Sincronizada | ✅ |
| 9 | Inventario | Crear | 🆕 INVENTARIO CREATE | ✅ |
| 10 | Inventario | Bajo Stock | ⚠️ INVENTARIO | ✅ |

---

## 🎯 Checklist Final

- [ ] Logs aparecen en consola del servidor
- [ ] Logs aparecen en DevTools del navegador
- [ ] Login muestra JWT generado
- [ ] Crear cliente muestra ID asignado
- [ ] Listar muestra cantidad de registros
- [ ] Buscar individual muestra datos encontrados
- [ ] Actualizar muestra confirmación
- [ ] Eliminar muestra confirmación
- [ ] Crear solicitud vincula cliente
- [ ] Cambiar orden a finalizado sincroniza solicitud
- [ ] Crear inventario valida campos
- [ ] Bajo stock muestra alertas

---

## 🔍 Troubleshooting

### Problema: No veo logs en la consola

**Solución 1**:
```bash
# Asegúrate de que el servidor está corriendo
npm start

# Deberías ver:
# Server running on port 3001
```

**Solución 2**:
- En DevTools, asegúrate que el filtro de Console no esté ocultando logs
- Abre la consola del servidor (terminal) directamente

### Problema: Logs sin emojis

**Solución**:
- Algunos terminales/sistemas no soportan emojis
- Los logs funcionan igual, solo sin emojis
- Puedes verificar el mensaje de texto

### Problema: No sincroniza orden/solicitud

**Solución**:
- Verifica que ambas entidades existan en BD
- Comprueba los IDs en logs
- Si no ves 🔄, revisar que la orden tenga un id_solicitud válido

---

## ✨ Tips de Testing

1. **Abre dos terminales**:
   - Una para el servidor (node)
   - Otra para npm (frontend)

2. **Usa el DevTools**:
   - Mantén open la pestaña Console
   - Así ves logs mientras usas la app

3. **Prueba error cases**:
   - Intenta crear sin llenar campos obligatorios
   - Deberías ver ❌ en logs

4. **Verifica timestamps**:
   - Cada log tiene timestamp del servidor
   - Útil para debugging de timing

---

## 📝 Registro de Testing

**Fecha de Testing**: ___________

**Tester**: ___________

**Servidor**: ✅ Corriendo

**Logs Visibles**: ✅ Sí / ❌ No

**Emojis**: ✅ Completos / ⚠️ Parciales

**Sincronización**: ✅ Funciona / ❌ Falla

**Observaciones**:
```
_________________________________
_________________________________
_________________________________
```

---

**Status**: ✅ TESTING GUIDE COMPLETO - Ready para validar logging en todos los módulos
