const { SlashCtrl } = require('slashctrl');
const path = require('path');

var log = console.log;

var botToken = '';

const slashCtrl = new SlashCtrl({
    token: botToken,
    applicationId: ''
});

slashCtrl.publishCommandsFromFolder(path.join(__dirname, 'cmd'));

const { Client, GatewayIntentBits } = require( 'discord.js' );
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
    
    const db = require('./cmd/db');
    
    setInterval(async () => {
        log('> Checking vps expire');
        
         var vps = await db.VPS.find({
            expiry: {
                $lt: Date.now()
            }
        });
        
        console.log('List', vps);
    }, 60*1000);
});

client.login(botToken);

client.on('interactionCreate', async interaction => {
    console.log(`> ${interaction.user.username} -> /${interaction.commandName}`);
    slashCtrl.handleCommands(interaction);
});
