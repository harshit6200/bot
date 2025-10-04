const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 STARTING WHATSAPP BOT - whatsapp-web.js VERSION');

// Cloud-optimized Puppeteer configuration
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process',
            '--disable-features=VizDisplayCompositor'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    }
});

client.on('qr', (qr) => {
    console.log('📱 QR CODE RECEIVED - SCAN WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WHATSAPP CLIENT IS READY AND CONNECTED!');
});

client.on('authenticated', () => {
    console.log('🔐 AUTHENTICATED SUCCESSFULLY!');
});

client.on('auth_failure', (msg) => {
    console.log('❌ AUTH FAILED:', msg);
});

client.on('disconnected', (reason) => {
    console.log('❌ DISCONNECTED:', reason);
    console.log('🔄 RECONNECTING...');
    client.initialize();
});

client.on('message', async (message) => {
    console.log('Message from:', message.from, 'Content:', message.body);
    await message.reply('Hello! Bot is working! 🎉 Type "menu" to see options.');
});

// Initialize client
client.initialize();

// Error handling
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
});
