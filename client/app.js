Template.home.events({
    'click #create' : function(event) {
        log("Creating a new planning session");

        Meteor.call('createStory', function(error, id){
            Meteor.Router.to('/story/' + id);
        });
    },
    'click #join':  function(event) {
        log("Joining a new planning session");
    }
});
      
Template.story.helpers({
  story: function() {
    return Stories.findOne(Session.get('currentStoryId'));
  }
});

// Utility functions
log = function(message) {
  if (typeof console !== 'undefined')
      console.log(message);
}