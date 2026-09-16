# AQUAPORA CORAL FISH

Tienda Next.js 16.3.5 / React 19, Neon PostgreSQL + Drizzle, Zustand y Cloudinary.

## Desarrollo local

Usar Node 22 (`.nvmrc`; Node 24 también admitido).

```sh
npm ci
cp .env.example .env.local
# Completar DATABASE_URL y las tres claves CLOUDINARY_*.
npm run admin:setup
npm run db:migrate
npm run dev
```

El generador añade exclusivamente claves de autenticación ausentes. Genera contraseña aleatoria con hash scrypt, secreto de sesión de 32 bytes y enlace TOTP compatible con Google Authenticator. Repetirlo conserva las variables existentes; rechaza placeholders o formatos inválidos. Para guardar el acceso en un archivo privado, crear `.local` y usar `npm run admin:setup -- --output .local/admin-access.txt`. El archivo debe ser nuevo. Guardar los datos en un gestor de contraseñas; `.local/` está excluido de Git. No pasar contraseñas por argumentos de shell. `auth:hash` se conserva por compatibilidad; preferir `admin:setup`.

En esta copia de desarrollo, el acceso generado está en `.local/admin-access.txt`. Entrar en `/admin/login` con esa contraseña y el código de seis dígitos de Authenticator. Usar secretos diferentes al configurar producción. Para rotación, retirar deliberadamente solo las claves a renovar y repetir el setup; cambiar AUTH_SECRET invalida todos los tokens anteriores. Para recuperar un TOTP perdido se requiere acceso al entorno del servidor y configurar un secreto nuevo; no existe bypass de 2FA.

## Validación

```sh
npm run verify
npm run test:integration
npm run start -- --port 3100
SMOKE_BASE_URL=http://localhost:3100 npm run smoke
```

`verify` genera tipos de rutas, comprueba TypeScript, ESLint sin advertencias, pruebas unitarias y build de producción con `next build --webpack`. Webpack es la opción de producción acordada. CI no requiere claves de servicios: el catálogo consulta la base de datos al atender solicitudes, no durante el build. Esto evita conectar CI o PR externos a producción; el inventario se renderiza dinámicamente.

Las pruebas de integración requieren una base Neon de pruebas migrada. Las pruebas de órdenes revierten sus transacciones; la prueba TOTP usa un secreto aislado y limpia su registro. Nunca ejecutar pruebas de escritura contra la base comercial real. La comprobación `smoke` es de lectura y verifica rutas, cabeceras y rechazo de accesos privados.

## Navegación y catálogo

Header blanco con filas de 104/52 px en escritorio, logo oficial de 100 px, buscador, favoritos y subtotal en soles. Las cantidades del carrito representan unidades. En móvil hay buscador visible, pestañas desplazables y menú lateral con foco gestionado mediante `<dialog>` nativo.

- `categoria=corales`: SPS + LPS + blandos, conservando las subcategorías.
- `categoria=peces`: `peces-marinos`.
- `categoria=anemonas`, `invertebrados`, `accesorios`: categorías independientes.
- `categoria=alimentos`: `alimentos-aditivos`.
- `ofertas=true`: productos activos marcados en oferta.
- Compatibilidad con `cat=Corales`, `cat=Anémonas`, `sale=1` y los slugs anteriores.

Favoritos guarda solo IDs (hasta 500) en este navegador; reconsulta precios y disponibilidad, contempla eliminados y sincroniza pestañas. El carrito valida datos persistidos, limita stock/WYSIWYG y siempre revalida precio y disponibilidad en el servidor al comprar. Los productos actuales son datos de prueba; accesorios puede estar vacío.

## Datos y migraciones

`npm run db:migrate` aplica SQL de `drizzle/` en orden, bajo una transacción y bloqueo de migración. Registra hashes en `aquapora_migrations` y rechaza modificar archivos ya aplicados. La baseline admite tanto una base vacía como el esquema previamente creado con `db:push`. Después añade privacidad de comprobantes y normaliza categorías, conservando IDs de productos y pedidos. Los tipos ambiguos de la categoría mixta abortan y revierten la migración.

Generar cambios futuros con `npm run db:generate`, revisar el SQL y aplicar mediante `db:migrate`. El runner también incluye migraciones de datos manuales; usa siempre prefijos de orden únicos. Reservar `db:push` para bases descartables. El seed es explícito (`npm run db:seed`) y nunca corre en CI/despliegues.

