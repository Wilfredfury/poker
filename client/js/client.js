/**
 * Jadro aplikace
 */

// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = traineeApp || {};

traineeApp.Core = function(){
    this.formEl = $('#login-form'); // hlavni prvek formu pro prihlaseni
    this.emailEl = $('#login-email'); // textove pole pro mail
    this.submitEl = $('#login-submit'); // tlacitko pro odeslani mailu
    this.contentEl = $('#content'); // hlavni prvek pro obsah
    this.io = io.connect(); // socket spojeni uzivatele
    this.user = {}; // info o uzivateli
    this.view = new traineeApp.view();
    this.votes = {};
    this.cardsEl = null;
};

//traineeApp.Core.elementCl = {
//  cardsEl: '.cards',
//  formEl: '#login-form', // hlavni prvek formu pro prihlaseni
//  emailEl: '#login-email', // textove pole pro mail
//  submitEl: '#login-submit', // tlacitko pro odeslani mailu
//  contentEl: '#content'
//};

/**
 * inicializace aplikace
 */
traineeApp.Core.prototype.init = function(){
  var loginID = 'traineeAppmail';
	this.initListeners(loginID);
	this.sendLogin(loginID);

};

/**
 * odeslani loginu na server prihlasenim nebo z localStorage
 * 
 * @param loginID -
 *          prvek v localStorage kde je hledana hodnota prihlaseni
 */
traineeApp.Core.prototype.sendLogin = function(loginID) {
  var email = "";
  var _this = this;
  if (localStorage.getItem(loginID) === null) {
    this.formEl[0].hidden = false;
    _this.formEl.submit(function(event) {
      event.preventDefault();
      email = _this.emailEl.val();
      _this.io.emit('login-request', {
        mail : email
      });
    });
  } else {
    email = localStorage.getItem(loginID);
    this.io.emit('login-request', {
      mail : email
    });
  }
};

/**
 * inicializace posluchacu pro komunikaci se serverem
 * 
 * @param loginID -
 *          prvek v localStorage kam je ukladana hodnota prihlaseni
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
            _this.view.login();

            // zobrazeni karticek k hlasovani
            _this.view.Cards(_this.user.email, _this.io);

            if (_this.user.role == traineeApp.user.roleTypes.sm){
                _this.io.emit("smUSList-request", _this.user.team);
            }
        } else{
            _this.view.flashMsg("flashMsg", "user not found!", traineeApp.view.messageTypes.error, 2000);
        }
    });


  this.io.on('smUSList-response', function(data) {
    _this.view.USList(data, _this.io, _this.user.team);
    _this.initVoteButtons();
  });

  this.io.on('valueCards-response', function(data){
    _this.view.flashMsg("flashMsg", "Odhlasovano: "+data, traineeApp.view.messageTypes.info, 5000);
  });

  this.io.on('startVote-response', function(data) {
    _this.view.startVote(data);
    _this.cardsEl = $(traineeApp.Core.elementCl.cardsEl);
    _this.view.getCards();
    _this.getCardsValue();
    _this.io.emit('valueVote-request', {voted:'5', userVote:'tomas.roch@socialbakers.com'});
    _this.view.clear();
  });
  
  this.io.on('valueVote-response', function(data) {
    _this.votes[data.votedName] = Number(data.voted);
    _this.view.valueVote(_this.votes);
  });
};

traineeApp.Core.prototype.initVoteButtons = function(){
  var _this = this; 
  $('.USbtn').click(function(){
    _this.votes = {};
    _this.view.clear();
    _this.io.emit('startVote-request', {team: _this.user.team, usid: $(this).val()});
  });
};

traineeApp.Core.prototype.getCardsValue = function(){
  this.cardsEl.click(function(){
    var valueCards = $(this).attr("data-value");
    return valueCards;
 //   alert(valueCards);
   });
};