Meteor.Router.add({
 '/': function () {
   console.log('loading home');
   return 'home';
 },
 '/story/:id': function (id) {
   log('Opening story ' + id);
   log('we are at ' + this.canonicalPath);
   log("our parameters: " + this.params);
    
   Session.set('currentStoryId', id);
   
   return 'story';
 },
});