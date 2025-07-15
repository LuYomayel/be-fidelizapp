#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando cambio de nombres de Stampia a Stampia...\n');

// Configuración de reemplazos
const replacements = [
  // Nombres de aplicación
  { from: /Stampia/g, to: 'Stampia' },
  { from: /stampia/g, to: 'stampia' },
  { from: /STAMPIA/g, to: 'STAMPIA' },

  // URLs y dominios - PRODUCCIÓN
  {
    from: /stampia\.luciano-yomayel\.com/g,
    to: 'stampia.luciano-yomayel.com',
  },
  {
    from: /api-stampia\.luciano-yomayel\.com/g,
    to: 'api.stampia.luciano-yomayel.com',
  },

  // URLs y dominios - DESARROLLO
  {
    from: /dev\.stampia\.luciano-yomayel\.com/g,
    to: 'dev.stampia.luciano-yomayel.com',
  },
  {
    from: /api-dev\.stampia\.luciano-yomayel\.com/g,
    to: 'api-dev.stampia.luciano-yomayel.com',
  },

  // URLs y dominios - TESTING
  {
    from: /test\.stampia\.luciano-yomayel\.com/g,
    to: 'test.stampia.luciano-yomayel.com',
  },
  {
    from: /api-test\.stampia\.luciano-yomayel\.com/g,
    to: 'api-test.stampia.luciano-yomayel.com',
  },

  // Nombres de base de datos
  { from: /stampia_dev/g, to: 'stampia_dev' },
  { from: /stampia_test/g, to: 'stampia_test' },
  { from: /stampia_prod/g, to: 'stampia_prod' },

  // Nombres de procesos PM2
  { from: /be-stampia-/g, to: 'be-stampia-' },
  { from: /stampia-/g, to: 'stampia-' },

  // Rutas de directorios
  { from: /\/home\/be-stampia-/g, to: '/home/be-stampia-' },
  { from: /\/home\/stampia-/g, to: '/home/stampia-' },

  // Descripciones y títulos
  { from: /Sistema de Sellos/g, to: 'Sistema de Sellos' },
  { from: /App de Sellos/g, to: 'App de Sellos' },
  { from: /Programa de Sellos/g, to: 'Programa de Sellos' },
  { from: /programa de sellos/g, to: 'programa de sellos' },
  { from: /sellos/g, to: 'sellos' },
  { from: /tarjeta de sellos/g, to: 'tarjeta de sellos' },
];

// Archivos y directorios a procesar
const projectRoots = [
  process.cwd(), // Backend (be-stampia)
  path.join(process.cwd(), '..', 'stampia'), // Frontend
];

// Patrones de archivos a procesar
const filePatterns = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.json',
  '**/*.md',
  '**/*.yml',
  '**/*.yaml',
  '**/*.config.js',
  '**/*.config.ts',
];

// Directorios a omitir
const excludeDirs = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'logs',
  'uploads',
  '.qodo',
  'coverage',
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (content.match(from)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Procesado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directorio no encontrado: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Omitir directorios excluidos
      if (!excludeDirs.includes(file)) {
        processDirectory(filePath);
      }
    } else {
      // Procesar archivos con extensiones específicas
      const ext = path.extname(file);
      const validExtensions = [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
        '.md',
        '.yml',
        '.yaml',
      ];

      if (
        validExtensions.includes(ext) ||
        file.endsWith('.config.js') ||
        file.endsWith('.config.ts')
      ) {
        processFile(filePath);
      }
    }
  });
}

// Procesar ambos proyectos
projectRoots.forEach((projectRoot) => {
  const projectName = path.basename(projectRoot);
  console.log(`\n📁 Procesando proyecto: ${projectName}`);
  console.log(`📍 Ruta: ${projectRoot}`);

  if (fs.existsSync(projectRoot)) {
    processDirectory(projectRoot);
  } else {
    console.log(`⚠️  Proyecto no encontrado: ${projectRoot}`);
  }
});

console.log('\n🎉 ¡Cambio de nombre completado!');
console.log('\n📋 Próximos pasos:');
console.log('1. Revisar los cambios con git diff');
console.log(
  '2. Crear las bases de datos: stampia_dev, stampia_test, stampia_prod',
);
console.log('3. Configurar los dominios en tu servidor');
console.log('4. Actualizar Google Cloud Console con las nuevas URLs');
console.log('5. Configurar los secrets en GitHub Actions');
console.log('6. Crear las branches: dev, test (main ya existe)');
console.log('7. Reiniciar las aplicaciones con PM2');

console.log('\n🔗 URLs actualizadas:');
console.log('- DEV: https://dev.stampia.luciano-yomayel.com');
console.log('- TEST: https://test.stampia.luciano-yomayel.com');
console.log('- PROD: https://stampia.luciano-yomayel.com');
console.log('- API DEV: https://api-dev.stampia.luciano-yomayel.com');
console.log('- API TEST: https://api-test.stampia.luciano-yomayel.com');
console.log('- API PROD: https://api.stampia.luciano-yomayel.com');
