request = require('request');
// https://socialbakers.tpondemand.com/api/v1/Authentication
var token = "MTo5ODYzMkNFOEU3QjMyRDI5RDQzMjBDNjk0M0EyNEJCRg==";
// pocet najednou branych uzivatelu
var pageTaken = 150;
//pocet prvnich preskakovanych vysledku  
var pageSkipped = 0;
// role_dev = 1;
// role_smaster = 7;
/**
 * ziskej vsechny uzivatele bez informace o jejich tymu a posli getTeamUsers
 *
 * @param cb - (users, teamUsers) callback pro ulozeni uzivatelu
 */
exports.getUsers = function(cb) {
  url = buildUrl(["Users"], ["isActive eq 'true'"], {
    include: "[Id, Email, FirstName, LastName, IsActive, Role]"
  });
  return request(url, function(err, req, data){
    if (!err){
      return _getTeamUsers(data, cb);      
    }
    else {
      return err;
    }
  });
};

/**
 * vrat do callbacku seznam uzivatelu a teamu s uzivateli
 * 
 * @param users - json s informacemi o uzivateli
 * @param cb - (users, teamUsers) callback pro ulozeni uzivatelu
 */
_getTeamUsers = function(users, cb) {
  url = buildUrl(["TeamMembers"], null, {
    include: "[Team, User, Role]"
  });
  return request(url, function(err, req, data){
    if (!err){
      return cb(users, data);      
    }
    else {
      return err;
    }
  });
};

/**
 * ziskej vsechny neohodnocene nedokoncene user story daneho tymu
 * 
 * @param teamName - nazev tymu pro hledane user story
 * @param cb - callback, kam se vraci nezpracovany seznam user story
 */
exports.getAllTeamUS = function(teamName, cb) {
  var url;
  url = buildUrl(["UserStories"], ["Team.Name eq '" + teamName + "'", "EndDate eq 'null'", "Effort eq '0.0000'"], {
    include: "[Name,Description,EntityType,TeamIteration,Team]"
  });
  if (teamName){
    return request(url,function(err, res, data){
      if (!err && data){
        return cb(data);          
      } else {
        return null;
      }
    });    
  } else {
    return null;
  }
};

/**
 * ziska nezpracovanou user story podle ID a vrati do callbacku
 * @param titleID - ID hledane user story pro vyber hlasovani
 * @param cb - callback pro predani nezpracovane user story
 */
exports.getUS = function(titleID, cb) {
  var url;
  url = buildUrl(["UserStories"], ["ID eq '" + titleID + "'"], {
    include: "[Name,Description,EntityType,TeamIteration,Team]"
  });
  if (titleID){
    return request(url,function(err, res, data){
      if (!err && data){
        return cb(data);          
      } else {
        return null;
      }
    });    
  } else {
    return null;
  }
};
/**
 * ziskani user story role ID a poslani funkci setEffort pro nastaveni Effortu
 * @param userStoryId - ID hledane user story
 * @param effort - chtena zmena effortu na TP
 * @param cb - callback funkce ktere se preda vysledek
 */
exports.setUserStoryEffort = function(userStoryId, effort, cb) {
  var url = buildUrl([ "RoleEfforts" ], [ "Assignable.Id eq '" + userStoryId + "'", "Role.Name eq 'Developer'"], {
    include : "[Id]"
  });

  if (userStoryId && effort) {
    return request(url, function(err, res, data) {
      if (!err && data) {
        return _setEffort(effort, data, cb);
      } else {
        return null;
      }
    });
  } else {
    return null;
  }
};
/**
 * callback z setUserStoryEffort ktery zmeni effort na TP
 * @param effort - effort user story k nastaveni na TP
 * @param roleEffortId -   
 */
_setEffort = function(effort, roleEffortId, cb) {
  roleEffortId = JSON.parse(roleEffortId).Items[0].Id;
  var options;
  options = {
    url: buildUrl(["RoleEfforts/" + roleEffortId], [], {}),
    json: {
      Effort : effort
    }
  };
  if (roleEffortId && effort) {
    return request.post(options, function(err, res, data) {
      if (!err && data) {
        return cb(data);
      } else {
        return null;
      }
    });
  } else {
    return null;
  }
};

/**
 * sestaveni url pro dotaz na TargetProcess
 * 
 * @param what - ["entita"] http://md5.tpondemand.com/api/v1/index/meta
 * @param where - ["podminka rovnost 'hodnota'"] http://dev.targetprocess.com/rest/response_format API
 * @param param - include: "[Team, User]" ktere prvky chceme, nebo exclude nechceme
 */
buildUrl = function(what, where, param) {
  var first, key, one, url, val, _i, _j, _len, _len1;
  if (where == null) {
    where = [];
  }
  if (param == null) {
    param = {};
  }
  url = "http://socialbakers.tpondemand.com/api/v1";
  for (_i = 0, _len = what.length; _i < _len; _i++) {
    one = what[_i];
    url = url + "/" + one;
  }
  url = url + "/?";
  first = true;
  for (_j = 0, _len1 = where.length; _j < _len1; _j++) {
    one = where[_j];
    if (first) {
      url = url + "where=(" + one + ")";
      first = false;
    } else {
      url = url + "and(" + one + ")";
    }
  }
  for (key in param) {
    val = param[key];
    url = url + "&" + key + "=" + val;
  }
  return encodeURI(url) + ("&format=json&take="+pageTaken+"&skip="+pageSkipped+"&token=" + token);
};
