module.exports = {
  apps: [
    {
      name: 'byduni-payment',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: process.env.PORT
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT
      },
      // Auto restart when app crashes
      autorestart: true,
      // Watch for file changes (only in development)
      watch: false,
      // Ignore watch files
      ignore_watch: [
        'node_modules',
        'logs',
        '*.log',
        '.git',
        'dist'
      ],
      // Max memory usage before restart
      max_memory_restart: '500M',
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      // Merge logs
      merge_logs: true,
      // Log date format
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Restart delay
      min_uptime: '10s',
      max_restarts: 10,
      // Restart delay between restarts
      restart_delay: 4000,
      // Kill timeout
      kill_timeout: 5000,
      // Wait for listen event
      wait_ready: true,
      listen_timeout: 10000,
      // Shutdown with message
      shutdown_with_message: true
    }
  ],
};

