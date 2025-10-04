const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

console.log('🚀 STARTING WHATSAPP BOT - BAILEYS V6');

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        const { version, isLatest } = await fetchLatestBaileysVersion();
        
        console.log(`✅ Using Baileys version ${version.join('.')}, isLatest: ${isLatest}`);

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
            // Remove logger completely to avoid the child function error
            getMessage: async (key) => {
                return {
                    conversation: 'hello'
                }
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
                
                console.log('Connection closed due to:', lastDisconnect?.error?.message);
                console.log('Reconnecting:', shouldReconnect);
                
                if (shouldReconnect) {
                    console.log('🔄 Reconnecting in 5 seconds...');
                    setTimeout(() => connectToWhatsApp(), 5000);
                }
            } else if (connection === 'open') {
                console.log('✅ WHATSAPP CONNECTED SUCCESSFULLY! Bot is now ready.');
            }
        });

        // Simple message handler
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const jid = msg.key.remoteJid;
            const senderName = msg.pushName || "Customer";
            const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

            console.log(`📨 Message from ${senderName}: ${messageText}`);

            if (messageText.toLowerCase().includes('hi') || messageText.toLowerCase().includes('hello') || messageText.toLowerCase() === 'menu') {
                await sock.sendMessage(jid, { 
                    text: `Hello ${senderName}! 👋\n\nWelcome to *Sit n' Eat*! 🍕\n\nI'm your food ordering assistant. Here's what you can do:\n\n• Type *menu* to see food categories\n• Type *order* to start ordering\n• We have pizza, burgers, drinks and more!\n\nHow can I help you today? 😊` 
                });
            }
        });

    } catch (error) {
        console.error('❌ Connection error:', error.message);
        console.log('🔄 Retrying in 10 seconds...');
        setTimeout(() => connectToWhatsApp(), 10000);
    }
}

// Start the bot
connectToWhatsApp();

// Error handling
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
});
