const { app, BrowserWindow, ipcMain, dialog } = require("electron");

const path = require("path");
const isDev = require("electron-is-dev");
const { Client } = require("ssh2");
const fs = require("fs");
const os = require("os");
const Datastore = require("nedb");
const { randomUUID } = require("crypto");

const username = os.userInfo().username;

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

let insertHost = async (data) => {
  let id = randomUUID();
  return new Promise((resolve, reject) => {
    db.find(
      { collection: "hosts", data: { $elemMatch: { name: data.host } } },
      (err, docs) => {
        if (err) {
          console.error("Error finding hosts:", err);
          reject(err);
        } else {
          if (docs.length > 0) {
            reject(new Error(`hosts with ${data.host} already exists`));
          } else {
            db.update(
              { collection: "hosts" },
              {
                $push: {
                  data: {
                    name: data.name,
                    host: data.host,
                    username: data.username,
                    _id: id,
                    privateKey: data.privateKey,
                    parentId: data.parentId,
                    port: data.port,
                    password: data.password,
                  },
                },
              },
              {},
              (err) => {
                if (err) {
                  console.error("Error inserting host:", err);
                  reject(err);
                } else {
                  console.log("Host inserted successfully");
                  resolve(id);
                }
              },
            );
          }
        }
      },
    );
  });
};

let insertGroup = async (groupName) => {
  return new Promise((resolve, reject) => {
    db.find(
      { collection: "groups", data: { $elemMatch: { name: groupName } } },
      (err, docs) => {
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
              },
            );
          }
        }
      },
    );
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

const getAllHosts = async () => {
  return new Promise((resolve, reject) => {
    db.find({ collection: "hosts" }, (err, docs) => {
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
    const sshId = data.id;
    const sshClient = new Client();

    sshClient.on("ready", () => {
      console.log(`SSH Client ${sshId} ready`);
      sshClient.shell(
        {
          term: "term-256color",
          cols: data.cols || 80,
          rows: data.rows || 24,
          pty: true,
        },
        (err, stream) => {
          if (err) {
            console.error(`SSH shell error for ${sshId} : `, err);
            win.webContents.send("ssh-error", { sshId, message: err.message });
            return;
          }

          stream.write("stty -echo\n");
          sshClients.set(sshId, {
            sshClient,
            sshStream: stream,
            write: (cmd) => {
              lastCommand = cmd;
              stream.write(`${cmd}\n`);
            },
          });

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
      privateKey: data.privateKey,
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
    const hosts = await getAllHosts();
    const groups = await getAllGroups();
    let formattedGroups = [];
    let formattedHosts = [];

    if (groups && groups.length > 0 && groups[0].data) {
      formattedGroups = groups[0].data.map((item) => ({
        id: item._id,
        name: item.name,
        hostsCount: 0,
      }));
    }

    if (hosts && hosts.length > 0 && hosts[0].data) {
      formattedHosts = hosts[0].data.map((item) => ({
        id: item._id,
        name: item.name,
        connectionDetails: "ssh, azureadmin",
        parentId: item.parentId,
        host: item.host,
        username: item.username,
        privateKey: item.privateKey,
        port: item.port,
      }));
    }

    for (let i = 0; i < formattedGroups.length; i++) {
      for (let j = 0; j < formattedHosts.length; j++) {
        if (formattedHosts[j].parentId == formattedGroups[i].id) {
          formattedGroups[i].hostsCount = formattedGroups[i].hostsCount + 1;
        }
      }
    }

    return {
      hosts: formattedHosts,
      groups: formattedGroups,
    };
  } catch (err) {
    return {
      hosts: [],
      groups: [],
    };
  }
});

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

ipcMain.handle("create-host", async (event, data) => {
  try {
    console.log(data);
    const privateKeyPath = path.resolve(data.privateKey);
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error("Private key file does not exist");
    }

    let buffer = fs.readFileSync(data.privateKey);
    let privateKey = Buffer.from(buffer).toString("utf8");

    let hostData = {
      name: data.label,
      host: data.address,
      username: data.username,
      privateKey: privateKey,
      parentId: data.parentId,
      port: data.port,
      password: data.password,
    };
    let id = await insertHost(hostData);
    return {
      id: id,
      name: data.label,
      connectionDetails: "ssh, azureadmin",
      parentId: data.parentId,
      host: data.address,
      username: data.username,
      privateKey: privateKey,
      port: data.port,
    };
  } catch (error) {
    console.error("Error adding group:", error.message);
    throw new Error(error.message);
  }
});

ipcMain.handle("open-file-dialog", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Key Files", extensions: ["pem", "key"] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
});

ipcMain.handle("open-folder-dialog", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
});

ipcMain.handle("export-group", async (event, id, name, selectedFolder) => {
  try {
    const hosts = await getAllHosts();
    const groups = await getAllGroups();
    let formattedGroups = [];
    let formattedHosts = [];

    if (groups && groups.length > 0 && groups[0].data) {
      formattedGroups = groups[0].data.map((item) => ({
        id: item._id,
        name: item.name,
        hostsCount: 0,
      }));
    }

    if (hosts && hosts.length > 0 && hosts[0].data) {
      formattedHosts = hosts[0].data
        .filter((item) => item.parentId === id)
        .map((item) => ({
          id: item._id,
          name: item.name,
          connectionDetails: "ssh, azureadmin",
          parentId: item.parentId,
          host: item.host,
          username: item.username,
          privateKey: item.privateKey,
          port: item.port,
        }));
    }

    for (let i = 0; i < formattedGroups.length; i++) {
      for (let j = 0; j < formattedHosts.length; j++) {
        if (formattedHosts[j].parentId == formattedGroups[i].id) {
          formattedGroups[i].hostsCount = formattedGroups[i].hostsCount + 1;
        }
      }
    }

    let json = {
      groups: formattedGroups,
      hosts: formattedHosts,
    };

    const currentDate = new Date().toISOString().split("T");
    const fileName = `${name}_${currentDate}.json`;
    const filePath = path.join(selectedFolder, fileName);

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");

    console.log(`File saved successfully at: ${filePath}`);
    return {
      success: true,
      message: `File saved successfully at: ${filePath}`,
    };
  } catch (err) {
    console.error("Error exporting group:", err);
    return {
      success: false,
      message: "Failed to export group",
      error: err.message,
    };
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
