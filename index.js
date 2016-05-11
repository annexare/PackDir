'use strict';

const
    FS = require('fs'),
    Path = require('path'),
    isOSX = (process.platform === 'darwin'),
    isWindows = (process.platform === 'win32');

let unset;

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

    dmg(path, callback) {
        let fileName = path + this.DMG,
            fileNameArg = this.escapeArg(fileName),
            pathArg = this.escapeArg(path),
            cmd = `hdiutil create -format ${this.params.dmgFormat} -srcfolder ${pathArg} ${fileNameArg}`;

        this.cleanFile(fileName);
        this.exec(cmd, unset, callback || unset);
        this.log(`DMG file created: "${fileName}"`);

        return fileName;
    }

    escapeArg(arg) {
        if (isWindows) {
            return '"'
                + arg
                    .trim()
                    .replace(/(["])/g, '\\$1')
                + '"';
        }

        return arg
            .trim()
            .replace(/(["\s'$`\\])/g, '\\$1');
    }

    exec(cmd, params, callback) {
        let execute = this.params.isSync
            ? require('child_process').execSync
            : require('child_process').exec;

        return execute(cmd, params, callback);
    }

    execFile(file, args, params, callback) {
        let execute = this.params.isSync
            ? require('child_process').execFileSync
            : require('child_process').execFile;

        return execute(file, args, params, callback);
    }

    extract(path, destination) {
        if (!path) {
            return -1;
        }

        try {
            let stats = FS.statSync(path);
            if (!stats.isFile()) {
                this.log(`Not a file: "${path}".`);
                return -2;
            }
        } catch (e) {
            return -2;
        }

        if (!path.endsWith(this.ZIP)) {
            this.log(`Only ZIP files can be extracted. Provided path: "${path}".`);
            return -3;
        }

        return this.unzip(path, destination);
    }

    path(path, callback) {
        try {
            if (!FS.existsSync(path)) {
                console.error(`Specified path does not exist: "${path}".`);
                return false;
            }

            if (this.asDMG(path)) {
                return this.dmg(path, callback);
            } else {
                return this.zip(path, callback);
            }
        }
        catch (e) {
            console.error(`Error while packaging "${path}": ${e.message}.`);
        }

        return false;
    }

    paths(paths, callback) {
        let packs = false;

        if (Array.isArray(paths)) {
            // Recursive packing for Array of paths
            packs = paths.map(path => {
                return this.path(path, callback);
            });
        }

        return packs;
    }

    getZipPath() {
        return Path.normalize(__dirname + '/zip/zip.exe');
    }

    getUnZipPath() {
        return Path.normalize(__dirname + '/zip/unzip.exe');
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

    unzip(path, destination, callback) {
        let pathInfo = Path.parse(path),
            extractWhat = this.escapeArg(path),
            extractTo = this.escapeArg(destination || pathInfo.dir),
            args = [
                '-o',
                extractWhat,
                '-d',
                extractTo
            ];

        if (isWindows) {
            // With Electron + ASAR, we can only use `execFile()`
            this.execFile(this.getUnZipPath(), args, unset, callback || unset);
        } else {
            let cmd = 'unzip ' + args.join(' ');
            this.exec(cmd, unset, callback || unset);
        }

        return extractTo;
    }

    zip(path, callback) {
        let fileName = path + this.ZIP,
            pathInfo = Path.parse(path),
            pathStat = FS.statSync(path),
            pathWithMask = this.escapeArg(
                pathStat.isDirectory()
                    ? pathInfo.base + Path.sep + '*'
                    : pathInfo.base
            ),
            pathToZipFile = this.escapeArg(pathInfo.base + '.zip'),
            params = {};

        if (pathInfo.dir) {
            params.cwd = pathInfo.dir;
        }

        this.cleanFile(fileName);

        let args = [
            '-r',
            pathToZipFile,
            pathWithMask
        ];

        if (isWindows) {
            // With Electron + ASAR, we can only use `execFile()`
            this.execFile(this.getZipPath(), args, params, callback || unset);
        } else {
            let cmd = 'zip ' + args.join(' ');
            this.exec(cmd, params, callback || unset);
        }

        this.log(`ZIP archive created: "${fileName}"`);

        return fileName;
    }
}

module.exports = new PackDir();
