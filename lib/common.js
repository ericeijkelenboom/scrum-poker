// Collections
Stories = new Meteor.Collection('stories');

if (Meteor.isServer) { 
    Meteor.publish("stories", function(userId) {
		var userId = userId;
		
		// Setup the disconnect event
		this._session.socket.on("close", Meteor.bindEnvironment(
			function() { 
				Stories.find({'users.userId': userId}).forEach(function(story) {
					Stories.update({_id: story._id}, { $pull: {users: userId} });
				});
			}, 
			function (err) { console.log("couldn't wrap the callback");})
		);
		
		return Stories.find({'users.userId': userId});
    });
}
