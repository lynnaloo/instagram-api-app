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
    app.fetchPhotos();
    // when any of the options are clicked
    // fetch the pictures with the new hashtag
    $('.option').click(function () {
      var tag = $(this).attr("title"); // the title attr of the link is the hashtag
      app.fetchPhotos(tag);
    });
  });
});
