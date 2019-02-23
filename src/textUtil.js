module.exports = class textUtil {
    
    //コンストラクタ
    constructor(editor, editor_text) {
        this.editor = editor;
        this.editor_text = editor_text;
    }

    //見出しタグ自動変換 with 独自タグ
    heading_replace(str) {
        let ret = "";
        str = str.replace(/(\r\n|\n|\r){2}/, "\n");
        let start_pt = new RegExp(/(>>h\d\n)/m);
        let end_pt = new RegExp(/(\n>>\/h\d)/m);
        let cr_tag = str.match(start_pt)[1].match(/(>>)(h\d)/m)[2];
        let content = str.replace(start_pt, "");
        content = content.replace(end_pt, "");
        let datas = content.split(/\n/);
        if(datas.length < 1) return;
        for(var i=0; i<datas.length; i++) {
            let line = datas[i];
            line = line.trim();
            line = line.replace(/(<\/*p.*?>|<\/*div.*?>)/g, "");
            ret += `<${cr_tag}>${line}</${cr_tag}>` + "\n";
        }
        return ret;
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

}