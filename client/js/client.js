// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = {};

traineeApp.Core = function() {
  this.formEl = $('#login-form');
  this.emailEl = $('#login-email');
  this.contentEl = $('#content');
  this.io = io.connect();
  this.user = {};
  // vygenerovani nicku tzn kazdy instance=tab ma sve idcko
  //this.nick = 'user' + Math.floor((Math.random()*1000)+1).toString();
};

traineeApp.Core.prototype.initListeners = function(){
  // _this mi drzi scope traineeApp.Core
  var _this = this;
  var email = "";
  // po clicknuti na button posilam request na backend
  this.formEl.submit( function(event){
    event.preventDefault();
    email = _this.emailEl.val();
    _this.io.emit('login-request', {mail: email});
  });
  // hlidani odpovedi ze serveru a zmena html
  this.io.on('login-response', function(data) {
    if(data.success){
      _this.user = new user(data.data);
      alert(JSON.stringify(_this.user));
      _this.formEl[0].hidden = true;
      _this.contentEl.append("<p>logged in as "+_this.user.name+"</p><br><p> please wait for vote to start...</p>");
    }
    else
      alert("user not found");
  });
};

var functionCallAbleFromEverywhere = function () {
  console.log( 'yep' );
}

