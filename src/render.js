
const { BrowserWindow, dialog } = require("electron").remote;
const fs = require("fs");
const textUtil = require(__dirname + "/textUtil");
const { ipcRenderer } = require("electron");

const tab_sp = "<bkmk:tab>";
const br_sp = "<bkmk:br>";

let editor = null;
let tu = null;
let defaultFontSize = 14;
let currentPath = null;

function getControlsHeight() {
    var controls = document.querySelector("#topbar");
    if(controls) {
        return controls.offsetHeight;
    } else {
        return 0;
    }
}

function initEditor() {
    let editor_text = document.querySelector("#editor_text");
    editor = ace.edit("editor_text");
    editor.setTheme("ace/theme/dracula");
    setEditorTheme("html");
    editor.getSession().setUseWrapMode(true);
    editor.setOptions({
        fontSize: defaultFontSize
    });

    tu = new textUtil(editor, editor_text);

    //ipcMainからのイベント処理
    ipcRenderer.on("alt-attr-dialog-sender", (event, arg) => {
        var type = arg.type;
        var content = arg.content;
        tu.alt_attr_edit(type, content);
    });

    ipcRenderer.on("insert-label-dialog-sender", (event, arg) => {
        var content = arg.content;
        var attr = arg.attr;
        tu.insert_tag_label(content, attr);
    });
}

function setEditorTheme(extension) {
    switch(extension) {
        case "txt":
            editor.getSession().setMode("ace/mode/plain_text");
            break;
        case "py":
            editor.getSession().setMode("ace/mode/python");
            break;
        case "c":
        case "cpp":
        case "h":
            editor.getSession().setMode("ace/mode/c_cpp");
            break
        case "html":
            editor.getSession().setMode("ace/mode/html");
            break;
        case "js":
            editor.getSession().setMode("ace/mode/javascript");
            break;
        case "md":
            editor.getSession().setMode("ace/mode/markdown");
            break;
        default:
            editor.getSession().setMode("ace/mode/plain_text");
            break;
    }
}

function headingReplaceButton() {
    document.querySelector("#heading-replace").onclick = function() {
       tu.heading_replace();
    };
}

function strongInsertButton() {
    document.querySelector("#strong-insert").onclick = function() {
        tu.insert_tag("strong");
    };
}

function listReplaceButton() {
    document.querySelector("#list-replace").onclick = function() {
        tu.list_replace();
    };
}

function targetBlankReplaceButton() {
    document.querySelector("#target-blank-replace").onclick = function() {
        tu.target_blank_replace();
    }
}

function showSearchPanelButton() {
    document.querySelector("#show-search-panel").onclick = function() {
        ace.config.loadModule("ace/ext/searchbox", function(e) {e.Search(editor)});
    };
}

function bkmkTagAndAttrDelButton() {
    document.querySelector("#bkmk-tag-and-attr-del").onclick = function() {
        tu.bkmk_tag_and_attr_del();
    }
}

function duplicateLineButton() {
    document.querySelector("#duplicate-line").onclick = function() {
        editor.copyLinesDown();
    }
}

function altAttrEditButton() {
    document.querySelector("#alt-attr-edit").onclick = function() {
        //ipcMainに処理を移譲
        ipcRenderer.send("alt-attr-edit", "dummy");
    }
}

function insertLabelTagButton() {
    document.querySelector("#insert-label-tag").onclick = function() {
        //ipcMainに処理を移譲
        ipcRenderer.send("insert-label-tag", "dummy");
    }
}

function insertReturnButton() {
    document.querySelector("#insert-return").onclick = function() {
        tu.insert_return();
    }
}

function svDecodeButton() {
    document.querySelector("#sv-decode").onclick = function() {
        tu.decode_sv_base();
    }
}

