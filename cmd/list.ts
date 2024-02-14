const db = require('./db');
   const { time } = require('discord.js');
const { SlashCommand } = require('slashctrl');

class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1013767249884094534", "1203730039296888842"];
        
        this.setName("list");
        this.setDescription("List your vps");
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
        
        var vps = await db.VPS.find({
            userID: userID
        });
        
        var res;
        res = '';
        
        const dayjs = require('dayjs')
        
        for(let i = 0; i < vps.length; i++) {
            
            var vpsI = vps[i];
            
            res += `\n\n**${vpsI.name} (${vpsI.proxID})**\nID: ${vpsI.proxID}\n${vpsI.ram/1024} GB ram\n${vpsI.cpu} vCPU\n${vpsI.disk} GB disk\nSSH port: 3${vpsI.proxID}0\nForwarded ports: 3${vpsI.proxID}1-3${vpsI.proxID}9\nIP:185.234.69.13\nPassword: ||${vpsI.password}||\n\nExpiry: ${time(  new Date(vpsI.expiry) , 'R')}`;
            
        }
        
        await ints.reply({ content: `# Your vps:${res}`, ephemeral: true})
    }

}

module.exports = { default: CMD };