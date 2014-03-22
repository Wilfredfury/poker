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

// req.data.mail = mail hlasujiciho, req.data.value = hodnota hlasovani
app.io.route('valueCards-request', function(req){
  req.io.emit('valueCards-response', req.data.value);
});

app.io.route('startVote-request', function(req) {
  server.addUSList(req.data.team, req.data.usid);
//  console.log(req.data.team);
  var teamList = server.getOnline(req.data.team);
  console.log(teamList);
  for ( var key in teamList) {
    var usReq = server.getUserSocket(req.data.team, key);
    console.log(usReq);
    if (usReq !== undefined) {
      usReq.io.emit('startVote-response', modelInstance.getUS(
          req.data.team, req.data.usid));
    }
  }
//  console.log(server.getUserList()); // vypis aktualnich uzivatelu
//  console.log(server.getUSList());
});

// spusteni aplikace na portu 4987
console.log('listen at localhost:4987');
app.listen(4987);
