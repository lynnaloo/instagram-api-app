
(function () {
  function fetchPhotos() {
    var baseUrl = 'https://api.instagram.com/v1/',
      configs = {
        id: '23299063',
        client: '4c1191c3ee9040b9968f432f2c977964',
        count: 50
      };

    var norfolkva = $.ajax({
      method: "GET",
      url: baseUrl + 'tags/norfolkva/media/recent?client_id=' + configs.client + '&count=' + configs.count,
      dataType: "jsonp",
      cache: false
    });
    var fieldguidenfk = $.ajax({
      method: "GET",
      url: baseUrl + 'tags/fieldguidenfk/media/recent?client_id=' + configs.client + '&count=' + configs.count,
      dataType: "jsonp",
      cache: false
    });
    var growinteractive = $.ajax({
      method: "GET",
      url: baseUrl + 'users/' + configs.id + '/media/recent?client_id=' + configs.client + '&count=' + configs.count,
      dataType: "jsonp",
      cache: false
    });

    // empty the photo stream before fetching new photos
    $('.content').empty();
    $.when.apply($, [norfolkva, fieldguidenfk, growinteractive]).then(function () {
      var union = _.flatten(_.map(arguments, function (item) { return item[0].data; }));
      var unique = _.uniq(union, 'id');

      _.each(unique, function (item) {
        var photo = createPhotoTile(item);
        // add this photo to the photo content div
        $('.content').append(photo);
      });
      // add tile flip animation on click
      $('.tile').click(function () {
        $(this).find('.front, .back').addClass('flipped');
        $(this).one('webkitTransitionEnd transitionend', function (event) {
          $(this).one('click', function () {
            $(this).find('.front, .back').removeClass('flipped');
          });
        });
      });
      // animate photos once they're all loaded
      $('.tile').fadeTo('slow', 1);
    }, function () {
      console.log("Fetch of Instagram images has failed!");
    });
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

  // public functions to expose to main and unit tests
  App = {
    fetchPhotos: fetchPhotos,
    filters: []
  };

  // prepare module
  if ( typeof define === "function" && define.amd ) {
    define( "app", [], function () { return App; } );
  }

}());
