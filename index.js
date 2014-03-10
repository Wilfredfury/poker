express = require('express.io');
path = require('path');

server = require('./server/main.js');

app = express();
app.http().io();

app.use( express.static('client') );

app.io.route( 'first_request', function(req){
	req.session = req.session || {}
	if ( req.session.user == null ) {
		req.session.user = req.data.mail;
	}
	console.log( server.getDivResponse( req.session.user ) );
	console.log( server.usersList );
	req.io.emit('first_response', {div: server.getDivResponse( req.session.user )});	
});

console.log('listen at localhost:4987');
app.listen(4987);
