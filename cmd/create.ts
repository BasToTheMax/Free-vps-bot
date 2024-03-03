const db = require('./db');
const prox = require('./prox');
const { SlashCommand } = require('slashctrl');

var randomip = require('random-ip');

var generator = require('generate-password');


class CMD extends SlashCommand {

    constructor() {
        super();
        
        this.guilds = ["1013767249884094534", "1203730039296888842"];
        
        this.setName("create");
        this.setDescription("Create a vps");
        
        this.addStringOption(option =>
            option.setName('name')
                .setDescription('VPS name')
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
                plan: 'free',
                vpsLimit: 1
            });
            await user.save();
        }
        
        var vpsCount = await db.VPS.find({
            userID: userID
        });
        console.log(vpsCount);
        vpsCount = vpsCount.length;
        
        if (!user.vpsLimit) {
            user.vpsLimit = 1;
            await user.save();
        }
        
         if (vpsCount >= user.vpsLimit) {
            return ints.reply('You can only have '+user.vpsLimit+' vps!')
        }
        
        var plan = user.plan;
        
        var ram;
        var cpu;
        var disk;
        var minCredits;
        var cost;
        
        var pass;
        pass = generator.generate({
            length: 15,
            uppercase: false,
            numbers: true
        });
        var name = ints.options.getString('name');
        
        if (plan == 'free') {
            ram = 4;
            cpu = 1;
            disk = 5;
            minCredits = 0.01;
            cost = 1;
        }
        
        if (user.balance <= minCredits) {
            return ints.reply(`You need at least $${minCredits}, but you only have $${user.balance}`);
        }
        
        await ints.reply(`Creating...\n\n**PLEASE WAIT.** This might take a few minutes`);
        
       const { readFileSync } = require('fs');

        const { Client } = require('ssh2');
        
        var proxId;
        
        var cOut;
        cOut = '';

        var ip = randomip('10.5.0.0', 16);

        const rand = (min, max) => {
            return Math.round(Math.random() * (max - min)) + min;
        }
        var rCm;
        rCm = rand(100000, 999999);
        
        const conn = new Client();
        conn.on('ready', () => {
          console.log('Client :: ready');
          conn.exec(`/usr/bin/bash /root/make/free.sh ${pass} ${ip} ${rCm}`, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
              console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                
                try {
                    var por = '';
                    
                    for (let ii = 1; ii<=9; ii++) {
                        por += `IP:3${proxId}${ii} -> 3${proxId}${ii}\n`
                    }
                
                    var conns = '';
                    
                    conns += '```\n';
                    conns += `ssh root@IP -p 3${proxId}0`
                    conns += '\n```'
                    
                      ints.user.send(`VPS IP: IP\nSSH port: 3${proxId}0\nVPS username: root\nVPS password: ${pass}\n\n**Forwarded ports:**\n${por}\n\nConnect to it by executing the following command in a terminal:\n${conns}`);
                    
                    ints.editReply(`Created! Check your DM!`);
                } catch(e) {
                    console.log('DM error', String(e), e);
                     ints.followUp(`Could not send DM! Use /list to see the details of the vps.`);
                }
               
                
              conn.end();
            }).on('data', (data) => {
              console.log('STDOUT: ' + data);
                
                if (String(data).includes('BTTM-Done')) {
                    console.log('Making vps is done!', proxId);
                    
                    const dayjs = require('dayjs')
                    
                    var vps = new db.VPS({
                        userID,

                        name,
                        password: pass,

                        ram: ram*1024,
                        cpu: cpu,
                        disk,

                        hasUsed: false,
                        usedCode: rCm,
                        
                        expiry: dayjs().add(3, 'day'),
                        cost,

                        proxID: proxId,
                        ip: ip
                    });
                    vps.save();
                    
                }
                
                if (String(data).startsWith('ID')) {
                    proxId = String(data).replace('ID-', '');
                    proxId = String(proxId).replace('\n', '');
                    console.log('Got proxmox ID:', proxId);
                } else {
                    
                   	cOut += String(data + '\n');
                    
                }
                
            }).stderr.on('data', (data) => {
              console.log('STDERR: ' + data);
            });
          });
        }).connect({
          host: 'IP',
          port: 0,
          username: '',
          password: ''
        });
    }

}

module.exports = { default: CMD };