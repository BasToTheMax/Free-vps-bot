const db = require('./db');
const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = [ "1203730039296888842" ];
        
        this.setName("used");
        this.setDescription("Mark your vps as used");
        
        this.addIntegerOption(option =>
            option.setName('code')
                .setDescription('Code')
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
        
        var id = ints.options.getInteger('code');
        
        var vps = await db.VPS.findOne({
            usedCode: id
        });
        
        if (!vps) {
            return ints.reply(`Code ${id} not found`);
        }
        
         const dayjs = require('dayjs')
        vps.expiry = dayjs().add(1, 'day');
        vps.hasUsed = true;
        
		await vps.save();
        
        const { time } = require('discord.js');

        const relative = time(  new Date(vps.expiry) , 'R');
        
        ints.reply(`Activated vps with code ${id}!\nExpiry date: ${relative}`)
    }

}

module.exports = { default: CMD };