module.exports = {
  apps: [
    // Backend API (NestJS)
    {
      name: 'be-stampia',
      script: './be-stampia/dist/src/main.js',
      cwd: './be-stampia',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,

        // Base de datos MySQL
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USERNAME: 'stampia_user',
        DB_PASSWORD: 'your_secure_password_here',
        DB_NAME: 'stampia',

        // JWT
        JWT_SECRET: 'your_jwt_secret_key_here_make_it_very_long_and_secure',

        // CORS
        CORS_ORIGIN: 'https://your-frontend-domain.com',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 4000,
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_USERNAME: 'root',
        DB_PASSWORD: 'password',
        DB_NAME: 'stampia',
        JWT_SECRET: 'secretKey',
        CORS_ORIGIN: 'http://localhost:3000',
      },
      log_file: './be-stampia/logs/combined.log',
      out_file: './be-stampia/logs/out.log',
      error_file: './be-stampia/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
    },

    // Frontend (Next.js)
    {
      name: 'stampia',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './stampia',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,

        // API URL para producción
        NEXT_PUBLIC_API_URL: 'https://api.your-domain.com',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
      log_file: './stampia/logs/combined.log',
      out_file: './stampia/logs/out.log',
      error_file: './stampia/logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
