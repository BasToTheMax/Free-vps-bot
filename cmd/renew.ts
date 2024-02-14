const db = require('./db');
const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1013767249884094534", "1203730039296888842"];
        
        this.setName("renew");
        this.setDescription("Renew your vps");
        
        this.addIntegerOption(option =>
            option.setName('id')
                .setDescription('VPS ID (found in /list)')
				.setRequired(true));
    }
    
    async execute(ints) {
        var userID = ints.user.id;
        
        var user = await db.User.findOne({
            userID: userID
        });
        
        if (!user) {
            user = new db.User({
                userID,
                balance: 1,
                plan: 'free'
            });
            await user.save();
        }
        
        var id = ints.options.getInteger('id');
        
        var vps = await db.VPS.findOne({
            userID: userID,
            proxID: id
        });
        
        if (!vps) {
            return ints.reply(`VPS ${id} not found`);
        }
        
         const dayjs = require('dayjs')
        vps.expiry = dayjs().add(3, 'day');
        
		await vps.save();
        
        const { time } = require('discord.js');

        const relative = time(  new Date(vps.expiry) , 'R');
        
        ints.reply(`Renewed vps ${id}!\nExpiry date: ${relative}`)
    }

}

module.exports = { default: CMD };