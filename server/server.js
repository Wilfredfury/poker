// uklada info o "prihlasenych" uzivatelych (otevrene sockety).
exports.usersList = {};

// pripojeni do objektu "exports" zajisti, ze budou objekty videt
// z mista, kde se cely soubor requiruje
exports.addUserList = function( userId ) {
	exports.usersList[userId] = modelInstance.getRole(userId);
};

exports.getUserList = function(){
  return exports.usersList;
};
