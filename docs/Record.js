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


////////////////////////////
// 情報開示
////////////////////////////
ARECORD.GetRecordArraySize = function(){
	return this.arraySize;
}


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
	while(i < this.arraySize){
		while(j < 32){
			stringEra = stringEra + ((this.record[i] & (1 << j)) != 0 ? "1" : "0");
			j = (j+1)|0;
		}
		i = (i+1)|0;
		j = 0;
	}
	
	// 2進数文字列が得られた。
	
	return stringEra;
}

ARECORD.SetEra = function (bignumber){
	// 10進数文字列をなんとかして2進数文字列に変換
	// さらにそれをなんとかしてrecordに流し込む
	// そしてエラーチェックも忘れない
	
	var i=0;
	var j=0;
	var k=0;
	var num;
	this.record[0] = 0;
	console.log(bignumber.length)
	while(i < this.bitSize){
		if(k == 0)this.record[j] = 0;
		num = bignumber.charAt(i) === '1' ? 1 : 0;
		this.record[j] = this.record[j] + ((1 & num) << k)
		if(k < 31){
			k=(k+1)|0;
		}else{
			k=0;
			j = (j+1)|0;
		}
		i=(i+1)|0;
	}
}


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