module.exports = class textUtil {
    
    //コンストラクタ
    constructor(editor, editor_text) {
        this.editor = editor;
        this.editor_text = editor_text;
    }

    //見出しタグ自動変換
    heading_replace() {
        let new_txt = "";
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange(range);
        let old_txt = this.editor.getValue();
        txt = txt.replace(/(\r\n|\n|\r){2}/, "\n");
        let start_pt = new RegExp(/(>>h\d\n)/m);
        let end_pt = new RegExp(/(\n>>\/h\d)/m);
        let cr_tag = txt.match(start_pt)[1].match(/(>>)(h\d)/m)[2];
        let content = txt.replace(start_pt, "");
        content = content.replace(end_pt, "");
        let datas = content.split(/\n/);
        if(datas.length < 1) return;
        for(var i=0; i<datas.length; i++) {
            let line = datas[i];
            line = line.trim();
            line = line.replace(/(<\/*p.*?>|<\/*div.*?>)/g, "");
            new_txt += `<${cr_tag}>${line}</${cr_tag}>` + "\n";
        }
        this.editor.setValue(old_txt + "\n\n" + new_txt);
    }

    //要素挿入
    insert_tag(tag_name) {
        tag_name = tag_name.toLowerCase();
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange(range);
        txt = txt.trim();
        let tag_ham = new RegExp(/(<.+?>)(.+)(<\/.+?>)/);
        let new_txt = "";
        if(tag_ham.test(txt)) {
            let mt = txt.match(tag_ham);
            new_txt = mt[1] + `<${tag_name}>` + mt[2] + `</${tag_name}>` + mt[3];
        } else {
            new_txt = `<${tag_name}>${txt}</${tag_name}>`;
        }
        let old_txt = this.editor.getValue();
        this.editor.setValue(old_txt + "\n\n" + new_txt);
    }

    //リストタグ自動変換
    list_replace() {
        let new_txt = "";
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let old_txt = this.editor.getValue();
        txt = txt.replace(/(\r\n|\n|\r){2}/, "\n");
        let start_pt = new RegExp(/(>>ul\n|>>ol\n|>>dl\n)/m);
        let end_pt = new RegExp(/(\n>>\/ul|\n>>\/ol|\n>>\/dl)/m);
        let cr_tag = txt.match(start_pt)[1].match(/(>>)(ul|ol|dl)/m)[2];
        cr_tag = cr_tag.toLowerCase();
        let content = txt.replace(start_pt, "");
        content = content.replace(end_pt, "");
        let datas = content.split(/\n/);
        if(datas.length < 1) return;
        for(var i=0; i<datas.length; i++) {
            let cnt = i + 1;
            let line = datas[i];
            line = line.trim();
            line = line.replace(/(<\/*p.*?>|<\/*div.*?>|<\/*h\d.*?>)/g, "");
            if(cr_tag === "dl" && (cnt % 2) == 0) {
                new_txt += `<dd>${line}</dd>` + "\n";
            } else if(cr_tag === "dl" && (cnt % 2) != 0) {
                new_txt += `<dt>${line}</dt>` + "\n";
            } else if(cr_tag === "ul" || cr_tag === "ol") {
                new_txt += `<li>${line}</li>` + "\n";
            }
        }
        if(cr_tag === "dl") {
            new_txt = "<dl>\n" + new_txt + "</dl>";
        } else if(cr_tag === "ul") {
            new_txt = "<ul>\n" + new_txt + "</ul>";
        } else if(cr_tag === "ol") {
            new_txt = "<ol>\n" + new_txt + "</ol>";
        }
        this.editor.setValue(old_txt + "\n\n" + new_txt);
    }

}