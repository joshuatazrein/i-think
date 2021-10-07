var index = {};

function updateLinks() {
  $.get(
    'bookmarks.html',
    function(message, status, xhr) {
      $('#bookmarks').html(xhr.responseText);
      setLinks('#bookmarks');
      $('#bookmarks').append('<p class="buffer"></p>');
      updateBacklinks();
    }
  );
  
  $.get(
    'bibliography.html',
    function(message, status, xhr) {
      $('#bibliography').html(xhr.responseText);
      setLinks('#bibliography')
    }
  );
}

function setLinks(selector) {
  if (!selector) selector = ''
  $(selector + ' .link').on('mouseup', function (ev) {
    let el = $(ev.target)
    console.log(el);
    while (!['SPAN', 'P'].includes(el[0].tagName)) {
      el = el.parent()
    }
    let link
    if (el.attr('href')) {
      link = el.attr('href')
    } else {
      link = el.text()
    }
    $.get(
      'z/' + link + '.html',
      function (t, s, xhr) {
        $('#zettels').html('<h4>' + link + '</h4>' + 
          xhr.responseText);
        if (index[link]) {
          $('#backlinks').html(
            // list of backlinks
            '<p class="link">' + 
            index[link].join('</p><p class="link">') + 
            '</p>');
          console.log($('#backlinks').html());
        }
        setLinks('#container')
        $('#zettels').scrollTop(0)
        const child = $($('#bookmarks').find('.link').toArray()
          .find(x => { return $(x).text().includes(link) }))
        $('#bookmarks').scrollTop(
          $('#bookmarks').scrollTop() + (child.position().top) - window.innerHeight / 2)
        $('html, body').animate({scrollTop: $('#header').height() }, 500)
        $('.currentlink').removeClass('currentlink')
        child.addClass('currentlink')
        const prevlink = $('#history').find('p.link').toArray().find(x => {
          return $(x).text() == link
        })
        if (prevlink) prevlink.remove();
        $('#history').html('<p class="link">' + link + '</p>' + 
          $('#history').html());
        setLinks('#history');
        setLinks('#backlinks');
      }
    );
  });
  $(selector + ' .b-link').on('mouseup', function (ev) {
    let link
    let el = $(ev.target)
    while (!['SPAN', 'P'].includes(el[0].tagName)) {
      el = el.parent()
    }
    if (el.attr('href')) {
      link = el.attr('href')
    } else {
      link = el.text()
    }
    console.log(link, el.text());
    $.get(
      'b/' + link + '.html',
      function (t, s, xhr) {
        $('#zettels').html('<h4>' + link + '</h4>' + 
          xhr.responseText);
        if (index[link]) {
          $('#backlinks').html(
            // list of backlinks
            '<p class="link">' + 
            index[link].join('</p><p class="link">') + 
            '</p>');
          console.log($('#backlinks').html());
        }
        setLinks('#container')
        $('#zettels').scrollTop(0)
        const child = $($('#bibliography').find('.b-link').toArray()
          .find(x => { return $(x).text().includes(link) }))
        $('#bibliography').scrollTop(
          $('#bibliography').scrollTop() + (child.position().top) - window.innerHeight / 2)
        $('html, body').animate({scrollTop: $('#header').height() }, 500)
        $('.currentlink').removeClass('currentlink')
        child.addClass('currentlink')
        const prevlink = $('#history').find('p.link').toArray().find(x => {
          return $(x).text() == link
        })
        if (prevlink) prevlink.remove();
        $('#history').html('<p class="link">' + link + '</p>' + 
          $('#history').html());
        setLinks('#history');
        setLinks('#backlinks');
      }
    );
  });
}

function updateBacklinks() {
  // indexes backlinks
  index = {}
  $('#bookmarks .link').toArray().forEach(x => {
    const title = $(x).text();
    console.log('./z/' + title + '.html');
    $.get('./z/' + title + '.html', 
    function (s, m, xhr) {
      // find all backlinks
      $('#test').html(xhr.responseText);
      console.log($('#test').html());
      $('#test').find('.link').toArray().forEach(y => {
        // add link text
        const el = $(y);
        console.log(el);
        let text;
        if (el.attr('href')) { text = el.attr('href') }
        else { text = el.text() }
        // add to dict: [article], [backlinks]
        console.log(text, index[text]);
        if (!index[text]) { index[text] = [title]}
        else { index[text].push(title) }
      })
    })
  })
  setTimeout(function () { console.log(index); }, 1000);
}

updateLinks();