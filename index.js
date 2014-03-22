// express.io umoznujici komunikaci pres sockety
express = require('express.io');
server = require('./server/server.js');
model = require('./server/model.js');

modelInstance = new model.model();

app = express();
app.http().io();
// pouziti adresare s obsahem pro clienta
app.use(express.static('client'));

// hlidani requestu z clienta
app.io.route('login-request', function(req) {
  // pokud nema spojeni definovanou session, ulozit object do req.session
  req.session = req.session || {};
  // prvni komunikace pres spojeni => prirazeni uzivatele
  if (req.session.user == null) {
    req.session.user = req.data.mail;
  }
  var registered = modelInstance.isRegistered(req.session.user);
  if (registered.success) {
    server.addUserList(req);
  }
  //console.log(server.getUserList()); // vypis aktualnich uzivatelu

	// vraceni odpovedi na clienta
	req.io.emit('login-response', modelInstance.isRegistered(req.session.user));
});

app.io.route("smUSList-request",function(req){
    req.io.emit('smUSList-response', modelInstance.getUSList(req.data));
});


});

app.io.route('startVote-request', function(req) {
  server.addUSList(req.data.team, req.data.usid);
  var teamList = server.getOnline(req.data.team);
  for ( var key in teamList) {
    var usReq = server.getUserSocket(req.data.team, key);
    if (usReq !== undefined) {
      usReq.io.emit('startVote-response', modelInstance.getUS(
          req.data.team, req.data.usid));
    }
  }
});

app.io.route('valueVote-request', function(req) {
  var voteVal = '5';
  var userVote ='tomas.roch@socialbakers.com';
  userVote = modelInstance.getUser(userVote);
  var smSocket = server.getSmSocket(userVote.team);
  smSocket.io.emit('valueVote-response', {voted:voteVal, votedName:userVote.name});
  setTimeout(function(){
    smSocket.io.emit('valueVote-response', {voted: '8', votedName:'Tomas Balicek'});    
  },2000);
  setTimeout(function(){
    smSocket.io.emit('valueVote-response', {voted: '13', votedName:userVote.name});    
  },4000);
});
// spusteni aplikace na portu 4987
console.log('listen at localhost:4987');
app.listen(4987);
