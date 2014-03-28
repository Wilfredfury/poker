/**
 * Jadro aplikace
 */
var traineeApp = traineeApp || {};

traineeApp.Core = function() {
  this.io = io.connect(); // socket spojeni uzivatele
  this.view = new traineeApp.View(); // view jadra
  this.votes = {}; // pro SM ulozeni hlasovani
  this.user = {}; // info o uzivateli
  this.timeToHideFlash = 3000;
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
 * odhlaseni uzivatele
 */
traineeApp.Core.prototype.logout = function() {
  if (this.user.email) {
    this.io.emit('logout-request', this.user.email);
  }
};

/**
 * odeslani loginu na server prihlasenim nebo z localStorage
 * 
 * @param loginID - prvek v localStorage kde je hledana hodnota prihlaseni
 */
traineeApp.Core.prototype.sendLogin = function(loginID) {
  var _this = this;
  var email = "";
  this.view.formEl.submit(function(event) {
    event.preventDefault();
    email = _this.view.emailEl.val();
    _this.io.emit('login-request', {
        mail : email
      }
    );
  });
  if (!localStorage.getItem(loginID)) {
    this.view.formEl.show();
  } else {
    email = localStorage.getItem(loginID);
    this.io.emit('login-request', {
        mail : email
      }
    );
  }
};

/**
 * inicializace posluchacu pro komunikaci se serverem
 * 
 * @param loginID - prvek v localStorage kam je ukladana hodnota prihlaseni
 */
traineeApp.Core.prototype.initListeners = function(loginID) {
  var _this = this;
  // prihlaseni uzivatele a zkontrolovani stavu (aktivni hlasovani)
  this.io.on('login-response', function(data) {
    if (data.success) {
      _this.user = new traineeApp.User(data.user);
      localStorage.setItem(loginID, _this.user.email);
      _this.view.login();
      _this.initLogoutButton();
      _this.view.flashMsg("flashMsg", "Successfuly logged in!", traineeApp.View.messageTypes.success, _this.timeToHideFlash);
      if (_this.user.role == traineeApp.User.roleTypes.sm) {
        _this.io.emit('votes-request', _this.user.email);
      } else {
        _this.view.wait();
        _this.io.emit('loginVote-request', _this.user.email);
      }
    } else {
      _this.view.flashMsg("flashMsg", "User not found!", traineeApp.View.messageTypes.error, _this.timeToHideFlash);
    }
  });
  // odhlaseni uzivatele
  this.io.on('logout-response', function(data) {
    localStorage.clear();
    _this.view.logout();
  });
  // zaslani dosavadnich hlasu aktivniho hlasovani SM
  this.io.on('votes-response', function(data) {
    if (data) {
      _this.votes = data;
      _this.io.emit('loginVote-request', _this.user.email);
    } else {
      _this.io.emit('usList-request', _this.user.email);
    }
  });
  // zaslani usListu SM
  this.io.on('usList-response', function(data) {
    _this.view.usList(data);
    _this.initUSListButtons();
  });
  // zacatek hlasovani
  this.io.on('startVote-response', function(data) {
    _this.view.startVote(data);
    _this.initVoteButtons();
  });
  // jednotlive vysledky hlasovani
  this.io.on('valueVote-response', function(data) {
    _this.votes[data.votedName] = Number(data.voted);
    _this.view.valueVote(_this.votes);
  });
  // uspesny konec hlasovani
  this.io.on('endVote-response', function(data) {
    _this.view.flashMsg("flashMsg", "The vote has ended with result " + data + ".", traineeApp.View.messageTypes.success, _this.timeToHideFlash);
    _this.view.wait();
  });
  // zruseni hlasovani
  this.io.on('endVoteError-response', function(data) {
    _this.view.flashMsg("flashMsg", "The vote has ended without result because " + data, traineeApp.View.messageTypes.warning, _this.timeToHideFlash);
    _this.view.wait();
  });
};

/**
 * incializace logout tlacitka
 */
traineeApp.Core.prototype.initLogoutButton = function() {
  var _this = this;
  $('#logoutBtn').click(function() {
    _this.io.emit('logout-request', _this.user.email);
  });
};
/**
 * inicializace tlacitek pro scrummastera
 */
traineeApp.Core.prototype.initUSListButtons = function() {
  var _this = this;
  $('#USListBtn').click(function() {
    _this.io.emit('usList-request', _this.user.email);
  });

  $('.USbtn').click(function() {
    _this.votes = {};
    _this.view.contentEl.empty();
    _this.io.emit('startVote-request', {
        email : _this.user.email,
        usid : $(this).val()
      }
    );
  });
};

/**
 * inicializace tlacitek pro hlasovani
 */
traineeApp.Core.prototype.initVoteButtons = function() {
  var _this = this;
  $('#voteEndBtn').click(function() {
    _this.io.emit('endVote-request', {
        email : _this.user.email,
        value : undefined
      }
    );
  });

  $('.cards').click(function() {
    var value = $(this).attr("data-value");
    var listener = 'endVote-request';
    if (_this.user.role != traineeApp.User.roleTypes.sm) { 
      _this.view.flashMsg("flashMsg", "You have voted for " + value + ".", traineeApp.View.messageTypes.info, _this.timeToHideFlash);
      listener = 'valueVote-request';
    }
    _this.io.emit(listener, {
        email : _this.user.email,
        value : value
      }
    );
  });
};