Meteor.methods({
    createStory: function(userId){
        var displayId = incrementCounter('storyDisplayId');
        
        return Stories.insert({
            displayId: displayId,
            name: '',
            users: [userId],
            moderator: userId,
            });
    }
});