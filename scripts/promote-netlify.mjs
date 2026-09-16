import { readFile } from 'node:fs/promises';
const { NETLIFY_SITE_ID: site, NETLIFY_AUTH_TOKEN: token } = process.env;
if (!site || !token || !process.argv[2]) throw new Error('Falta configuración de Netlify o archivo de despliegue.');
const deploy = JSON.parse(await readFile(process.argv[2], 'utf8'));
if (!deploy.deploy_id || deploy.site_id !== site) throw new Error('El despliegue no corresponde al sitio configurado.');
const response = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(site)}/deploys/${encodeURIComponent(deploy.deploy_id)}/restore`, {
  method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(60000),
});
if (!response.ok) throw new Error(`No se pudo publicar el despliegue verificado: HTTP ${response.status}`);
console.log('Publicado el mismo despliegue que pasó las pruebas de humo.');
