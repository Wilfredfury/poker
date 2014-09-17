/**
 * Jadro serveru s nastavenim poslechovych cest
 */
// express.io umoznujici komunikaci pres sockety
express = require('express.io');
server = require('./server/server.js');
model = require('./server/model.js');
tp = require('./server/tp.js');

modelInstance = new model.model();
app = express();
app.http().io();
app.use(express.static('client')); // pouziti adresare s obsahem pro clienta
modelInstance.load(function(){
  console.log('listening at localhost:4987'); // schvalne tu neni listen, aby necekal na TP
});

//1 prihlaseni a predani info o uzivateli zpatky
app.io.route('login-request', function (req) { // hlidani requestu z clienta
  req.session = req.session || {}; // pokud nema spojeni definovanou session, ulozit object do req.session
  if (!req.session.user) { // prvni komunikace pres spojeni => prirazeni uzivatele
    req.session.user = req.data.mail;
  }
  var registered = modelInstance.getUser(req.session.user);
  if (registered) {
    var isOnServer = server.getUser(req.session.user);
    if (isOnServer) {
      server.addUser(req, isOnServer.teamId, registered);
      req.io.emit('login-response', isOnServer);
      return;
    }
    if (registered.teams.length == 1) {
      server.addUser(req, 0, registered);//kdyz je tam jeden team je to na pozici 0
      var user = server.getUser(req.data.mail);
      req.io.emit('login-response', user); // vraceni odpovedi na clienta
    } else {
      req.io.emit('choiceTeam-response', registered);//poslani dotazu na vyber teamu
    }
  } else {
    req.io.emit('login-response', null);
  }
});
//1 poslani vybraneho teamu
app.io.route('choiceTeam-request', function (req) {//cekani na prijeti, ktery team si vybral
  var user = modelInstance.getUser(req.data.email);
  server.addUser(req, req.data.selectedTeamId, user);
  req.io.emit('login-response', server.getUser(req.data.email)); // vraceni odpovedi na clienta
});
//1 poslani dosavadniho hlasovani SM
app.io.route('votes-request', function (req) {
  var userInfo = server.getUser(req.data);
  var data = null;
  if (userInfo) {
    var usInfo = server.getUS(userInfo.team);
    if (usInfo) {
      data = server.getVotes(userInfo.team);
    }
  }
  req.io.emit('votes-response', data);
});
//1 kontrola aktivniho hlasovani po prihlaseni
app.io.route('loginVote-request', function (req) {
  var userInfo = server.getUser(req.data);
  if (userInfo) {
    var usInfoID = server.getUS(userInfo.team);
    if (usInfoID) {
      modelInstance.getUS(usInfoID, function (usInfo) {
        if (usInfo) {
          req.io.emit('startVote-response', usInfo);
          if (userInfo.role == model.model.roleTypes.sm) {
            var votes = server.getVotes(userInfo.team);
            if (votes && votes != {}) { // pokud nemame co zobrazit, tak nebudeme
              for (var key in votes) { // zopakovani prvniho hlasovani v tabulce pro zobrazeni hlasovani
                req.io.emit('valueVote-response', {
                  voted: votes[key],
                  votedName: key
                });
                break;
              }
            }
          }
        }
      });
    }
  }
});

//2 odhlaseni uzivatele odebranim ze seznamu
app.io.route('logout-request', function (req) {
  var userInfo = server.getUser(req.data);
  if (userInfo) {
    server.removeUser(userInfo.team, userInfo.email);
    req.io.emit('logout-response');
  }
});
//2 pozadavek obnoveni uzivatelu od SM
app.io.route('updateUsers-request', function (req) {
  modelInstance.load(function(){
    req.io.emit('updateUsers-response');
  });
  console.log(server.getUserList());
  console.log(server.getUSList());
});
//2 poslani seznamu us sm
app.io.route('usList-request', function (req) {
  var userInfo = server.getUser(req.data);
  if (userInfo) {
    modelInstance.getUSList(userInfo.team, function (usList) {
      req.io.emit('usList-response', usList);
    });
  }
});

//3 SM zvolil us, poslani informaci o dane us vsem z tymu
app.io.route('startVote-request', function (req) {
  var userInfo = server.getUser(req.data.email);
  if (userInfo) {
    modelInstance.getUS(req.data.usid, function (usInfo) {
      if (usInfo) {
        server.addUS(userInfo.team, usInfo.titleID);
        var teamList = server.getUsers(userInfo.team);
        for (var key in teamList) {
          var usReq = server.getUserSocket(userInfo.team, key);
          if (usReq) {
            usReq.io.emit('startVote-response', usInfo);
          }
        }
      } else {
        req.io.emit('startVote-response', null);
      }
    });
  }
});
//3 developeri posilaji sve hlasovani sm
app.io.route('valueVote-request', function (req) {
  var userInfo = server.getUser(req.data.email);
  if (userInfo) {
    server.addVote(userInfo.team, userInfo.name, req.data.value);
    var smSocket = server.getSmSocket(userInfo.team);
    if (smSocket) {
      smSocket.io.emit('valueVote-response', {
          voted: req.data.value,
          votedName: userInfo.name
        }
      );
    }
  }
});

//4 SM konci hlasovani
app.io.route('endVote-request', function (req) {
  var userInfo = server.getUser(req.data.email);
  var response = null;
  if (userInfo) {
    if (req.data.value) { // spravne ukonceni, odesilame vysledek
      modelInstance.sendVoteTP(server.getUS(userInfo.team), req.data.value, function(response) {
        if (response && response.Id){
          req.io.emit('endVoteTP-response', true);
        }else {
          req.io.emit('endVoteTP-response', false);          
        }
      });
    }
    server.removeUS(userInfo.team);
    var teamList = server.getUsers(userInfo.team);
    for ( var key in teamList) {
      if (key != userInfo.email){
        var usReq = server.getUserSocket(userInfo.team, key);
        if (usReq) {
          usReq.io.emit('endVote-response', req.data.value);
        }        
      } else {
        modelInstance.getUSList(userInfo.team, function(usList) {
          req.io.emit('usList-response', usList);
        });              
      }
    }
  }
});

app.listen(process.env.PORT || 4987); // spusteni aplikace na portu 4987
