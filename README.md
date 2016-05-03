# PackDir

[![Travis CI](https://api.travis-ci.org/annexare/PackDir.svg "Travis CI")](https://travis-ci.org/annexare/PackDir)
[![AppVeyor CI](https://ci.appveyor.com/api/projects/status/dprobj2m351v6aaa?svg=true "AppVeyor CI")](https://ci.appveyor.com/project/z-ax/packdir)

Pack specified directory with native current OS command line tools.

Main purpose for this lib was to pack the Electron app.
<br>
So, by default, if specified `path` has a `darwin` in it's name,
the directory will be packed as DMG under OS X.

## Usage

Get the package via NPM: `npm install pack-dir`.

```js
const Pack = require('pack-dir');

// Set custom DMG RegEx, default is `/darwin/`.
Pack.param('dmg', /osx/);

// Pack the directory
let zipPath = Pack.path('some/test/dir');
// Extract to directory
let extractedPath = Pack.extract(zipPath, 'some/destination');
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
