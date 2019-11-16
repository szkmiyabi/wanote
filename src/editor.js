window.onresize = doLayout;

window.onload = function() {
    doLayout();
    initEditor();
    headingReplaceButton();
    strongInsertButton();
    listReplaceButton();
    targetBlankReplaceButton();
    showSearchPanelButton();
    bkmkTagAndAttrDelButton();
    duplicateLineButton();
    altAttrEditButton();
    insertLabelTagButton();
    insertReturnButton();
    saveButton();
    openButton();
    newFileButton();
    svDecodeButton();
    doDefaultSnippet();
    snippetInsertButton();
};

function doLayout() {
    var editor_text = document.querySelector("#editor_text");
    var windowWidth = document.documentElement.clientWidth;
    var windowHeight = document.documentElement.clientHeight;
    var controlsHeight = getControlsHeight();
    var editorWidth = windowWidth;
    var editorHeight = windowHeight - controlsHeight;
    editor_text.setAttribute("style", `width:${editorWidth}px; height:${editorHeight}px;font-size:${defaultFontSize}px;`);
}

function doDefaultSnippet() {
    var tar = document.getElementById("snippet-ddl");
    var dics = [
        "過剰指摘です。<bkmk:br>見直してください。<bkmk:br><bkmk:br>testtttt",
        "3ブラウザ<bkmk:tab>IE,Firefox<bkmk:tab>Chrome",
        "フォーカス視認できない"
    ];
    for(var d of dics) {
        var el = document.createElement("option");
        el.textContent = d;
        tar.appendChild(el);
    }
    doLayout();
}
