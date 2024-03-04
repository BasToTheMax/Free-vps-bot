const { SlashCtrl } = require('slashctrl');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const exec = require('./cmd/ssh');
const db = require('./cmd/db');

const botToken = '';
const applicationId = '';
const channelId = '1204045694164533269';

const slashCtrl = new SlashCtrl({
  token: botToken,
  applicationId: applicationId
});

slashCtrl.publishCommandsFromFolder(path.join(__dirname, 'cmd'));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  startVpsExpiryCheck();
});

client.on('interactionCreate', async (interaction) => {
  console.log(`> ${interaction.user.username} -> /${interaction.commandName}`);
  slashCtrl.handleCommands(interaction);
});

client.login(botToken);

async function startVpsExpiryCheck() {
  console.log('> Starting VPS expiry check');
  setInterval(async () => {
    try {
      console.log('> Checking VPS expiry');
      const expirationThreshold = Date.now() + 3600000; // 1 hour threshold
      const vps = await db.VPS.find({ expiry: { $lt: expirationThreshold } });

      for (let i = 0; i < vps.length; i++) {
        const expiredVPS = vps[i];
        const channel = client.channels.cache.get(channelId);

        if (!expiredVPS.proxID) {
          console.log(`VPS ${expiredVPS._id} does not have a proxmox ID`, expiredVPS);
          channel.send(`<@${expiredVPS.userID}> Your VPS failed to create and has been removed from the database. Try again with /create in #cmds`);
          await db.VPS.deleteMany({ _id: expiredVPS._id });
        } else {
          const expirationTime = new Date(expiredVPS.expiry);
          const timeUntilExpiry = expirationTime - Date.now();
          const hoursUntilExpiry = Math.floor(timeUntilExpiry / 3600000);
          let r = 'expired';

          if (expiredVPS.hasUsed === false) {
            r = 'VPS was not activated in time';
          } else if (expiredVPS.hasUsed === null || expiredVPS.hasUsed === undefined) {
            r = 'Using Alpine Linux. We switched back to Debian because Alpine was buggy, so your VPS was deleted. Sorry.';
          }

          if (hoursUntilExpiry <= 1) {
            channel.send(`VPS ${expiredVPS.proxID} will be deleted soon (${hoursUntilExpiry} hour(s) remaining) because: ${r} - <@${expiredVPS.userID}>`);
          } else {
            channel.send(`VPS ${expiredVPS.proxID} was deleted because: ${r} - <@${expiredVPS.userID}>`);
          }

          await exec(`bash /root/remove.sh ${expiredVPS.proxID}`);
          await db.VPS.deleteMany({ proxID: expiredVPS.proxID });
        }
      }

      console.log('> Expiry check done!');
    } catch (error) {
      console.error('Error occurred during VPS expiry check:', error);
    }
  }, 60 * 1000);
}
