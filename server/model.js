/**
 * Created by balicekt on 12/03/14.
 */
var model = function(){
	this.users = null;
	this.us = null;
	this.load();
};

model.prototype.setUsers = function(users) {
	this.users = users;
};

model.prototype.setUserStories = function(us) {
	this.us = us;
};

model.prototype.load = function(){
    users =[
	    {
	        name: "test test",
	        team: "masterA",
	        email: "test@test.cz",
	        role: "SCRUMmaster"
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
	        email: "tomas.roch@socialbakers.com",
	        role: "developer"
	    },
	    {
	        name: "Tomas Krasny",
	        team: "masterB",
	        email: "tomas.krasny@socialbakers.com",
	        role: "developer"
	    }
	];

	userStories =[
	    {
	        team: 'masterA',
	        us:[
	            {
	                title:'user story 1',
	                titleID:'#32378',
	               	description:'blabla storka je skvela nad sto znaku na to prdet',
	               	type:'us'
	            },
	            {
	               	title:'debug 00001',
	               	titleID:'#00001',
	               	description:'nekdo rozbil zachod',
	               	type:'db'
	            }
	        ]
		},
		{
			team: 'masterB',
		    us:[
		        {
			    	title:'user story 3',
			    	titleID:'#55221',
			    	description:'blabla nad sto znaku na to prdet',
			    	type:'us'
		        },
		        {
			    	title:'deeeee 00002',
			    	titleID:'#00002',
			    	description:'nekdo ho opravil',
			    	type:'db'
		        }
		    ]
		}
	];

	this.setUsers(users);
	this.setUserStories(userStories);
};

model.prototype.isRegistered = function (email) {
  for (var key in this.users) {
    if (this.users[key].email === email){
      return {success: true, data: this.users[key]};
    }
  }
  return {success: false};
};

model.prototype.getRole = function (email){
  for (var key in this.users) {
    if (this.users[key].email === email)
      return this.users[key].role;
  }
};

// predelat, jina nebo k nicemu
model.prototype.getUS = function (userTeam){
  for(var key in us){
    if (us[key].team === userTeam.team) {

    }
  }
  return;
};

exports.model = model;