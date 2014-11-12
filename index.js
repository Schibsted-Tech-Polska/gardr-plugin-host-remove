'use strict';

var xde = require('cross-domain-events');

// container with items that should be removed if they do not respond after certain time
var watched = [];


var remove = function(gardrPluginApi) {

    var tryRemove = function(item) {
        var removed = false;

        if(item.options.removeOnFailure && item.hasFailed() && item.iframe.wrapper && item.iframe.wrapper.parentNode) { // remove upon failure
            item.iframe.remove();
            removed = true;
        }

        if(typeof item.options.removeBySize === 'object' && // remove when rendered size is smaller than threshold
            (
               (typeof item.options.removeBySize.minWidth === 'number' && item.rendered.width < item.options.removeBySize.minWidth) ||
                   (typeof item.options.removeBySize.minHeight === 'number' && item.rendered.height < item.options.removeBySize.minHeight)
            )
        ) {
              item.iframe.remove();
              removed = true;
        }

        if(removed && typeof item.options.removeCallback === 'function') {
            item.options.removeCallback(item);
        }
    };

    xde.on('plugin:send-size', function(response) {
        var id = response.data.id,
            size = response.data.size,
            singleWatched = watched.filter(function(singleWatched) {
                return singleWatched.item.id === id;
            });

        if(singleWatched && singleWatched[0]) {
            singleWatched[0].item.rendered = size;
            tryRemove(singleWatched[0].item);
        }
    });

    gardrPluginApi.on('item:beforerender', function(item) {
        var toPush = {
            item: item
        };

        if(typeof item.options.removeOnTimeout === 'number') { // watch this item
            toPush.removeTimeout = setTimeout(function() {
                item.iframe.remove();
            }, item.options.removeOnTimeout);
        }

        watched.push(toPush);
    });


    gardrPluginApi.on('item:afterrender', function(item) {
        var delay = item.options.removeCheckDelay || 0;

        if(item.options.removeOnTimeout) {
            watched.forEach(function(singleWatched) {
                if(singleWatched.item.id === item.id) {
                    clearTimeout(singleWatched.removeTimeout);
                }
            });
        }

        if(delay > 0) {
            setTimeout(function() {
                var iframeElement = item.iframe.element,
                    targetWindow;

                if(iframeElement) {
                    if(typeof iframeElement.contentWindow === 'object' &&
                       typeof iframeElement.contentWindow.postMessage === 'function') {
                        targetWindow = iframeElement.contentWindow;
                    }
                    else if(typeof iframeElement.contentDocument.contentWindow === 'object' &&
                            typeof iframeElement.contentDocument.contentWindow.postMessage === 'function') {
                        targetWindow = iframeElement.contentDocument.contentWindow;
                    }
                    if(targetWindow) {
                        xde.sendTo(targetWindow, 'plugin:send-size');
                    }
                }
            }, delay);
        }
        else {
            tryRemove(item);
        }

    });
};

module.exports = remove;
