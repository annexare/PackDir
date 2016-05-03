'use strict';

const fs = require('fs');
const isOSX = (process.platform === 'darwin'),
    TEST_PATH = 'tests',
    TEST_DIR_PATH = TEST_PATH + '/test-dir',
    TEST_OSX_PATH = TEST_PATH + '/test-osx',
    TEST_OSX_REG = /osx/;

jest.autoMockOff();

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

    it('has correct ZIP executable for Windows', () => {
        let stats = fs.statSync(Pack.getZipPath());

        expect(stats.isFile()).toBe(true);
    });

    it('checks for DMG correctly', () => {
        Pack.param('dmg', TEST_OSX_REG);
        expect(Pack.asDMG(TEST_DIR_PATH)).toBe(false);
        expect(Pack.asDMG(TEST_OSX_PATH)).toBe(isOSX);
    });

    it('executed sync/async', () => {
        let process = require('child_process');

        Pack.param('isSync', true);
        expect(Pack.exec()).toBe(process.execSync);

        Pack.param('isSync', false);
        expect(Pack.exec()).toBe(process.exec);
    });

    it('logs are silent when off', () => {
        Pack.param('isSilent', true);
        expect(Pack.log('Something silent.')).toBe(false);

        Pack.param('isSilent', false);
        expect(Pack.log('This log should appear.')).toBe(true);
    });

    it('packs one as expected', () => {
        let pack = Pack.path(TEST_DIR_PATH),
            stats = fs.statSync(pack);

        expect(stats.isFile()).toBe(true);
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

    // Cleanup
    fs.readdir(TEST_PATH, (err, files) => {
        if (files && files.length) {
            files.forEach(file => {
                if (file.endsWith(Pack.DMG) || file.endsWith(Pack.ZIP)) {
                    fs.unlinkSync(TEST_PATH + '/' + file);
                }
            });
        }
    });

});
