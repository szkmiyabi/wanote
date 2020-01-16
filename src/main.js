const { app, Menu, BrowserWindow } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");

let mainWindow;

const rmenu = Menu.buildFromTemplate([
    {
        label: "切り取り",
        role: "cut"        
    },
    {
        label: "コピー",
        role: "copy"
    },
    {
        label: "貼り付け",
        role: "paste"
    },
    {
        label: "全て選択",
        role: "selectall"
    },
    {
        type: "separator"
    },
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

app.on("ready", () => {
    createWindow();

    ipcMain.on("alt-attr-edit", (event, arg) => {
        var dialogWindow = new BrowserWindow({
            width: 360,
            height: 160,
            frame: false
        });
        //dialogWindow.loadURL('data:text/html,' + dialogHtml);
        dialogWindow.loadURL("file://" + __dirname + "/dialog/alt-attr-edit.html");
        dialogWindow.on("closed" , () => {
            dialogWindow = null;
        });
    });
    ipcMain.on("alt-attr-dialog-response", (event, arg) => {
        var type = arg.type;
        var content = arg.content;
        mainWindow.webContents.send("alt-attr-dialog-sender", {type: type, content: content});
    });

    ipcMain.on("insert-label-tag", (event, arg) => {
        var dialogWindow = new BrowserWindow({
            width: 360,
            height: 190,
            frame: false
        });
        dialogWindow.loadURL("file://" + __dirname + "/dialog/insert-label-tag.html");
        dialogWindow.on("closed" , () => {
            dialogWindow = null;
        });
    });
    ipcMain.on("insert-label-dialog-response", (event, arg) => {
        var content = arg.content;
        var attr = arg.attr;
        mainWindow.webContents.send("insert-label-dialog-sender", {content: content, attr: attr});
    });

    ipcMain.on("snippet-add", (event, arg) => {
        var dialogWindow = new BrowserWindow({
            width: 360,
            height: 190,
            frame: false
        });
        dialogWindow.loadURL("file://" + __dirname + "/dialog/snippet-diag.html");
        dialogWindow.on("closed" , () => {
            dialogWindow = null;
        });
    });
    ipcMain.on("snippet-add-response", (event, arg) => {
        var content = arg.content;
        var attr = arg.attr;
        mainWindow.webContents.send("snippet-add-sender", {content: content});
    });

});

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