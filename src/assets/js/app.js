(function () {
  var baseUrl = 'https://api.instagram.com/v1/',
    config = {
      userId: '23299063',
      client: '4c1191c3ee9040b9968f432f2c977964'
    },
    tags = {
      'norfolkva': baseUrl + 'tags/norfolkva/media/recent?client_id=' + config.client,
      'fieldguidenfk': baseUrl + 'tags/fieldguidenfk/media/recent?client_id=' + config.client,
      'growinteractive': baseUrl + 'users/' + config.userId + '/media/recent?client_id=' + config.client
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

  /**
   * @private
   */
  function filterTags(tag) {
    if (!tag) { return; }
    selectedTags[tag] = !selectedTags[tag];
  }

  function getSelectedTags () {
    return _.keys(_.pick(selectedTags, _.identity));
  }

  function fetchPhotos(tag, next) {
    // empty the photo stream before fetching new photos
    if (!next) {
      $('#content').empty();
    }

    filterTags(tag);
    var defers = _.compact(_.map(getSelectedTags(), function (key) {
      var url = (next ? pagination : tags)[key];
      if (url) {
        return $.ajax({
          method: "GET",
          url: url,
          dataType: "jsonp",
          cache: false,
          context: { tag: key } // keep track of the tag in the response
        });
      }
    }));
    // add a placehold deffered here so result is an array of arrays
    defers.push(new $.Deferred().resolve());

    // hide the more-images link before refresh
    $('#more-images').hide();
    // show loading image
    $('#spinner').show();

    $.when.apply($, defers).then(function () {
      var sorted = _.chain(arguments)
        .initial() // get all but the final placehold deferred
        .pluck('0')
        .map(function (item, i) {
          pagination[this[i].tag] = item.pagination.next_url;
          return item.data;
        }, this)
        .flatten()
        .compact()
        .unique('id')
        .sortBy('created_time')
        .value()
        .reverse();

      _.each(sorted, createPhotoTile);

      var showMore = _.any(_.pick(pagination, getSelectedTags()));
      $('#more-images').toggle(showMore);
      // animate photos once they're all loaded
      $('.tile').fadeTo('slow', 1);
      $('#spinner').hide();
    }, function () {
      console.log("Fetch of Instagram images has failed!");
    });
  };

  /**
   * @private
   */
  function createPhotoTile(item){
    var tile = new Tile(item);
    tile.render();
    tile.bindHandlers();
  };

  /**
   * @private
   */
  function truncate(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  }

  function Tile (item) {
    this.username = '@' + item.user.username;
    this.photo = item.images.low_resolution.url;
    this.url = item.link;
    this.location = _.result(item.location, 'name') || '';
    this.likes = item.likes.count + ' likes';
    this.created = item.created_time ? new Date(item.created_time * 1000).toLocaleDateString() : '';
    this.caption = truncate(_.result(item.caption, 'text') || '', 75);
      // limit to 10 tags, join on # to create string
    this.tags = _.map(_.first(item.tags, 10), function (tag) { return '#' + tag; }).join(' ');
  }

  Tile.prototype.render = function () {
    // add photo tile to the content section
    this.element = $('<div/>').addClass('tile-container').append(
      $('<div/>').addClass('tile')
      .append(
        $('<div/>').addClass('front')
          .append($('<img/>').attr({ src: this.photo, title: 'image', alt: this.url }))
      )
      .append(
        $('<div/>').addClass('back').append(
          $('<div/>').addClass('info')
            .append($('<div/>').text(this.caption))
            .append(
              $('<div/>').append($('<a/>').text(this.url).attr({ href: this.url, target: '_blank' }))
            )
            .append($('<div/>').text(this.created + ' ' + this.username))
            .append($('<div/>').text(this.location))
            .append($('<div/>').text(this.tags))
            .append($('<div/>').text(this.likes))
        )
      )
    );
    $('#content').append(this.element);
  };

  /**
   * Add tile flip animation on click
   * @public
   */
  Tile.prototype.bindHandlers = function () {
    $(this.element).click(function () {
      $(this).find('.front, .back').addClass('flipped');
      $(this).one('webkitTransitionEnd transitionend', function (event) {
        $(this).one('click', function () {
          $(this).find('.front, .back').removeClass('flipped');
        });
      });
    });
  };

  // public functions to expose to main and unit tests
  var App = {
    fetchPhotos: fetchPhotos,
    getSelectedTags: getSelectedTags
  };

  // prepare module
  if ( typeof define === "function" && define.amd ) {
    define( "app", [], function () { return App; } );
  }
}());