// Collections
Stories = new Meteor.Collection('stories');
Players = new Meteor.Collection('players');

Decks = {
	fibonacci: [{value: 0}, {value: 1}, {value: 2}, {value: 3}, {value: 5}, {value: 8}, {value: 13}, {value: 21}, {value: 34}, {value: 55}, {value: 89}, {value: '?'}]
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
