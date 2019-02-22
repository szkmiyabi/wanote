const { app, Menu, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ width: 1140, height: 700});
    mainWindow.loadURL("file://" + __dirname + "index.html");
    Menu.setApplicationMenu(null);
    mainWindow.on("closed", () => {
         mainWindow = null;
    });
}

app.on("ready", () => { createWindow(); });

app.on("window-all-closed", () => {
    if(process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if(mainWindow === null) {
        createWindow();
    }
});