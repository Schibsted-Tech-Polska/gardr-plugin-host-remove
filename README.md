# Gardr Iframe Remove Plugin

Gardr plugin to remove iframes from host based on certain conditions.

## Install

```
npm install gardr-plugin-host-remove --save
```

## Bundle
In your host bundle file:

```javascript
    var gardrHost = require('gardr-host');
    var remove = require('gardr-plugin-host-remove');

    gardrHost.plugin(remove);

    module.exports = gardrHost;
```

## Options

```removeOnTimeout``` - number, amount of miliseconds after which iframe will be removed if it doesn't respond to host.

```removeOnFailure``` - boolean, indicating wether iframe should be removed if it fails to render.

```removeBySize``` - object containing size threshold which if not met will result in iframe removal. Syntax:
```javascript
removeBySize: {
    minWidth: number,
    minHeight: number
}
```

```removeCheckDelay``` - number, amount of miliseconds after which check will be performed (default: 0). Requires [Send Size Plugin](https://github.com/Schibsted-Tech-Polska/gardr-plugin-ext-send-size)

## Example

```javascript
var gardr = gardrHost(...);
gardr.queue('ad', {
    removeOnTimeout: true,
    removeOnFailure: true,
    removeBySize: {
        minWidth: 1,
        minHeight: 1
    }
});
```
