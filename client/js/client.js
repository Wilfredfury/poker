// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = {};

traineeApp.Core = function() {
  this.formEl = $('#login-form');
  this.emailEl = $('#login-email');
  this.submitEl = $('#login-submit');
  this.contentEl = $('#content');
  this.storiesEl = $('button');
  this.buttView = $('.butt');  // pouze test
  this.io = io.connect();
  this.user = {};
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
	if(localStorage.getItem(loginID) === null){
		this.formEl[0].hidden = false;
		_this.formEl.submit( function(event){
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
            viewInstance.flashMsg("flashMsg", "successfuly logged in!", view.messageTypes.success, 2000);
            _this.formEl[0].hidden = true;
            if(_this.user.role == user.roleTypes.sm){
                _this.io.emit("smUSList-request",_this.user);                    
      viewInstance.flashMsg("flashMsg", "Congrats, you did it!", "success", 2000)
            }
        } else{
            viewInstance.flashMsg("flashMsg", "user not found!", view.messageTypes.error, 2000);
        }
    });
    this.io.on('smUSList-response', function(data){
        viewInstance.USList(data, _this);
        viewInstance.flashMsg("flashMsg", JSON.stringify(data), view.messageTypes.info, 2000);
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

