require.config({
    paths: {
      'jquery': 'libs/jquery/jquery.min.js'
    },
    shim: {

    }
});

require(['jquery'], function() {

    console.log($('html'));

});