`npm run legacy:import -- export.json` es un esqueleto de Go-Live: valida el contrato JSON, IDs/slugs duplicados y categorías, sin escribir. `--apply` se rechaza intencionadamente. Antes de implementar la importación final, exportar el catálogo anterior, mapear IDs, trasladar imágenes `/api/images/` a Cloudinary y revisar un informe de altas/actualizaciones. No sustituir la tienda pública con los datos de prueba.

## Seguridad

Proxy verifica la firma para redirecciones; cada página/acción privada vuelve a validar sesión y su registro revocable en Neon. Cookies HttpOnly, SameSite=Lax, Secure en producción; caducidad de siete días y revocación al cerrar sesión. JWT con algoritmo, emisor, audiencia y sujeto restringidos.

Login: máximo 10 intentos por origen cada 15 minutos y 100 globales; contadores persistentes/atómicos. En Netlify se usa su cabecera `x-nf-client-connection-ip`; fuera de Netlify se aplica un bucket local común. Cada paso TOTP solo se acepta una vez, incluso entre instancias concurrentes. La falta de configuración o de base de datos impide autenticar.

Comprobantes: un número de pedido no concede acceso. El checkout crea un secreto de 256 bits, guarda únicamente su hash en Neon y entrega una cookie HttpOnly limitada a ese comprobante y 30 días. La URL no contiene el secreto. Solo el navegador comprador o una sesión administrativa válida pueden consultar los datos. Los pedidos anteriores sin secreto quedan accesibles únicamente al administrador. Respuestas privadas sin caché y sin indexación.

Órdenes: pending → confirmed/completed/cancelled; confirmed → completed/cancelled; completed → cancelled; cancelled es terminal. Repetir el mismo estado es idempotente respecto al stock. Confirmar o completar descuenta una vez, cancelar devuelve solo stock descontado. Bloqueos de filas y orden consistente de productos protegen la concurrencia; auditoría y cambios se guardan juntos.

Subidas: autenticación obligatoria, JPG/PNG/WebP/AVIF con firma comprobada, máximo 4 MB y conversión WebP por Cloudinary. El límite deja margen para transporte multipart/base64 en funciones de hosting. Verificar una subida real en el preview antes del Go-Live.

## CI/CD y Netlify

`.github/workflows/ci.yml` ejecuta npm ci, tipos, lint, pruebas, build y auditoría de dependencias de producción en cada push/PR a main. Las acciones están fijadas por commit. `clsx` y `tailwind-merge` se conservan y se usan en `cn()`.

El job de despliegue queda desactivado hasta el Go-Live. Preparación externa necesaria:

1. Configurar en Netlify las siete variables de `.env.local`, con valores de producción y alcance de funciones/runtime. En el dashboard, ADMIN_PASSWORD_HASH se pega literalmente (`scrypt$...$...`), sin las barras usadas en el archivo dotenv. Configurar región próxima a Neon.
2. En GitHub, environment `production`, secrets `NETLIFY_AUTH_TOKEN` y `PRODUCTION_DATABASE_URL`; variable `NETLIFY_SITE_ID` con el UUID del sitio.
3. Finalizar y revisar la importación del catálogo real. Activar `ENABLE_NETLIFY_DEPLOY=true` solo entonces.
4. Evitar un segundo publicador: desactivar autopublicación por Git en Netlify si GitHub Actions controlará releases. Proteger main con el check CI requerido.

El job usa el commit validado, migra de forma aditiva, construye con el adaptador fijado, sube un draft usando contexto production, ejecuta smoke y publica ese mismo deploy mediante la API oficial. Ejecuta smoke de nuevo en el dominio final. `NETLIFY_NEXT_SKEW_PROTECTION=true` mantiene compatibilidad de clientes abiertos entre despliegues.

`netlify.toml` configura el adaptador, Node y cabeceras estáticas; `next.config.ts` cubre SSR y respuestas privadas. Next/Netlify gestionan la caché de assets con hash; `/assets/*` se revalida y nunca se marca immutable. No hay exportación estática ni rewrite universal a index.html.

Rollback: anotar el ID de producción anterior antes de publicar; si falla la comprobación posterior, restaurar ese deploy en Netlify. Conservar las migraciones aditivas; no ejecutar automáticamente SQL inverso ni eliminar tablas/columnas. Restaurar datos requiere una copia/branch de Neon revisada. Mantener secretos y esquema compatibles durante toda la transición.

Aún se debe verificar el runtime del adaptador en un preview real conectado a la cuenta Netlify; un build local no demuestra una publicación ni garantiza disponibilidad de servicios externos.
