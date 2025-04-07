const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { Client } = require("ssh2");
const fs = require("fs");
const os = require("os");
const Datastore = require("nedb");
const { randomUUID } = require("crypto");

const username = os.userInfo().username;
console.log(username);
const customDir = path.join("/home", username, "termis");

if (!fs.existsSync(customDir)) {
  fs.mkdirSync(customDir, { recursive: true });
}

const db = new Datastore({
  filename: path.join(customDir, "termis.db"),
  autoload: true,
});

fs.stat(path.join(customDir, "termis.db"), (err, stats) => {
  if (err || stats.size == 0) {
    console.log("Databse is empty or does not exist");
    db.insert({ collection: "groups", data: [] }, function (err, newDocs) {
      if (err) {
        console.error("Error creating groups collections:", err);
      } else {
        console.log("Grups collection created with default data");
      }
    });

    db.insert({ collection: "hosts", data: [] }, function (err, newDoc) {
      if (err) {
        console.error("Error creating hosts collection:", err);
      } else {
        console.log("Hosts collection created with default data");
      }
    });
  }
});

let insertGroup = async (groupName) => {
 
  
  return new Promise((resolve, reject) => {
    db.find({ collection: "groups", data: { $elemMatch: { name: groupName } } }, (err, docs) => {
      if (err) {
        console.error("Error finding group:", err);
        reject(err);
      } else {
        console.log("Found groups:", docs);
        if (docs.length > 0) {
          reject(new Error("Group with name already exists"));
        } else {
          db.update(
            { collection: "groups" },
            { $push: { data: { name: groupName, _id: randomUUID() } } },
            {},
            (err) => {
              if (err) {
                console.error("Error inserting group:", err);
                reject(err);
              } else {
                console.log("Group inserted successfully");
                resolve("Data Inserted");
              }
            }
          );
        }
      }
    });
  });
};

const getAllGroups = async () => {
  return new Promise((resolve, reject) => {
    db.find({ collection: "groups" }, (err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
};

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
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`,
  );

  if (isDev) win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("ssh-connect", (event, data) => {
  try {
    const sshId = data.privateKey;
    const sshClient = new Client();

    sshClient.on("ready", () => {
      console.log(`SSH Client ${sshId} ready`);
      sshClient.shell(
        {
          term: "term-256color",
          cols: data.cols || 80,
          rows: data.rows || 24,
        },
        (err, stream) => {
          if (err) {
            console.error(`SSH shell error for ${sshId} : `, err);
            win.webContents.send("ssh-error", { sshId, message: err.message });
            return;
          }

          sshClients.set(sshId, { sshClient, sshStream: stream });

          stream.on("data", (data) => {
            win.webContents.send("ssh-data", { sshId, data: data.toString() });
          });

          stream.on("close", () => {
            console.log(`SSH Straem ${sshId} closed`);
            cleanupSshClient(sshId);
          });
        },
      );
    });
    sshClient.on("error", (err) => {
      console.error(`SSH Client ${sshId} error:`, err);
      win.webContents.send("ssh-error", { sshId, message: err.message });
    });
    sshClient.connect({
      host: data.host,
      port: data.port || 22,
      username: data.username,
      privateKey: fs.readFileSync(data.privateKey),
    });
    return { sshId };
  } catch (err) {
    console.error("Error connecting to SSH:", err);
    win.webContents.send("ssh-error", { message: err.message });
  }
});

ipcMain.handle("ssh-command", (event, { sshId, command }) => {
  const sshConnection = sshClients.get(sshId);
  if (!sshConnection) {
    throw new Error(`SSH client ${sshId} not found`);
  }

  if (sshConnection.sshStream && sshConnection.sshStream.writable) {
    sshConnection.sshStream.write(command);
  }
});

ipcMain.handle("ssh-resize", (event, { sshId, cols, rows }) => {
  const sshConnection = sshClients.get(sshId);
  if (!sshConnection) {
    throw new Error(`SSH client ${sshId} not found`);
  }

  if (sshConnection.sshStream && sshConnection.sshStream.writable) {
    sshConnection.sshStream.setWindow(rows, cols);
  }
});

ipcMain.handle("get-system-data", async (event) => {
  try {
    const groups = await getAllGroups();
    let formattedGroups = [];

    if (groups && groups.length > 0 && groups[0].data) {
    
      formattedGroups = groups[0].data.map((item) => ({
        id: item._id,
        name: item.name,
        hostsCount: 1,
      }));
    }
  
    
    return {
      hosts: [],
      groups: formattedGroups,
    };
  } catch (err) {
   
    return {
      hosts: [],
      groups: [],
    };
  }
});

// Function to recursively read directory contents
function readDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    return files.map((file) => {
      const fullPath = path.join(dirPath, file.name);

      try {
        const stats = fs.statSync(fullPath);

        return {
          name: file.name,
          kind: file.isDirectory()
            ? "folder"
            : path.extname(file.name).slice(1) || "file",
          dateModified: stats.mtime.toLocaleString(),
          size: file.isDirectory()
            ? "-"
            : `${(stats.size / 1024).toFixed(2)} kB`,
          path: fullPath,
        };
      } catch (error) {
        console.warn(`Skipping inaccessible file/directory: ${fullPath}`);
        return {
          name: file.name,
          kind: "inaccessible",
          dateModified: "N/A",
          size: "N/A",
          path: fullPath,
        };
      }
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
}

// Handle IPC request to get file system data
ipcMain.handle("get-file-system-data", async (event, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      throw new Error("Directory does not exist");
    }

    const files = readDirectory(dirPath);
    return files;
  } catch (error) {
    console.error("Error fetching file system data:", error);
    return [];
  }
});

ipcMain.handle("create-group", async (event, name) => {
  try {
    let newData = await insertGroup(name);
    return 1;
  } catch (error) {
    console.error("Error adding group:", error.message);
    return -1;
  }
});

ipcMain.handle("get-all-groups", async (event) => {
  return getAllGroups();
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

app.on("before-quit", () => {
  sshClients.forEach((_, sshId) => cleanupSshClient(sshId));
});

/*
{
      id: 1,
      name: 'gtest1',
     
      connectionDetails: 'ssh, azureadmin',
      parentId: 'f3gda',
      host: '9.141.20.46',
      username: 'azureadmin',
      privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_test_1.pem',
      port: 22
    },
    {
      id: 2,
      name: 'prod1',
      connectionDetails: 'ssh, azureadmin',
      parentId: 'f3gda',
      host: '9.141.19.175',
      username: 'azureadmin',
      privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_prod_1.pem',
      port: 22
    },
    {
      id: 3,
      name: 'postoffice',
      connectionDetails: 'ssh, azureadmin',
      parentId: 'f3gde',
      host: '9.141.19.175',
      username: 'azureadmin',
      privateKey: '/home/abenezer121/Downloads/sshkeys/gebeta_key_prod_1.pem',
      port: 22
    }
*/
