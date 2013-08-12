Meteor.methods({
    createStory: function(){
        var displayId = incrementCounter('storyDisplayId');
        
        return Stories.insert({
            displayId: displayId,
            name: '',
            users: [],
            moderator: '',
            });
    }
}); 