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
        // TODO: filter, sort by date
        $('.container').empty();
        $.each(data.data, function (i, item) {
          var image = {
            username: item.user.username,
            photo: item.images.low_resolution.url,
            url: item.link,
            tags: item.tags,
            location: item.location ? item.location.name : '',
            likes: item.likes.count,
            created: item.created_time,
            caption: item.caption ? item.caption.text : ''
          };
          var img = '<img src="' + image.photo + '"/>';
          $('.container').append('<span class="photo">' + img + '</span>');
        });
        // animate photos once they're all loaded
        $('.photo').fadeTo('slow', 1);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log("There was a problem loading the images!");
      }
    });
  }

  function createPhotoTile(item){
    var image = {
      username: item.user.username,
      photo: item.images.low_resolution.url,
      url: item.link,
      tags: item.tags,
      location: item.location ? item.location.name : "",
      likes: item.likes.count,
      created: item.created_time,
      caption: item.caption ? item.caption.text : ""
    };
    var img = '<img src=' + image.photo + '/>';
    // TODO: add jquery click event to flip and show information
  }

  function createPhotoList(photos){
    var photoList = '';
    $('.container').append(photoList)
  }

  // public functions
  App = {
    fetchPhotos: fetchPhotos
  };

  if ( typeof define === "function" && define.amd ) {
    define( "app", [], function () { return App; } );
  }
}());
