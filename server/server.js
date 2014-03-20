// uklada info o "prihlasenych" uzivatelych (otevrene sockety).
exports.usersList = {};
//uklada info o aktivnich US pro hlasovani.
exports.USList = {};
// pripojeni do objektu "exports" zajisti, ze budou objekty videt
// z mista, kde se cely soubor requiruje
exports.addUserList = function( userId ) {
	exports.usersList[userId] = modelInstance.getRole(userId);
};

exports.getUserList = function(){
    return exports.usersList;
};

exports.addUSList = function( team, usid ) {
    exports.USList[team] = usid;
};

exports.getUSList = function(){
    return exports.USList;
};
