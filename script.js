let dotTbl = document.getElementById("dotTBL");
let size = document.getElementById('canvas-size') // キャンバスのサイズを変更
        
let ColTbl = document.getElementById("ColorTBL");
let AddColorTbl = document.getElementById("AddColorTBL");

let canvas = document.getElementById("output");
let context = canvas.getContext("2d"); // 二次元を指定

let paint = document.getElementById('paint');
let border = document.getElementById('border');

let input = document.getElementById('input'); // 追加色入力欄


input.addEventListener('input', function (event) {
    addColor = event.currentTarget.value; // 入力内容の取得
    AddColTable();
});


let addColor;
let ColorIndex;
function AddColTable() {
    // 入力された色のRGB値を取得
    let addColorRGB = getColorRGB(addColor);

    // パレット内を走査
    for (let i = 0, colLen = ColTbl.rows[0].cells.length; i < colLen; i++) {
        let existingCell = ColTbl.rows[0].cells[i];
        let existingColorRGB = getComputedStyle(existingCell).backgroundColor;

        if (existingColorRGB === addColorRGB) {
            return;
        }
    }

    // パレットに色を追加
    let cell = ColTbl.rows[0].insertCell();
    cell.style.backgroundColor = addColorRGB;

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
    for (let i=0, colLen=ColTbl.rows[0].cells.length ; i<colLen; i++){
        let getStyle = getComputedStyle(ColTbl.rows[0].cells[i]);
        let BeforeColInfo = getStyle.backgroundColor;

        if(BeforeColInfo == ColorIndex) {
            ColTbl.rows[0].deleteCell(i);
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


const indexA_star = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]

let borderDraw = false;
let coordinateStart = [];
let coordinateEnd = [];
function dotTable() { // ドット絵を書き込む表を表示
    for (let i = 0; i < x; i++) {
        let row = dotTbl.insertRow(-1);
        for (let j = 0; j < y; j++) {
            let cell = row.insertCell(-1);

            cell.addEventListener("click", function () {
                let lookingBackgroundColor = this.style.backgroundColor;
                this.style.backgroundColor = ColorIndex;

                // 塗りつぶし処理
                if (paint.checked){
                    fillBFS(cell, lookingBackgroundColor)
                
                // 直線描画処理
                } else if (border.checked && !borderDraw){
                    let nowRows = this.parentNode.rowIndex;
                    let nowCols = this.cellIndex;

                    coordinateStart.push([nowRows, nowCols])

                    borderDraw = true;

                    this.appendChild(document.createTextNode("▼"));

                //
                // 本当は，A*アルゴリズムではなく，
                // 近似直線を求めてやる方が良い．
                // でもA*を使ってみたかったの．
                //
                } else if (border.checked && borderDraw){
                    let startRows = coordinateStart[0][0];
                    let startCols = coordinateStart[0][1];
                    let endRows = cell.parentNode.rowIndex;
                    let endCols = cell.cellIndex;

                    coordinateEnd.push(endRows, endCols);
                    
                    dotTbl.rows[startRows].cells[startCols].textContent = "";

                    // 目標節点であった場合，着色して終了
                    if (startRows == endRows && startCols == endCols){
                        dotTbl.rows[startRows].cells[startRows].style.backgroundColor = ColorIndex;

                        coordinateStart.splice(0);
                        coordinateEnd.splice(0);
                        return;
                    }

                    let nextCoordinate = coordinateStart;
                    let num = indexA_star.length;

                    while (true){
                        let [nowRows, nowCols] = nextCoordinate.shift();
                        let distance = Number.MAX_SAFE_INTEGER;
                        
                        dotTbl.rows[nowRows].cells[nowCols].style.backgroundColor = ColorIndex;

                        // 探索の実行
                        for (let i=0; i < num; i++){
                            let lookingRows = nowRows + indexA_star[i][0];
                            let lookingCols = nowCols + indexA_star[i][1];
                    
                            if (0 <= lookingRows && lookingRows < y){
                                if (0 <= lookingCols && lookingCols < x){
                                    let temp = EuclideanD(lookingRows, endRows, lookingCols, endCols);
                                    if (distance > temp){
                                        distance = temp
                                        nextCoordinate.splice(0)
                                        nextCoordinate.push([lookingRows, lookingCols])
                                    }
                                }
                            }
                        }

                        if (distance == 0){
                            coordinateStart.splice(0)
                            coordinateEnd.splice(0)
                            borderDraw = false;

                            break;
                        }
                    }
                } else {
                    if (borderDraw){
                        let [startRows, startCols] = coordinateStart.shift();
                        dotTbl.rows[startRows].cells[startCols].textContent = "";
                    }

                    coordinateStart.splice(0)
                    coordinateEnd.splice(0)
                    borderDraw = false;
                }
            });
            // 直線の予測線を実装しても良い
        }
    }
}


// 評価関数f()
function EuclideanD(x_1 = 0, x_2 = 0, y_1 = 0, y_2 = 0){
    let distance = Math.sqrt( (x_1 - x_2) ** 2 + (y_1 - y_2) ** 2 );

    return distance;
}


function borderA_star(){

}


const indexBSF = [[-1,0],[0,1],[1,0],[0,-1]]
function fillBFS(cell, lookingBackgroundColor){
    // ループ用変数の宣言
    let queue = [];
    let num = indexBSF.length;
    // 現在地の取得
    let nowRows = cell.parentNode.rowIndex;
    let nowCols = cell.cellIndex;

    for (let i=0; i < num; i++){
        let lookingRows = nowRows + indexBSF[i][0];
        let lookingCols = nowCols + indexBSF[i][1];

        if (0 <= lookingRows && lookingRows < y){
            if (0 <= lookingCols && lookingCols < x){
                if (lookingBackgroundColor == dotTbl.rows[lookingRows].cells[lookingCols].style.backgroundColor){
                    // IndexがOutOfRangeではない && 色が現在地と同じ
                    queue.push([lookingRows,lookingCols])
                }
            }
        }
    }

    if (!queue.length){
        return;
    }

    while (true){
        let [queueRows, queueCols] = queue.shift();
        dotTbl.rows[queueRows].cells[queueCols].style.backgroundColor = ColorIndex;

        for (let i=0; i < num; i++){
            let lookingRows = queueRows + indexBSF[i][0];
            let lookingCols = queueCols + indexBSF[i][1];

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

        if (!queue.length){
            console.log(`塗りつぶし完了`);
            break;
        }
    }
}


function resizeTable(){
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
            dotTbl.style.color = "gray";
            dotTbl.rows[i].cells[j].textContent = "";
        }
    }

    // ConvertTableの初期化
    context.fillStyle = "rgb(255, 255, 255)";
    context.fillRect ( 0, 0, x, y);
}


function ConvertTable() { // .pngに変換
    canvas.setAttribute("width", x);
    canvas.setAttribute("height", y);

    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            let canvas_Color = dotTbl.rows[i].cells[j].style.backgroundColor;
            context.fillStyle = canvas_Color;
            context.fillRect ( j, i, x, y);
        }
    }
}


let x, y;
window.onload = function() {
    x = 20, y = 20;
    ColorIndex = "rgb( 0, 0, 0)";
    dotTable();
    colTable();
    clearTable();
}