// express.io umoznujici komunikaci pres sockety
express = require('express.io');
// ukazkovy soubor s js pro server
server = require('./server/main.js');

app = express();
app.http().io();
// pouziti adresare s obsahem pro clienta
app.use( express.static('client') );

// hlidani requestu z clienta
app.io.route( 'first_request', function(req){
	// pokud nema spojeni definovanou session, ulozit object do req.session
	req.session = req.session || {}
	// prvni komunikace pres spojeni => prirazeni uzivatele
	if ( req.session.user == null ) {
		req.session.user = req.data.mail;
	}
	// ukazka vystupu do console
	console.log( server.getResponse( req.session.user ) );
	// vypis aktualnich uzivatelu
	console.log( server.usersList );
	// vraceni odpovedi na clienta
	req.io.emit('first_response', server.getResponse( req.session.user ) );	
});

// spusteni aplikace na portu 4987
console.log('listen at localhost:4987');
app.listen(4987);
