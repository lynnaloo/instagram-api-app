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
      // the title attr of the link is the hashtag
      var tag = $(this).attr('title');
      app.fetchPhotos(tag);
      $(this).toggleClass('checked');
    });
    // when the toggle button is clicked, toggle icon and sidebar
    $('.toggle').click(function () {
      $('#sidebar').toggle('fast', function () {
        // toggle the margin class and close/menu icon
        $('#right').toggleClass('open');
        $('.toggle').toggleClass('close');
      });
      return false;
    });
    // when the more images link is clicked, fetch again with the next_max_id
    $('#more-images').click(function () {
      app.fetchPhotos(null, true);
      return false;
    });
  });
});
