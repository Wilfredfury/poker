/**
 * modul pro komunikaci se serverem Created by balicekt on 12/03/14.
 */
var model = function() {
  this.users = null;
  this.userStories = null;
  this.load();
};

model.prototype.setUsers = function(users) {
  this.users = users;
};

model.prototype.setUserStories = function(us) {
  this.userStories = us;
};

model.prototype.load = function() {
  users = [ {
    name : "test test",
    team : "masterA",
    email : "test@test.cz",
    role : "SCRUMmaster"
  }, {
    name : "Tomas Balicek",
    team : "masterA",
    email : "tomas.balicek@socialbakers.com",
    role : "developer"
  }, {
    name : "Lukas Cerny",
    team : "masterA",
    email : "lukas.cerny@socialbakers.com",
    role : "developer"
  }, {
    name : "Tomas Roch",
    team : "masterA",
    email : "tomas.roch@socialbakers.com",
    role : "developer"
  }, {
    name : "Tomas Krasny",
    team : "masterB",
    email : "tomas.krasny@socialbakers.com",
    role : "developer"
  } ];

  userStories = [
      {
        team : 'masterA',
        us : [
            {
              title : 'user story 1',
              titleID : '#32378',
              description : 'nad sto znaku useknout nad sto znnad sto znnadnad sto znnad stosto znnad stoznnad stoznnad stoznnad stoznnad stoznnad stoznnad stoznnad stoznnad stoznnad sto toto uz je prilis',
              type : 'us'
            }, {
              title : 'debug 00001',
              titleID : '#00001',
              description : 'viewUS vraci spatne hodnoty',
              type : 'db'
            } ]
      }, {
        team : 'masterB',
        us : [ {
          title : 'user story 3',
          titleID : '#55221',
          description : 'sm a dev tvorit tym',
          type : 'us'
        }, {
          title : 'deeeee 00002',
          titleID : '#00002',
          description : 'ztrata dat pri predani funkci',
          type : 'db'
        } ]
      } ];

  this.setUsers(users);
  this.setUserStories(userStories);
};

model.prototype.isRegistered = function(email) {
  for ( var key in this.users) {
    if (this.users[key].email === email) {
      return {
        success : true,
        data : this.users[key]
      };
    }
  }
  return {
    success : false
  };
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
 * @param team -
 *          team pro vybrani user stories
 * @returns object - seznam user stories daneho tymu
 */
model.prototype.getUSList = function(team) {
  for ( var key in this.userStories) {
    if (this.userStories[key].team === team) {
      return this.userStories[key].us;
    }
  }
};

/**
 * vrati jednu US z listu podle ID
 * 
 * @param team -
 *          tym hledane user story
 * @param titleID -
 *          ID hledane user story
 * @returns object - user story ze seznamu podle ID
 */
model.prototype.getUS = function(team, titleID) {
  for ( var key in this.userStories) {
    if (this.userStories[key].team === team) {
      for ( var keyIn in this.userStories[key].us) {
        if (this.userStories[key].us[keyIn].titleID === titleID) {
          return this.userStories[key].us[keyIn];
        }
      }
      return;
    }
  }
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
exports.model = model;
