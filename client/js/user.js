/**
 * Created by balicekt on 13/03/14.
 */

traineeApp.user = function(user){
    this.email = user.email;
    this.role = user.role;
    this.team = user.team;
    this.name = user.name;
};

traineeApp.user.roleTypes = {
    dev: 'developer',
    sm: 'SCRUMmaster'
};
