module.exports = class textUtil {
    
    //コンストラクタ
    constructor(editor, editor_text) {
        this.editor = editor;
        this.editor_text = editor_text;
        this.target_blank_def_txt = "(別ウィンドウで開く)";
        this.tab_sp = "<bkmk:tab>";
        this.br_sp = "<bkmk:br>";
        this.data_tab_sp = "<bkmk:data:tab>";
        this.data_br_sp = "<bkmk:data:br>";
    }

    //見出しタグ自動変換
    heading_replace() {
        let new_txt = "";
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange(range);
        let old_txt = this.editor.session.getTextRange();
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
            new_txt += this.replace_element_only(line, cr_tag);
        }
        this.editor.session.replace(range, old_txt + "\n\n" + new_txt);
    }

    //要素名だけを置換
    replace_element_only(str, cr_tag){
        if(!this._is_tag_code(str) || this._is_inline(str)) {
            return `<${cr_tag}>${str}</${cr_tag}>` + "\n";
        } else {
            let pt = new RegExp(/(^<)([a-zA-Z]+?)( *)(.*?)(>)(.+)(<\/[a-zA-Z]+>)/);
            let mt = str.match(pt);
            return `<${cr_tag}${mt[3]}${mt[4]}>${mt[6]}</${cr_tag}>` + "\n";
        }
    }
    _is_tag_code(str) {
        if(new RegExp(/^</).test(str)) return true;
        else return false;
    }
    _is_inline(str) {
        if(new RegExp(/(^<)(span|strong|em)(.*)/).test(str)) return true;
        else return false;
    }

    //要素挿入
    insert_tag(tag_name, attrs = "") {
        tag_name = tag_name.toLowerCase();
        if(attrs !== "") attrs = " " + attrs;
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let new_val = `<${tag_name}${attrs}>${txt}</${tag_name}>`;
        this.editor.session.replace(range, new_val);
    }

    //リストタグ自動変換
    list_replace() {
        let new_txt = "";
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let old_txt = this.editor.session.getTextRange();
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
        this.editor.session.replace(range, old_txt + "\n\n" + new_txt);
    }

    //別ウィンドウの明示自動修正
    target_blank_replace() {
        let new_txt = "";
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let old_txt = this.editor.session.getTextRange();
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
        this.editor.session.replace(range, old_txt + "\n\n" + new_txt);
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

    //label要素を挿入
    insert_tag_label(content, attr) {
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let tmptxt = "";
        let pt = new RegExp(/(<.+?>)(.+?)(<\/.+?>)/);
        let tagflg = null;
        let opentag = "";
        let endtag = "";
        tagflg = pt.test(txt);
        if(tagflg) {
            tmptxt = txt.match(pt)[2];
            opentag = txt.match(pt)[1];
            endtag = txt.match(pt)[3];
            if(content !== "nil") {
                tmptxt = content;
            }
        } else {
            if(content === "nil") {
                tmptxt = txt;
            } else {
                tmptxt = content;
            }
        }
        if(attr === "nil") {
            txt = `<label>` + tmptxt + `</label>`;
        } else {
            txt = `<label for="${attr}">` + tmptxt + `</label>`;
        }
        if(tagflg) {
            txt = opentag + txt + endtag;
        }
        this.editor.session.replace(range, txt);
    }

    //改行挿入
    insert_return() {
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        this.editor.session.replace(range, txt + "\n");
    }

    //判定ひな形をデコード
    decode_sv_base() {
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let arr = new Array();
        let sv = "";
        let comment = "";
        let description = "";
        let srccode = "";
        let tmp = txt.split(this.tab_sp);
        if(tmp == null) return;
        sv = tmp[1];
        comment = this._br_decode(tmp[4]);
        description = this._br_decode(tmp[5]);
        srccode = this._br_decode(tmp[6]);
        let body = `■判定: ${sv}\n\n■判定コメント:\n${comment}\n\n■対象ソースコード:\n${description}\n\n■修正ソースコード:\n${srccode}`;
        this.editor.session.replace(range, body);
    }
    _br_decode(str) {
        return str.replace(new RegExp(this.br_sp, "mg"), "\n");
    }

    //判定ひな形をデコード（LibraPlus）
    decode_sv_base_plus() {
        let range = this.editor.getSelectionRange();
        let txt = this.editor.session.getTextRange();
        let body = "■■開始■■\n\n";
        body += "";
        let pr_arr = txt.split(this.data_br_sp);
        if(pr_arr == null) return;
        for(var i=0; i<pr_arr.length; i++) {
            let ch_arr = pr_arr[i].split(this.tab_sp);
            if(ch_arr == null) return;
            let nm = ch_arr[0];
            let title = ch_arr[1];
            let sv = ch_arr[2];
            let sv_body = ch_arr[3];
            sv_body = sv_body.replace(/<bkmk:data:rw[0-9]+:cn[0-9]+:start>/, "");
            sv_body = sv_body.replace(/<bkmk:data:rw[0-9]+:cn[0-9]+:end>/, "");
            let tmp = sv_body.split(this.data_tab_sp);
            if(tmp == null) return;
            let comment = this._br_decode(tmp[0]);
            let description = this._br_decode(tmp[1]);
            let srccode = this._br_decode(tmp[2]);
            body += `■番号: ${nm}\n\n■検査項目: ${title}\n\n■判定: ${sv}\n\n■判定コメント:\n${comment}\n\n■対象ソースコード:\n${description}\n\n■修正ソースコード:\n${srccode}`;
            if(i != (pr_arr.length - 1)) body += "\n\n■■■■■■\n\n";
        }
        body += "\n\n■■終了■■";
        this.editor.session.replace(range, body);
    }

    //判定ひな形にエンコード
    encode_sv_base() {
        try {
            let range = this.editor.getSelectionRange();
            let txt = this.editor.session.getTextRange();
            let old_txt = this.editor.session.getTextRange();
            let sv = txt.split(/■判定: */)[1].trim().split(/■判定コメント:/)[0].trim();
            sv = this._br_encode(sv);
            let comment = txt.split(/■判定コメント:/)[1].trim().split(/■対象ソースコード:/)[0].trim();
            comment = this._br_encode(comment);
            let description = txt.split(/■対象ソースコード:/)[1].trim().split(/■修正ソースコード:/)[0].trim();
            description = this._br_encode(description);
            let srccode = txt.split(/■修正ソースコード:/)[1].trim();
            srccode = this._br_encode(srccode);
            let new_txt = txt = "which" + this.tab_sp + sv + this.tab_sp + "no" + this.tab_sp + "who" + this.tab_sp;
            new_txt += comment + this.tab_sp + description + this.tab_sp + srccode;
            this.editor.session.replace(range, old_txt + "\n\n" + new_txt);
        } catch(e) {
            alert("選択範囲に問題があります。確認してください。\n"+e.toString());
        }
    }
    _br_encode(str) {
        return str.replace(/\r/mg, "").replace(/\n/mg, this.br_sp);
    }

}