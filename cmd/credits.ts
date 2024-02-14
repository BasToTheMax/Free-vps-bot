const db = require('./db');
const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1013767249884094534", "1203730039296888842"];
        
        this.setName("credits");
        this.setDescription("Get your balance");
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
        
        
        ints.reply(`Your balance: $${user.balance}`)
    }

}

module.exports = { default: CMD };