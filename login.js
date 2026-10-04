const { Innertube, UniversalCache } = require('youtubei.js');
const path = require('path');

async function login() {
    console.log('\n=============================================================');
    console.log('🔑 YTSaver / viedown - 1-Click Google Device Authentication');
    console.log('=============================================================\n');
    console.log('This will sign in your server permanently to bypass:');
    console.log('"Video is login required" datacenter IP blocks.\n');

    const cachePath = path.resolve(__dirname, '.yt_session');
    
    try {
        const yt = await Innertube.create({
            cache: new UniversalCache(true, cachePath),
            device_category: 'mobile',
        });

        if (yt.session.logged_in) {
            console.log('✅ Server is ALREADY logged in!');
            console.log('To sign out or switch accounts, delete the folder: .yt_session/\n');
            process.exit(0);
        }

        yt.session.on('auth-pending', (data) => {
            console.log('-------------------------------------------------------------');
            console.log('👉 STEP 1: On your phone or PC browser, open this link:');
            console.log(`\n   \x1b[36m\x1b[4m${data.verification_url}\x1b[0m\n`);
            console.log('👉 STEP 2: Enter this code:');
            console.log(`\n   \x1b[32m\x1b[1m${data.user_code}\x1b[0m\n`);
            console.log('-------------------------------------------------------------');
            console.log('⏳ Waiting for you to authorize the device...\n');
        });

        yt.session.on('auth', ({ credentials }) => {
            console.log('\n🎉 SUCCESS! Authentication complete!');
            console.log('Tokens saved permanently to:', cachePath);
            console.log('Your server is now verified. "Video is login required" is permanently resolved.');
            console.log('Restart your server (npm start or pm2 restart) to apply!\n');
            process.exit(0);
        });

        yt.session.on('auth-error', (err) => {
            console.error('\n❌ Authentication failed:', err.message);
            process.exit(1);
        });

        await yt.session.signIn();
    } catch (err) {
        console.error('Initialization error:', err.message);
        process.exit(1);
    }
}

login();
