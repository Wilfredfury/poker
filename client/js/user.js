/**
 * Informace o uzivateli
 */
var traineeApp = traineeApp || {};

traineeApp.User = function(user) {
  this.email = user.email;
  this.role = user.role;
  this.team = user.team;
  this.teamId = user.teamId;
  this.name = user.name;
};

traineeApp.User.roleTypes = {
  dev : 'Developer',
  sm : 'Scrum Master'
};
