/**
 * Jadro serveru s nastavenim poslechovych cest
 */
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
    server.addUser(req);
  }
  req.io.emit('login-response', modelInstance.isRegistered(req.session.user)); // vraceni odpovedi na clienta
  console.log(server.getUserList()); // vypis online uzivatelu
});
// 2. poslani seznamu us sm
app.io.route("usList-request", function(req) {
  req.io.emit('usList-response', modelInstance.getUSList(req.data));
});
// (2). kontrola aktivniho hlasovani po prihlaseni
app.io.route('loginVote-request', function(req) {
  var userInfo = modelInstance.isRegistered(req.data).user;
  var usInfo = server.getUS(userInfo.team);
  if (usInfo) {
    req.io.emit('startVote-response', modelInstance.getUS(userInfo.team, usInfo));
  }
});
// 3. us zvolil us, poslani informaci o dane us vsem z tymu
app.io.route('startVote-request', function(req) {
  server.addUS(req.data.team, req.data.usid);
  var teamList = server.getUsers(req.data.team);
  for ( var key in teamList) {
    var usReq = server.getUserSocket(req.data.team, key);
    if (usReq) {
      usReq.io.emit('startVote-response', modelInstance.getUS(req.data.team, req.data.usid));
    }
  }
  console.log(server.getUSList()); // vypis aktivnich hlasovani
});
// 4. developeri posilaji sve hlasovani sm, sm ukonci hlasovani
app.io.route('valueVote-request', function(req) {
  userVote = modelInstance.getUser(req.data.email);
  // if userVote.role == SM -> poslat na TP else tohle
  // z USListu vime, o kterou us se hlasuje podle userTeamu
  if (userVote.role != model.model.roleTypes.sm) { // dev hlasuji
    var smSocket = server.getSmSocket(userVote.team);
    if (smSocket) {
      smSocket.io.emit('valueVote-response', {
        voted : req.data.value,
        votedName : userVote.name
      });
    }
  } else { // SM konec hlasovani
    var usID = server.getUS(userVote.team);
    var usValue = req.data.value;
    // TP.send(usID,usValue); zpracovani hodnoceni hlasovani
    server.removeUS(userVote.team);
    var teamList = server.getUsers(userVote.team);
    for ( var key in teamList) {
      var usReq = server.getUserSocket(userVote.team, key);
      if (usReq && (usReq != req)) {
        usReq.io.emit('endVote-response', usValue);
      }
    }
    req.io.emit('usList-response', modelInstance.getUSList(userVote.team));
  }
});
// spusteni aplikace na portu 4987
console.log('listen at localhost:4987');
app.listen(4987);
