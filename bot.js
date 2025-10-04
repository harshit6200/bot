const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

console.log('🚀 STARTING ULTRA SIMPLE BOT');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    console.log(`✅ Using Baileys version ${version.join('.')}`);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        
        if (qr) {
            console.log('📱 SCAN THIS QR CODE:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'open') {
            console.log('✅ CONNECTED TO WHATSAPP! Bot is ready.');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (msg.message && !msg.key.fromMe) {
            const jid = msg.key.remoteJid;
            await sock.sendMessage(jid, { text: 'Hello! Your bot is working! 🎉\n\nType "menu" to see food options.' });
        }
    });
}

startBot().catch(err => {
    console.error('Failed to start:', err);
    console.log('Restarting in 5 seconds...');
    setTimeout(startBot, 5000);
});
