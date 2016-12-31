// JavaScript Document
"use struct";

var ARECORD = ARECORD || {}


// 場の定義
ARECORD.worldWidth; // 世界の横幅
ARECORD.worldHeight; // 世界の縦幅
ARECORD.dataBits; // 1データの持つ情報量（必ず32で割り切れる数値）
ARECORD.pixelSize; // 描画時のピクセルサイズ


ARECORD.worldSize; // ワールドのピクセル数
ARECORD.arraySize; // レコード配列の長さ
ARECORD.bitSize; // レコードの全ビット数（未使用領域を含まない）

ARECORD.remainMsk; // レコード配列末尾の有効桁マスク
ARECORD.dataMsk; // 1データの情報量マスク
ARECORD.record; // レコード本体

//var ctxscope; // 2次元描画領域
//var textEra; // 時代表示


////////////////////////////
// 初期化
////////////////////////////
ARECORD.Init = function(width, height, bits){
	bits = Math.floor(bits);
	if( 32 % bits != 0){
		alert("Cannot specified bits that indivisible by 32.");
		return false;
	}
	this.worldWidth = Math.floor(width);
	this.worldHeight = Math.floor(height);
	this.dataBits = bits;
	
	this.worldSize = this.worldWidth * this.worldHeight;
	this.arraySize = Math.ceil(this.worldSize * this.dataBits / 32);
	this.bitSize = this.worldSize * this.dataBits;
	
	this.remainMsk = this.bitSize % 32 == 0 ? ~0 : ~(~0 << (32 - this.bitSize % 32));
	this.dataMsk = this.getFilledBit(this.dataBits);
	this.record = new Array(this.arraySize);
	
	this.Fill(0);
}

//var onload = function(){
//	
//	var canvasScope = document.getElementById('id_canvasScope');
//	if(!canvasScope || !canvasScope.getContext) {
//		alert("本ページの閲覧はHTML5対応ブラウザで行ってください");
//		return false;
//	}
//	canvasScope.addEventListener('mousedown', clickEvent, true);
//	canvasScope.addEventListener('mouseup', upEvent, true);
//	canvasScope.addEventListener('mousemove', moveEvent, true);
//	canvasScope.addEventListener('blur', upEvent, false);
//	ctxscope = canvasScope.getContext('2d');
//
//	textEra = document.getElementById('id_textEra');
//	//document.getElementById('id_buttonSetEra').addEventListener('click', SetErafunc, true);
//	
//	document.getElementById('id_buttonFillRnd').addEventListener('click', FillRandom, true);
//	document.getElementById('id_selectfill').addEventListener('change', selectFillerEvent, true);
//	
//	FillRandom();
//	console.log(record);
//	
//}


////////////////////////////
// 情報開示
////////////////////////////
ARECORD.GetRecordArraySize = function(){
	return this.arraySize;
}

////////////////////////////
// イベント処理
////////////////////////////
//var clicking = false;
//var fillmode = 0;
//function clickEvent(event){
//	var rect = event.target.getBoundingClientRect();
//	var x = Math.floor((event.clientX - rect.left) / pixelSize);
//	var y = Math.floor((event.clientY - rect.top ) / pixelSize);
//	var addr = GetAddrFromCoord(x, y);
//	
//	fillmode = GetData(addr) +1;
//	if(fillmode > dataMsk) fillmode = 0;
//	SetData(addr, fillmode);
//	drawPixel(x,y, fillmode);
//	
//	clicking = true;
//	event.returnValue = false;
//	refleshEra();
//	return false;
//}
//
//function upEvent(event){
//	clicking = false;
//	event.returnValue = false;
//	return false;
//}
//
//function moveEvent(event){
//	if(clicking == false) return;
//	var rect = event.target.getBoundingClientRect();
//	var x = Math.floor((event.clientX - rect.left) / pixelSize);
//	var y = Math.floor((event.clientY - rect.top ) / pixelSize);
//	var addr = GetAddrFromCoord(x, y);
//	
//	SetData(addr, fillmode);
//	drawPixel(x,y, fillmode);
//	event.returnValue = false;
//	refleshEra();
//	return false;
//}
//
//function selectFillerEvent(event){
//	var index = event.target.selectedIndex;
//	if(index > 0) Fill(index - 1);
//	event.target.selectedIndex = 0;
//}


///////////////////////////////
// レコードアドレスの取得
///////////////////////////////
ARECORD.GetAddrFromIndex = function (index){
	var i = Math.floor((index * this.dataBits) / 32);
	var j = (index * this.dataBits) % 32;
	
	return [i, j];
}

