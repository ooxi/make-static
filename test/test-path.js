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
var Path = require('./../src/Path.js');
var URI = require('urijs');



var base = new URI('http://www.example.net/en/');
var path = new Path(base);

assert.strictEqual(path(new URI('http://www.example.net/en/')), 'index.html');
assert.strictEqual(path(new URI('http://www.example.net/en/file.html')), 'file.html');
assert.strictEqual(path(new URI('http://www.example.net/en/directory/file.html')), 'directory/file.html');
assert.strictEqual(path(new URI('http://www.example.net/en/strange%2Ffile.html')), 'strange%2Ffile.html');
assert.strictEqual(path(new URI('http://www.example.net/en/file-without-extension')), 'file-without-extension.html');
assert.strictEqual(path(new URI('http://www.example.net/en/file-with-htm-extension.htm')), 'file-with-htm-extension.htm');
assert.strictEqual(path(new URI('http://www.example.net/en/directory-index/')), 'directory-index/index.html');
assert.strictEqual(path(new URI('http://www.example.com/en/different-domain.html')), false);
assert.strictEqual(path(new URI('https://www.example.net/en/different-schema.html')), false);
assert.strictEqual(path(new URI('http://www.example.net/en/漢字.html')), '%E6%BC%A2%E5%AD%97.html');
assert.strictEqual(path(new URI('http://www.example.net/en/%e6%bc%A2%E5%AD%97.html')), '%E6%BC%A2%E5%AD%97.html');
assert.strictEqual(path(new URI('http://www.example.net/en/file?query')), 'file-76ce183c8ea2177de8c1ab93c568cb7b.html');
assert.strictEqual(path(new URI('http://www.example.net/en/file.html?query&a=b')), 'file-3ad7945a23d8388661be71497e637798.html');
assert.strictEqual(path(new URI('http://www.example.net/en/file.html?a=b&c=d')), 'file-434b3d110e40a223925c1f15880b1e96.html');
