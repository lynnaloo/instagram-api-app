require.config({
    paths: {
      'jquery': 'libs/jquery/jquery',
      'jquery-instagram': 'libs/jquery-instagram/dist/instagram'
    },
    shim: {
      'jquery-instagram' : {
          deps: ['jquery']
      },
    }
});

require(['jquery', 'jquery-instagram'], function ($) {

  $(".instagram").instagram({
    userId: 'lynnaloo',
    clientId: '4c1191c3ee9040b9968f432f2c977964',
    image_size:'standard_resolution'
  });

});
