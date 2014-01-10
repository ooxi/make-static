make-static
===========

make-static allows you to create static exports of your pseudo dynamic website
without much hassle.

````bash
$ ./make-static http://www.example.net/
````

Invoking make-static without specifing any arguments besides the URL of your
website will start an export of that website and all (reachable) resources
below that URL to an archive in the local directory.



What do I have to keep in mind when using make-static
-----------------------------------------------------

 * make-static will click on every link it encounters. If you want to export a
   wiki with a public "delete page" action make-static might delete all your
   content. In reality this is not really a problem since search engine bots
   might do the same (using `robots.txt` could help though).

   It is best practice not to include any links in the website which might cause
   a state change since the won't work in the static version anyway.

 * If you want to export a website for offline usage you should keep in mind
   that currently only assets below the base URL will be exported. Since most
   real websites use a CDN for delivering assets this could cause problems with
   the static export.

   While make-static will support multiple base URLs in the future, it does not
   do so now.


TODO
----

 * Change `MakeStatic.progress` and `MakeStatic.finished' to event emitter style
 * Add nodejitsu appliance
 * Instead of manually checking whether a document URI is below the base URI the
   `Path` object should take care of the check at a central location
 * Add support for multiple base URIs
 * Add support for stripping references to external content (for offline export)
 * `ReferencedAssets` and `ReferencedDocuments` share a fair amount of code
 * Handle non HTML documents (like links to images)
 * Handle assets referenced inside assets (CSS)
 * Handle assets referenced in inline stylesheets
 * Make abstract filesystem implementation so export can be written to arbitrary
   backends without being written to the local filesystem at first (really
   necessary?)
 * Split library from command line tool (would remove quite a view dependencies
   on the one side but on the other side the API is neither stable nor in wide
   use)
 * Support compression to zip file (which is surprisingly complex since no
   library I have tried so far can compress recursive directories without
   corrupting some files here and there o_O)
 * Support document rate limiting (currently one document after another will be
   exported but this seams to be too fast for some servers...)
