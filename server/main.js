responseDivClass = 'someClass'

// uklada info o "prihlasenych" uzivatelych (otevrene sockety).
exports.usersList = {}

// pripojeni do objektu "exports" zajisti, ze budou objekty videt
// z mista, kde se cely soubor requiruje
exports.getResponse = function( userId ) {
	console.log( localFunction(523) );
	exports.usersList[userId] = 'developer';
	// class se zde posila zbytecne a urcite se musi resit na frontendu stejne
	// jako vsechno zobrazeni. posila se pouze proto, aby se posilalo vice info
	// jako priklad
	output = {
		'userId': userId,
		'class': responseDivClass
	};
	return output;
}

localFunction = function( number ) {
	return number*100;
}
