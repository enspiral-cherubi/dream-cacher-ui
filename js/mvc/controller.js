// adds the event listners

$(document).ready( function () {

  init3dInterface();

  $('#sign-in-catch').on("click", function(e) {
    e.preventDefault()
    var email = $('#login-nav').find('input[type="email"]').val()
    var password = $('#login-nav').find('input[type="password"]').val()
    dreamsModel.emailSignIn(email, password)
  })


  $('#dreamscape-tab').on('click', function(e) {
    e.preventDefault()
    $(this).addClass('active')
    $('#my-dreams-tab').removeClass('active')
    dreamsModel.getAllDreams()
  })

  $('#my-dreams-tab').on('click', function(e) {
    e.preventDefault()
    $(this).addClass('active')
    $('#dreamscape-tab').removeClass('active')
    dreamsModel.getDreamsForUser()
  })

  $('#log-out-tab').on('click', function(e) {
    e.preventDefault()
    $.auth.signOut().then(function () {
      if ( $("#my-dreams-tab").hasClass("active") ) {
        dreamsModel.getAllDreams()
        $('#my-dreams-tab').removeClass('active')
        $('#dreamscape-tab').addClass('active')
      }
      dreamsView.updateNavBar()
    })

  })

  $('#new-dream-tab').on('click', function (e) {
    e.preventDefault()
    $('#dream-entry-modal').modal('show')
  })


  // create new account modal
  $('#create-account-catch').on('click', function (e) {
    e.preventDefault()
    $('#login-dropdown').removeClass('open')
    $('#login-dropdown').hide()
    // $('#login-dropdown-toggle').hide()
    $('#login-dropdown-toggle').attr('aria-expanded', 'false')

    showCreateAccount()
  })

  $('#submit-account-catch').on("click", function(e) {
    e.preventDefault()
    var email = $('#signup-dropdown').find('input[type="email"]').val()
    var password = $('#signup-dropdown').find('input[type="password"]').val()
    var confirmPassword = $('#confirm-password').find('input[type="password"]').val()

    if ( authentication(email, password, confirmPassword) ) {
      dreamsModel.emailSignUp( email, password, confirmPassword )
    } else { alert(authenticationError) }
  })

  $('.btn-fb').on('click', function(e) {
    e.preventDefault()
    alert('facebook!')
    // $.auth.authenticate({provider: 'github'})
  })

  $('.btn-tw').on('click', function(e) {
    e.preventDefault()
    alert('twitter!')
    // $.auth.authenticate({provider: 'github'})
  })

  $('.btn-gh').on('click', function(e) {
    e.preventDefault()
    alert('github!!!')
    // $.auth.authenticate({provider: 'github'})
  })

  $('.btn-gl').on('click', function(e) {
    e.preventDefault()
    alert('google!')
    // $.auth.authenticate({provider: 'github'})
  })

  $('#save-dream').on('click', function (e) {
    e.preventDefault()
    var dream = $('#dream-entry-modal').find('textarea[type="dream"]').val()
    dreamsModel.saveDream(dream)
  })

  renderer.domElement.addEventListener('mousedown', function () {
    if (objectUnderMouse >= 0) {
      // make the modal appear with the correct dream data
      var dream = dreamData[objectUnderMouse]
      dreamsView.showDreamModal(dream)
    }
  })







})

function showCreateAccount() {
  setTimeout( function () {
    $('.signup-dropdown-toggle').attr('aria-expanded', 'true')
    $('#signup-dropdown').show()
    $('#signup-dropdown').addClass('open')
    $('.signup-dropdown-toggle').hide()
    $('#login-dropdown').show()
  }, 100)
}


var authenticationError = null
function authentication(email, password, confirmPassword) {
  if (password === confirmPassword) {
    if (password.length > 7) {
        if (email) {
          return true
        } else { authenticationError = 'email must be a real email' ; showCreateAccount() ; return false }
      } else { authenticationError = 'password must be atleast 8 characters' ; showCreateAccount() ; return false }
  } else { authenticationError = 'passwords do not match!' ; showCreateAccount() ; return false }
}