module.exports = {
    apps: [
        {
            name: 'ytsaver',
            script: 'server.js',
            instances: 1,
            autorestart: true,
            max_memory_restart: '1G',
            env: { NODE_ENV: 'production', PORT: 3000 },
        },
    ],
};
