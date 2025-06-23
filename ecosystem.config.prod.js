module.exports = {
     apps: [
    {
        name: 'backend',
        script: './apps/backend/dist/index.js',
        instances: 1,
        autorestart: true,
        watch: false
        //   env: {
        //     NODE_ENV: 'production',
        //     PORT: 3000, // Porta para a webapp1
        //   },
    },
    {
        name: 'scraping-api',
        script: './apps/scraping-api/dist/index.js',
        instances: 1,
        autorestart: true,
        watch: false
        //   env: {
        //     NODE_ENV: 'production',
        //     PORT: 3001, // Porta para a webapp2
        //   },
    },
    {
        name: 'frontend',
        script: 'pnpm',
        args: 'start',
        instances: 1,
        autorestart: true,
        watch: false
        // exp_backoff_restart_delay: 100, // optional, adjust as needed
        //  max_memory_restart: '400M' // optional, adjust as needed
        //   env: {
        //     NODE_ENV: 'production',
        //     PORT: 3000, // Porta para a webapp1
        //   },
    }
]}
