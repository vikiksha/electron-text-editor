const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const fs = require("fs");
let win;
let filePath = undefined;
const isMac = process.platform === "darwin";
app.on("ready", () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile("index.html");
  console.log("app is ready");
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

ipcMain.on("save", (event, text) => {
  if (!filePath) {
    dialog
      .showSaveDialog(win, { defaultPath: "filename.txt" })
      .then((fullpath) => {
        filePath = fullpath.filePath;
        if (fullpath.filePath) {
          writeIntoFile(text);
        }
      });
  } else {
    writeIntoFile(text);
  }
});
function writeIntoFile(text) {
  fs.writeFile(filePath, text, (err) => {
    console.log(filePath);
    if (err) {
      console.log(err);
    }
    console.log("File has been saved");
    win.webContents.send("saved", "success");
  });
}

const menuTemplate = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ role: "about" }],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      isMac ? { role: "close" } : { role: "quit" },
      {
        label: "Save",
        accelerator: isMac ? "Command+S" : "Ctrl+S",
        click() {
          win.webContents.send("save-clicked");
          console.log("Save from the Menu");
        },
      },
      {
        label: "Save as",
        accelerator: isMac ? "Command+Shift+S" : "Ctrl+Shift+S",
        click() {
          filePath = undefined;
          win.webContents.send("save-clicked");
          console.log("Save as from the menu");
        },
      },
    ],
  },
  {
    role: "editMenu",
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
  { role: "viewMenu" },
];
