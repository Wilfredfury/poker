exports.usersList = {}; // uklada info o "prihlasenych" uzivatelych (otevrene sockety).
exports.USList = {}; //uklada info o aktivnich US pro hlasovani.

/**
 * vlozeni noveho uzivatele do seznamu prihlasenych uzivatelu
 * @param userid - mail vkladaneho uzivatele
 */
exports.addUserList = function(userId){
	exports.usersList[userId] = modelInstance.getRole(userId);
};

/**
 * ziskani prihlasenych uzivatelu
 * @returns object - list uzivatelu
 */
exports.getUserList = function(){
    return exports.usersList;
};

/**
 * vlozeni nove user story hlasovani do seznamu aktivnich hlasovani
 * @param team - tym vkladane user story
 * @param usid - ID vkladane user story
 */
exports.addUSList = function(team, usid){
    exports.USList[team] = usid;
};

/**
 * ziskani aktivnich hlasovani user stories 
 * @returns object - list user stories hlasovani
 */
exports.getUSList = function(){
    return exports.USList;
};
