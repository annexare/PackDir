'use strict';

jest.autoMockOff();

const fs = require('fs');
const path = require('path');
const isOSX = (process.platform === 'darwin'),
    isWindows = (process.platform === 'win32'),
    TEST_PATH = __dirname,
    TEST_DIR_PATH = path.join(TEST_PATH, 'test こんにちは世界', 'test dir'),
    TEST_EXTRACT_PATH = path.join(TEST_PATH, 'test-extract'),
    TEST_OSX_PATH = path.join(TEST_PATH, 'test-osx'),
    TEST_OSX_REG = /osx/;

describe('Pack Dir', () => {

    let Pack;

    beforeEach(() => {
        Pack = require('../index');
    });

    it('stores and reads a param', () => {
        let param = 'dmg',
            value = /osx/;

        Pack.param(param, value);
        expect(Pack.param(param)).toEqual(value);
    });

    it('refuses non existent param', () => {
        let param = 'dummy',
            value = 'value';

        expect(Pack.param(param, value)).toEqual(null);
        expect(Pack.param(param)).toEqual(null);
    });

    it('has correct ZIP/UNZIP executables for Windows', () => {
        let statZip = fs.statSync(Pack.getZipPath()),
            statUnZip = fs.statSync(Pack.getUnZipPath());

        expect(statZip.isFile()).toBe(true);
        expect(statUnZip.isFile()).toBe(true);
    });

    it('checks for DMG correctly', () => {
        Pack.param('dmg', TEST_OSX_REG);
        expect(Pack.asDMG(TEST_DIR_PATH)).toBe(false);
        expect(Pack.asDMG(TEST_OSX_PATH)).toBe(isOSX);
    });

    it('executed sync/async', () => {
        let cmd = 'node -v';

        Pack.param('isSync', true);
        expect(Pack.exec(cmd) instanceof Buffer).toBe(true);

        Pack.param('isSync', false);
        expect(Pack.exec(cmd) instanceof require('events')).toBe(true);
    });

    it('executed file sync/async', () => {
        let cmd = 'node',
            args = ['-v'];

        Pack.param('isSync', true);
        expect(Pack.execFile(cmd) instanceof Buffer).toBe(true);

        Pack.param('isSync', false);
        expect(Pack.execFile(cmd, args) instanceof require('events')).toBe(true);
    });

    it('logs are silent when off', () => {
        Pack.param('isSilent', true);
        expect(Pack.log('Something silent.')).toBe(false);

        Pack.param('isSilent', false);
        expect(Pack.log('This log should appear.')).toBe(true);
    });

    it('packs / extracts one as expected', () => {
        let pack = Pack.path(TEST_DIR_PATH),
            stats = fs.statSync(pack);

        expect(stats.isFile()).toBe(true);

        let dir = Pack.extract(pack, TEST_EXTRACT_PATH);

        stats = fs.statSync(dir);
        expect(stats.isDirectory()).toBe(true);
    });

    it('packs several as expected', () => {
        Pack.param('dmg', TEST_OSX_REG);

        let packs = Pack.paths([TEST_DIR_PATH, TEST_OSX_PATH]),
            isOkay = Array.isArray(packs);

        expect(isOkay).toEqual(true);

        if (isOkay) {
            packs.forEach(pack => {
                let stats = fs.statSync(pack);
                expect(stats.isFile()).toBe(true);
            });
        }
    });

    it('handles non-existent path', () => {
        expect(Pack.path(TEST_PATH + '/non-existent-path')).toEqual(false);
    });

    it('extracts only ZIP', () => {
        expect(Pack.extract()).toEqual(-1);
        expect(Pack.extract(TEST_PATH + '/non-existent-file.zip')).toEqual(-2);
        expect(Pack.extract(TEST_OSX_PATH + '/index.html')).toEqual(-3);
    });

    it('escapes args/paths', () => {
        if (isWindows) {
            expect(Pack.escapeArg(TEST_PATH)).toEqual(TEST_PATH.replace(' ' , '\ '));
        } else {
            expect(Pack.escapeArg(TEST_PATH)).toEqual(TEST_PATH.replace(' ', '\\ '));
        }
    });

    it('cleans up all test data', () => {
        let files = fs.readdirSync(TEST_PATH),
            removedFilesCount = 0;
        if (files && files.length) {
            files.forEach(file => {
                if (file.endsWith(Pack.DMG) || file.endsWith(Pack.ZIP)) {
                    try {
                        fs.unlinkSync(path.join(TEST_PATH, file));
                        removedFilesCount++;
                    } catch (e) {
                        console.error(e);
                    }
                }
            });
        }

        try {
            fs.unlinkSync(path.join(TEST_DIR_PATH + Pack.ZIP));
            removedFilesCount++;
        } catch (e) {
            console.error(e);
        }

        expect(removedFilesCount).toBeGreaterThan(0);
    });
});
