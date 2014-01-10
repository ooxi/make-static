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
var Document = require('./Document.js');





/**
 * 
 * @param {URI} _base Base URI below which documents and assets will be
 *     exported
 * @param {Asset} _asset Asset helper
 * @param {Path} _path OS path helper
 * @param {string} _directory Output directory
 */
module.exports = function(_base, _asset, _path, _directory) {
	var _self = this;
	
	/**
	 * @var {string -> boolean} Lookup map to see whether or not a document
	 *     was already exported
	 */
	var _cache = {};
	
	/**
	 * @var {array of object} Contains all documents to be exported
	 */
	var _queue = [];
	
	/**
	 * @var {Document} Will help exporting documents
	 */
	var _document = new Document(_base, _asset, _path, _directory);
	
	
	
	
	
	/**
	 * Can be overwritten to get information about the current export
	 * progress
	 * 
	 * @param {URI} uri URI of current document
	 * @param {int} remaining Number of documents not yet exported
	 */
	this.progress = function(uri, remaining) {
	};
	
	
	
	/**
	 * Will be invoked as soon as the queue is empty (after it was not empty
	 * at least once)
	 */
	this.finished = function() {
	};
	
	
	
	/**
	 * Will add another entry point for document retrival from which
	 * referenced assets and documents should be exported
	 * 
	 * @param {URI} uri Document's location
	 * @param {int} limit Max depth from entry point where document
	 *     references should be followed, zero means no referenced documents
	 *     should be exported
	 * @param {callback} callback Will be invoked as soon as this document
	 *     was exported. To know when all referenced documents are exported
	 *     you have to overwrite `finished'
	 */
	this.entry = function(uri, limit, callback) {
		_queue.push({
			uri:		uri.normalize(),
			limit:		limit,
			callback:	callback
		});
		next();
	};
	
	
	
	
	
	/**
	 * Will fetch the next document and check if any events should be
	 * emitted.
	 * 
	 * @warning Since the generation of documents is usually
	 *     computationally expensive, the documents will be downloaded one
	 *     after another to avoid overloading the server
	 *     
	 *     In the we might even add a user defined delay between two
	 *     receiving two documents
	 */
	var next = function() {
		
		/* Queue is empty, we are finished!
		 */
		if (0 === _queue.length) {
			_self.finished();
			return;
		}
		
		
		/* Get next document from queue and check whether it was already
		 * exported
		 */
		var entry = _queue.shift();
		var uri_s = entry.uri.toString();
		_self.progress(entry.uri, _queue.length);
		
		if (_cache.hasOwnProperty(uri_s)) {
			return invoke_next(function() {
				entry.callback(null, 'Document `'+ uri_s +'\' already exported');
			});
		}
		
		
		/* Cannot export document since the max depth is already reached
		 */
		if (entry.limit < 0) {
			return invoke_next(function() {
				entry.callback(new Error('Cannot export `'+ uri_s +'\' since max export depth was reached'));
			});
		}
		
		
		/* Export document and update document cache (must not be done
		 * before limit check)
		 */
		_cache[uri_s] = true;
		
		_document(entry.uri, function(err, references) {
			if (err) {
				entry.callback(err);
				return;
			}
			
			/* Append references to queue
			 */
			for (var i = 0; i < references.length; ++i) {
				_queue.push({
					uri:		references[i],
					limit:		entry.limit - 1,
					callback:	entry.callback
				});
			}
			
			/* Notify callback of success and invoke export of next
			 * document
			 */
			invoke_next(function() {
				entry.callback(null, 'Successfully exported `'+ uri_s +'\'');
			});
		});
	};
	
	
	
	/**
	 * Garantees to invoke `next' regardless of the outcome of `before'
	 * 
	 * @param {function} before Should be invoked before `next'
	 */
	var invoke_next = function(before) {
		try {
			before();
		} finally {
			next();
		}
	};
};
