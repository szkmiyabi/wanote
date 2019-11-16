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
    snippetInsertButton();
    snippetAddButton();
    snippetDelButton();
    snippetLoadButton();
    //レイアウト崩れバグ対策のため2回実行
    doLayout();
    doLayout();
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

