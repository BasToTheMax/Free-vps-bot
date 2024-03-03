const { SlashCommand } = require('slashctrl');
const fs = require('fs');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds= ["1013767249884094534", "1203730039296888842"];
        
        this.setName("donate");
        this.setDescription("Get the donate link");
    }
    
    execute(interaction) {
        interaction.reply(fs.readFileSync('/home/container/donate.txt').toString())
    }

}

module.exports = { default: CMD };