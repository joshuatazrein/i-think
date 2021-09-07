$.get($('#indextext').attr('link'), 
function (val, status, xhr) {
  $('#indextext').html(xhr.responseText)
})