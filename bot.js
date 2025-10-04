const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🔴 STARTING WHATSAPP BOT - whatsapp-web.js VERSION');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('🟢 QR CODE RECEIVED - SCAN WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WHATSAPP CLIENT IS READY AND CONNECTED!');
});

client.on('message', async (message) => {
    await message.reply('Hello! Bot is working! 🎉');
});

client.initialize();