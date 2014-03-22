// express.io umoznujici komunikaci pres sockety
express = require('express.io');
server = require('./server/server.js');
model = require('./server/model.js');

modelInstance = new model.model();

app = express();
app.http().io();
app.use(express.static('client')); // pouziti adresare s obsahem pro clienta
// 1. prihlaseni a predani info o uzivateli zpatky
app.io.route('login-request', function(req) { // hlidani requestu z clienta
  req.session = req.session || {}; // pokud nema spojeni definovanou session, ulozit object do req.session
  if (req.session.user == null) { // prvni komunikace pres spojeni => prirazeni uzivatele
    req.session.user = req.data.mail;
  }
  var registered = modelInstance.isRegistered(req.session.user);
  if (registered.success) {
    server.addUserList(req);
  }
  // console.log(server.getUserList()); // vypis aktualnich uzivatelu
  req.io.emit('login-response', modelInstance.isRegistered(req.session.user)); // vraceni odpovedi na clienta
});
// 2. poslani seznamu us sm
app.io.route("usList-request", function(req) {
  req.io.emit('usList-response', modelInstance.getUSList(req.data));
});
// 3. us zvolil us, poslani informaci o dane us vsem z tymu
app.io.route('startVote-request', function(req) {
  server.addUSList(req.data.team, req.data.usid);
  var teamList = server.getOnline(req.data.team);
  for ( var key in teamList) {
    var usReq = server.getUserSocket(req.data.team, key);
    if (usReq !== undefined) {
      usReq.io.emit('startVote-response', modelInstance.getUS(req.data.team, req.data.usid));
    }
  }
});
// 4. developeri posilaji sve hlasovani sm, sm pres to muze v budoucnu odeslat vysledek hlasovani
app.io.route('valueVote-request', function(req) {
  userVote = modelInstance.getUser(req.data.email);
  // if userVote.role == SM -> poslat na TP else tohle 
  // z USListu vime, o kterou us se hlasuje podle userTeamu
  var smSocket = server.getSmSocket(userVote.team);
  if (smSocket !== undefined) {
    smSocket.io.emit('valueVote-response', {
      voted : req.data.value,
      votedName : userVote.name
    });
// !dalsi emity jen pro visualizaci dat!
    setTimeout(function() {
      smSocket.io.emit('valueVote-response', {
        voted : '?',
        votedName : 'Bezhlavy Jack'
      });
    }, 2000);

    setTimeout(function() {
      smSocket.io.emit('valueVote-response', {
        voted : '13',
        votedName : 'Bezruky Balu'
      });
    }, 4000);
    setTimeout(function() {
      smSocket.io.emit('valueVote-response', {
        voted : '2',
        votedName : userVote.name
      });
    }, 6000);
  }
});
// spusteni aplikace na portu 4987
console.log('listen at localhost:4987');
app.listen(4987);
