import * as dotenv from 'dotenv';

// Cargar variables de entorno manualmente para asegurar que estén disponibles
dotenv.config();

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
};

export const googleOAuthConstants = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL:
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:4000/auth/google/callback',
};

// Debug: Mostrar las variables (quitar en producción)
console.log('🔧 Variables de entorno OAuth (con dotenv manual):');
console.log(
  'GOOGLE_CLIENT_ID:',
  process.env.GOOGLE_CLIENT_ID ? 'Configurado ✅' : 'No configurado ❌',
);
console.log(
  'GOOGLE_CLIENT_SECRET:',
  process.env.GOOGLE_CLIENT_SECRET ? 'Configurado ✅' : 'No configurado ❌',
);
console.log(
  'GOOGLE_CALLBACK_URL:',
  process.env.GOOGLE_CALLBACK_URL || 'Usando valor por defecto',
);
console.log(
  'JWT_SECRET:',
  process.env.JWT_SECRET ? 'Configurado ✅' : 'Usando valor por defecto',
);
