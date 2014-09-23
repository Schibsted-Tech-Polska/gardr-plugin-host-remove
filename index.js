'use strict';

// container with items that should be removed if they do not respond after certain time
var watchedForTimeout = [];

var remove = function(gardrPluginApi) {

    gardrPluginApi.on('item:beforerender', function(item) {

        if(typeof item.options.removeOnTimeout === 'number') { // watch this item
            watchedForTimeout.push({
                item: item,
                removeTimeout: setTimeout(function() {
                    item.iframe.remove();
                }, item.options.removeOnTimeout)
            });
        }

    });


    gardrPluginApi.on('item:afterrender', function(item) {

        if(item.options.removeOnTimeout) {
            watchedForTimeout = watchedForTimeout.filter(function(watched) { // stop watching item
                if(watched.item.id === item.id) {
                    clearTimeout(watched.removeTimeout);
                    return true;
                }
            });
        }

        if(item.options.removeOnFailure && item.hasFailed() && item.iframe.wrapper && item.iframe.wrapper.parentNode) { // remove upon failure
            item.iframe.remove();
        }

        if(typeof item.options.removeBySize === 'object' && // remove when rendered size is smaller than threshold
            (
                (typeof item.options.removeBySize.minWidth === 'number' && item.rendered.width < item.options.removeBySize.minWidth) ||
                (typeof item.options.removeBySize.minHeight === 'number' && item.rendered.height < item.options.removeBySize.minHeight)
            )
        ) {
            item.iframe.remove();
        }

    });
};

module.exports = remove;
