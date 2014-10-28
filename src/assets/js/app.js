var App = {};

(function () {
  function fetchPhotos(filter) {
    var hash = filter,
      // TODO: move to config
      id = '23299063',
      client = '4c1191c3ee9040b9968f432f2c977964',
      count = 100,
      url = 'https://api.instagram.com/v1/users/' + id + '/media/recent?client_id=' +
        client + '&count=' + count;

    $.ajax({
      method: "GET",
      url: url,
      dataType: "jsonp",
      cache: false,
      success: function (data) {
        $('.container').empty();
        var images = filterImages(data.data, filter);
        $.each(images, function (i, item) {
          var photo = createPhotoTile(item);
          // add flip animation
          // TODO: this is buggy
          $('.tile').click(function () {
            $(this).find('.front').addClass('flipped').mouseleave(function () {
              $(this).removeClass('flipped');
            });
            $(this).find('.back').addClass('flipped').mouseleave(function () {
              $(this).removeClass('flipped');
            });
            return false;
          });
          // add this photo to the photo container
          $('.container').append(photo);
        });
        // animate photos once they're all loaded
        $('.tile').fadeTo('slow', 1);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("There was a problem loading the images!");
      }
    });
  }

  function filterImages(data, filter) {
    // TODO: implement sort
    if (filter !== 'all') {
      // TODO: lodash filter on tag
    }
    return data;
  };

  function createPhotoTile(item){
    var username = '@' + item.user.username,
      photo = item.images.low_resolution.url,
      url = item.link,
      location = item.location ? item.location.name || '' : '',
      likes = item.likes.count + ' likes',
      created = item.created_time ? new Date(item.created_time * 1000).toLocaleDateString() : '',
      caption = item.caption ? item.caption.text || '' : '',
      tags = _.map(item.tags, function (tag) {
        return '#' + tag;
      }),
      img = '<img src="' + photo + '"/>';

    var info = '<p>' + caption + '</p>' +
        '<p>' + created + ' ' + username + '</p>' +
        '<p>' + likes + '</p>' +
        '<p>' + location + '</p>' +
        '<p>' + tags.join(" ") + '</p>';


    var tile = '<div class="front">' + img + '</div>' +
      '<div class="back">' + info + '</div>';
    return '<div class="tile-container"><div class="tile">' + tile + '</div></div>';
  }

  // public functions
  App = {
    fetchPhotos: fetchPhotos
  };

  // prepare module
  if ( typeof define === "function" && define.amd ) {
    define( "app", [], function () { return App; } );
  }
}());