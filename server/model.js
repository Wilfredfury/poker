/**
 * Modul pro komunikaci se serverem
 */
var model = function () {
  this.users = null;
};

model.roleTypes = {
  dev: 'Developer',
  sm: 'Scrum Master'
};

model.prototype.setUsers = function (users) {
  this.users = users;
};

model.prototype.load = function (usersTP, teamUsersTP) {
  usersTP = JSON.parse(usersTP).Items;
  teamUsersTP = JSON.parse(teamUsersTP).Items;
  users = [];
  for (key = 0; key < usersTP.length; key++) {
    var teamTP = [];
    var rolesTP = [];
    for (inKey = 0; inKey < teamUsersTP.length; inKey++) {
      if (usersTP && usersTP[key].Id == teamUsersTP[inKey].User.Id) {
        teamTP.push(teamUsersTP[inKey].Team.Name);
        rolesTP.push(teamUsersTP[inKey].Role.Name);
        teamUsersTP.splice(inKey, 1);
      }
    }
    users[key] = {
      name: usersTP[key].FirstName + ' ' + usersTP[key].LastName,
      teams: teamTP,
      roles: rolesTP,
      email: usersTP[key].Email
    };
  }
  this.setUsers(users);
};

model.prototype.getUser = function (email) {
  for (var key in this.users) {
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
//model.prototype.getRole = function (email) {
//  for (var key in this.users) {
//    if (this.users[key].email === email) {
//      return this.users[key].role;
//    }
//  }
//};

/**
 * vrati vsechny user stories teamu
 *
 * @param userStoriesTP -
 *          userStories z Target processu daneho tymu
 * @returns object - upraveny seznam user stories daneho tymu
 */
model.prototype.getUSList = function (userStoriesTP) {
  console.log(userStoriesTP);
  userStoriesTP = JSON.parse(userStoriesTP).Items;
  if (userStoriesTP) {
    console.log(JSON.stringify(userStoriesTP));
    var usTP = [
      {
        team: userStoriesTP[0].Team.Name,
        us: []
      }
    ];
    for (var key = 0; key < userStoriesTP.length; key++) {
      var usName = null;
      if (userStoriesTP[key].EntityType) {
        usName = userStoriesTP[key].EntityType.Name;
      }
      usTP[0].us.push({
        title: userStoriesTP[key].Name,
        titleID: userStoriesTP[key].Id,
        description: userStoriesTP[key].Description,
        type: usName
      });
    }
    console.log('getAllUS');
    console.log(usTP);
    return usTP;
  } else {
    return null;
  }
};

/**
 * vrati jednu US z listu podle ID
 *
 * @param userStoriesTP -
 *          hledana user Story
 * @returns object - upravena user story
 */
model.prototype.getUS = function (userStoriesTP) {
  if (userStoriesTP) {
    userStoriesTP = JSON.parse(userStoriesTP).Items[0];
    var usName = null;
    if (userStoriesTP.EntityType) {
      usName = userStoriesTP.EntityType.Name;
    }
    var usTP = {
      title: userStoriesTP.Name,
      titleID: userStoriesTP.Id,
      description: userStoriesTP.Description,
      type: usName
    };
    return usTP;
  } else {
    return null;
  }
};
/**
 * vrati vsechny cleny daneho tymu
 *
 * @param team -
 *          hledany tym
 * @returns array - clenove daneho tymu
 */
model.prototype.getTeam = function (team) {
  var aTeam = [];
  for (var key in this.users) {
    if (this.users[key].team == team) {
      aTeam.push(this.users[key].email);
    }
  }
  return aTeam;
};

/**
 * Nasteveni teamu k uzivateli podle emailu pokud se nastavi uspesne vrati se true
 * @param email
 * @param team
 * @returns {boolean}
 */
model.prototype.setTeam = function (email, teamId) {
  var user = this.getUser(email);
  if (user) {
    var team = user.teams[teamId];
    if (team != "undefined") {
      user.team = team;
      return user;
    }
    else
      return false;
  } else
    return false;
}
exports.model = model;
