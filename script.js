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
                    fillBFS(cell, lookingBackgroundColor);
                    resetBorderFlag();
                // 直線描画処理
                } else if (border.checked && !borderDraw){
                    borderA_starInitial(cell);
                } else if (border.checked && borderDraw){
                    //
                    // 本当は，A*アルゴリズムではなく，
                    // ブレゼンハムでやる方が良い．
                    // でもA*を使ってみたかったの．
                    //
                    //borderA_star(cell);

                    borderBresenham(cell);
                    
                } else {
                    resetBorderFlag();
                }
            });
            // 直線の予測線を実装しても良い
        }
    }
}


function borderBresenham(cell){
    let startRows = coordinateStart[0][0];
    let startCols = coordinateStart[0][1];
    let endRows = cell.parentNode.rowIndex;
    let endCols = cell.cellIndex;

    dx = Math.abs(endCols - startCols);
    dy = Math.abs(endRows - startRows);

    let sx = 0;
    let sy = 0;

    if (startCols < endCols){
        sx = 1;
    } else {
        sx = -1;
    }
    if (startRows < endRows){
        sy = 1;
    } else {
        sy = -1;
    }

    err = dx - dy;

    while (true){
        dotTbl.rows[startRows].cells[startCols].style.backgroundColor = ColorIndex;

        if (startCols == endCols && startRows == endRows){
            resetBorderFlag();
            
            return;
        }

        e2 = 2 * err;

        if (e2 > -dy){
            err -= dy;
            startCols += sx;
        }
        if (e2 < dx){
            err += dx;
            startRows += sy;
        }
    }
}


// 評価関数f()
function EuclideanD(x_1 = 0, x_2 = 0, y_1 = 0, y_2 = 0){
    let distance = Math.sqrt( (x_1 - x_2) ** 2 + (y_1 - y_2) ** 2 );

    return distance;
}


let borderDraw = false;
let coordinateStart = [];
function borderA_starInitial(cell){
    let nowRows = cell.parentNode.rowIndex;
    let nowCols = cell.cellIndex;

    coordinateStart.push([nowRows, nowCols]);

    borderDraw = true;

    cell.appendChild(document.createTextNode("▼"));
}


const indexA_star = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
let coordinateEnd = [];
function borderA_star(cell){
    let startRows = coordinateStart[0][0];
    let startCols = coordinateStart[0][1];
    let endRows = cell.parentNode.rowIndex;
    let endCols = cell.cellIndex;

    coordinateEnd.push(endRows, endCols);

    // 目標節点であった場合，着色して終了
    if (startRows == endRows && startCols == endCols){
        resetBorderFlag();

        return;
    }

    // deepCopy
    let nextCoordinate = structuredClone(coordinateStart);
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
                        distance = temp;
                        nextCoordinate.splice(0);
                        nextCoordinate.push([lookingRows, lookingCols]);
                    }
                }
            }
        }

        if (distance == 0){
            resetBorderFlag();

            return;
        }
    }
}


function resetBorderFlag(){
    if (borderDraw){
        let [startRows, startCols] = coordinateStart.shift();
        dotTbl.rows[startRows].cells[startCols].textContent = "";
    }

    coordinateStart.splice(0)
    coordinateEnd.splice(0)
    borderDraw = false;
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