exports.usersList = {}; // uklada info o "prihlasenych" uzivatelych (otevrene
// sockety).
exports.USList = {}; // uklada info o aktivnich US pro hlasovani.

/**
 * vlozeni noveho uzivatele do seznamu prihlasenych uzivatelu
 * @param userid - mail vkladaneho uzivatele
 */
exports.addUserList = function(req) {
  var oUser = modelInstance.isRegistered(req.session.user).data;
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
 * ziskani prihlasenych uzivatelu
 * @returns object - list uzivatelu
 */
exports.getOnline = function(team) {
  return exports.usersList[team];
};
/**
 * ziskani socketu podle mailu uzivatele
 */
exports.getUserSocket = function(userTeam, userMail) {
  for ( var key in this.usersList[userTeam]) {
    if (key == userMail) {
      return this.usersList[userTeam][key].socket;
    }
  }
};

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
 * @param team -
 *          tym vkladane user story
 * @param usid -
 *          ID vkladane user story
 */
exports.addUSList = function(team, usid) {
  exports.USList[team] = usid;
};

/**
 * ziskani aktivnich hlasovani user stories
 *
 * @returns object - list user stories hlasovani
 */
exports.getUSList = function() {
  return exports.USList;
};
