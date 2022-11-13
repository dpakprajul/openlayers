import Feature from 'ol/Feature';
import { Map, View } from 'ol';
//import geojson
import { GeoJSON } from 'ol/format';
//import overlay
import Overlay from 'ol/Overlay';

import { OSM, Vector as VectorSource } from 'ol/source';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
//cors error header


//make vectorLayer interactive by adding a popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

const map = new Map({
  //projection for web mercator
  projection: 'EPSG:3857',
 
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  overlays: [overlay],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});

const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: map.getView().getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

el('track').addEventListener('change', function () {
  geolocation.setTracking(this.checked);
}),


  // handle geolocation error.
  geolocation.on('error', function (error) {
    const info = document.getElementById('info');
    info.innerHTML = error.message;
    info.style.display = '';
  }
  );



const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
}
);

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [positionFeature],
  }),
});

//get the geojson data and display in a map
// fetch('https://www.imis.bfs.de/ogc/opendata/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=opendata:odl_brutto_1h&format_options=CHARSET:UTF-8&CQL_FILTER=(end_measure%3D2021-12-15T13%3A00%3A00.000Z)%20AND%20(source%20%3D%20%27BfS%27)&outputFormat=application%2Fjson')
//   .then(function (response) {
//     if (!response.ok) {
//       throw new Error("HTTP error, status = " + response.status);
//     }
//     //console.log(response.json());
//     return response.json();
//   })
//   .then(function (json) {
//     //exchange the latitute and longitude
//     var features = new GeoJSON().readFeatures(json, {
//       dataProjection: 'EPSG:4326',
//       featureProjection: 'EPSG:3857'
//     });
//     var vectorSource = new VectorSource({
//       features: features
//     });
//     var vectorLayer = new VectorLayer({
//       source: vectorSource
//     });
//     map.addLayer(vectorLayer);


//   })

  //store vectorLayer in a variable
  var vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: 'https://www.imis.bfs.de/ogc/opendata/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=opendata:odl_brutto_1h&format_options=CHARSET:UTF-8&CQL_FILTER=(end_measure%3D2021-12-15T13%3A00%3A00.000Z)%20AND%20(source%20%3D%20%27BfS%27)&outputFormat=application%2Fjson',
    format: new GeoJSON()
  })
  });

  //add vectorLayer to map
  map.addLayer(vectorLayer);


//add a popup to the map
// map.on('click', function (evt) {
//   var feature = map.forEachFeatureAtPixel(evt.pixel,
//     function (feature) {
//       return feature;
//     });
//   if (feature) {
//     var geometry = feature.getGeometry();
//     var coord = geometry.getCoordinates();
//     overlay.setPosition(coord);
//     //give the information of the id and nuclide of the feature and locality name
//     content.innerHTML = '<p>Id: ' + feature.get('id') + '</p><p>Nuclide: ' + feature.get('nuclide') + '</p><p>Locality: ' + feature.get('locality_name') + '</p>';

//   } else {
//     overlay.setPosition(undefined);
//     closer.blur();
//   }
// });

// closer.onclick = function () {
//   overlay.setPosition(undefined);
//   closer.blur();
//   return false;
// };

map.on('click', function (evt) {
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    var geometry = feature.getGeometry();
    var coord = geometry.getCoordinates();
    overlay.setPosition(coord);
  //send the information of the id and nuclide of the feature and locality name to the postman api
    content.innerHTML = '<p>Id: ' + feature.get('id') + '</p><p>Nuclide: ' + feature.get('nuclide') + '</p><p>Locality: ' + feature.get('locality_name') + '</p>';
    var id = feature.get('id');
    var nuclide = feature.get('nuclide');
    var locality = feature.get('locality_name');
    var longitude = coord[0];
    var latitude = coord[1];
    var data = {
      id: id,
      nuclide: nuclide,
      locality: locality,
      //get latitude and longitude
      latitude: latitude,
      longitude: longitude,

    }
    saveData(data);

  });

});

function saveData(data) {
  //use ajax to send data to postgresql database
  $.ajax({
    type: "POST",
    url: "save.php",
    data: data,
    success: function (response) {
      console.log(response);
    },
    error: function (error) {
      console.log(error);
    }
  });
}
