require.config({
    paths: {
      'jquery': 'libs/jquery/jquery',
      'lodash': 'libs/lodash/dist/lodash',
      'app': 'app'
    },
    shim: {
      'lodash': {
        deps: ['jquery']
      },
      'app': {
        deps: ['jquery']
      }
    }
});


require(['jquery', 'lodash', 'app'], function ($, _, app) {

  $(document).ready(function () {
    app.fetchPhotos("all");
    // when any of the options are clicked
    // fetch the pictures with the new filter
    $('.option').click(function () {
      var filter = $(this).text();
      app.fetchPhotos(filter);
    });
  });
});
