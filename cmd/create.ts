const { SlashCommand } = require('slashctrl');
const { Client } = require('ssh2');
const { generate } = require('generate-password');
const { readFileSync } = require('fs');
const { randomip } = require('random-ip');
const { dayjs } = require('dayjs');

class CMD extends SlashCommand {
  constructor() {
    super();
    this.guilds = ['1013767249884094534', '1203730039296888842'];
    this.setName('create');
    this.setDescription('Create a vps');
    this.addStringOption((option) =>
      option.setName('name').setDescription('VPS name').setRequired(true)
    );
  }

  async execute(ints) {
    const userID = ints.user.id;
    let user = await db.User.findOne({ userID });
    if (!user) {
      user = new db.User({
        userID,
        balance: 1,
        plan: 'free',
        vpsLimit: 1,
      });
      await user.save();
    }

    const vpsCount = await db.VPS.find({ userID });
    const vpsCountLength = vpsCount.length;

    if (!user.vpsLimit) {
      user.vpsLimit = 1;
      await user.save();
    }

    if (vpsCountLength >= user.vpsLimit) {
      return ints.reply(
        `You can only have ${user.vpsLimit} vps!`
      );
    }

    const plan = user.plan;

    let ram;
    let cpu;
    let disk;
    let minCredits;
    let cost;

    let pass;
    pass = generate({
      length: 15,
      uppercase: false,
      numbers: true,
    });
    const name = ints.options.getString('name');

    if (plan === 'free') {
      ram = 4;
      cpu = 1;
      disk = 5;
      minCredits = 0.01;
      cost = 1;
    }

    if (user.balance <= minCredits) {
      return ints.reply(
        `You need at least $${minCredits}, but you only have $${user.balance}`
      );
    }

    await ints.reply(
      `Creating...\n\n**PLEASE WAIT.** This might take a few minutes`
    );

    const conn = new Client();
    conn.on('ready', () => {
      console.log('Client :: ready');
      conn.exec(
        `/usr/bin/bash /root/make/free.sh ${pass} ${randomip('10.5.0.0', 16)} ${rand(
          100000,
          999999
        )}`,
        (err, stream) => {
          if (err) throw err;
          stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            try {
              const por = [];
              for (let ii = 1; ii <= 9; ii++) {
                por.push(`IP:3${proxId}${ii} -> 3${proxId}${ii}\n`);
              }
              const conns = [];
              conns.push('```\n');
              conns.push(`ssh root@IP -p 3${proxId}0`);
              conns.push('\n```');
              ints.user.send(
                `VPS IP: IP\nSSH port: 3${proxId}0\nVPS username: root\nVPS password: ${pass}\n\n**Forwarded ports:**\n${por}\n\nConnect to it by executing the following command in a terminal:\n${conns}`
              );
              ints.editReply(`Created! Check your DM!`);
            } catch (e) {
              console.log('DM error', String(e), e);
              ints.followUp(`Could not send DM! Use /list to see the details of the vps.`);
            }
            conn.end();
          }).on('data', (data) => {
            console.log('STDOUT: ' + data);
            if (String(data).includes('BTTM-Done')) {
              console.log('Making vps is done!', proxId);
              const dayjs = require('dayjs');
              const vps = new db.VPS({
                userID,
                name,
                password: pass,
                ram: ram * 1024,
                cpu: cpu,
                disk,
                hasUsed: false,
                usedCode: rand(100000, 999999),
                expiry: dayjs().add(3, 'day'),
                cost,
                proxID: proxId,
                ip: randomip('10.5.0.0', 16),
              });
              vps.save();
            } else {
              cOut += String(data + '\n');
            }
          }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
          });
        }
      );
    }).connect({
      host: 'IP',
      port: 0,
      username: '',
      password: '',
    });
  }
}

module.exports = { default: CMD };
