//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
    'use strict';

    var DeferredTestExample = AsyncTestCase('DeferredTestExample', TestCasePrototype());

    DeferredTestExample.prototype.testResolve = function (queue) {

        console.log('testResolve');
        var state = 0;

        queue.Deferred(function(d) {

            assertEquals('Step 1: ', 1, ++state);
            console.log('Step 1: Start an async event here.');

            assertEquals('Step 2: ', 2, ++state);
            console.log('Step 2: Then use a timeout, interval, callback, or defer to watch for your event to end.');

            setTimeout(function(){

                assertEquals('Step 3: ', 3, ++state);
                console.log('Step 3: Call resolve to mark the event as done.');
                d.resolve();

            }, 1000);

        }).then(function(){

            assertEquals('Step 4', 4, ++state);
            console.log('Step 4: Chain it up and assert your tests!');

        });
    };

    DeferredTestExample.prototype.testChaining = function (queue) {

        queue.Deferred(function(d) {

            console.log('1: Do something');
            setTimeout(function(){
                console.log('2: Waited one second!');
                d.resolve();
            }, 1000);

        }).then(function () {

            return queue.Deferred(function(d) {
                console.log('3: Start another action!');
                setTimeout(function() {
                    console.log('4: Waited another second!');
                    d.resolve();
                }, 1000);
            });

        }).then(function () {

            console.log('5: All done!');
            assertTrue(true);

        });
    };


}());