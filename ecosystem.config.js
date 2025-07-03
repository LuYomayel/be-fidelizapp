module.exports = {
  apps: [
    {
      name: 'be-fidelizapp',
      script: 'dist/src/main.js',
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
        DB_USERNAME: 'fidelizapp_user',
        DB_PASSWORD: 'your_secure_password_here',
        DB_NAME: 'fidelizapp',

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
        DB_NAME: 'fidelizapp',
        JWT_SECRET: 'secretKey',
        CORS_ORIGIN: 'http://localhost:3000',
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
