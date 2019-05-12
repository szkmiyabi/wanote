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
        const dialogHtml = '<html lang="ja"><head><meta charset="utf-8">\
        <style>\
        body {font-family: sans-serif;}\
        button {float:right; margin-left: 10px;}\
        label.automax,input.automax {margin-bottom: 10px; width: 100%; display:block;}\
        h4 {text-align: center;}\
        </style></head><body><h4>alt属性値の修正</h4>\
        <label><input type="radio" name="opt_type" value="replace">置換</label>\
        <label><input type="radio" name="opt_type" value="overwrite" checked="checked">後に追記</label><br>\
        <label class="automax">変更内容<input id="alt-attr-content" type="text" class="automax"></label>\
        <button onclick="data_send();window.close()">Ok</button>\
        <button onclick="window.close()">Cancel</button>\
        <script type="text/javascript">\
        function data_send() {\
            const { ipcRenderer } = require("electron");\
            const data = document.getElementById("alt-attr-content").value;\
            var type_data = "";\
            var rds = document.getElementsByName("opt_type");\
            for(var i=0; i<rds.length; i++) {\
                if(rds[i].checked === true) {\
                    type_data = rds[i].value;\
                    break;\
                }\
            }\
            ipcRenderer.send("alt-attr-dialog-response", {type: type_data, content: data});\
        }\
        </script>\
        </body></html>';
        dialogWindow.loadURL('data:text/html,' + dialogHtml);
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