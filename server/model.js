/**
 * Created by balicekt on 12/03/14.
 */

exports.users = function () {
  var users = [
    {
      name: "test test",
      team: "masterA",
      email: "test@test.cz",
      role: "developer"
    },
    {
      name: "Tomas Balicek",
      team: "masterA",
      email: "tomas.balicek@socialbakers.com",
      role: "developer"
    },
    {
      name: "Lukas Cerny",
      team: "masterA",
      email: "lukas.cerny@socialbakers.com",
      role: "developer"
    },
    {
      name: "Tomas Roch",
      team: "masterA",
      email: "tomas.rochk@socialbakers.com",
      role: "developer"
    }
  ];

  return users;
};


exports.userStories = function () {
  var userStories = [
    {
      name: 'user story 1',
      team: 'masterA'
    },
    {
      name: 'user story 2',
      team: 'masterA'
    },
    {
      name: 'user story 3',
      team: 'masterA'
    }
  ];

  return userStories;
}


exports.isRegistred = function (email) {
  var users = exports.users();
  for (var key in users) {
    if (users[key].email === email)
      return {success: true, data: users[key]};
  }
  return {success: false};
}

exports.getRole = function (email){
  var users = exports.users();
  for (var key in users) {
    if (users[key].email === email)
      return users[key].role;
  }
}

