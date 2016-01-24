function statistic() {
  // remove header on the modal window
  var elem = document.getElementById('header');
  if (elem != null)
    elem.parentNode.removeChild(elem);
  // remove restart button on the modal window footer
  elem = document.getElementById('restart');
  if (elem != null)
    elem.parentNode.removeChild(elem);
  // update values for statistic
  document.getElementById('tries').textContent = getCookie('tries');
  document.getElementById('wins').textContent = getCookie('wins');
  document.getElementById('loses').textContent = getCookie('loses');
  $("#game_end").modal();
}

function signin() {
  $("#game_end").modal();
}

function result(str) {
  if (getCookie('modal_shown') == "0") {
    document.getElementById('result').textContent = str;
    checkCookies(str);
    $("#game_end").modal({keyboard: false});
    setCookie('modal_shown', '1');
  }
}

function checkCookies(str) {
  function check(cook) {
    var tmp = getCookie(cook);
    if (tmp != "") {
      tmp = parseInt(tmp) + 1;
      setCookie(cook, tmp.toString());
      document.getElementById(cook).textContent = tmp.toString();
    }
  }
  if (str == "You lose") {
    check('loses');
    document.getElementById('wins').textContent = getCookie('wins');
  } else if (str == "You win!") {
    check('wins');
    document.getElementById('loses').textContent = getCookie('loses');
    setCookie('loses', getCookie('loses'));
  }
  check('tries');
}

function setCookie(cname, cvalue) {
  var d = new Date();
  // 30 days expiration
  d.setTime(d.getTime() + (30*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

function delCookie(cname) {
  document.cookie = cname + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}

function removeFlags() {
  for (var i = 30; i > 0; i-- ) {
    for (var j = 16; j > 0; j--) {
      delCookie('flag_' + i + '-' + j);
    }
  }
}

(function () {
  var cookie = getCookie('tries');
  if (cookie == "")
    setCookie('tries', '0');
  cookie = getCookie('wins');
  if (cookie == "")
    setCookie('wins', '0');
  cookie = getCookie('loses');
  if (cookie == "")
    setCookie('loses', '0');
  cookie = getCookie('modal_shown');
  if (cookie == "")
    setCookie('modal_shown', '0');
})();

window.onload = function() {
  $("a[name='buttons']").bind("contextmenu", function(event){
    var flag_id = 'flag_' + $(this).children()[0].id;
    if (event.which == 3 && !($('#' + flag_id).length)) {
      $('#'+$(this).children()[0].id).append('<img id="' + flag_id + '" style="margin-left: -13px" class="Mine" align="middle" height="27" width="27" src="assets/images/flag.png">');
      setCookie(flag_id, '+');
      return false;
    } else if (event.which == 3 && $('#' + flag_id).length) {
      $('#'+flag_id).remove();
      setCookie(flag_id, '');
      return false;
    }
  });
  $("a[name='buttons']").hover(function(){
    $(this).css("background", "#C6DAF2").delay("fast");
  }, function(){
    $(this).queue(function(){
      $(this).css("background", "#eff0f2").dequeue();
    });
  });

  // set flags
  for (var i = 30; i > 0; i--) {
    for (var j = 16; j > 0; j--) {
      var elem = $('#' + i + '-' + j);
      var flag_id = 'flag_' + i + '-' + j;
      if (elem.length && getCookie(flag_id).length) {
        elem.append('<img id="' + flag_id + '" style="margin-left: -13px" class="Mine" align="middle" height="27" width="27" src="assets/images/flag.png">');
      }
    }
  }
};