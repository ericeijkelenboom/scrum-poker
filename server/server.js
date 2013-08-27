Meteor.methods({
    createStory: function(userId){
        var displayId = incrementCounter('storyDisplayId');
        
        var moderator = {userId: userId};
        
        return Stories.insert({
            displayId: displayId,
            name: '',
            users: [moderator],
            moderator: moderator,
            });
    }
});