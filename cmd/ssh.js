const { Client } = require('ssh2');

function exec(cmd) {
    return new Promise((resolve, deny) => {
         const conn = new Client();
        
        var Out;
        var Err;
        
        Out = [];
        Err = [];
        
        conn.on('ready', () => {
          console.log('Client :: ready');
          conn.exec(cmd, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
              console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                
               resolve(Out);
               
                
              conn.end();
            }).on('data', (data) => {
              console.log('STDOUT: ' + data);
                
                Out.push(String(data));
                
            }).stderr.on('data', (data) => {
              console.log('STDERR: ' + data);
                
                Err += String(data);
            });
          });
        }).connect({
          host: '',
          port: 0,
          username: '',
          password: ''
        });
    });
}

    
module.exports = exec;