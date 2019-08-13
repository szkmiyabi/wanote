
const { BrowserWindow } = require("electron").remote;
const fs = require("fs");
const textUtil = require(__dirname + "/textUtil");
const { ipcRenderer } = require("electron");

let editor = null;
let tu = null;
let defaultFontSize = 14;

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