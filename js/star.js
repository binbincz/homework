
//原理，通过绘制点，构成边，通过边来组成星型图案
var Follow = function () {

 var $ = function (i) {return document.getElementById(i)},

addEvent = function (o, e, f) {o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on'+e, function(){f.call(o)})},

 OBJ = [], sp, rs, N = 0, m;

 var init = function (id, config) {

  this.config = config || {};
  this.obj = document.getElementById(id);
  // sp = 8;
  // rs = 2;
  sp = this.config.speed || 4;
  rs = this.config.animR || 1;
  m = {x: $(id).offsetWidth * .5, y: $(id).offsetHeight * .5};
  this.setXY();
  this.start();

 }

 init.prototype = {
  setXY : function () {
   var _this = this;
   addEvent(window, 'mousemove', function (e) {
    e = e || window.event;
    m.x = e.clientX;
    m.y = e.clientY;
   })
  },

  start : function () {

   var k = 180 / Math.PI, OO, o, _this = this, fn = this.config.fn;

    OO = new CObj(null, 0, 0);

    OBJ[N++] = OO ;
   //控制边条数
   for(var i=0;i<201;i+=20){
     var O = OO;
     //控制边长的长度
     for(var j=10; j<40; j+=1){
       var x = fn(i, j).x ,
       y = fn(i, j).y ;
       o = new CObj(O , x, y);
       OBJ[N++] =  o;
       O = o;
     }
   }
   //循环 16毫秒
   setInterval(function() {
    for (var i = 0; i < N; i++) OBJ[i].run();
   }, 16);
  }
 }

 var CObj = function (p, cx, cy) {

  var obj = document.createElement("span");
  this.css = obj.style;
  this.css.position = "absolute";
  this.css.left = "-1000px";
  this.css.zIndex = 1000 - N;
  document.getElementById("screen").appendChild(obj);
  this.ddx = 0;
  this.ddy = 0;
  this.PX = 0;
  this.PY = 0;
  this.x = 0;
  this.y = 0;
  this.x0 = 0;
  this.y0 = 0;
  this.cx = cx;
  this.cy = cy;
  this.parent = p;
 }

 CObj.prototype.run = function () {
  if (!this.parent) {
   this.x0 = m.x;
   this.y0 = m.y;
  } else {
   this.x0 = this.parent.x;
   this.y0 = this.parent.y;
  }

  this.ddx += ((this.x0 - this.PX - this.ddx) + this.cx) / rs
  this.ddy += ((this.y0 - this.PY - this.ddy) + this.cy) / rs

  // this.PX +=  this.ddx;
  // this.PY += this.ddy ;
  this.PX +=  this.ddx / sp;
  this.PY += this.ddy / sp;

  this.x = this.PX
  this.y = this.PY

  this.css.left = Math.round(this.x) + 'px';
  this.css.top = Math.round(this.y) + 'px';
 }

 return init;
}();