'use strict';

const
    FS = require('fs'),
    Path = require('path'),
    isOSX = (process.platform === 'darwin'),
    isWindows = (process.platform === 'win32');

class PackDir {
    constructor() {
        this.params = {
            dmg: /darwin/,
            dmgFormat: 'UDZO',
            isSilent: false,
            isSync: true
        };

        this.DMG = '.dmg';
        this.ZIP = '.zip';
    }

    asDMG(path) {
        if (!isOSX || !this.params.dmg) {
            // Impossible to pack as DMG, or disabled
            return false;
        }
        if (this.params.dmg instanceof RegExp) {
            return this.params.dmg.test(path);
        }

        return !!this.params.dmg;
    }

    cleanFile(fileName) {
        if (fileName && FS.existsSync(fileName)) {
            FS.unlinkSync(fileName);
        }
    }

    dmg(path) {
        let fileName = path + this.DMG;

        this.cleanFile(fileName);
        this.exec()(`hdiutil create -format ${this.params.dmgFormat} -srcfolder "${path}" "${fileName}"`);
        this.log(`DMG file created: "${fileName}"`);

        return fileName;
    }

    exec() {
        return this.params.isSync
            ? require('child_process').execSync
            : require('child_process').exec;
    }

    extractTo(path) {
        this.log(`TODO: Extract to "${path}"`);
    }

    path(path) {
        try {
            if (this.asDMG(path)) {
                return this.dmg(path);
            } else {
                return this.zip(path);
            }
        }
        catch (e) {
            console.error(`Error while packaging "${path}":`, e.message);
        }

        return false;
    }

    paths(paths) {
        let packs = false;

        if (Array.isArray(paths)) {
            // Recursive packing for Array of paths
            packs = paths.map(path => {
                return this.path(path);
            });
        }

        return packs;
    }

    getZipPath() {
        return Path.normalize(__dirname + '/zip/zip.exe');
    }

    log(message) {
        if (this.params.isSilent) {
            return false;
        }

        console.log(message);
        return true;
    }

    param(name, value) {
        if (!this.params.hasOwnProperty(name)) {
            return null;
        }

        if (typeof value === 'undefined') {
            return this.params[name];
        }

        return this.params[name] = value;
    }

    zip(path) {
        let fileName = path + this.ZIP,
            pathInfo = Path.parse(path),
            cmd = (isWindows
                    ? `${this.getZipPath()}`
                    : 'zip')
                + ` -r "${pathInfo.base}.zip" "${pathInfo.base}"`,
            params = {};

        if (pathInfo.dir) {
            params.cwd = pathInfo.dir;
        }

        this.cleanFile(fileName);
        this.exec()(cmd, params);
        this.log(`ZIP archive created: "${fileName}"`);

        return fileName;
    }
}

module.exports = new PackDir();
