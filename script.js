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
let coordinate_start = [];
let coordinate_end = [];
function dotTable() { // ドット絵を書き込む表を表示
    for (let i = 0; i < x; i++) {
        let row = dotTbl.insertRow(-1);
        for (let j = 0; j < y; j++) {
            let cell = row.insertCell(-1);

            cell.onclick = function() { // 描画処理
                let lookingBackgroundColor = this.style.backgroundColor;
                this.style.backgroundColor = ColorIndex;

                // 塗りつぶし処理
                if (paint.checked){
                    fillBFS(cell, lookingBackgroundColor)
                
                // 直線描画処理
                } else if (border.checked && !borderDraw){

                    // ループ用変数の宣言(始点の定義には必要ない)
                    // let queue = [];
                    // let num = indexA_star.length;
                    // 現在地の取得
                    let nowRows = this.parentNode.rowIndex;
                    let nowCols = this.cellIndex;

                    coordinate_start.push([nowRows, nowCols])

                    borderDraw = true;

                    this.appendChild(document.createTextNode("▼"));

                    //
                    // 多分そもそも直線近似してやる方がいい？
                    //


                } else if (border.checked && borderDraw){
                    // border.checked && bool border なときに操作をおこなうようにする？
                    let endRows = cell.parentNode.rowIndex;
                    let endCols = cell.cellIndex;

                    coordinate_end.push(endRows, endCols);

                    let startRows = coordinate_start[0][0];
                    let startCols = coordinate_start[0][1];
                    
                    dotTbl.rows[startRows].cells[startCols].textContent = "";
                    //cell.appendChild(document.createTextNode("▲"));

                    // 目標節点であった場合，着色して終了
                    if (startRows == endRows && startCols == endCols){
                        // ここに着色処理
                        dotTbl.rows[startRows].cells[startRows].style.backgroundColor = ColorIndex;
                        // 変数の初期化処理
                        coordinate_start.splice(0)
                        coordinate_end.splice(0)
                        return;
                    }

                    let nextCoordinate = coordinate_start;
                    let num = indexA_star.length;
                    let distance = Number.MAX_SAFE_INTEGER;

                    console.log(num)

                    while (true){

                        let [nowRows, nowCols] = nextCoordinate.shift();
                        dotTbl.rows[nowRows].cells[nowCols].style.backgroundColor = ColorIndex;

                        console.log("n回め")
                        console.log(distance)

                        console.log(nowRows)
                        console.log(nowCols)

                        // 探索の実行
                        for (let i=0; i < num; i++){
                            let lookingRows = nowRows + indexA_star[i][0];
                            let lookingCols = nowCols + indexA_star[i][1];
                    
                            if (0 <= lookingRows && lookingRows < y){
                                if (0 <= lookingCols && lookingCols < x){
                                    let temp = EuclideanD(lookingRows, endRows, lookingCols, endCols);
                                    if (distance > temp){
                                        distance = temp
                                        //nextCoordinate = [];
                                        nextCoordinate.splice(0)
                                        nextCoordinate.push([lookingRows, lookingCols])
                                    }
                                }
                            }
                        }

                        // ここに着色処理
                        //let [nextRows, nextCols] = coordinate_start.shift();
                        //dotTbl.rows[nextRows].cells[nextCols].style.backgroundColor = ColorIndex;

                        if (distance == 0){
                            coordinate_start.splice(0)
                            coordinate_end.splice(0)

                            break;
                        }
                    }


                    



                    borderDraw = false;

                    // setTimeout(function(){
                    //     cell.textContent = "";  // セルのテキストをクリア
                    // }, 3000);
                } else {
                    borderDraw = false;
                }
            }
        }
    }
}


// 評価関数()
function EuclideanD(x_1 = 0, x_2 = 0, y_1 = 0, y_2 = 0){
    //let x_1, x_2, y_1, y_2;

    let distance = Math.sqrt( (x_1 - x_2) ** 2 + (y_1 - y_2) ** 2 );

    console.log(distance);

    return distance;
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
        // キューから要素を取り出す
        let [queueRows, queueCols] = queue.shift();
        // 一マスを着色
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


function resizeCanvas(){
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
            dotTbl.rows[i].cells[j].textContent = "";
        }
    }

    // ConvertCanvasの初期化
    context.fillStyle = "rgb(255, 255, 255)";
    context.fillRect ( 0, 0, x, y);
}


function ConvertCanvas() { // .pngに変換
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