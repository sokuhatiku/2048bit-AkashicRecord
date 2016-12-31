// JavaScript Document
var CTX_SCOPE;
var TEXT_ERA;

var DRAW_COLOR_SOURCE = ["rgb(200,200,200)", "rgb(100,100,100)", "rgb(200,100,100)", "rgb(150,150,200)"];
var DRAW_PIX_SIZE = 8;

var WORLD_WIDTH = 32;
var WORLD_HEIGHT = 32;
var WORLD_BITS = 2;

onload = function(){
	var canvasScope = document.getElementById('id_canvasScope');
	
	if(!canvasScope || !canvasScope.getContext) {
		alert("本ページの閲覧はHTML5対応ブラウザで行ってください");
		return false;
	}
	canvasScope.addEventListener('mousedown',MOUSE_EVENT , true);
	canvasScope.addEventListener('mousemove',MOUSE_EVENT , true);
	canvasScope.addEventListener('mouseup'  ,MOUSE_EVENT   , true);
	canvasScope.addEventListener('blur'     ,MOUSE_EVENT   , false);
	
	CTX_SCOPE = canvasScope.getContext('2d');
	
	TEXT_ERA = document.getElementById('id_textEra');
	
	document.getElementById('id_selectfill').addEventListener('change', SELECT_FILLER_EVENT, true);
	document.getElementById('id_buttonFillRnd').addEventListener('click', RANDOM_FILLER_EVENT, true);
	document.getElementById('id_buttonSetEra').addEventListener('click', BUTTON_SETERA_EVENT, true);
	
	ARECORD.Init(WORLD_WIDTH,WORLD_HEIGHT,WORLD_BITS);
	ARECORD.FillRandom();
	REFLEASH_SCOPE();
}


///////////////////////////////
// イベント処理
///////////////////////////////
var CLICKING, BRUSHDATA;
function MOUSE_EVENT(event){
	var rect,
	x, y,
	addr;
	
	if((event.buttons & 1) === 1){
		rect = event.target.getBoundingClientRect();
		x = Math.floor((event.clientX - rect.left) / DRAW_PIX_SIZE);
		y = Math.floor((event.clientY - rect.top ) / DRAW_PIX_SIZE);
		addr = ARECORD.GetAddrFromCoord(x, y);
		
		if(CLICKING === false){
			CLICKING = true;
			BRUSHDATA = ARECORD.GetData(addr) + 1;
			if(BRUSHDATA >> WORLD_BITS !== 0){
				BRUSHDATA = 0;
			}
		}
		
		ARECORD.SetData(addr, BRUSHDATA);
		DRAW_PIXEL(x, y, BRUSHDATA);
		TEXT_ERA.value = ARECORD.GetEra();
	}else{
		CLICKING = false;
	}
	
	event.returnValue = false;
	return false;
}

function BUTTON_SETERA_EVENT(event){
	ARECORD.SetEra(TEXT_ERA.value);
	REFLEASH_SCOPE();
}

function SELECT_FILLER_EVENT(event){
	var index = event.target.selectedIndex;
	if(index > 0) {
		ARECORD.Fill(index - 1);
		REFLEASH_SCOPE();
		event.target.selectedIndex = 0;
	}
}

function RANDOM_FILLER_EVENT(event){
	ARECORD.FillRandom();
	REFLEASH_SCOPE();
}

///////////////////////////////
// 描画処理
///////////////////////////////
function REFLEASH_SCOPE(){
	var data,
	addr = ARECORD.GetAddrFromIndex(0),
	arraySize = ARECORD.GetRecordArraySize();
	x = 0,
	y = 0;
	
	while(addr[0] < arraySize){
		data = ARECORD.GetData(addr);
		
		DRAW_PIXEL(x, y, data);
		
		ARECORD.NextAddr(addr);
		if(x >= 31){
			x = 0;
			y = (y+1)|0;
		}else{
			x = (x+1)|0;
		}
	}
	
	TEXT_ERA.value = ARECORD.GetEra();
}

function DRAW_PIXEL(x, y, data){
	CTX_SCOPE.fillStyle = DRAW_COLOR_SOURCE[data];
	CTX_SCOPE.fillRect(x * DRAW_PIX_SIZE, y * DRAW_PIX_SIZE,
						   DRAW_PIX_SIZE, DRAW_PIX_SIZE);
}