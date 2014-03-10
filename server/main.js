responseDivClass = 'someClass'

// uklada info o "prihlasenych" uzivatelych (otevrene sockety).
exports.usersList = {}

// pripojeni do objektu "exports" zajisti, ze budou objekty videt
// z mista, kde se cely soubor requiruje
exports.getDivResponse = function( userId ) {
	console.log( localFunction(523) );
	exports.usersList[userId] = 'developer';
	return '<div class="' + responseDivClass +'">user: <strong>' + userId + '</strong></div>';
}

localFunction = function( number ) {
	return number*100;
}
