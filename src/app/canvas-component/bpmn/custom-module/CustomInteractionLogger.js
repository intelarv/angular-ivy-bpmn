 // logging component
export default function CustomInteractionLogger(eventBus) {
   eventBus.on('element.hover', function(event) {
    // console.log('element.hover'); // using for test
   });
 }

CustomInteractionLogger.$inject = [ 'eventBus' ]; // minification save
