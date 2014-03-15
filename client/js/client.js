// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = {};

traineeApp.Core = function() {
  this.formEl = $('#login-form');
  this.emailEl = $('#login-email');
  this.contentEl = $('#content');
  this.storiesEl = $('button');
  this.buttView = $('.butt');  // pouze test
  this.io = io.connect();
  this.user = {};

  // vygenerovani nicku tzn kazdy instance=tab ma sve idcko
  //this.nick = 'user' + Math.floor((Math.random()*1000)+1).toString();
};

traineeApp.Core.prototype.init = function() {
	var loginID = 'mail';
	this.initListeners(loginID);
	this.sendLogin(loginID);
    this.sendUs();
};

traineeApp.Core.prototype.sendLogin = function(loginID) {
	var email = "";
	var _this = this;
    this.buttView.hide(); // pouze test
	if(localStorage.getItem(loginID) === null){
		this.formEl[0].hidden = false;
		this.formEl.submit( function(event){
			event.preventDefault();
			email = _this.emailEl.val();
			_this.io.emit('login-request', {mail: email});
		});
	}else{
		email = localStorage.getItem(loginID);
		this.io.emit('login-request', {mail: email});
	}
};

traineeApp.Core.prototype.initListeners = function(loginID){
	var _this = this;
    var viewInstance = new view();
  // hlidani odpovedi ze serveru a zmena html
  this.io.on('login-response', function(data) {
    if(data.success){
      _this.user = new user(data.data);
       localStorage.setItem(loginID,_this.user.email);
      alert(JSON.stringify(_this.user));
      _this.formEl[0].hidden = true;
      _this.buttView.show();  // pouze test
      _this.contentEl.append("<p>logged in as "+_this.user.name+" in team "+_this.user.team+"</p><br><p> please wait for vote to start...</p>");
      viewInstance.flashMsg("flashMsg", "Congrats, you did it!", "success", 2000)
    }
    else{
//      alert("user not found!");
    	viewInstance.flashMsg("flashMsg", "Ups, an error occurred", "error", 2000);
    }
  });
};

traineeApp.Core.prototype.sendUs = function(){
    var _this = this;
    var bt;
    this.storiesEl.click(function(){
        bt = $(this).val();
        alert(bt);
        _this.io.emit('userstories-id', {usid: bt});
    });
};

