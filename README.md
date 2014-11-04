I <3 Norfolk
=============

## Prerequisites

- Clone this project:

  `$ git clone https://github.com/lynnaloo/iheartnorfolk`

- Webserver (e.g. Apache, Nginx) with a vhost pointed to the iheartnorfolk/src directory
- Ruby (at least 2.0)
- Sass (gem install sass)
- Node.js (includes npm)
- Grunt (npm install -g grunt grunt-cli)
- Bower (npm install -g bower)

## Running the app locally

1.) In terminal, install the Grunt, Bower, and Mocha dependencies:

`$ npm install`

2.) In the same directory (tools), leave terminal tab open with the grunt task running. It will watch your files for changes and perform sass, and handlebars compilation:

`$ grunt watch`

3.) Update the src/index-template.html and src/assets/scss/styles.scss file with an extra space or comment in order to trigger the grunt compilation step.

4.) In the Google Chrome browser, visit the URL pointed to the src directory. It should load the page with images from the three active filters: #norfolkva, #fieldguidenfk, and #growinteractive.
