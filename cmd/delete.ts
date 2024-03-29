const db = require('./db');
const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1013767249884094534", "1203730039296888842"];
        
        this.setName("delete");
        this.setDescription("Deletes your vps");
        
        this.addIntegerOption(option =>
            option.setName('id')
                .setDescription('VPS ID (found in /list)')
				.setRequired(true));
        
        this.addBooleanOption(option =>
            option.setName('sure')
                .setDescription('Are you sure you want to delete your vps?')
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
        var sure = ints.options.getBoolean('sure');
        
        if (!sure) return ints.reply(`Cancelled destroy. User is not sure.`);
        
        var vps = await db.VPS.findOne({
            proxID: id
        });
        
        if (!vps) {
            return await ints.reply(`[1] VPS ${id} not found`);
        }
        
        if (vps.userID != ints.user.id) {
            if (userID != '554344892827172884') {
            	return await ints.reply(`[2] No access to VPS ${id} - ${vps.userID} / ${userID}`);
            }
        }
        
        
        const exec = require('./ssh');
        
        await ints.deferReply();
        
       await exec(`bash /root/remove.sh ${id}`);

      	var dbDel = await db.VPS.deleteMany({ proxID: id });
        
        console.log('delete', dbDel);
        
        ints.editReply(`VPS destroyed`);
    }

}

module.exports = { default: CMD };
