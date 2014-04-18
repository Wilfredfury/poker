tp = require('./tp.js');
/**
 * Modul pro komunikaci se serverem
 */
var model = function() {
  this.users = null;
};

model.roleTypes = {
  dev : 'Developer',
  sm : 'Scrum Master'
};

model.prototype.setUsers = function(users) {
  this.users = users;
};

model.prototype.load = function() {
  _this = this;
  tp.getUsers(function(usersTP, teamUsersTP) {
    usersTP = JSON.parse(usersTP).Items;
    teamUsersTP = JSON.parse(teamUsersTP).Items;
    users = [];
    for (key = 0; key < usersTP.length; key++) {
      var teamTP = [];
      for (inKey = 0; inKey < teamUsersTP.length; inKey++) {
        if (usersTP && usersTP[key].Id == teamUsersTP[inKey].User.Id) {
          teamTP = teamUsersTP[inKey].Team.Name;
          teamUsersTP.splice(inKey, 1);
          break;
        }
      }
      users[key] = {
        name : usersTP[key].FirstName + ' ' + usersTP[key].LastName,
        team : teamTP,
        email : usersTP[key].Email,
        role : usersTP[key].Role.Name
      };
    }
    _this.setUsers(users);
  });
};

model.prototype.getUser = function(email) {
  for ( var key in this.users) {
    if (this.users[key].email === email) {
      return this.users[key];
    }
  }
};

/**
 * vrati roli uzivatele podle mailu(bran jako ID)
 * 
 * @param email
 *          mail uzivatele
 * @returns string - role uzivatele
 */
model.prototype.getRole = function(email) {
  for ( var key in this.users) {
    if (this.users[key].email === email) {
      return this.users[key].role;
    }
  }
};

/**
 * vrati vsechny user stories teamu
 * 
 * @param userStoriesTP -
 *          userStories z Target processu daneho tymu
 * @returns object - upraveny seznam user stories daneho tymu
 */
model.prototype.getUSList = function(team, cb) {
  tp.getAllTeamUS(team, function(userStoriesTP){
  userStoriesTP = JSON.parse(userStoriesTP).Items;
  if (userStoriesTP) {
    var usTP = [ {
      team : userStoriesTP[0].Team.Name,
      us : []
    } ];
    for ( var key = 0; key < userStoriesTP.length; key++) {
      var usName = null;
      if (userStoriesTP[key].EntityType) {
        usName = userStoriesTP[key].EntityType.Name;
      }
      usTP[0].us.push({
        title : userStoriesTP[key].Name,
        titleID : userStoriesTP[key].Id,
        description : userStoriesTP[key].Description,
        type : usName
      });
    }
    return cb(usTP);
  } else {
    return null;
  }
  });
};

/**
 * vrati jednu US z listu podle ID
 * 
 * @param userStoriesTP -
 *          hledana user Story
 * @returns object - upravena user story
 */
model.prototype.getUS = function(usID, cb) {
  tp.getUS(usID, function(userStoriesTP) {
    if (userStoriesTP){
      userStoriesTP = JSON.parse(userStoriesTP).Items[0];
      var usName = null;
      if (userStoriesTP.EntityType){
        usName = userStoriesTP.EntityType.Name;
      }
      var usTP = {
        title : userStoriesTP.Name,
        titleID : userStoriesTP.Id,
        description : userStoriesTP.Description,
        type : usName
      };
      return cb(usTP);      
    } else {
      return cb(null);
    }
  });
};
/**
 * vrati vsechny cleny daneho tymu
 * 
 * @param team -
 *          hledany tym
 * @returns array - clenove daneho tymu
 */
model.prototype.getTeam = function(team) {
  var aTeam = [];
  for ( var key in this.users) {
    if (this.users[key].team == team) {
      aTeam.push(this.users[key].email);
    }
  }
  return aTeam;
};

/**
 * odesle vysledek hlasovani o US na TP
 * 
 * @param usID - ID user story, o ktere se hlasovalo
 * @param value - vysledek hlasovani
 */
model.prototype.sendVoteTP = function(usID, value, cb){
  tp.setUserStoryEffort(usID, value, function(response){
    return cb(response);
  });
};

model.prototype.init = function(){
};

exports.model = model;