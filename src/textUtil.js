module.exports = class textUtil {
    
    //コンストラクタ
    constructor(editor, editor_text) {
        this.editor = editor;
        this.editor_text = editor_text;

        this.target_blank_def_txt = "(別ウィンドウで開く)";
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

    //別ウィンドウの明示自動修正
    target_blank_replace() {
        let new_txt = "";
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let old_txt = this.editor.getValue();
        let datas = txt.split(/\n/);
        for(var i=0; i<datas.length; i++) {
            var type = "";
            var row = datas[i].trim();
            if(this._is_img_link(row)) {
                type = "aimg";
            } else {
                type = "atext";
            }
            if(type === "aimg") {
                row = row.replace(this._get_alt_attr_pt(), "$1$2" + this.target_blank_def_txt + "$3");
                new_txt += row + "\n";
            } else {
                row = row.replace(this._get_a_pt(type), "$1$2" + this.target_blank_def_txt + "$3");
                new_txt += row + "\n";
            }
        }
        this.editor.setValue(old_txt + "\n\n" + new_txt);
    }
    _is_img_link(str) {
        var pt = new RegExp(/(<a.+?>)(.*?<img.+?>.*?)(<\/a>)/);
        return (pt.test(str) === true) ? true : false;
    }
    _get_a_pt(link_type) {
        if(link_type === "aimg") {
            return new RegExp(/(<a.+?>)(.*?<img.+?>.*?)(<\/a>)/);
        } else {
            return new RegExp(/(<a.+?>)(.+)(<\/a>)/);
        }
    }
    _get_alt_attr_pt() {
        return new RegExp(/(alt=")(.*?)(")/);
    }

    //minbrowserシュミレーションで付与されたspan要素とstyle属性の削除
    bkmk_tag_and_attr_del() {
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let pt_arr = [
            new RegExp(/( style="border:1px solid #*)([a-zA-Z0-9]+?)(; position: relative;")/mg),
            new RegExp(/( style="border:2px dotted #*)([a-zA-Z0-9]+;")/mg),
            new RegExp(/( style="border:1px solid #*)([a-zA-Z0-9]+;")/mg),
            new RegExp(/(<span id=")(bkm-.+?>)(.+?)(<\/span>)/mg)
        ];
        for(var i=0; i<pt_arr.length; i++) {
            try {
                if(pt_arr[i].test(txt)) {
                    txt = txt.replace(pt_arr[i], "");
                }
            } catch(e) {}
        }
        this.editor.session.replace(range, txt);
    }

    //alt属性値を修正
    alt_attr_edit(type, content) {
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let datas = txt.split(/\n/);
        let new_val = "";
        for(var i=0; i<datas.length; i++) {
            var line = datas[i];
            var pt = this._get_alt_attr_pt();
            if(pt.test(line)) {
                if(type === "overwrite") {
                    line = line.replace(pt, "$1$2" + content + "$3");
                } else if(type === "replace") {
                    line = line.replace(pt, "$1" + content + "$3");
                }
                new_val += line + "\n";
            }
        }
        this.editor.session.replace(range, new_val);
    }

}