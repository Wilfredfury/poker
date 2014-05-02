/**
 * Modul pro komunikaci se serverem
 */
var model = function() {
  this.users = null;
};

model.roleTypes = { // role
  dev : 'Developer',
  sm : 'Scrum Master'
};

/**
 * Setter pro uzivatele
 * 
 * @param users - seznam vsech uzivatelu z TP
 */
model.prototype.setUsers = function(users) {
  this.users = users;
};

/**
 * inicializace modelu a vraceni odpovedi v callbacku
 * 
 * @param cbResponse - (), pouze pro informaci
 */
model.prototype.load = function(cbResponse) {
  _this = this;
  tp.getUsers(function(usersTP, teamUsersTP, cbResponse) {
    usersTP = JSON.parse(usersTP).Items;
    teamUsersTP = JSON.parse(teamUsersTP).Items;
    users = [];
    for (key = 0; key < usersTP.length; key++) {
      var teamTP = [];
      var roleTP = [];
      for (inKey = 0; inKey < teamUsersTP.length; inKey++) {
        if (usersTP && usersTP[key].Id == teamUsersTP[inKey].User.Id) {
          teamTP.push(teamUsersTP[inKey].Team.Name);
          roleTP.push(teamUsersTP[inKey].Role.Name);
          teamUsersTP.splice(inKey, 1);
        }
      }
      users[key] = {
        name : usersTP[key].FirstName + ' ' + usersTP[key].LastName,
        teams : teamTP,
        roles : roleTP,
        email : usersTP[key].Email
      };
    }
    _this.setUsers(users);
    console.log('model loaded ' + users.length + ' users');
    cbResponse();
  },cbResponse);
};

/**
 * vrati uzivatele podle emailu
 * 
 * @param email - email hledaneho uzivatele
 * @returns User - hledany uzivatel
 */
model.prototype.getUser = function (email) {
  for (var key in this.users) {
    if (this.users[key].email === email) {
      return this.users[key];
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
    if (userStoriesTP && userStoriesTP != []) {
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
      return cb(usTP[0].us);
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
    userStoriesTP = JSON.parse(userStoriesTP).Items[0];
    if (userStoriesTP){
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

exports.model = model;
