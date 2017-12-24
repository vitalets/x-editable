## How to contribute
A few steps how to start contributing.  
Assuming you have [Node.js](http://nodejs.org/) already installed.

1.Fork *X-editable* on github and clone it to your local machine:
````
git clone https://github.com/<your-github-name>/x-editable.git
````
2.Install *grunt-cli* globally (if not yet):
````
npm i -g grunt-cli
````
3.Install dependencies:  
````
cd x-editable
npm i
````
4.Make your changes:  
````
vim editable-form.js
````
5.Write some tests for your changes:
````
vim /test/unit/*.js
````
6.Run tests in cli:  
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

7.Commit and push back on github:  
````
git add .
git commit -m'refactor editable form, fix #123'
git push origin
````
8.Make pull request on github (to `develop` branch).  
 
Thanks for your support!

### Local build
To build x-editable locally please run:
````
grunt build
````
Result will appear in `dist` directory.
