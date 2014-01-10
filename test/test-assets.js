/**
 * Copyright (c) 2014 github/ooxi
 *     https://github.com/ooxi/make-static
 *     violetland@mail.ru
 * 
 * This software is provided 'as-is', without any express or implied warranty.
 * In no event will the authors be held liable for any damages arising from the
 * use of this software.
 * 
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 
 *  1. The origin of this software must not be misrepresented; you must not
 *     claim that you wrote the original software. If you use this software in a
 *     product, an acknowledgment in the product documentation would be
 *     appreciated but is not required.
 * 
 *  2. Altered source versions must be plainly marked as such, and must not be
 *     misrepresented as being the original software.
 * 
 *  3. This notice may not be removed or altered from any source distribution.
 */
var assert = require('assert');
var Asset = require('./../src/Asset.js');

var asset = new Asset('/tmp/test-assets');



/* Don't wait forever for tests to finish
 */
var remaining = 2;

var timeout = setTimeout(function() {
	assert.fail('a', 'b', 'Assets did not finish downloading in time');
}, 5000);



/* @warning These tests are quite fragile since content may change. We should
 *     use an internal http server
 */
asset('https://upload.wikimedia.org/wikipedia/commons/e/ec/Wikipedia-logo-v2-de.png', function(err, path) {
	if (err) {
		assert.fail(err, null, 'Did not expect an error');
	};
	assert.strictEqual(path, '0af92fe36033a7599a4e85fc2f9509ed.png');
	
	if (0 === --remaining) {
		clearTimeout(timeout);
	}
});

asset('https://de.wikipedia.org/wiki/Wikipedia:Hauptseite', function(err, path) {
	if (err) {
		assert.fail(err, null, 'Did not expect an error');
	};
	assert.strictEqual(path, '862838b31c106551b0b1bbb7b14985e9.html');
	
	if (0 === --remaining) {
		clearTimeout(timeout);
	}
});
