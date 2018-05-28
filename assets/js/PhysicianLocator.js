(function(window, google){
  var Locator = (function(){
    function Locator(element, opts) {
      this.gMap = new google.maps.Map(element, opts);
      //this.markers = List.create();
      this.markers = [];
      this.items = [];
      this.places = [];
      this.circle = null;
      this.center = this.gMap.center;
      this.infowindow = null;
      this.opts = opts;
      this.keywords = opts.keywords;
      this.radius = opts.radius;
      this.input = opts.autocomplete,
        this.visible = false,
        this.curPos = 0,
        this.details = {}
    }

    Locator.prototype = {
      draw: function(coords) {
        if(coords) {
          this.center = coords;
        }
        //this.gMap.setCenter(coords);

        if(this.circle){
          this.circle.setMap(null);
        }
        var optionCircle = {
          strokeColor: '#ba5915',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#cccccc',
          fillOpacity: 0.2,
          map: this.gMap,
          center: this.center,
          radius: this.radius
        };
        this.circle = new google.maps.Circle(optionCircle);
      },

      setPlace: function() {
        return new google.maps.places.PlacesService(this.gMap);
      },

      searchShow: function (coords) {
        var self = this;
        self.clearOutput(self.opts.output);
        self.removeItems();
        if(coords) {
          this.center = coords;
        }
        this.keywords.forEach(function (keyword) {
          self.searchByKey(keyword);
        });
      },

      searchByKey: function (keyword) {
        var self = this,
          service = this.setPlace();
        var totalData = [];
        var optionSearch = {
          location: self.center,
          radius: self.radius,
          keyword: keyword,
        };
        service.nearbySearch(optionSearch, function (data, status, pagination) {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
          } else {
            data.forEach(function (item) {
              totalData.push(item);
            });

            if (pagination.hasNextPage) {
              pagination.nextPage();
            } else {
              self.handleData(totalData,
                function (item) {
                  var marker = self.addMarker(item),
                    data = {
                      place_id: item.place_id,
                      marker: marker,
                      item: item
                    };

                  self.handleMarkerClick(data);
                  self.items.push(data);
                },
                function (arr) {
                  self.showData(self.opts.output, arr);
                }
              );
            }
          }
        });
      },

      setRadius: function(radius){
        this.radius = radius;
      },

      getGeolocation: function(){
        var self = this;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            var infoWindow = new google.maps.InfoWindow({map: self.gMap});
            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            self.gMap.setCenter(pos);
          }, function() {
            self.handleLocationError(true, infoWindow, self.gMap.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          self.handleLocationError(false, infoWindow, self.gMap.getCenter());
        }
      },

      handleLocationError: function(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
          'Error: The Geolocation service failed.' :
          'Error: Your browser doesn\'t support geolocation.');
      },

      handleData: function(data, handleItem, handleResult){
        var arr = [];
        data.forEach(function(item){
          handleItem(item);
          arr.push(item);
        });
        handleResult(arr);
      },

      clearOutput: function (element) {
        $(element).text('');
      },

      getLink: function(info){
        return '<div class="box"><a id="' + info.place_id + '" href="#"><span class="center"><strong>' + info.name + '</strong><span>'+info.vicinity+'</span></span></a></div>';
      },

      showData: function(element, data){
        var self = this;
        data.forEach(function(item) {
          var handleLink;
          $(element).append(self.getLink({
            place_id: item.place_id,
            name: item.name,
            vicinity: item.vicinity
          }));
          console.log($(element).html());
          self.items.forEach(function(obj) {
            if(obj.place_id === item.place_id){
              // self.addInfo(obj.item, obj.marker);
              handleLink = function(){
                self.getDetails(obj);
              }
            }
          });

          $('#' + item.place_id).on('click', function () {
            var $box = $(this).parent(self.opts.outputItem);
            $box.addClass(self.opts.activeClass).siblings().removeClass(self.opts.activeClass);
            // open marker
            handleLink();
            return false;
          });
        });
      },

      setCenter: function (coords) {
        var center;
        if (coords) {
          center = {
            lat: coords.lat(),
            lng: coords.lng()
          };
        } else {
          center = this.gMap.center;
        }
        return center;
      },

      addMarker: function (obj) {
        var self = this;
        var marker = new google.maps.Marker({
          position: obj.geometry.location,
          map: this.gMap,
          title: obj.name
        });

        return marker;
      },

      removeItems: function() {
        this.items.forEach(function(item){
          item.marker.setMap(null);
        });
        this.items = [];
      },

      addInfo: function (obj, marker) {
        var self = this,
          infowindow = new google.maps.InfoWindow({
            content: obj.name
          });

        marker.addListener('click', function () {
          self.handleInfoWindow(infowindow, marker);
        });



        return infowindow;
      },

      drawInfo: function(obj, details) {
        var self = this;
        var infowindow = new google.maps.InfoWindow({
          content: self.htmlInfo(details),
          zIndex: 1000
        });

        this.handleInfoWindow(infowindow, obj.marker);
        this.gMap.setCenter(obj.item.geometry.location);

      },

      htmlInfo: function (details) {
        var output = '';

        if(details.name) {
          output += '<p><strong>' + details.name + '</strong></p>';
        }

        if(details.adr_address) {
          output += '<p><strong>Address:</strong> <address>' + details.adr_address + '</address></p>';
        }

        if(details.counted_distance) {
          output += '<p><strong>Distance:</strong> ' + details.counted_distance + ' miles</p>';
        }

        if(details.formatted_phone_number) {
          output += '<p><strong>Phone:</strong> ' + details.formatted_phone_number + '</p>';
        }

        if(details.website) {
          output += '<p><a target="_blank" href="' + details.website + '">' + details.website + '</a></p>';
        }

        if(details.url) {
          output += '<hr/>';
          output += '<p><a target="_blank" href="' + details.url + '">View on Google Maps</a></p>';
        }
        return output;
      },

      handleInfoWindow: function(infowindow, marker) {
        if (this.infowindow) {
          this.infowindow.close();
        }

        infowindow.open(this.gMap, marker);
        this.infowindow = infowindow;
      },

      handleMarkerClick: function (obj) {
        var self = this;
        obj.marker.addListener('click', function () {
          self.getDetails(obj);
          var $box = $('#' + obj.place_id).parent(self.opts.outputItem);
          if ($box.length) {
            $(self.opts.output).find('.' + self.opts.activeClass).removeClass(self.opts.activeClass);
            $box.addClass(self.opts.activeClass);
            self.updateBoxPosition($box);
          }
        });
      },

      updateBoxPosition: function($el){
        var self = this;
        if(typeof $el.position() === 'undefined') {
          return false;
        }

        $(this.opts.output).scrollTop(0);
        $(this.opts.output).scrollTop($el.position().top);
      },

      setSearchBox: function(){
        var self = this;
        var searchBox = new google.maps.places.SearchBox(this.input);
        this.gMap.addListener('bounds_changed', function() {
          searchBox.setBounds(self.gMap.getBounds());
        });

        var infowindow = new google.maps.InfoWindow();
        var marker = new google.maps.Marker({
          map: this.gMap,
          anchorPoint: new google.maps.Point(0, -29)
        });

        searchBox.addListener('places_changed', function() {
          var map = self.gMap;
          infowindow.close();
          marker.setVisible(false);
          var places = searchBox.getPlaces();
          if (places.length == 0) {
            self.showError();
            return;
          }

          $(self.opts.error).hide();
          self.clearOutput(self.opts.output);
          self.removeItems();

          // Clear out the old markers.
          self.markers.forEach(function(marker) {
            marker.setMap(null);
          });
          self.markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }

            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            self.markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
            self.searchShow(place.geometry.location);
          });
          map.fitBounds(bounds);

          if (!self.visible) {
            self.showContainer();
          }
        });
      },

      showContainer: function () {
        var center = this.gMap.getCenter();
        $(this.opts.container).addClass('visible');
        google.maps.event.trigger(this.gMap, 'resize');
        this.gMap.setCenter(center);
        this.visible = true;
      },

      showError: function() {
        $(this.opts.error).text(this.opts.errorMessage).show();
      },

      setIcon: function(marker, place) {
        marker.setIcon(/** @type {google.maps.Icon} */({
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(35, 35)
        }));
      },

      getDetails: function(obj) {
        var self = this,
          place_id = obj.item.place_id;

        if(typeof self.details[place_id] == 'undefined' ){
          var service = new google.maps.places.PlacesService(this.gMap);
          service.getDetails({
            placeId: place_id
          }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              place["counted_distance"] = self.getDistance(self.center, obj.item.geometry.location);
              self.details[place_id] = place;
              self.drawInfo(obj, self.details[place_id]);
            }
          });
        } else {
          self.drawInfo(obj, self.details[place_id]);
        }
      },

      getRadians: function (x) {
        return x * Math.PI / 180;
      },

      metresToMiles: function(m) {
        var rate = 0.00062137
        return Math.round(m * rate);
      },

      getDistance: function(p1, p2) {
        var R, dLat, dLong, a, c, d,
          rad = this.getRadians;

        R = 6378137;
        dLat = rad(p2.lat() - p1.lat());
        dLong = rad(p2.lng() - p1.lng());

        a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
          Math.sin(dLong / 2) * Math.sin(dLong / 2);

        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        d = R * c;


        return this.metresToMiles(d); // returns the distance in meter
      },

      clear: function() {

      }
    };
    return Locator;
  }());

  Locator.create = function(element, opts) {
    return new Locator(element, opts);
  };

  window.Locator = Locator;
}(window, google));