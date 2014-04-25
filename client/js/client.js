/**
 * Jadro aplikace
 */
var traineeApp = traineeApp || {};

traineeApp.Core = function () {
  this.io = io.connect(); // socket spojeni uzivatele
  this.view = new traineeApp.View(); // view jadra
  this.votes = {}; // pro SM ulozeni hlasovani
  this.user = {}; // info o uzivateli
  this.timeToHideFlash = 3000;
};

/**
 * odhlaseni uzivatele
 */
traineeApp.Core.prototype.logout = function () {
  if (this.user.email) {
    this.view.loaderShow();
    this.io.emit('logout-request', this.user.email);
  }
};

/**
 * inicializace poslouchani prihlaseni a odeslani loginu na server prihlasenim nebo z localStorage
 */
traineeApp.Core.prototype.init = function () {
  var _this = this;
  var loginID = 'traineeAppmail';
  var email = "";

  // prihlaseni uzivatele a zkontrolovani stavu (aktivni hlasovani)  
  this.io.on('login-response', function (data) {
    _this.view.loaderHide();
    if (data) {
      _this.user = data;
      localStorage.setItem(loginID, _this.user.email);
      _this.initBoth();
      _this.view.login();
      _this.initLogoutButton();
      _this.view.flashMsg("flashMsg", "Successfuly logged in!", traineeApp.View.messageTypes.success, _this.timeToHideFlash);
      if (_this.user.role == traineeApp.User.roleTypes.sm) {
        _this.initSM();
        _this.view.loaderShow();
        _this.io.emit('votes-request', _this.user.email);
      } else {
        _this.view.wait();
        _this.io.emit('loginVote-request', _this.user.email);
      }
    } else {
      _this.view.flashMsg("flashMsg", "User not found!", traineeApp.View.messageTypes.error, _this.timeToHideFlash);
    }
  });

  this.io.on('choiceTeam-response', function (data) {
    _this.view.loaderHide();
    _this.view.choiceTeam(data.teams);
    _this.initChoiceTeam(data.email);
  });

  if (localStorage.getItem(loginID)) {
    email = localStorage.getItem(loginID);
    this.view.loaderShow();
    this.io.emit('login-request', {
        mail: email
      }
    );
  } else {
    this.view.showLoginForm();
    this.initFormButton();
  }
};

/**
 * incializace vybrani teamu
 */
traineeApp.Core.prototype.initChoiceTeam = function (email) {
  var _this = this;
  $('#choiceTeamBtn').click(function () {
    var selectedTeamId = $("#selectChoice").val();
    if (selectedTeamId == -1){
      _this.view.flashMsg("flashMsg", "You have to select a team!", traineeApp.View.messageTypes.error, _this.timeToHideFlash);      
    }
    else {
      _this.io.emit('choiceTeam-request', {
        email: email, 
        selectedTeamId: selectedTeamId
      });      
    }
  });
};

/**
 * inicializace spolecnych udalosti ze serveru
 */
traineeApp.Core.prototype.initBoth = function () {
  var _this = this;
  // odhlaseni uzivatele
  this.io.on('logout-response', function (data) {
    _this.view.loaderHide();
    _this.view.flashMsg("flashMsg", "Successfuly logged out!", traineeApp.View.messageTypes.success, _this.timeToHideFlash);
    localStorage.removeItem("traineeAppmail");
    _this.view.logout();
    _this.view.showLoginForm();
    _this.initFormButton();
  });
  // zacatek hlasovani
  this.io.on('startVote-response', function (data) {
    _this.view.loaderHide();
    if (data){
      _this.view.startVote(data);
      _this.initVoteButtons();      
    } else {
      _this.view.flashMsg("flashMsg", "Could not find US!", traineeApp.View.messageTypes.error, _this.timeToHideFlash);      
    }
  });
  // uspesny konec hlasovani
  this.io.on('endVote-response', function (data) {
    _this.view.loaderHide();
    var message = "The vote has ended with result " + data + "."; // oznameni o vysledku hlasovani
    var type = traineeApp.View.messageTypes.success; // typ zobrazeni zpravy
    if (!data) { // nemame vysledek SM ukoncil predcasne
      message = "The vote has ended without result because SM ended it.";
      type = traineeApp.View.messageTypes.warning;
    }
    _this.view.flashMsg("flashMsg", message, type, _this.timeToHideFlash);
    _this.view.wait();
  });
};

