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

exports.getAllTeamUS = function(teamName, cb) {
  var url;
  url = buildUrl(["UserStories"], ["Team.Name eq '" + teamName + "'", "EndDate eq 'null'", "Effort eq '8.0000'"], { //, "Effort eq '0.0000'"
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
exports.setUserStoryEffort = function(userStoryId, effort, cb) {
  var url = buildUrl([ "RoleEfforts" ], [ "Assignable.Id eq '" + userStoryId + "'" ], {
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

_setEffort = function(effort, roleEffortId, cb) {
/*  var options;
  options = {
    url: buildUrl(["RoleEfforts/" + roleEffortId], [], {}),
    json: {
      Effort : effort
    }
  };
  return request.post(options, function(err, res, data) {
    if (err) {
      return cb(err);
    }
    return cb(data);
  });
  return getRoleEffortId(userStoryId, roleId, function(err, roleEffortId) {
    var url;
    if (err) {
      return cb(err);
    }
    url = 
    return postRequest(url, {
      Effort: effort
    }, function(err, body) {
      if (err) {
        return cb(err);
      }
      if (body.Effort !== effort) {
        return cb(body);
      }
      return cb(null, true);
    });
  });*/
};
/*
getWholeTeamUS = function(iterationsIDs, cb) {
  var url;
  iterationsIDs = JSON.parse(iterationsIDs).Items;
  url = buildUrl(["UserStories"], ["TeamIteration.Id eq '" + teamName + "'", "IsCurrent eq 'true'"], {
    include: "[Name,Description,EntityType,TeamIteration,Team]"
  });
  request(url,function(err, res, data){
    return getWholeTeamUS(data, cb);    
  });
};
*/
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


exports.getUserStories = function(teamId, cb) {
  return getUserStoriesByTeamId(teamId, function(err, userStories) {
    if (err) {
      return cb(err);
    }
    return cb(null, userStories);
  });
};

exports.setEffort = function(userStoryId, effort, cb) {
  return setUserStoryEffort(userStoryId, effort, function(err, result) {
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });
};

/* PRIPADNE DODELANI STRANKOVANI 
makeRequest = function(originalUrl, howMany, page, cb) {
  var url;
  url = originalUrl;
  if (page > 0 && howMany > querylimit) {
    url = url + ("&take=" + querylimit + "&skip=" + (page * querylimit));
  } else if (page > 0) {
    url = url + ("&take=" + howMany + "&skip=" + (page * querylimit));
  } else if (howMany > querylimit || howMany === 0) {
    url = url + ("&take=" + querylimit);
  } else if (howMany > 0) {
    url = url + ("&take=" + howMany);
  }
  return exports.requestFunction(url, function(err, data) {
    var take, _ref;
    if ((err != null) || !(data != null ? (_ref = data.Items) != null ? _ref.length : void 0 : void 0) > 0) {
      return cb(err, data);
    } else if ((0 < howMany && howMany <= querylimit) || data.Items.length < querylimit) {
      return cb(err, data.Items);
    } else if (querylimit < howMany) {
      take = howMany - querylimit;
    } else {
      take = querylimit;
    }
    return makeRequest(originalUrl, take, page + 1, function(err, recursiveData) {
      return cb(err, data.Items.concat(recursiveData));
    });
  });
}; */

exports.requestFunction = function(url, cb) {
  return request({
    uri: url,
    json: true
  }, function(err, response, data) {
    if (((response != null ? response.error : void 0) != null) && (err == null) && (data == null)) {
      err = response.error;
    }
    return cb(err, data);
  });
};


Array.prototype.unique = function() {
  var key, output, value, _i, _ref, _results;
  output = {};
  for (key = _i = 0, _ref = this.length; 0 <= _ref ? _i < _ref : _i > _ref; key = 0 <= _ref ? ++_i : --_i) {
    output[this[key]] = this[key];
  }
  _results = [];
  for (key in output) {
    value = output[key];
    _results.push(value);
  }
  return _results;
};

getUserById = function(id, cb) {
  var url;
  url = buildUrl(["Users"], ["id eq '" + id + "'"], {
    include: "[Id, Email, FirstName, LastName, IsActive, AvatarUri, Role]"
  });
  return makeRequest(url, 1, 0, function(err, data) {
    if (err) {
      return cb(err);
    }
    if ((data != null ? data[0] : void 0) == null) {
      return cb(data);
    }
    return cb(null, data[0]);
  });
};
getUserStoriesByTeamId = function(teamId, cb) {
  return getNextTeamIterationId(teamId, function(err, nextTeamIterationId) {
    var url;
    if (err) {
      return cb(err);
    }
    url = buildUrl(["UserStories"], ["Team.id eq " + teamId, "TeamIteration.id eq " + nextTeamIterationId, "Effort eq 0"], {
      include: "[Name, Description, Project, Release, Iteration, TeamIteration, Team, Priority, EntityState]"
    });
    return makeRequest(url, 100, 0, function(err, userStories) {
      if (err) {
        return cb(err);
      }
      if (userStories == null) {
        return cb(userStories);
      }
      return cb(null, userStories);
    });
  });
};

getRoleEffortId = function(userStoryId, roleId, cb) {
  var url;
  url = buildUrl(["RoleEfforts"], ["Assignable.Id eq " + userStoryId, "Role.Id eq " + roleId], {});
  return makeRequest(url, 100, 0, function(err, userStories) {
    var _ref;
    if (err) {
      return cb(err);
    }
    if ((userStories != null ? (_ref = userStories[0]) != null ? _ref.Id : void 0 : void 0) == null) {
      return cb(userStories);
    }
    return cb(null, userStories[0].Id);
  });
};

setUserStoryEffort = function(userStoryId, effort, cb) {
  var roleId;
  roleId = role_dev;
  return getRoleEffortId(userStoryId, roleId, function(err, roleEffortId) {
    var url;
    if (err) {
      return cb(err);
    }
    url = buildUrl(["RoleEfforts/" + roleEffortId], [], {});
    return postRequest(url, {
      Effort: effort
    }, function(err, body) {
      if (err) {
        return cb(err);
      }
      if (body.Effort !== effort) {
        return cb(body);
      }
      return cb(null, true);
    });
  });
};