function snippetInsertButton() {
    document.querySelector("#snippet-insert").onclick = function() {
        let crtxt = "";
        let crel = document.querySelector("#snippet-ddl");
        let opts = crel.getElementsByTagName("option");
        let idx = crel.selectedIndex;
        let cnt = 0;
        for(var op of opts) {
            if(idx==cnt) {
                crtxt = op.textContent;
                break;
            }
            cnt++;
        }
        let range = editor.getSelectionRange();
        let txt = editor.session.getTextRange();
        crtxt = _snippet_decode(crtxt);
        editor.session.replace(range, txt + crtxt);
    }
}
function _snippet_decode(str) {
    return str.replace(new RegExp(br_sp, "mg"), "\r\n").replace(new RegExp(tab_sp, "mg"), "\t");
}

function snippetAddButton() {
    document.querySelector("#snippet-add").onclick = function() {
        let txt = editor.session.getTextRange();
        txt = _snippet_encode(txt);
        let crel = document.querySelector("#snippet-ddl");
        let opt = document.createElement("option");
        opt.textContent = txt;
        crel.appendChild(opt);
        //レイアウト崩れバグ対策のため2回実行
        doLayout();
        doLayout();
    }
}
function _snippet_encode(str) {
    return str.replace(new RegExp("(\r\n|\n|\r)", "mg"), br_sp).replace(new RegExp("\t", "mg"), tab_sp);
}

function openButton() {
    document.querySelector("#open").onclick = function() {
        const win = BrowserWindow.getFocusedWindow();
        dialog.showOpenDialog(
            win,
            {
                properties: ["openFile"],
                filters: [
                    {
                    name: "Documents",
                    extensions: ["txt"]
                    }
                ]
            },
            fileNames => {
                if (fileNames) {
                    _readFile(fileNames[0]);
                }
            }
        );
    }
}
function _readFile(path) {
    currentPath = path;
    fs.readFile(path, (error, text) => {
        if (error != null) {
            alert("error : " + error);
            return;
        }
        editor.setValue(text.toString(), -1);
    });
}

function saveButton() {
    document.querySelector("#save").onclick = function() {
        if(currentPath == null) {
            _saveNewFile();
            return;
        }
        const win = BrowserWindow.getFocusedWindow();
        dialog.showMessageBox(
            win,
            {
                title: "ファイルの上書き保存を行います。",
                type: "info",
                buttons: ["OK", "Cancel"],
                detail: "本当に保存しますか？"
            },
            response => {
                if (response === 0) {
                    const data = editor.getValue();
                    _writeFile(currentPath, data);
                }
            }
        );
    }
}
function _saveNewFile() {
    let content = editor.getValue();
    const win = BrowserWindow.getFocusedWindow();
    dialog.showSaveDialog(
        win,
        {
            properties: ["openFile"],
            filters: [{
                name: "Documents",
                extensions: ["txt"]
            }]
        },
        (fileName) => {
            if(fileName) {
                fs.writeFile(fileName, content, (err) => {
                    if(err) {
                        alert("保存に失敗しました!");
                    } else {
                        alert("保存に成功しました!")
                    }
                });
                currentPath = fileName;
            }
        }
    );
}
function _writeFile(path, data) {
    fs.writeFile(path, data, (err) => {
        if(err) {
            alert("保存に失敗しました!");
        } else {
            alert("保存に成功しました!")
        }
    });
}

function newFileButton() {
    document.querySelector("#new").onclick = function() {
        let content = editor.getValue();
        if(currentPath == null && content !== "") {
            const win = BrowserWindow.getFocusedWindow();
            dialog.showMessageBox(
                win,
                {
                    title: "確認",
                    type: "info",
                    buttons: ["OK", "Cancel"],
                    detail: "内容が変更されています。保存しますか？"
                },
                response => {
                    if (response === 0) {
                        _saveNewFile();
                        currentPath = null;
                        editor.setValue("");
                    }
                }
            );
        } else if(currentPath != null) {
            const win = BrowserWindow.getFocusedWindow();
            dialog.showMessageBox(
                win,
                {
                    title: "確認",
                    type: "info",
                    buttons: ["OK", "Cancel"],
                    detail: "内容が変更されています。保存しますか？"
                },
                response => {
                    if (response === 0) {
                        const data = editor.getValue();
                        _writeFile(currentPath, data);
                        currentPath = null;
                        editor.setValue("");
                    }
                }
            );
        }

    }
}