const db = require('./db');
const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1013767249884094534", "1203730039296888842"];
        
        this.setName("search");
        this.setDescription("[ADMIN ONLY] Search");
        
        this.addStringOption(option =>
            option.setName('q')
                .setDescription('Query')
				.setRequired(true));
    }
    
    async execute(ints) {
        var userID = ints.user.id;
        
        var q = ints.options.getString('q');
        
        if (userID != '554344892827172884' && userID != '1147518380211982377') return ints.reply('Admin only');

		var googleSr = require("google-sr");
        
        const searchResults = await googleSr.search({ query: `Debian 12 ${q} site:stackoverflow.com` });
        // console.log(searchResults);	
        
        var r;
        r = '**Maybe the following resources help:**\n';
        
        for (let i = 0; i < 3; i++) {
            var rr = searchResults[i];
            if (rr) {
                if (rr.link) {
                    r += `- ${rr.link}\n`;
                }
            } else {
                    r += `- *No result*`;
                }
        }
        
        await ints.reply(r);
        
    }

}

module.exports = { default: CMD };