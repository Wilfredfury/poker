/**
 * online informace serveru a funkce k nim
 */
exports.usersList = {}; // uklada info o "prihlasenych" uzivatelich (otevrene sockety).
exports.usList = {}; // uklada info o aktivnich US pro hlasovani.

/**
 * vlozeni noveho uzivatele do seznamu prihlasenych uzivatelu
 * 
 * @param req - objekt pro komunikaci klienta a serveru 
 */
exports.addUser = function(req) {
  var oUser = modelInstance.isRegistered(req.session.user).user;
  if (!exports.usersList[oUser.team]) {
    exports.usersList[oUser.team] = {};
  }
  exports.usersList[oUser.team][oUser.email] = {
    name : oUser.name,
    role : oUser.role,
    socket : req
  };
};

/**
 * odebrani uzivatele ze seznamu prihlasenych uzivatelu
 * 
 * @param user - objekt uzivatele, ktery ma byt odhlasen
 */
exports.removeUser = function(user) {
  if (exports.usersList[user.team]) {
    delete exports.usersList[user.team][user.email];
  }
};

/**
 * ziskani prihlasenych uzivatelu daneho tymu
 * 
 * @param team - team hledanych uzivatelu
 * @return object - list prihlasenych uzivatelu tymu
 */
exports.getUsers = function(team) {
  return exports.usersList[team];
};

/**
 * ziskani socketu uzivatele podle mailu a tymu uzivatele
 * 
 * @param userTeam - tym uzivatele hledaneho socketu
 * @param userMail - mail uzivatele hledaneho socketu
 * @return object - socket daneho uzivatele
 */
exports.getUserSocket = function(userTeam, userMail) {
  for ( var key in this.usersList[userTeam]) {
    if (key == userMail) {
      return this.usersList[userTeam][key].socket;
    }
  }
};

/**
 * ziskani socketu scrummastera tymu
 * 
 * @param userTeam - tym hledaneho scrummastera
 * @return object - socket scrummastera daneho tymu
 */
exports.getSmSocket = function(userTeam) {
  for ( var key in this.usersList[userTeam]) {
    if (this.usersList[userTeam][key].role == model.model.roleTypes.sm) {
      return this.usersList[userTeam][key].socket;
    }
  }
};

/**
 * vlozeni nove user story hlasovani do seznamu aktivnich hlasovani
 * 
 * @param team - tym vkladane user story
 * @param usid - ID vkladane user story
 */
exports.addUS = function(team, usid) {
  exports.usList[team] = usid;
};

/**
 * vrati us, o kterou se hlasuje, daneho tymu
 * 
 * @param team - tym, ktereho us chceme zjistit
 * @return string - aktivni us daneho tymu
 */
exports.getUS = function(team) {
  return exports.usList[team];
};

/**
 * smazani aktivni user story ze seznamu aktivnich hlasovani
 * 
 * @param team - tym mazane user story
 */
exports.removeUS = function(team) {
 delete exports.usList[team];
};

/**
 * ziskani online uzivatelu po tymech
 * 
 * @return object - list online uzivatelu
 */
exports.getUserList = function() {
  var users = {};
  for ( var key in exports.usersList) {
    users[key] = {};
    for ( var keyIn in exports.usersList[key]) {
      users[key][keyIn] = exports.usersList[key][keyIn].role;
    }
  }
  return users;
};

/**
 * ziskani aktivnich hlasovani user stories
 * 
 * @return object - list user stories hlasovani
 */
exports.getUSList = function() {
  return exports.usList;
};
