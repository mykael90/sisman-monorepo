module.exports = {
     apps: [
    {
        name: 'backend',
        script: './apps/backend/dist/main.js',
        instances: 1,
        autorestart: true,
        watch: false
    },
    {
        name: 'scraping-api',
        script: './apps/scraping-api/dist/main.js',
        instances: 1,
        autorestart: true,
        watch: false
    },
    {
        name: 'frontend',
        script: 'sh',                     // 1. O executável agora é o shell do sistema.
        args: '-c "pnpm run start"',   // 2. Passamos nosso comando como uma ÚNICA STRING para o shell.
        cwd: './apps/frontend',            // 3. O PM2 ainda muda para este diretório primeiro.
        instances: 1,
        autorestart: true,
        watch: false
        // exp_backoff_restart_delay: 100, // optional, adjust as needed
        //  max_memory_restart: '400M' // optional, adjust as needed
    }
]}
