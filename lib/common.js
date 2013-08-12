// Collections
Stories = new Meteor.Collection('stories');

if (Meteor.isServer) { 
    Meteor.publish("stories", function(id) {
        return Stories.find({_id: id});
    });
}

if (Meteor.isClient) {
    Meteor.subscribe('stories', Session.get('currentStoryId'));
}
