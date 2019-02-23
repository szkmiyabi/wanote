
const { BrowserWindow } = require("electron").remote;
const fs = require("fs");
const textUtil = require(__dirname + "/textUtil");

let editor = null;
let tu = null;

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
        fontSize: 14
    });

    tu = new textUtil(editor, editor_text);
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
        let range = editor.getSelectionRange();
        let txt = editor.session.getTextRange(range);
        let old_txt = editor.getValue();
        //alert(txt);
        let new_txt = tu.heading_replace(txt);
        editor.setValue(old_txt + "\n\n" + new_txt);
    };
}

function strongInsertButton() {
    document.querySelector("#strong-insert").onclick = function() {
        tu.insert_tag("strong");
    };
}
