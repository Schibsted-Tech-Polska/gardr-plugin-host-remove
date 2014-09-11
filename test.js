/*global describe, beforeEach, it */

'use strict';

var assert = require('assert'),
    remove = require('./index.js'),
    PluginApi = require('gardr-core-plugin').PluginApi,
    sinon = require('sinon');

var mockItem = function() {
    return {
        id: Math.ceil(Math.random() * 9),
        options: {},
        rendered: {},
        iframe: {
            remove: sinon.spy(),
            wrapper: {
                parentNode: {}
            }
        },
        state: {
            hasFailed: function() {
                return false;
            }
        }
    };
};

describe('remove-host', function() {
    var pluginApi;

    beforeEach(function() {
        pluginApi = new PluginApi();
    });
    
    it('should be a function', function() {
        assert.equal(typeof remove, 'function');
    });

    it('should remove unresponsive item after options.removeOnTimeout time passed', function(done) {
        var item = mockItem(),
            timeout = 200;

        item.options.removeOnTimeout = timeout;
        remove(pluginApi);

        pluginApi.trigger('item:beforerender', item);

        setTimeout(function() {
            assert(!item.iframe.remove.called, 'item.iframe.remove was not called yet');
        }, timeout / 2);

        setTimeout(function() {
            assert(item.iframe.remove.calledOnce, 'item.iframe.remove was called');
            done();
        }, timeout + timeout / 2);

    });

    it('should not remove responsive item', function(done) {
        var item = mockItem(),
            timeout = 200;

        item.options.removeOnTimeout = timeout;
        remove(pluginApi);

        pluginApi.trigger('item:beforerender', item);

        setTimeout(function() {
            pluginApi.trigger('item:afterrender', item);
        }, timeout / 2);

        setTimeout(function() {
            assert(!item.iframe.remove.called, 'item.iframe.remove was not called');
            done();
        }, timeout + timeout / 2);

    });

    it('should remove unresponsive items selectively', function(done) {
        var item = mockItem(),
            item2 = mockItem(),
            timeout = 200;

        item.options.removeOnTimeout = timeout;
        item2.options.removeOnTimeout = null;
        remove(pluginApi);

        pluginApi.trigger('item:beforerender', item);
        pluginApi.trigger('item:beforerender', item2);

        setTimeout(function() {
            assert(!item.iframe.remove.called, 'item.iframe.remove was not called yet');
        }, timeout / 2);

        setTimeout(function() {
            assert(item.iframe.remove.calledOnce, 'item.iframe.remove was called');
            assert(!item2.iframe.remove.called, 'item2.iframe.remove was not called');
            done();
        }, timeout + timeout / 2);

    });

    it('should remove failed items when options.removeOnFailure is true', function() {
        var item = mockItem();
        item.state.hasFailed = function() {
            return true;
        };
        item.options.removeOnFailure = true;
        remove(pluginApi);

        pluginApi.trigger('item:afterrender', item);
        assert(item.iframe.remove.calledOnce, 'item.iframe.remove was called');
    });

    it('should not remove succeeded items when options.removeOnFailure is true', function() {
        var item = mockItem();
        item.options.removeOnFailure = true;
        remove(pluginApi);

        pluginApi.trigger('item:afterrender', item);
        assert(!item.iframe.remove.calledOnce, 'item.iframe.remove was called');
    });

    it('should remove item when options.removeBySize threshold is met', function() {
        var item = mockItem();
        item.options.removeBySize = {
            minWidth: 1,
        };
        remove(pluginApi);

        pluginApi.trigger('item:beforerender', item);
        item.rendered.width = 0;
        item.rendered.height = 0;
        pluginApi.trigger('item:afterrender', item);
        assert(item.iframe.remove.calledOnce, 'item.iframe.remove was called');
    });

    it('should not remove item when options.removeBySize threshold is not met', function() {
        var item = mockItem();
        item.options.removeBySize = {
            minHeight: 1,
        };
        remove(pluginApi);

        pluginApi.trigger('item:beforerender', item);
        item.rendered.width = 10;
        item.rendered.height = 10;
        pluginApi.trigger('item:afterrender', item);
        assert(!item.iframe.remove.calledOnce, 'item.iframe.remove was not called');
    });
    
});
