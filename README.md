I <3 Norfolk
=============

## Prerequisites

- This project (cloned from Github)
- Webserver (e.g. Apache, Nginx) with a vhost pointed to the grow-template/src directory
- Ruby
- Sass (sudo gem install sass)
- Node.js (if installed via apt-get, run 'sudo ln -s /usr/bin/nodejs /usr/bin/node' installation
- NPM
- Grunt (sudo npm install -g grunt grunt-cli)
- Bower (sudo npm install -g bower)


## Running the app

1.) In terminal, cd into grow-template/tools and type 'npm install' to install all grunt dependencies.

2.) In the same directory (tools), type 'grunt watch' and leave terminal tab open with the grunt task running. It will watch your files for changes and perform sass, and handlebars compilation.

3.) Update the src/index-template.html and src/assets/scss/styles.scss file with an extra space or comment in order to trigger the grunt compilation step.

4.) Visit the URL pointed to the src directory. It should load the page with a 'Hello World', gray background, and a console log.
