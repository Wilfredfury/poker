/**
 * online informace serveru a funkce k nim
 */
exports.usersList = {}; // uklada info o "prihlasenych" uzivatelich (otevrene sockety).
exports.usList = {}; // uklada info o aktivnich US pro hlasovani.

/**
 * vlozeni noveho uzivatele do seznamu prihlasenych uzivatelu
 * 
 * @param req - objekt pro komunikaci klienta a serveru 
 * @param selectedTeamId - id vybraneho tymu pro index v poli z modelu 
 * @param oUser - objekt uzivatele z modelu 
 */
exports.addUser = function(req, selectedTeamId, oUser) {
  var selectedTeam = oUser.teams[selectedTeamId]; // podle vybraneho ID vybere roli
  var selectedRole = oUser.roles[selectedTeamId];

  if (!exports.usersList[selectedTeam]) {
    exports.usersList[selectedTeam] = {};
  }
  exports.usersList[selectedTeam][oUser.email] = {
    name : oUser.name,
    role : selectedRole,
    socket : req,
    teamId : selectedTeamId
  };
  console.log("LI: " + oUser.name + " " + selectedRole + " " + selectedTeam);
};

/**
 * ziskani informaci uzivatele ze serveru
 * 
 * @param email - hledany uzivatel
 * @return user - informace o uzivateli
 */
exports.getUser = function(email) {
  for (var key in exports.usersList) {
    for (var inKey in exports.usersList[key]) {
      if (inKey == email) {
        var usLi = exports.usersList[key][inKey]; // zkratka
        var user = {
            name : usLi.name,    
            role : usLi.role,
            teamId : usLi.teamId,
            team : key,
            email : inKey
        };
        return user;
      }
    }
  }
  return null;
};

/**
 * odebrani uzivatele ze seznamu prihlasenych uzivatelu
 * 
 * @param team - team uzivatele, ktery ma byt odhlasen
 * @param email - email uzivatele, ktery ma byt odhlasen
 */
exports.removeUser = function(team, email) {
  if (exports.usersList[team] && exports.usersList[team][email]) {
    console.log("LO: " + exports.usersList[team][email].name + " " + exports.usersList[team][email].role + " " + team);
    delete exports.usersList[team][email];
    if (!Object.getOwnPropertyNames(exports.usersList[team]).length){
      delete (exports.usersList[team]);
    }
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
  exports.usList[team] = {
    titleID : usid,
    votes : {}
  };
  console.log("VI: " + team + " " + usid);
};

/**
 * vrati us, o kterou se hlasuje, daneho tymu
 * 
 * @param team - tym, ktereho us chceme zjistit
 * @return string - aktivni us daneho tymu
 */
exports.getUS = function(team) {
  if (exports.usList[team]){
    return exports.usList[team].titleID;
  }
  return null;
};

/**
 * smazani aktivni user story ze seznamu aktivnich hlasovani
 * 
 * @param team - tym mazane user story
 */
exports.removeUS = function(team) {
 if (exports.usList[team]){
   console.log("VO: " + team + " " + exports.usList[team].titleID);
   delete exports.usList[team];   
 }
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

/**
 * pridani hlasu do aktivniho hlasovani
 * 
 * @param team - team hlasovani
 * @param name - jmeno hlasujiciho
 * @param vote - hodnota hlasovani
 */
exports.addVote = function(team, name, vote) {
  var usID = exports.getUS(team);
  if (usID) {
    exports.usList[team].votes[name] = vote;
  }
};

/**
 * ziskani dosavadnich hlasu
 * 
 * @param team - team hledaneho hlasovani
 * @return object - {name : hodnota} seznam hlasu
 */
exports.getVotes = function(team) {
  var usID = exports.getUS(team);
  if (usID) {
    return exports.usList[team].votes;
  }
};
