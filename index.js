'use strict';

const Path = require('path'),
    isOSX = (process.platform === 'darwin'),
    isWindows = (process.platform === 'win32');

let options = {
    dmg: /darwin/,
    dmgFormat: 'UDZO',
    isSilent: false,
    isSync: true
};

let setParam = (param, value) => {
    if (!options.hasOwnProperty(param)) {
        return false;
    }

    return options[param] = value
};

let asDMG = (path) => {
    if (!isOSX || !options.dmg) {
        // Impossible to pack as DMG, or disabled
        return false;
    }
    if (options.dmg instanceof RegExp) {
        return options.dmg.test(path);
    }

    return !!options.dmg;
};

let exec = () => {
    return options.isSync
        ? require('child_process').execSync
        : require('child_process').exec;
};

let get7zPath = () => {
    return Path.normalize(__dirname + '/7z/7za.exe');
};

let log = (message) => {
    if (options.isSilent) {
        return;
    }

    console.log(message + "\n");
};

let packDMG = (path) => {
    exec()(`hdiutil create -format ${options.dmgFormat} -srcfolder ${path} ${path}.dmg`);
    log(`DMG file created: "${path}.dmg"`);
};

let packZIP = (path) => {
    let pathInfo = Path.parse(path),
        cmd = (isWindows
            ? `${get7zPath()} a`
            : 'zip -r')
            + ` ${pathInfo.base}.zip ${pathInfo.base}`,
        params = { };

    if (pathInfo.dir) {
        params.cwd = pathInfo.dir;
    }

    exec()(cmd, params);
    log(`ZIP archive created: "${path}.zip"`);
};

let pack = (path) => {
    if (Array.isArray(path)) {
        // Recursive packing for Array of paths
        path.forEach(path => pack(path));

        return true;
    }

    try {
        if (asDMG(path)) {
            packDMG(path);
        } else {
            packZIP(path);
        }
    }
    catch (e) {
        console.error(`Error while packaging "${path}":`, e.message);
    }
};

module.exports = {
    path: pack,
    param: setParam
};
