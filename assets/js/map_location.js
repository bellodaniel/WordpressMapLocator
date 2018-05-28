$( document ).ready(function(){

    var exogenus_geolocator = {
        "api_key": "AIzaSyCj8FiIpntED5oxbdR0Nct72m2ys-i6qRE",
        "keywords": "Orthopedic, Podiatrist, Sports Medicine"
    };
    var map = document.getElementById('map'),
        MAP_OPTIONS = {
            center: {lat: 40.70597954587119, lng: -73.9780035},
            zoom: 15,
            maxZoom: 18,
            minZoom: 5,
            mapTypeId: google.maps.MapTypeId.ROAD,
            output: '#places',
            outputItem: '.box',
            activeClass: 'active',
            container: '.places-map',
            error: '.error',
            errorMessage: 'Please, choose your place',
            autocomplete: document.getElementById('search-place'),
            radius: milesToMetres(5),
            keywords: exogenus_geolocator.keywords.split(', ')
        };

    var locator = Locator.create(map, MAP_OPTIONS);
    locator.setSearchBox();

    handleRadius();

    function updateRadius(radius){
        locator.setRadius(radius);
        //locator.draw();
        locator.searchShow();
    }

    function milesToMetres(miles){
        var rate = 1609.34; // metres in 1 mile
        return Math.round(miles * rate);
    }

    function handleRadius(){
        var radiusSelect = document.getElementById('radius');

        radiusSelect.addEventListener('change', function(e){
            var value = milesToMetres(e.target.value);
            updateRadius(value);
        });
    }
});