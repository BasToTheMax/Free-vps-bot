const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds= ["1013767249884094534", "1203730039296888842"];
        
        this.setName("ping");
        this.setDescription("Check if the bot is online");
    }
    
    execute(interaction) {
        interaction.reply('**Pong** :coin: :D')
    }

}

module.exports = { default: CMD };