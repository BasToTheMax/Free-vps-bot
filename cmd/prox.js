// import proxmoxApi from "proxmox-api";
const { proxmoxApi } = require('proxmox-api');
const promox = proxmoxApi({host: '', password: '', username: ''});

promox.nod = '';

module.exports = promox;