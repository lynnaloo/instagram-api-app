require.config({
    paths: {
      'jquery': 'libs/jquery/jquery',
      'lodash': 'libs/lodash/dist/lodash'
    },
    shim: {
      'lodash': {
        deps: ['jquery']
      }
    }
});


require(['jquery', 'lodash'], function ($, _) {

  $(document).ready(function () {
    var hash = 'norfolkva';
    var id = '23299063';
    var client = '4c1191c3ee9040b9968f432f2c977964';
    var count = 50;
    var url = 'https://api.instagram.com/v1/tags/' + hash + '/media/recent?client_id=' +
      client + '&count=' +   count;

    $.ajax({
      method: "GET",
      url: url,
      dataType: "jsonp",
      cache: false,
      success: function (data) {
        $.each(data.data, function (i, item) {
          //if (item.user.id === id) {
            var image = {
              userid: item.user.id,
              username: item.user.username,
              photo: item.images.low_resolution.url,
              url: item.link,
              tags: item.tags
            };
            var img = '<img src=' + image.photo + ' width="250" height="250"/>';
            $('.container').append('<span class="photo">' + img + '</span>');
            $('.photo').fadeIn('slow');
          //}
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("There was a problem loading the images!");
      }
    });

  });
});
