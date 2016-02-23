var Auth = global.Auth
var environment = global.environment
var THREE = require('three')
var geometryChooser = require('./../services/geometry-chooser')
var getMatrixData = require('./../services/get-matrix-data')
var moment = require('moment')
var parseDreamString = require('./../services/parse-dream-string')
var $ = require('jquery')
require('bootstrap-jquery')

// posts stuff to the dom
var dreamsView = {
  setNavBarSignedIn: function () {
    $('#login-dropdown').hide()
    $('.dp-form-container').hide()
    $('#my-dreams-tab').show()
    $('#log-out-btn').show()
  },

  setNavBarSignedOut: function () {
    $('#my-dreams-tab').removeClass('active')
    $('#dreamscape-tab').addClass('active')
    $('#login-dropdown').show()
    $('#login-dropdown').attr('data-state', 'closed')
    $('#my-dreams-tab').hide()
    $('#log-out-btn').hide()
  },

  showDreamEntryModal: function () {
    if ($('#dreamscape-tab').hasClass('active')) {
      $('#dream-entry-modal-container').modal('show')
    } else if ($('#my-dreams-tab').hasClass('active')) {
      $('#dream-entry-modal-container').modal('show')
    }
  },

  showCreateAccount: function () {
    $('#sign-up-dp-form-container').show()
    $('#login-dp-form-container').hide()
  },

  clearLoginForm: function () {
    $('#login-dp-form-container form')[0].reset()
  },

  clearSignUpForm: function () {
    $('#sign-up-dp-form-container form')[0].reset()
  },

  // takes dreams, decides where they're going to go
  populateDreamscape: function (dreams) {

    allDreamsGeometry = new THREE.Geometry()
    pickingGeometry = new THREE.Geometry()

    dreams.forEach(function ( dream, i ) {

      var color = new THREE.Color();
      var quaternion = new THREE.Quaternion();
      var matrix = new THREE.Matrix4();

      var singleDreamGeom = geometryChooser(dream.sentiment)

      var matrixData = getMatrixData(i)

      quaternion.setFromEuler( matrixData.rotation, false );

      // the matrix has the position, scale, and rotation of the object
      matrix.compose( matrixData.position, quaternion, matrixData.scale );

      var facesBeforeMerge = allDreamsGeometry.faces.length
      allDreamsGeometry.merge(singleDreamGeom, matrix)
      var facesAfterMerge = allDreamsGeometry.faces.length

      var facesLocation = { // this is how we can find the faces for this particular geom, after it is merged into the single geom
        low: facesBeforeMerge,
        hi: facesAfterMerge - 1
      }

      var facesLow = facesLocation.low
      var facesHi = facesLocation.hi


      for (var j = facesLow; j <= facesHi; j++) { // this is to support dream.viewed feature yet to be added to the rails back end
        allDreamsGeometry.faces[j].materialIndex = (dream.viewed) ? 1 : 0
      };

      // give the singleDreamGeom's vertices a color corresponding to the "id"
      applyVertexColorsToGeometry( singleDreamGeom, color.setHex( i ) );

      pickingGeometry.merge( singleDreamGeom, matrix );

      environment.pickingData[ i ] = {
        position: matrixData.position,
        rotation: matrixData.rotation,
        scale: matrixData.scale,
        facesLocation: facesLocation
      }
    })

    // allDreamsMesh is all of the dream objects merged together together
    var materials = [ environment.defaultMaterial, environment.viewedMaterial ]
    environment.dreamsMesh = new THREE.Mesh( allDreamsGeometry, new THREE.MultiMaterial(materials) );
    environment.addObjectToScene( environment.dreamsMesh );

    environment.pickingMesh = new THREE.Mesh( pickingGeometry, environment.pickingMaterial )
    environment.pickingScene.add( environment.pickingMesh );

    environment.resetCameraPosition()

  },

  showInfoModal: function () {
    var contents = 'Each shape in the dreamscape represents a dream submited by somebody. You can click on an object to read the dream. Submit a dream yourself by clicking "Cache New Dream" in the nav bar. All dreams are anonymous. If you would like to keep track of your dreams, create an account and you will have access to you own personal dreamscape. Think of it like a 3D dream diary. You can also click on keywords in a dream to reveal other dreams with the same themes.<br><br>Dreamcacher is an experiment by <a href="http://will-sklenars.github.io/" target="_blank">Will Sklenars</a> and <a href="https://github.com/data-doge" target="_blank">Eugene Lynch</a>, using <a href="http://threejs.org/">three.js</a>.<br><br> <a href="https://twitter.com/WIllSklenars" id="feedback" target="_blank">Feedback</a>'
    // var contents = 'contents'
    var html = ""
      +   '<div class="modal-body">'
      +           "<p>"
      +                contents
      +           "</p>"
      +       "</div>"

    var titlehtml = ""
      + '<h4 class="modal-title">'
      +   "About Dreamcacher"
      + "</h4>"

    $('#dreamReadModal').modal('show')
    $('#read-modal-body').html(html)
    $('#read-modal-title').html(titlehtml)

  },

  showDreamModal: function (dream, tags) {
    var dreamTime = moment(dream.created_at).fromNow()
    var tagWords = parseTagObjects(tags)
    var taggedDreamString = parseDreamString(dream.contents, tagWords)
    var html = ""
      +   '<div class="modal-body">'
      +           "<p>"
      // +             dream.contents
      +                taggedDreamString
      +           "</p>"
      +       "</div>"

    var titlehtml = ""
      + '<h4 class="modal-title">'
      +   "A dream from "
      +   dreamTime
      + ".</h4>"

    $('#dreamReadModal').modal('show')
    $('#read-modal-body').html(html)
    $('#read-modal-title').html(titlehtml)

  }
};

function parseTagObjects (tagObjects) {
  var tags = []
  for (var i = 0; i < tagObjects.length; i++) {
    tags.push(tagObjects[i].word)
  }
  return tags
}

function applyVertexColorsToGeometry (geometry, color) {
  geometry.faces.forEach(function (face) {
    var n = (face instanceof THREE.Face3) ? 3 : 4;
    for (var j = 0; j < n; j++) {
      face.vertexColors[j] = color;
    }
  })
}

module.exports = dreamsView
