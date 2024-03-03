const { SlashCtrl } = require('slashctrl');
const path = require('path');

const exec = require('./cmd/ssh');

var log = console.log;

var botToken = '';

const slashCtrl = new SlashCtrl({
    token: botToken,
    applicationId: ''
});

slashCtrl.publishCommandsFromFolder(path.join(__dirname, 'cmd'));

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const db = require('./cmd/db');

    var isChecking;
    isChecking = false;

    setInterval(async () => {
        log('> Checking vps expire');

        if (isChecking == true) {
            return console.log('already checking expire');
        }

        isChecking = true;

        var vps = await db.VPS.find({
            expiry: {
                $lt: Date.now()
            }
        });

        for (let ab = 0; ab < vps.length; ab++) {
            var expiredVPS = vps[ab];
            const channel = client.channels.cache.get('1204045694164533269');
            if (!expiredVPS.proxID) {
                console.log(`vps ${expiredVPS._id} does not have proxmox id`, expiredVPS);

                channel.send(`<@${expiredVPS.userID}> Your vps failed to create and has been removed from the database. Try again with /create in #cmds`);

                await db.VPS.deleteMany({ _id: expiredVPS._id });

            } else {

                await exec('bash /root/remove.sh ' + expiredVPS.proxID);

                var r;
                r = 'expired';

                if (expiredVPS.hasUsed == false) {
                    r = 'vps was not activated in time';
                }
                if (expiredVPS.hasUsed == null || expiredVPS.hasUsed == undefined) {
                    r = 'using alpine linux. We switched back to debian because alpine was buggy, so your vps was deleted, sorry';
                }

                channel.send(`VPS ${expiredVPS.proxID} was deleted because: ${r} - <@${expiredVPS.userID}>`);

                await db.VPS.deleteMany({ proxID: expiredVPS.proxID });
            }
        }

        isChecking = false;
        console.log('> Expiry check done!')

        // console.log('List', vps);
    }, 60 * 1000);
});

client.login(botToken);

client.on('interactionCreate', async interaction => {
    console.log(`> ${interaction.user.username} -> /${interaction.commandName}`);
    slashCtrl.handleCommands(interaction);
});
