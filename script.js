let dotTbl = document.getElementById("dotTBL");
        
let ColTbl = document.getElementById("ColorTBL");
let AddColorTbl = document.getElementById("AddColorTBL");

let canvas = document.getElementById("output");
let context = canvas.getContext("2d"); // 二次元を指定

let paint = document.getElementById('paint');

let input = document.getElementById('input'); // 追加色入力欄

let size = document.getElementById('canvas-size') // キャンバスのサイズを変更

input.addEventListener('input', function (event) {
    addColor = event.currentTarget.value; // 入力内容の取得
    AddColTable();
});

let addColor = "rgb(255, 255, 255)";
function AddColTable() {
    // 入力された色のRGB値を取得
    let addColorRGB = getColorRGB(addColor);
    //console.log(`入力された色は: ${addColorRGB}`);

    // パレット内を走査
    for (let i = 0, colLen = ColTbl.rows[0].cells.length; i < colLen; i++) {
        let existingCell = ColTbl.rows[0].cells[i];
        let existingColorRGB = getComputedStyle(existingCell).backgroundColor;

        // 既に追加されている色なら削除
        if (existingColorRGB === addColorRGB) {
            //console.log(`色の重複があります`); 
            return;
        }
    }

    // 新たにセルを追加
    let cell = ColTbl.rows[0].insertCell();
    cell.style.backgroundColor = addColorRGB; // セルの背景色を入力された色に変更

    // セルのクリックイベントを設定
    cell.onclick = function() {
        ColorIndex = this.style.backgroundColor;
        console.log("現在の色は" + ColorIndex);
    }

    console.log(`新しい色なので追加します...`);
}

// 入力をRGBに変換
function getColorRGB(colorName) {
    const div = document.createElement("div");
    div.style.color = colorName;
    document.body.appendChild(div);

    // ブラウザが解釈した色のRGB値を取得
    const rgbValue = window.getComputedStyle(div).color;

    // 仮想要素を削除
    document.body.removeChild(div);

    return rgbValue;
}


function deleteColTable() {
    // パレット内を走査
    for (let i=0, colLen=ColTbl.rows[0].cells.length ; i<colLen; i++){
        let getStyle = getComputedStyle(ColTbl.rows[0].cells[i]);
        let BeforeColInfo = getStyle.backgroundColor;

        if(BeforeColInfo == ColorIndex) { // 既に追加されている色なら削除
        ColTbl.rows[0].deleteCell(i);
        console.log(`パレットから削除しました`);

        return;
        }
    }
}

let BaseColorTable = [ "rgb(0, 0, 0)", "rgb(255, 255, 255)"];
function colTable() { // AddColTableの初期色をセット
    for (let i = 0; i < BaseColorTable.length; i++) {
        let cell = ColTbl.rows[0].insertCell(-1);
        cell.style.backgroundColor = BaseColorTable[i];
        cell.onclick = function() {
            ColorIndex = this.style.backgroundColor;
        }
    }
}

const index = [[-1,0],[0,1],[1,0],[0,-1]]
function dotTable() { // ドット絵を書き込む表を表示
    for (let i = 0; i < x; i++) {
        let row = dotTbl.insertRow(-1);
        for (let j = 0; j < y; j++) {
            let cell = row.insertCell(-1);

            cell.onclick = function() { // 描画処理
                let lookingBackgroundColor = this.style.backgroundColor;

                if (lookingBackgroundColor == ColorIndex){
                    return;
                }

                // 一マスを着色
                this.style.backgroundColor = ColorIndex;

                if (paint.checked){ // 塗りつぶし処理
                    // ループ用変数の宣言
                    let queue = [];
                    let num = index.length;
                    // 現在地の取得
                    let nowRows = this.parentNode.rowIndex;
                    let nowCols = this.cellIndex;

                    // 現在地の上下左右を調査
                    for (let i=0; i < num; i++){
                        let lookingRows = nowRows + index[i][0];
                        let lookingCols = nowCols + index[i][1];

                        if (0 <= lookingRows && lookingRows < y){
                            if (0 <= lookingCols && lookingCols < x){
                                if (lookingBackgroundColor == dotTbl.rows[lookingRows].cells[lookingCols].style.backgroundColor){
                                    // IndexがOutOfRangeではない && 色が現在地と同じ
                                    queue.push([lookingRows,lookingCols])
                                }
                            }
                        }
                    }

                    // 塗りつぶす候補がないとき
                    if (!queue.length){
                        return;
                    }

                    while (true){
                        // キューから要素を取り出す
                        let [queueRows, queueCols] = queue.shift();
                        // 一マスを着色
                        dotTbl.rows[queueRows].cells[queueCols].style.backgroundColor = ColorIndex;

                        // 着色したマスの上下左右を調査
                        for (let i=0; i < num; i++){
                            let lookingRows = queueRows + index[i][0];
                            let lookingCols = queueCols + index[i][1];

                            if (0 <= lookingRows && lookingRows < y){
                                if (0 <= lookingCols && lookingCols < x){
                                    if (lookingBackgroundColor == dotTbl.rows[lookingRows].cells[lookingCols].style.backgroundColor){
                                        if (!queue.find(([row, col]) => row === lookingRows && col === lookingCols)) {
                                            // IndexがOutOfRangeではない && 色が現在地と同じ && キューに座標の重複がない
                                            queue.push([lookingRows,lookingCols])
                                        }
                                    }
                                }
                            }
                        }

                        // 塗りつぶす候補が無くなったとき
                        if (!queue.length){
                            console.log(`塗りつぶし完了`);
                            break;
                        }
                    }
                }
            }
        }
    }
}

function resizeCanvas(){
    console.log("指定されたサイズは" + size.value);

    x = size.value;
    y = size.value;

    while (dotTbl.rows[0]){
        dotTbl.deleteRow(0);
    }

    dotTable();
    clearTable();
}

function clearTable() {
    // dotTableの初期化
    for(let i = 0; i < x; i++) {
        for(let j = 0; j < y; j++) {
            dotTbl.rows[i].cells[j].style.backgroundColor = "rgb(255, 255, 255)";
        }
    }

    console.log("x: " + x)

    // ConvertCanvasの初期化
    context.fillStyle = "rgb(255, 255, 255)";
    context.fillRect ( 0, 0, x, y);
}

function ConvertCanvas() { // .pngに変換
    //canvas = document.getElementById('output')
    //canvas = document.createElement("canvas");
    canvas.setAttribute("width", x);
    canvas.setAttribute("height", y);

    console.log("x: " + x)

    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            let canvas_Color = dotTbl.rows[i].cells[j].style.backgroundColor;
            context.fillStyle = canvas_Color;
            context.fillRect ( j, i, x, y);
        }
        console.log("実行 " + i + "回目")
    }
}

let x, y;
window.onload = function() {
    x = 20, y = 20;
    dotTable();
    colTable();
    clearTable();
}