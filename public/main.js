const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const {Client} = require('ssh2')
const fs = require('fs')

let sshClients = new Map();
let win;

function createWindow() {
  
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
      enableRemoteModule: true,
    },
  });

  win.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`
  );
  
  if (isDev)win.webContents.openDevTools(); 

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0)createWindow();
});

ipcMain.handle('ssh-connect', (event, data) => {

  try {
    const sshId = data.privateKey 
    const sshClient = new Client()

    sshClient.on('ready' , ()=>{
      console.log(`SSH Client ${sshId} ready`)
      sshClient.shell({
        term : 'term-256color',
        cols : data.cols || 80,
        rows : data.rows || 24
      } , (err , stream) => {
        if (err){
          console.error(`SSH shell error for ${sshId} : `, err)
          win.webContents.send('ssh-error' , {sshId , message : err.message})
          return;
        }

       
        sshClients.set(sshId, { sshClient, sshStream: stream })


        stream.on('data' , (data) => {
          win.webContents.send('ssh-data' , {sshId , data : data.toString()})
        })
        
        stream.on('close' , ()=> {
          console.log(`SSH Straem ${sshId} closed`)
          cleanupSshClient(sshId)
        })
      })
    })
    sshClient.on('error' , (err) => {
      console.error(`SSH Client ${sshId} error:`, err);
      win.webContents.send('ssh-error', { sshId, message: err.message });
    })
    sshClient.connect({
      host: data.host,
      port: data.port || 22,
      username: data.username,
      privateKey: fs.readFileSync(data.privateKey),
    });
    return { sshId };
  }catch(err){
    console.error('Error connecting to SSH:', err);
    win.webContents.send('ssh-error', { message: err.message });
  }

})

ipcMain.handle('ssh-command', (event, { sshId, command }) => {

  const sshConnection = sshClients.get(sshId);
  if (!sshConnection) {
    throw new Error(`SSH client ${sshId} not found`);
  }

  if (sshConnection.sshStream && sshConnection.sshStream.writable) {
    sshConnection.sshStream.write(command);
  }
});


ipcMain.handle('ssh-resize', (event, { sshId, cols, rows }) => {
  const sshConnection = sshClients.get(sshId);
  if (!sshConnection) {
    throw new Error(`SSH client ${sshId} not found`);
  }

  if (sshConnection.sshStream && sshConnection.sshStream.writable) {
    sshConnection.sshStream.setWindow(rows, cols);
  }
});
function cleanupSshClient(sshId) {
  const connection = sshClients.get(sshId);
  if (!connection) return;

  console.log(`Cleaning up SSH client ${sshId}`);

  if (connection.sshStream) {
    connection.sshStream.end();
  }

  if (connection.sshClient) {
    connection.sshClient.end();
  }

  sshClients.delete(sshId);
}

app.on('before-quit', () => {
  sshClients.forEach((_, sshId) => cleanupSshClient(sshId));
});


