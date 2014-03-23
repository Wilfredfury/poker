exports.usersList = {}; // uklada info o "prihlasenych" uzivatelich (otevrene sockety).
exports.usList = {}; // uklada info o aktivnich US pro hlasovani.

/**
 * vlozeni noveho uzivatele do seznamu prihlasenych uzivatelu
 * 
 * @param userid - mail vkladaneho uzivatele
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

exports.getUS = function(team) {
  return exports.usList[team];
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
