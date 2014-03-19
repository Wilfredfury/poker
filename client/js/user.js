/**
 * Created by balicekt on 13/03/14.
 */
var user = {};

user = function(user){
  this.email = user.email;
  this.role = user.role;
  this.team = user.team;
  this.name = user.name;
};

user.roleTypes = {
    dev: 'developer',
    us: 'SCRUMmaster'
};
