/**
 * Jadro aplikace
 */

// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = {};

traineeApp.Core = function(){
    this.formEl = $('#login-form'); // hlavni prvek formu pro prihlaseni
    this.emailEl = $('#login-email'); // textove pole pro mail
    this.submitEl = $('#login-submit'); // tlacitko pro odeslani mailu
    this.contentEl = $('#content'); // hlavni prvek pro obsah
    this.io = io.connect(); // socket spojeni uzivatele
    this.user = {}; // info o uzivateli
    this.view = new traineeApp.view();
};

/**
 * inicializace aplikace
 */
traineeApp.Core.prototype.init = function(){
    var loginID = 'mail';
	this.initListeners(loginID);
	this.sendLogin(loginID);
};

/**
 * odeslani loginu na server prihlasenim nebo z localStorage
 * @param loginID - prvek v localStorage kde je hledana hodnota prihlaseni
 */
traineeApp.Core.prototype.sendLogin = function(loginID){
	var email = "";
	var _this = this;
	if (localStorage.getItem(loginID) === null){
		this.formEl[0].hidden = false;
		_this.formEl.submit( function(event){
    		event.preventDefault();
    		email = _this.emailEl.val();
    		_this.io.emit('login-request', {mail: email});
		});
	} else{
		email = localStorage.getItem(loginID);
		this.io.emit('login-request', {mail: email});
	}
};

/**
 * inicializace posluchacu pro komunikaci se serverem
 * @param loginID - prvek v localStorage kam je ukladana hodnota prihlaseni
 */
traineeApp.Core.prototype.initListeners = function(loginID){
    var _this = this;
    // hlidani odpovedi ze serveru a zmena html
    this.io.on('login-response', function(data){
        if (data.success){
            _this.user = new traineeApp.user(data.data);
            localStorage.setItem(loginID, _this.user.email);
            _this.formEl[0].hidden = true;
            _this.view.flashMsg("flashMsg", "successfuly logged in!", traineeApp.view.messageTypes.success, 2000);
            _this.view.login(_this);
            if (_this.user.role == traineeApp.user.roleTypes.sm){
                _this.io.emit("smUSList-request", _this.user);
            }
        } else{
            _this.view.flashMsg("flashMsg", "user not found!", traineeApp.view.messageTypes.error, 2000);
        }
    });

    this.io.on('smUSList-response', function(data){
        _this.view.USList(data, _this);
        _this.view.flashMsg("flashMsg", JSON.stringify(data), traineeApp.view.messageTypes.info, 2000);
    });
};