ARECORD.NextAddr = function (addr){
	if(addr[1] + this.dataBits >= 32){
		addr[0] = (addr[0]+1)|0;
		addr[1] = 0;
	}else{
		addr[1] = (addr[1]+this.dataBits)|0;
	}
}

ARECORD.GetAddrFromCoord = function (x, y){
	var index = y * this.worldWidth + x;
	return this.GetAddrFromIndex(index);
}


/////////////////////////////
// レコード操作：単ピクセル
/////////////////////////////
ARECORD.SetData = function (addr, data){
	var mask = this.dataMsk << addr[1];
	
	data = (data & this.dataMsk) << addr[1];
	this.record[addr[0]] = this.record[addr[0]] & ~mask;
	this.record[addr[0]] = this.record[addr[0]] + data;
}

ARECORD.GetData = function (addr){
	var mask = this.dataMsk << addr[1];
	return (this.record[addr[0]] & mask) >> addr[1];
}


////////////////////////////
// レコード操作：一括系
////////////////////////////
ARECORD.Fill = function(data){
	var addr = this.GetAddrFromIndex(0);
	
	while(addr[0] < this.arraySize){
		this.SetData(addr, data);
		this.NextAddr(addr);
	}
	//refleshAll();
}

ARECORD.FillRandom = function() {
	var addr = this.GetAddrFromIndex(0);
	
	while(addr[0] < this.arraySize){
		this.SetData(addr, Math.floor(Math.random() * (this.dataMsk + 1)));
		this.NextAddr(addr);
	}
	//refleshAll();
}


/////////////////////////////////
// 時代操作
/////////////////////////////////
ARECORD.GetEra = function (){
	// recordから2進数が流れ出す
	// さらにそれが10進数になり溢れゆく
	
	var stringEra = String();
	var i=0;
	var j=0;
	while(i < this.arraySize - 1){
		while(j < 32){
			stringEra = stringEra + ((this.record[i] & (1 << j)) != 0 ? "1" : "0");
			j = (j+1)|0;
		}
		i = (i+1)|0;
		j = 0;
	}
	while((1 << j) & this.remainMsk != 0){
		stringEra = stringEra + ((this.record[i] & (1 << j)) != 0 ? "1" : "0");
		j = (j+1)|0;
	}
	return stringEra;
}

ARECORD.SetEra = function (bignumber){
	// 10進数文字列をなんとかして2進数文字列に変換
	// さらにそれをなんとかしてrecordに流し込む
	// そしてエラーチェックも忘れない
}


/////////////////////////////////
// 描画処理
/////////////////////////////////
//function refleshAll(){
//	var addr = GetAddrFromIndex(0);
//	var x = 0;
//	var y = 0;
//	var data;
//	
//	while(addr[0] < arraySize){
//		data = GetData(addr);
//		setFillStyle(data);
//		ctxscope.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
//		
//		NextAddr(addr);
//		if(x >= worldWidth - 1){
//			x = 0;
//			y = (y+1)|0;
//		}else{
//			x = (x+1)|0;
//		}
//	}
//	
//	refleshEra();
//}
//
//function refleshPixel(addr){
//	var index = (addr[0] * 32 + addr[1]) / dataBits;
//	var x = index / worldWidth;
//	var y = index % worldWidth;
//	
//	setFillStyle(data);
//	ctxscope.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
//}
//
//function drawPixel(x, y, data){
//	setFillStyle(data);
//	ctxscope.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
//}
//
//var dataColor = ["rgb(200,200,200)", "rgb(100,100,100)", "rgb(200,100,100)", "rgb(150,150,200)"];
//function setFillStyle(data){
//	ctxscope.fillStyle = dataColor[data];
//}
//
//function refleshEra(){
//	textEra.value = GetEra();
//}


//////////////////////////////////
// ユーティリティ
//////////////////////////////////
ARECORD.getFilledBit = function (x){
	if(x <= 0) return 0;
	var i=1;
	var j=1;
	while(i < x){
		j = ((j << 1) + 1)|0;
		i = (i+1)|0;
	}
	return j;
}
//function getRandomInt(x) {
//	if (x <   0) return NaN;
//	if (x <= 30) return (0 | Math.random() * (1 <<      x));
//	if (x <= 53) return (0 | Math.random() * (1 <<     30)) 
//		+ (0 | Math.random() * (1 << x - 30)) * (1 << 30);
//	return NaN;
//}
//
//function clamp(i, min, max){
//	return Math.min(Math.max(i,max),min);
//}