
(function () {
  var baseUrl = 'https://api.instagram.com/v1/',
    showMoreLink,
    configs = {
      id: '23299063',
      client: '4c1191c3ee9040b9968f432f2c977964'
    },
    tags = {
      'norfolkva': baseUrl + 'tags/norfolkva/media/recent?client_id=' + configs.client,
      'fieldguidenfk': baseUrl + 'tags/fieldguidenfk/media/recent?client_id=' + configs.client,
      'growinteractive': baseUrl + 'users/' + configs.id + '/media/recent?client_id=' + configs.client
    },
    pagination = {
      'norfolkva': null,
      'fieldguidenfk': null,
      'growinteractive': null
    },
    selectedTags = {
      'norfolkva': true,
      'fieldguidenfk': true,
      'growinteractive': true
    };

  function filterTags(tag) {
    if (!tag) { return; }
    selectedTags[tag] = !selectedTags[tag];
  };

  function fetchPhotos(tag, next) {
    filterTags(tag);
    var showMore = false;
    var filtered = _.omit(selectedTags, function (selected) { return !selected; });
    var defers = [];
    _.each(filtered, function (selected, key) {
      var url = tags[key];
      if (next) {
        url = pagination[key];
      }
      if (url) {
        var ajax = $.ajax({
          method: "GET",
          url: url,
          dataType: "jsonp",
          cache: false,
          context: { tag: key } // keep track of the tag in the response
        });
        defers.push(ajax);
      }
    });
    // empty the photo stream before fetching new photos
    $('.content').empty();
    $('.more-images').toggle(false);
    // show loading image
    $('.spinner').show();
    $.when.apply($, defers).then(function () {
      var union = [];
      _.each(arguments, function (item, i) {
        var maxId;
        if (item.data) {
          // if there are no more results, this will be undefined
          pagination[this.tag] = item.pagination.next_url;
          if (pagination[this.tag]) { showMore = true; }
          union.push(item.data);
          return;
        }
        if (item[0] && item[0].data) {
          // if there are no more results, this will be undefined
          pagination[this[i].tag] = item[0].pagination.next_url;
          if (pagination[this[i].tag]) { showMore = true; }
          union.push(item[0].data);
          return;
        }
      }, this);
      union = _.flatten(union);
      // only get unique photos
      var unique = _.uniq(union, 'id');
      // sort photos descending by time
      var sorted = _.sortBy(unique, function (item){
        return item.created_time * -1;
      });
      _.each(sorted, function (item) {
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
      // visibility of more link
      $('.more-images').toggle(showMore);
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

    var info = '<div class="info"><div>' + truncate(caption, 50) + '</div>' +
        '<div><a href="' + url + '" target="_blank">' + url + '</a></div>' +
        '<div>' + created + ' ' + username + '</div>' +
        '<div>' + location + '</div>' +
        '<div>' + truncate(tags.join(" "), 100) + '</div>' +
        '<div>' + likes + '</p><div>';

    var tile = '<div class="front">' + img + '</div>' +
      '<div class="back">' + info + '</div>';

    var tileContainer = '<div class="tile-container"><div class="tile">' + tile + '</div></div>';
    return tileContainer;
  };

  function truncate(text, maxLength) {
    var result = text;
    if (result.length > maxLength) {
      result = result.substr(0, maxLength - 3) + "...";
    }
    return result;
  }

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
