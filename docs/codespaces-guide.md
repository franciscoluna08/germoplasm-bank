# Guía para probar cambios en GitHub Codespaces

Esta guía es para usar la app sin tener que copiar y pegar archivos HTML completos. El proyecto es una app **Next.js**, así que los cambios se hacen en archivos como `app/page.tsx`, `components/SearchForm.tsx` y `app/globals.css`, no pegando un `index.html` suelto.

## Lo que pasó en tu captura

En la captura aparecen dos problemas comunes:

1. `npm error enoent` significa que corriste `npm install` / `npm run dev` en una carpeta que **no tiene `package.json`**. En otras palabras: la terminal no estaba parada dentro de la app Next.js.
2. `}PORT=3001 npm run dev` falló porque se pegó una llave `}` al principio. El comando correcto no lleva esa llave.

Para evitar esos dos errores, usá el bloque largo de la sección siguiente.

## Comando recomendado para pegar en Codespaces

Abrí la terminal desde `Terminal → New Terminal` y pegá **todo este bloque completo**:

```bash
PROJECT_DIR=$(find /workspaces /workspace -maxdepth 3 -name package.json -not -path "*/node_modules/*" -printf '%h\n' 2>/dev/null | head -n 1)
if [ -z "$PROJECT_DIR" ]; then
  echo "No encontré package.json. Abrí el Codespace del repo donde está la app Next.js o avisame con una captura."
else
  cd "$PROJECT_DIR"
  echo "Estoy usando esta carpeta: $(pwd)"
  git pull
  npm install
  npm run dev
fi
```

Cuando termine de arrancar, Codespaces normalmente muestra un aviso para abrir el puerto. Hacé clic en **Open in Browser**.

## Puerto que tenés que usar

Por defecto Next.js usa el puerto **3000**. En Codespaces lo vas a ver como una URL parecida a:

```text
https://...-3000.app.github.dev
```

Si el puerto 3000 está ocupado, frená el servidor con `Ctrl + C` y pegá este comando, sin llaves ni símbolos adelante:

```bash
npm run dev:3001
```

En ese caso abrí el puerto **3001** desde la pestaña **Ports** de Codespaces.

## Si querés hacerlo paso a paso

### 1. Ver dónde estás

Pegá:

```bash
pwd
```

Si ves algo como `/workspaces/Paspalum_genebank` pero ahí no existe `package.json`, no corras `npm install` todavía. Primero buscá la carpeta correcta con:

```bash
find /workspaces /workspace -maxdepth 3 -name package.json -not -path "*/node_modules/*" -printf '%h\n' 2>/dev/null
```

Después entrá a la carpeta que aparezca. Ejemplo:

```bash
cd /workspaces/germoplasm-bank
```

### 2. Traer los últimos cambios

Pegá:

```bash
git pull
```

Si Git dice que no puede porque tenés cambios locales, copiame el texto exacto del error antes de seguir.

### 3. Instalar dependencias

Pegá:

```bash
npm install
```

Esto prepara Next.js y las librerías del proyecto. Puede tardar unos minutos.

### 4. Levantar la app

Pegá:

```bash
npm run dev
```

## Ver cambios nuevos cuando ya está corriendo

Mientras `npm run dev` está abierto, Next.js actualiza la página solo. Si no ves el cambio:

1. Recargá el navegador con `Ctrl + R` / `Cmd + R`.
2. Si sigue igual, frená el servidor con `Ctrl + C` en la terminal.
3. Pegá:

```bash
rm -rf .next
npm run dev
```

## No pegues un `index.html` completo

No tenés que copiar el bloque largo de HTML que te pasé antes dentro de GitHub Pages. En este repositorio, la pantalla principal vive acá:

```text
app/page.tsx
```

Los estilos globales viven acá:

```text
app/globals.css
```

Y el buscador reutilizable vive acá:

```text
components/SearchForm.tsx
```

Si querés cambiar textos, colores o tamaños, decime qué querés cambiar y te paso exactamente el archivo y la línea, o te dejo un comando listo para pegar.

## Comando rápido para revisar antes de publicar

Cuando quieras revisar que no se rompió nada, pegá estos tres comandos:

```bash
npm run lint
npm run typecheck
npm run build
```

Si alguno falla, copiame el error completo y lo reviso.
