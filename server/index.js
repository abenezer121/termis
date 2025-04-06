
const { WebSocketServer } = require('ws');
const { Client } = require('ssh2');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  const id = uuidv4();
  console.log(`New client connected: ${id}`);

  let sshClient = null;
  let sshStream = null;
  let termSize = { cols: 80, rows: 24 };

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'connect':
          sshClient = new Client();
          
          sshClient.on('ready', () => {
            console.log("SSH Client :: ready");
            sshClient.shell({
              term: 'xterm-256color',
              cols: termSize.cols,
              rows: termSize.rows
            }, (err, stream) => {
              if (err) {
                console.error('SSH shell error:', err);
                ws.send(JSON.stringify({ type: 'error', message: err.message }));
                return;
              }
              sshStream = stream;
              
              stream.on('data', (data) => {
                ws.send(data.toString());
              }).on('close', () => {
                console.log('SSH Stream :: closed');
                ws.send('\r\nSSH connection closed\r\n');
                sshClient.end();
              });
            });
          }).connect({
            host: data.host,
            port: data.port || 22,
            username: data.username,
            privateKey: require('fs').readFileSync(data.privateKey)
          });

          sshClient.on('error', (err) => {
            console.error('SSH Client error:', err);
            ws.send(`\r\nSSH Error: ${err.message}\r\n`);
          });
          break;

        case 'command':
          if (sshStream && sshStream.writable) {
            sshStream.write(data.command);
          }
          break;

        case 'resize':
          termSize = { cols: data.cols, rows: data.rows };
          if (sshStream && sshStream.writable) {
            sshStream.setWindow(data.rows, data.cols);
          }
          break;
      }
    } catch (err) {
      console.error('Error processing message:', err);
      ws.send('\r\nError: Invalid message format\r\n');
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${id}`);
    if (sshClient) sshClient.end();
  });

  ws.send('Connected to SSH proxy. Initializing connection...\r\n');
});

console.log('WebSocket server running on ws://localhost:8080');