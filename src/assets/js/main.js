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
    app.fetchPhotos(null);
    // when any of the options are clicked
    // fetch the pictures with the new hashtag
    $('.option').click(function () {
      app.fetchPhotos(tag);
      var tag = $(this).attr('title'); // the title attr of the link is the hashtag
      $(this).toggleClass('checked'); // toggle the checked class
    });
    // when the toggle button is clicked, toggle icon and sidebar
    $('.toggle').click(function () {
      $('.sidebar').toggle('fast', function () {
        $('.right').toggleClass('open'); // toggle the margin class
        $('.toggle').toggleClass('close'); // toggle the close/menu icon
      });
    });
  });
});
