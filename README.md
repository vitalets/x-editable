# X-editable

In-place editing with Twitter Bootstrap, jQuery UI or pure jQuery.  

## Live demo
**http://vitalets.github.io/x-editable/demo.html**

## Installation

### Manual download
Use **http://vitalets.github.io/x-editable** main page.

### Bower
````
bower install x-editable
````

### CDN
````js
<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.4.6/bootstrap-editable/css/bootstrap-editable.css" rel="stylesheet"/>
<script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.4.6/bootstrap-editable/js/bootstrap-editable.min.js"></script>
````

## Documentation
**http://vitalets.github.io/x-editable**


## Reporting issues
Please provide [jsFiddles](http://jsfiddle.net)!  
Use these as template:   
1. [jsFiddle bootstrap 3](http://jsfiddle.net/xBB5x/2265)  
2. [jsFiddle bootstrap 2](http://jsfiddle.net/xBB5x/1817)  
3. [jsFiddle jqueryui](http://jsfiddle.net/xBB5x/196)  
4. [jsFiddle jquery](http://jsfiddle.net/xBB5x/197)    
Your feedback is very appreciated!

## Contribution
A few steps how to start contributing.  
Assuming you have [Node.js](http://nodejs.org/) already installed.

1.Fork *X-editable* on github and clone it to your local mashine:
````
git clone https://github.com/<your-github-name>/x-editable.git -b dev
````
2.Install *grunt-cli* globally (if not yet):
````
npm i -g grunt-cli
````
3.Install dependencies:  
````
npm i
````
4.Make your awesome changes.  
````
vim editable-form.js
````
5.Write some tests for your changes:
````
vim /test/unit/*.js
````
6.Run tests:  
````
grunt test
````
or directly in browser:
````
grunt server
````
and open http://127.0.0.1:8000/test  
By default test run on bootstrap 3 popup version, but you can test any other build:  

* bootstrap 3
  * popup: http://127.0.0.1:8000/test/?f=bootstrap3&c=popup  
  * inline: http://127.0.0.1:8000/test/?f=bootstrap3&c=inline  
* bootstrap 2
  * popup: http://127.0.0.1:8000/test/?f=bootstrap2&c=popup 
  * inline: http://127.0.0.1:8000/test/?f=bootstrap2&c=inline
* jquery-ui
  * popup: http://127.0.0.1:8000/test/?f=jqueryui&c=popup 
  * inline: http://127.0.0.1:8000/test/?f=jqueryui&c=inline
* jquery + poshytip
  * popup: http://127.0.0.1:8000/test/?f=plain&c=popup 
  * inline: http://127.0.0.1:8000/test/?f=plain&c=inline

7.Commit and push on github:  
````
git add .
git commit -m'refactor editable form, fix #123'
git push origin
````
8.Make pull request on github.  
 
Thanks for your support!

### Local build
To build x-editable locally please run:
````
grunt build
````
Result will appear in `dist` directory.

## License
Copyright (c) 2012 Vitaliy Potapov  
Licensed under the MIT license.