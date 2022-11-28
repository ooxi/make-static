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
var URI = require('urijs');

var Asset = require('./../src/Asset.js');
var Document = require('./../src/Document.js');
var Path = require('./../src/Path.js');

var base = new URI('http://nodejs.org/');

var asset = new Asset('/tmp/test-document/assets');
var path = new Path(base);
var document = new Document(base, asset, path, '/tmp/test-document');



/* Don't wait forever for tests to finish
 */
var remaining = 1;

var timeout = setTimeout(function() {
	assert.fail('a', 'b', 'Documents did not finish downloading in time');
}, 5000);



/* @warning These tests are quite fragile since content may change. We should
 *     use an internal http server
 */
document(new URI('http://nodejs.org/api/path.html'), function(err, references) {
	if (err) throw err;
	
	assert.strictEqual(references.length, 37);
	
	if (0 === --remaining) {
		clearTimeout(timeout);
	}
});
