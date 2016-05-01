'use strict';

const fs = require('fs');
const isOSX = (process.platform === 'darwin'),
    TEST_DIR_PATH = 'tests/test-dir',
    TEST_OSX_PATH = 'tests/test-osx',
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

});
