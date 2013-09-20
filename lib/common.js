// Collections
Stories = new Meteor.Collection('stories');
Players = new Meteor.Collection('players');

Decks = {
	fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 'coffee', '?']
};

log = function(message) {
	if(Meteor.isServer) 
		Meteor._debug(message);	
   	else if(Meteor.isClient && typeof console !== 'undefined')
      	console.log(message);
}

isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
