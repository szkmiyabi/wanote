const { app, Menu, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

const rmenu = Menu.buildFromTemplate([
    {
        label: "DevToolを開く",
        click: () => {
            let crWindow = BrowserWindow.getFocusedWindow();
            crWindow.webContents.toggleDevTools();
        }
    },
]);

function createWindow() {
    mainWindow = new BrowserWindow({ width: 1140, height: 700, "icon": __dirname + "/icons/appicon.ico"});
    mainWindow.loadURL("file://" + __dirname + "/index.html");
    //mainWindow.webContents.toggleDevTools();
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

app.on("browser-window-created", (event, win) => {
    win.webContents.on("context-menu", (e, params) => {
        rmenu.popup(win, params.x, params.y);
    });
});