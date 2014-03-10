// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = {};

traineeApp.Core = (function() {
  function Core() {
        this.buttonEl = $('#call-backend');
        this.responseEl = $('#response-wrapper');
        this.io = io.connect();
        // vygenerovani nicku tzn kazdy instance=tab ma sve idcko
        this.nick = 'user' + Math.floor((Math.random()*1000)+1).toString(); 
      };
    
  Core.prototype.initListeners = function(){
    // _this mi drzi scope traineeApp.Core
    var _this = this;
    // po clicknuti na button posilam request na backend
    this.buttonEl.click( function(){
      _this.io.emit('first_request', {mail: _this.nick});
    });
    // hlidani odpovedi ze serveru a zmena html
    this.io.on('first_response', function(data) {
      _this.responseEl.append( data.div );
    });
  };
  return Core;
})();

var functionCallAbleFromEverywhere = function () {
  console.log( 'yep' );
}

