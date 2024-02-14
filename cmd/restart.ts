const db = require('./db');
const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1013767249884094534", "1203730039296888842"];
        
        this.setName("restart");
        this.setDescription("Restart your vps");
        
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
        
        
        const exec = require('./ssh');
        
        await ints.deferReply();
        
        await exec(`pct reboot ${id}`);
        
        ints.editReply(`VPS restart!`);
    }

}

module.exports = { default: CMD };