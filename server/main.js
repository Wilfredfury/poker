responseDivClass = 'someClass'

exports.usersList = {}

exports.getDivResponse = function( userId ) {
	exports.usersList[userId] = 'developer';
	return '<div class="' + responseDivClass +'">user: <strong>' + userId + '</strong></div>';
}
