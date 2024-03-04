const { SlashCommand } = require('slashctrl');
const db = require('./db');

class DeleteCommand extends SlashCommand {
  constructor() {
    super();
    this.guilds = ['1013767249884094534', '1203730039296888842'];
    this.setName('delete');
    this.setDescription('Deletes your VPS');
    this.addIntegerOption(option =>
      option.setName('id').setDescription('VPS ID (found in /list)').setRequired(true)
    );
    this.addBooleanOption(option =>
      option.setName('sure').setDescription('Are you sure you want to delete your VPS?').setRequired(true)
    );
  }

  async execute(ints) {
    const userID = ints.user.id;
    const user = await db.User.findOne({ userID });
    if (!user) {
      user = new db.User({ userID, balance: 1, plan: 'free' });
      await user.save();
    }
    const id = ints.options.getInteger('id');
    const sure = ints.options.getBoolean('sure');
    if (!sure) return ints.reply(`Cancelled destroy. User is not sure.`);
    const vps = await db.VPS.findOne({ proxID: id });
    if (!vps) {
      return await ints.reply(`[1] VPS ${id} not found`);
    }
    if (vps.userID !== ints.user.id) {
      if (userID !== '554344892827172884') {
        return await ints.reply(`[2] No access to VPS ${id} - ${vps.userID} / ${userID}`);
      }
    }
    const exec = require('./ssh');
    await ints.deferReply();
    await exec(`bash /root/remove.sh ${id}`);
    const dbDel = await db.VPS.deleteOne({ _id: vps._id });
    console.log('delete', dbDel);
    ints.editReply(`VPS destroyed`);
  }
}

module.exports = { default: DeleteCommand };
