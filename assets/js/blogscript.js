if ($('#indextext').attr('link') == 'index') {
  console.log('yes');
  for (fname of [
    'artistic ideologies and practices',
    'dharma',
    'knowledge management'
  ]) {
    $.get(
      './i/' + fname + '.html', 
      function (val, status, xhr) {
        console.log(xhr.responseText);
        $('#indextext').html($('#indextext').html() + 
        xhr.responseText.replace(/\.\//g, "./z/"))
      }
    )
  }
} else {
  $.get($('#indextext').attr('link'), 
  function (val, status, xhr) {
    $('#indextext').html(xhr.responseText)
  })
}