/**
 * inicializace poslouchani serveru pro scrummastera
 */
traineeApp.Core.prototype.initSM = function () {
  var _this = this;
  // zaslani dosavadnich hlasu aktivniho hlasovani SM
  this.io.on('votes-response', function (data) {
    if (data) {
      _this.votes = data;
      _this.view.loaderShow();
      _this.io.emit('loginVote-request', _this.user.email);
    } else {
      _this.view.loaderShow();
      _this.io.emit('usList-request', _this.user.email);
    }
  });
  // zaslani usListu SM
  this.io.on('usList-response', function (data) {
    _this.view.loaderHide();
//    _this.view.flashMsg("flashMsg", "User stories updated!", traineeApp.View.messageTypes.success, _this.timeToHideFlash);
    _this.view.usList(data);
    _this.initUSListButtons();
  });
  // jednotlive vysledky hlasovani
  this.io.on('valueVote-response', function (data) {
    _this.view.loaderHide();
    _this.votes[data.votedName] = parseInt(data.voted);
    _this.view.valueVote(_this.votes);
  });
  // aktualizace uzivatelu z TP do modelu serveru
  this.io.on('updateUsers-response', function (data) {
    _this.view.loaderHide();
    _this.view.flashMsg("flashMsg", "Users updated!", traineeApp.View.messageTypes.success, _this.timeToHideFlash);
  });
  // zobrazeni updatu US na TP
  this.io.on('endVoteTP-response', function (data) {
    var message = 'User story effort has been updated successfully on Target Process!';
    var type = traineeApp.View.messageTypes.success;
    if (!data){
      message = 'User story effort has NOT been updated on Target Process!';
      type = traineeApp.View.messageTypes.error;
    }
    _this.view.flashMsg("flashMsg", message, type, _this.timeToHideFlash);
  });
};

/**
 * incializace logout tlacitka
 */
traineeApp.Core.prototype.initLogoutButton = function () {
  var _this = this;
  $('#logoutBtn').click(function () {
    _this.view.loaderShow();
    _this.io.emit('logout-request', _this.user.email);
  });
};


/**
 * inicializace tlacitek pro vyber user story scrummasterem
 */
traineeApp.Core.prototype.initUSListButtons = function () {
  var _this = this;
  $('#USListBtn').click(function () {
    _this.view.loaderShow();
    _this.io.emit('usList-request', _this.user.email);
  });

  $('#UpdateUsers').click(function () {
    _this.view.loaderShow();
    _this.io.emit('updateUsers-request', null);
  });

  $('.USbtn').click(function () {
    _this.votes = {};
    _this.view.contentEl.empty();
    _this.view.loaderShow();
    _this.io.emit('startVote-request', {
        email: _this.user.email,
        usid: $(this).val()
      }
    );
  });
};

/**
 * inicializace tlacitek pro hlasovani
 */
traineeApp.Core.prototype.initVoteButtons = function () {
  var _this = this;
  $('#voteEndBtn').click(function () {
    _this.view.loaderShow();
    _this.io.emit('endVote-request', {
        email: _this.user.email,
        value: null
      }
    );
  });

  $('.cards').click(function () {
    var value = $(this).attr("data-value");
    var listener = 'endVote-request';
    if (_this.user.role != traineeApp.User.roleTypes.sm) {
      _this.view.flashMsg("flashMsg", "You have voted for " + value + ".", traineeApp.View.messageTypes.info, _this.timeToHideFlash);
      listener = 'valueVote-request';
    }
    _this.io.emit(listener, {
        email: _this.user.email,
        value: value
      }
    );
  });
};

/**
 * inicializace tlacitka pro prihlaseni
 */
traineeApp.Core.prototype.initFormButton = function () {
  var _this = this;
  this.view.formEl.submit(function (event) {
    event.preventDefault();
    email = _this.view.emailEl.val();
    _this.view.loaderShow();
    _this.io.emit('login-request', {
        mail: email
      }
    );
  });
};