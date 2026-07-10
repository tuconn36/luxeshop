module.exports = {
  apps: [
    {
      name: 'luxe-api',
      script: 'api/server.js',
      cwd: 'd:/luxe',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      error_file: 'd:/luxe/logs/api-error.log',
      out_file: 'd:/luxe/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'luxe-web',
      script: 'web/node_modules/vite/bin/vite.js',
      args: '--host --port 3000',
      cwd: 'd:/luxe/web',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development'
      },
      error_file: 'd:/luxe/logs/web-error.log',
      out_file: 'd:/luxe/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
