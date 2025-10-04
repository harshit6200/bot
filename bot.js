const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

console.log('🚀 STARTING WHATSAPP BOT - BAILEYS VERSION');

// Clear previous sessions
if (fs.existsSync('./auth_info_baileys')) {
    console.log('🧹 Clearing previous session...');
}

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        const { version, isLatest } = await fetchLatestBaileysVersion();
        
        console.log(`Using Baileys version ${version.join('.')}, isLatest: ${isLatest}`);

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            logger: {
                level: 'silent'
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('📱 QR CODE - Scan with WhatsApp:');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                
                console.log('Connection closed, reconnecting:', shouldReconnect);
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnecting in 5 seconds...');
                    setTimeout(() => connectToWhatsApp(), 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ WHATSAPP CONNECTED SUCCESSFULLY!');
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const jid = msg.key.remoteJid;
            const senderName = msg.pushName || "User";
            const messageContent = (msg.message.conversation || '').trim().toLowerCase();

            console.log(`📨 Message from ${senderName}: ${messageContent}`);

            if (messageContent === 'hi' || messageContent === 'hello' || messageContent === 'menu') {
                await sock.sendMessage(jid, { 
                    text: `Hello ${senderName}! 👋\n\nWelcome to Sit n' Eat! 🍕\n\nType *menu* to see our delicious food options!` 
                });
            }
        });

    } catch (error) {
        console.error('Connection error:', error);
        console.log('🔄 Retrying in 10 seconds...');
        setTimeout(() => connectToWhatsApp(), 10000);
    }
}

// Start the bot
connectToWhatsApp();

// Keep alive
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
});
