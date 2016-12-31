// JavaScript Document

// 場の定義
var worldWidth = 32; // 世界の横幅
var worldHeight = 32; // 世界の縦幅
var pixelBits = 2; // ピクセルの持つ情報量（必ず32で割り切れる数値）
var pixelSize = 8; // 描画時のピクセルサイズ

var worldSize = worldWidth * worldHeight; // ワールドのピクセル数
var arraySize = Math.ceil(worldSize * pixelBits / 32); // レコード配列の長さ
var bitSize = worldSize * pixelBits; // レコードの全ビット数（未使用領域を含まない）

var remainMsk = bitSize % 32 == 0 ? ~0 : ~(~0 << (32 - bitSize % 32)); // レコード配列末尾の有効桁マスク
var pixelMsk = getFilledBit(pixelBits); // ピクセルの情報量マスク
var Record = new Array(arraySize); // レコード本体

var ctxscope; // 2次元描画領域
var textEra; // 時代表示

var onload = function(){
	
	var canvasScope = document.getElementById('id_canvasScope');
	if(!canvasScope || !canvasScope.getContext) {
		alert("本ページの閲覧はHTML5対応ブラウザで行ってください");
		return false;
	}
	canvasScope.addEventListener('mousedown', clickEvent, true);
	canvasScope.addEventListener('mouseup', upEvent, true);
	canvasScope.addEventListener('mousemove', moveEvent, true);
	canvasScope.addEventListener('blur', upEvent, false);
	ctxscope = canvasScope.getContext('2d');

	textEra = document.getElementById('id_textEra');
	//document.getElementById('id_buttonSetEra').addEventListener('click', setErafunc, true);
	
	document.getElementById('id_buttonFillRnd').addEventListener('click', randomRecord, true);
	document.getElementById('id_selectfill').addEventListener('change', selectFillerEvent, true);
	
	randomRecord();
	console.log(Record);
	
}


////////////////////////////
// イベント処理
////////////////////////////
var clicking = false;
var fillmode = 0;
function clickEvent(event){
	var rect = event.target.getBoundingClientRect();
	var x = Math.floor((event.clientX - rect.left) / pixelSize);
	var y = Math.floor((event.clientY - rect.top ) / pixelSize);
	var addr = getAddrFromCoord(x, y);
	
	fillmode = getRecord(addr) +1;
	if(fillmode > pixelMsk) fillmode = 0;
	setRecord(addr, fillmode);
	drawPixel(x,y, fillmode);
	
	clicking = true;
	event.returnValue = false;
	refleshEra();
	return false;
}

function upEvent(event){
	clicking = false;
	event.returnValue = false;
	return false;
}

function moveEvent(event){
	if(clicking == false) return;
	var rect = event.target.getBoundingClientRect();
	var x = Math.floor((event.clientX - rect.left) / pixelSize);
	var y = Math.floor((event.clientY - rect.top ) / pixelSize);
	var addr = getAddrFromCoord(x, y);
	
	setRecord(addr, fillmode);
	drawPixel(x,y, fillmode);
	event.returnValue = false;
	refleshEra();
	return false;
}

function selectFillerEvent(event){
	var index = event.target.selectedIndex;
	if(index > 0) fillRecord(index - 1);
	event.target.selectedIndex = 0;
}


///////////////////////////////
// レコードアドレスの取得
///////////////////////////////
function getAddrFromIndex(index){
	var i = Math.floor((index * pixelBits) / 32);
	var j = (index * pixelBits) % 32;
	
	return [i, j];
}

function nextAddr(addr){
	if(addr[1] + pixelBits >= 32){
		addr[0] = (addr[0]+1)|0;
		addr[1] = 0;
	}else{
		addr[1] = (addr[1]+pixelBits)|0;
	}
}

function getAddrFromCoord(x, y){
	var index = y * worldWidth + x;
	return getAddrFromIndex(index);
}


/////////////////////////////
// レコード操作：単ピクセル
/////////////////////////////
function setRecord(addr, data){
	var mask = pixelMsk << addr[1];
	
	data = (data & pixelMsk) << addr[1];
	Record[addr[0]] = Record[addr[0]] & ~mask;
	Record[addr[0]] = Record[addr[0]] + data;
}

function getRecord(addr){
	var mask = pixelMsk << addr[1];
	return (Record[addr[0]] & mask) >> addr[1];
}


////////////////////////////
// レコード操作：一括系
////////////////////////////
function fillRecord(data){
	var addr = getAddrFromIndex(0);
	
	while(addr[0] < arraySize){
		setRecord(addr, data);
		nextAddr(addr);
	}
	refleshAll();
}

function randomRecord() {
	var addr = getAddrFromIndex(0);
	
	while(addr[0] < arraySize){
		setRecord(addr, Math.floor(Math.random() * pixelSize));
		nextAddr(addr);
	}
	refleshAll();
}


/////////////////////////////////
// 時代操作
/////////////////////////////////
function getEra(){
	// Recordから2進数が流れ出す
	// さらにそれが10進数になり溢れゆく
	
	var stringEra = String();
	var i=0;
	var j=0;
	while(i < arraySize - 1){
		while(j < 32){
			stringEra = stringEra + ((Record[i] & (1 << j)) != 0 ? "1" : "0");
			j = (j+1)|0;
		}
		i = (i+1)|0;
		j = 0;
	}
	while((1 << j) & remainMsk != 0){
		stringEra = stringEra + ((Record[i] & (1 << j)) != 0 ? "1" : "0");
		j = (j+1)|0;
	}
	return stringEra;
}

function setEra(bignumber){
	// 10進数文字列をなんとかして2進数文字列に変換
	// さらにそれをなんとかしてRecordに流し込む
	// そしてエラーチェックも忘れない
}


/////////////////////////////////
// 描画処理
/////////////////////////////////
function refleshAll(){
	var addr = getAddrFromIndex(0);
	var x = 0;
	var y = 0;
	var data;
	
	while(addr[0] < arraySize){
		data = getRecord(addr);
		setFillStyle(data);
		ctxscope.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
		
		nextAddr(addr);
		if(x >= worldWidth - 1){
			x = 0;
			y = (y+1)|0;
		}else{
			x = (x+1)|0;
		}
	}
	
	refleshEra();
}

function refleshPixel(addr){
	var index = (addr[0] * 32 + addr[1]) / pixelBits;
	var x = index / worldWidth;
	var y = index % worldWidth;
	
	setFillStyle(data);
	ctxscope.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function drawPixel(x, y, data){
	setFillStyle(data);
	ctxscope.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

var dataColor = ["rgb(200,200,200)", "rgb(100,100,100)", "rgb(200,100,100)", "rgb(150,150,200)"];
function setFillStyle(data){
	ctxscope.fillStyle = dataColor[data];
}

function refleshEra(){
	textEra.value = getEra();
}


//////////////////////////////////
// ユーティリティ
//////////////////////////////////
function getFilledBit(x){
	if(x <= 0) return 0;
	var i=1;
	var j=1;
	while(i < x){
		j = ((j << 1) + 1)|0;
		i = (i+1)|0;
	}
	return j;
}
function getRandomInt(x) {
	if (x <   0) return NaN;
	if (x <= 30) return (0 | Math.random() * (1 <<      x));
	if (x <= 53) return (0 | Math.random() * (1 <<     30)) 
		+ (0 | Math.random() * (1 << x - 30)) * (1 << 30);
	return NaN;
}

function clamp(i, min, max){
	return Math.min(Math.max(i,max),min);
}