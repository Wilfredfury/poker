/**
 * Jadro aplikace
 */

// vsechny dalsi "tridy" prefixovat "traineeApp". snizi se tim sance,
// ze se prepise jiny JS. kvuli definici traineeApp musi byt vzby tento soubor
// prvni me JS na clientu
var traineeApp = traineeApp || {};

traineeApp.Core = function() {
  this.io = io.connect(); // socket spojeni uzivatele
  this.user = {}; // info o uzivateli
  this.view = new traineeApp.View();
  this.votes = {};
};

/**
 * inicializace aplikace
 */
traineeApp.Core.prototype.init = function() {
  var loginID = 'traineeAppmail';
  this.initListeners(loginID);
  this.sendLogin(loginID);
};

/**
 * odeslani loginu na server prihlasenim nebo z localStorage
 * 
 * @param loginID - prvek v localStorage kde je hledana hodnota prihlaseni
 */
traineeApp.Core.prototype.sendLogin = function(loginID) {
  var email = "";
  var _this = this;
  if (localStorage.getItem(loginID) === null) {
    this.formEl.show();
    this.formEl.submit(function(event) {
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
 * @param loginID - prvek v localStorage kam je ukladana hodnota prihlaseni
 */
traineeApp.Core.prototype.initListeners = function(loginID) {
  var _this = this;
  // hlidani odpovedi ze serveru a zmena html
  this.io.on('login-response', function(data) {
    if (data.success) {
      _this.user = new traineeApp.User(data.user);
      localStorage.setItem(loginID, _this.user.email);
      _this.view.login();
      _this.view.flashMsg("flashMsg", "successfuly logged in!", traineeApp.View.messageTypes.success, 5000);

      if (_this.user.role == traineeApp.User.roleTypes.sm) {
        _this.io.emit("usList-request", _this.user.team);
      }
    } else {
      _this.view.flashMsg("flashMsg", "user not found!", traineeApp.View.messageTypes.error, 5000);
    }
  });

  this.io.on('usList-response', function(data) {
    _this.view.usList(data);
    _this.initUSList();
  });

  this.io.on('valueCards-response', function(data) {
    _this.view.flashMsg("flashMsg", "Odhlasovano: " + data, traineeApp.View.messageTypes.info, 5000);
  });

  this.io.on('startVote-response', function(data) {
    _this.view.startVote(data);
    _this.cardsEl = $(traineeApp.Core.elementCl.cardsEl);
    _this.view.getCards();
    _this.getCardsValue();
    _this.io.emit('valueVote-request', {
    voted : '5',
    userVote : 'tomas.roch@socialbakers.com'
    });
    _this.view.clear();
  });

  this.io.on('valueVote-response', function(data) {
    _this.votes[data.votedName] = Number(data.voted);
    _this.view.valueVote(_this.votes);
  });
};

traineeApp.Core.prototype.initUSList = function() {
  var _this = this;
  $('#smUSList-btn').click(function(){
    _this.io.emit("usList-request",_this.user.team);
  });  
  
  $('.USbtn').click(function() {
    _this.votes = {};
    _this.view.clear();
    _this.io.emit('startVote-request', {
      team : _this.user.team,
      usid : $(this).val()
    });
  });
};

traineeApp.Core.prototype.getCardsValue = function() {
  this.cardsEl.click(function() {
    var valueCards = $(this).attr("data-value");
    return valueCards;
    // alert(valueCards);
  });
};