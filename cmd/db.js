const mongoose = require('mongoose');
var us = '';
var ww = '';
var db = '';
mongoose.connect(`mongodb+srv://${us}:${ww}@{db}.{cluster}.mongodb.net/${db}?retryWrites=true&w=majority`);

const User = mongoose.model('User', {
    userID: String,
    balance: Number,
    
    vpsLimit: Number,
    
    plan: String // free
});

const VPS = mongoose.model('VPS', {
    userID: String,
    ip: String,
    
    proxID: Number,
    
    name: String,
    
    ram: Number,
    cpu: Number,
    disk: Number,
    
    hasUsed: Boolean,
    usedCode: Number,
    
    expiry: Number, // Time to expire after lastRenew
    password: String,
    
    cost: Number
});

module.exports = {
    User,
    VPS
};