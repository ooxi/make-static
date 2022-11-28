# make-static

make-static allows you to create static exports of your pseudo dynamic website
without much hassle.

````bash
$ ./make-static http://www.example.net/
````

Invoking make-static without specifing any arguments besides the URL of your
website will start an export of that website and all (reachable) resources
below that URL to an archive in the local directory.



## What do I have to keep in mind when using make-static

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



## Quickstart

```
mc _ make
```

