// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = {};

traineeApp.Core = function() {
  this.buttonEl = $('#call-backend');
  this.responseEl = $('#response-wrapper');
  this.io = io.connect();
  // vygenerovani nicku tzn kazdy instance=tab ma sve idcko
  this.nick = 'user' + Math.floor((Math.random()*1000)+1).toString(); 
};

traineeApp.Core.prototype.initListeners = function(){
  // _this mi drzi scope traineeApp.Core
  var _this = this;
  // po clicknuti na button posilam request na backend
  this.buttonEl.click( function(){
    _this.io.emit('first_request', {mail: _this.nick});
  });
  // hlidani odpovedi ze serveru a zmena html
  this.io.on('first_response', function(data) {
    divEl = $('<div class="' + data['class'] + '">' + data['userId'] + '</div>')
    _this.responseEl.append( divEl );
  });
};

var functionCallAbleFromEverywhere = function () {
  console.log( 'yep' );
}

