/**
 * Jadro aplikace
 */
var traineeApp = traineeApp || {};

traineeApp.Core = function() {
  this.io = io.connect(); // socket spojeni uzivatele
  this.user = {}; // info o uzivateli
  this.view = new traineeApp.View(); // view jadra
  this.votes = {}; // pro SM ulozeni hlasovani
};

/**
 * inicializace aplikace
 */
traineeApp.Core.prototype.init = function() {
  var loginID = 'traineeAppmail';
  this.initListeners(loginID);
  this.sendLogin(loginID);
};

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
  var email = "";
  var _this = this;
  this.view.formEl.submit(function(event) {
    event.preventDefault();
    email = _this.view.emailEl.val();
    _this.io.emit('login-request', {
      mail : email
    });
  });
  if (!localStorage.getItem(loginID)) {
    this.view.formEl.show();
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
      _this.initLogoutButton();
      _this.view.flashMsg("flashMsg", "Successfuly logged in!", traineeApp.View.messageTypes.success, 5000);
      if (_this.user.role == traineeApp.User.roleTypes.sm) {
        _this.io.emit('votes-request', _this.user.email);
      } else {
        _this.view.wait();
      }
    } else {
      _this.view.flashMsg("flashMsg", "User not found!", traineeApp.View.messageTypes.error, 5000);
    }
  });

  this.io.on('logout-response', function(data) {
    localStorage.clear();
    _this.view.logout();
  });

  this.io.on('usList-response', function(data) {
    _this.view.usList(data);
    _this.initUSListButtons();
  });

  this.io.on('votes-response', function(data) {
    if (data) {
      _this.votes = data;
      _this.io.emit('loginVote-request', _this.user.email);
    } else {
      _this.io.emit("usList-request", _this.user.team);
    }
  });
  this.io.on('startVote-response', function(data) {
    _this.view.startVote(data);
    _this.initVoteButtons();
  });

  // posilano jen sm
  this.io.on('valueVote-response', function(data) {
    _this.votes[data.votedName] = Number(data.voted);
    _this.view.valueVote(_this.votes);
  });

  this.io.on('endVote-response', function(data) {
    _this.view.flashMsg("flashMsg", "The vote has ended with result " + data + ".", traineeApp.View.messageTypes.success, 5000);
    _this.view.wait();
  });

  this.io.on('endVoteError-response', function(data) {
    _this.view.flashMsg("flashMsg", "The vote has ended without result because " + data, traineeApp.View.messageTypes.warning, 5000);
    _this.view.wait();
  });
};

/**
 * inciializace logout tlacitka
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
    _this.io.emit("usList-request", _this.user.team);
  });

  $('.USbtn').click(function() {
    _this.votes = {};
    _this.view.contentEl.empty();
    _this.io.emit('startVote-request', {
    team : _this.user.team,
    usid : $(this).val()
    });
  });
};

/**
 * inicializace tlacitek pro hlasovani
 */
traineeApp.Core.prototype.initVoteButtons = function() {
  var _this = this;
  $('#voteEndBtn').click(function() {
    _this.io.emit('endVote-request', _this.user.email);
  });
  $('.cards').click(function() {
    var value = $(this).attr("data-value");
    _this.view.flashMsg("flashMsg", "You have voted for " + value + ".", traineeApp.View.messageTypes.info, 5000);
    _this.io.emit('valueVote-request', {
    email : _this.user.email,
    value : value
    });
  });
};