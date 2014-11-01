
(function () {
  var baseUrl = 'https://api.instagram.com/v1/',
    configs = {
      id: '23299063',
      client: '4c1191c3ee9040b9968f432f2c977964',
      count: 50
    },
    tags = {
      'norfolkva': baseUrl + 'tags/norfolkva/media/recent?client_id=' + configs.client,
      'fieldguidenfk': baseUrl + 'tags/fieldguidenfk/media/recent?client_id=' + configs.client,
      'growinteractive': baseUrl + 'users/' + configs.id + '/media/recent?client_id=' + configs.client
    },
    selectedTags = {
      'norfolkva': true,
      'fieldguidenfk': true,
      'growinteractive': true
    };

  function filterTags(tag) {
    if (!tag) { return }
    selectedTags[tag] = !selectedTags[tag];
  };

  function fetchPhotos(tag, callback) {
    filterTags(tag);
    var defers = _.map(selectedTags, function (selected, key) {
        var ajax = $.ajax({
          method: "GET",
          url: tags[key] + '&count=' + configs.count,
          dataType: "jsonp",
          cache: false
        });
        return ajax;
      });
    // empty the photo stream before fetching new photos
    $('.content').empty();
    // show loading image
    $('.spinner').show();
    $.when.apply($, defers).then(function () {
      var union = _.flatten(_.map(arguments, function (item) {
        return item[0].data;
      }));
      var unique = _.uniq(union, 'id');
      _.each(unique, function (item) {
        var photo = createPhotoTile(item);
        // add this photo to the photo content div
        $('.content').append(photo);
      });
      // TODO: sort
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
      $('.spinner').hide();
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
        '<p>' + tags.join(" ") + '</p>' +
        '<p><a href="' + url + '" target="_blank">' + url + '</a></p>';

    var tile = '<div class="front">' + img + '</div>' +
      '<div class="back">' + info + '</div>';
    return '<div class="tile-container"><div class="tile">' + tile + '</div></div>';
  };

  // public functions to expose to main and unit tests
  App = {
    fetchPhotos: fetchPhotos,
    filterTags: filterTags,
    selectedTags: selectedTags
  };

  // prepare module
  if ( typeof define === "function" && define.amd ) {
    define( "app", [], function () { return App; } );
  }
}());
