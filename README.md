# PackDir

Pack specified directory with native current OS command line tools.

Main purpose was to pack the OS X/Windows Electron app,
so Linux was not tested yet.
<br>
By default, if specified `path` has a `darwin` in it's name,
the directory will be packed as DMG under OS X.

## Usage

Get the package via NPM: `npm install pack-dir`.

```js
const Pack = require('pack-dir');

let dir = 'some/test/dir';

// Set custom DMG RegEx, default is `/darwin/`.
Pack.param('dmg', /osx/);

// Pack the directory
let zip = Pack.path(dir);
// Extract to directory
Pack.extract(zip, dir);
```

### Parameters

* `dmg` `boolean|RegEx`, check to pack into DMG instead of ZIP.
* `dmgFormat` `string`, the `hdiutil -format` parameter value ([docs](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man1/hdiutil.1.html)).
* `isSilent` `boolean`, `false`, will write only Errors to console.
* `isSync` `boolean`, `true`, synchronous packaging.

## Credits

Created by [Annexare Studio](https://annexare.com/).
Feel free to use it as you need in your apps or send updates into [this](https://github.com/annexare/PackDir) public repository.
All code is under MIT license.

## Zip/UnZip for Windows

For Windows host
[Zip](http://gnuwin32.sourceforge.net/packages/zip.htm)/
[UnZip](http://gnuwin32.sourceforge.net/packages/unzip.htm)
standalone console apps are used
(~800kB, doesn't require installation, bundled with the package).
