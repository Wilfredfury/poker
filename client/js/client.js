// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = {};

traineeApp.Core = function() {
  this.formEl = $('#login-form');
  this.emailEl = $('#login-email');
  this.submitEl = $('#login-submit');
  this.contentEl = $('#content');
  this.io = io.connect();
  this.user = {};
};

traineeApp.Core.prototype.init = function() {
    //hlidana promenna pro prihlaseni v localStorage
    var loginID = 'mail';
	this.initListeners(loginID);
	this.sendLogin(loginID);
};

traineeApp.Core.prototype.sendLogin = function(loginID) {
    // _this mi drzi scope traineeApp.Core    
	var _this = this;
    var email = "";
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
            viewInstance.flashMsg("flashMsg", "successfuly logged in!", view.messageTypes.success, 5000);
            _this.formEl[0].hidden = true;
            _this.contentEl.append("<p>logged in as "+_this.user.name+" in team "+_this.user.team+"</p><br><p> please wait for vote to start...</p>");
        } else{
            viewInstance.flashMsg("flashMsg", "user not found!", view.messageTypes.error, 5000);
        }
    });
};