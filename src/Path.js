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
var md5 = require('MD5');
var path = require('path');
var URI = require('URIjs');





/**
 * Converts document URIs to relative paths. It is assumed that all documents
 * contain HTML.
 * 
 * @param {URI} _base Base URI, paths to other URIs should be relative to this
 */
module.exports = function(_base) {

	/**
	 * URI -> path cache for faster lookup
	 */
	var _cache = {};
	
	
	
	
	
	/**
	 * @param {string} url_path URI path
	 * @return {string} Save filesystem path which looks somehow similar to
	 *     the URI path
	 */
	var get_save_path = function(url_path) {
		var parts = url_path.split('/');
		var os_path = '';
		
		for (var i = 0; i < parts.length; ++i) {
			if (i > 0) {
				os_path += path.sep;
			}
			os_path += get_safe_name(parts[i]);
			
		}

		return os_path;
	};
	
	/**
	 * @param {string} filename Filename to make filesystem safe
	 * @return {string} Name of file safe to write in filesystem
	 */
	var get_safe_name = function(filename) {
		
		/* An empty part means a directory listing
		 */
		if ('' === filename) {
			return 'index.html';
		}
		
		/* Most files should be safe without any modification since we
		 * use URL encoded filenames. This is great since most unix
		 * file systems and even NTFS support % as filename character
		 * and browsers will render decoded URLs
		 */
		return filename.replace(/[^a-z0-9.%_-]/gi, '_');
	};
	
	/**
	 * @param {string} os_path Base relative save path determined by
	 *     `get_save_path'
	 * @param {object or null} query URI query
	 * 
	 * @warning This is no canonical query hash function so which means
	 *     `index.php?a=b&c=d' will probably have a different hash than
	 *     `index.php?c=d&a=b' but I don't care and websites are broken if
	 *     they offer the same content without using canonical URLs
	 * 
	 * @return Modifieds path so query hash is included so `list.php?s=asc'
	 *     will be saved in a different file than `list.php?s=desc'
	 */
	var append_query = function(os_path, query) {
		
		/* No query
		 */
		if (0 === Object.keys(query).length) {
			return os_path;
		}
		var query_hash = md5(JSON.stringify(query));
		
		/* Get file extension, if there is no file extension we simply
		 * append the hash
		 */
		var extension = path.extname(os_path);
		
		if ('' === extension) {
			return os_path +'-'+ query_hash;
		}
		return os_path.substr(0, os_path.length - extension.length) +'-'+ query_hash + extension;
	};
	
	
	
	
	
	/**
	 * @param {URI} uri Document's location
	 * @return {string or false} Relative path to document if below base
	 *     otherwise false
	 */
	return function(uri) {
		
		if (!(uri instanceof URI)) {
			throw new Error('Argument must be an instance of URI but is `'+ uri +'\'');
		}
		uri = uri.normalize();
		var uri_s = uri.toString();
		
		/* If uri is not below base it should not be made static
		 */
		if (0 !== uri_s.indexOf(_base.toString())) {
			return false;
		}
		
		/* Use cache if available
		 */
		if (_cache.hasOwnProperty(uri_s)) {
			return _cache[uri_s];
		}
		
		/* First get file name without looking at the query
		 */
		var relative = uri.relativeTo(_base);
		var path = get_save_path(relative.path());
		
		/* If URI contains a query, append query hash to file name
		 */
		path = append_query(path, relative.query(true));
		
		/* Append HTML file extension
		 */
		if (!/\.html?$/.test(path)) {
			path += '.html';
		}
		
		/* Cache returned result
		 */
		return _cache[uri_s] = path;
	};
};
