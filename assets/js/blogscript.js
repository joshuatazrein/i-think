var index = {};
var found = [];
var searches = [];
var tooltiptimer;

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

function followLink(link, text, type) {
  let frame
  let linkclass
  if (type == 'link') {
    frame = '#bookmarks'
    linkclass = 'link'
  } else if (type == 'b-link') {
    frame = '#bibliography'
    linkclass = 'b-link'
  }
  $('#zettels').html('<h4>' + link + '</h4>' + text);
  if (index[link]) {
    $('#backlinks').html(
      // list of backlinks
      '<p class="link">' + 
      index[link].join('</p><p class="link">') + '</p>');
  }
  setLinks('#zettels')
  setLinks('#backlinks')
  $('#zettels').scrollTop(0)
  const child = $($(frame).find('.' + linkclass).toArray()
    .find(x => { return $(x).text().includes(link) }))
  $(frame).scrollTop(
    $(frame).scrollTop() + (child.position().top) - window.innerHeight / 2)
  $('html, body').animate({scrollTop: $('#header').height() + 25}, 500)
  $('.currentlink').removeClass('currentlink')
  child.addClass('currentlink')
  const prevlink = $('#history').find('p').toArray().find(x => {
    return $(x).text() == link
  })
  if (prevlink) prevlink.remove();
  $('#history').prepend('<p class="' + linkclass + '">' + link + '</p>');
  setLinks('#history');
  setLinks('#backlinks');
  $('#tooltip').hide(300)
}

function setLinks(selector, tooltip) {
  if (!selector) selector = ''
  $(selector + ' .link').on('mouseup', function (ev) {
    let el = $(ev.target)
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
        followLink(link, xhr.responseText, 'link')
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
    $.get(
      'b/' + link + '.html',
      function (t, s, xhr) {
        followLink(link, xhr.responseText, 'b-link')
      }
    );
  });
  if (tooltip != false) {
    $(selector + ' .b-link, ' + selector + ' .link').on('mouseover', 
      function (ev) { tooltiptimer = setTimeout(toolTip, 1000, ev) })
    $(selector + ' .b-link, ' + selector + ' .link').on('mouseleave', 
      function (ev) { clearTimeout(tooltiptimer) })
  }
}

function hideToolTip() {
  $('#tooltip').stop(true)
  $('#tooltip').hide(300)
  clearTimeout(tooltiptimer)
}

function toolTip(ev) {
  const el = $(ev.target)
  let location
  if (el.hasClass('link')) {
    location = './z/'
  } else if (el.hasClass('b-link')) {
    location = './b/'
  }
  let title
  if (el.attr('href')) {
    title = el.attr('href')
  } else {
    title = el.text()
  }
  location += title + '.html'
  $.get(location, 
    function (s, m, xhr) {
      if (!el.parents().toArray().includes($('#tooltip')[0])) {
        // move tooltip
        $('#tooltip').css('top', '')
        $('#tooltip').css('left', '')
        $('#tooltip').css('right', '')
        $('#tooltip').css('bottom', '')
        if (ev.clientY > window.innerHeight - $('#tooltip').height()) {
          $('#tooltip').css('bottom', '10px')
        } else {
          $('#tooltip').css('top', Number(ev.clientY - 30) + 'px')
        }
        if (ev.clientX > window.innerWidth - $('#tooltip').width()) {
          $('#tooltip').css('right', '10px')
        } else {
          $('#tooltip').css('left', Number(ev.clientX - 30) + 'px')
        }
      }
      $('#tooltip').html(
        '<h3>' + title + '</h3>' + 
        xhr.responseText)
      setLinks('#tooltip')
      if (!el.parents().toArray().includes($('#tooltip')[0])) {
        $('#tooltip').show(300)
      }
      $('#tooltip').scrollTop(0)
    }
  )
}

function updateBacklinks() {
  // indexes backlinks
  index = {}
  searches = []
  $('#bookmarks .link').toArray().forEach(x => {
    const title = $(x).text();
    $.get('./z/' + title + '.html', 
    function (s, m, xhr) {
      // find all backlinks
      $('#test').html(xhr.responseText);
      searches.push([title, $('#test').text()])
      $('#test').find('.link').toArray().forEach(y => {
        // add link text
        const el = $(y);
        let text;
        if (el.attr('href')) { text = el.attr('href') }
        else { text = el.text() }
        // add to dict: [article], [backlinks]
        if (!index[text]) { index[text] = [title]}
        else { index[text].push(title) }
      })
      found = searches.concat()
    })
  })
}

function selectRandom() {
  const children = $('#bookmarks .link')
  const linkselect = Math.floor(Math.random() * children.length)
  $.get(
    './z/' + $(children[linkselect]).text() + '.html',
    function (s, m, xhr) {
      followLink($(children[linkselect]).text(), xhr.responseText, 'link')
    }
  )
}

function search(ev) {
  if (ev.key == 'Backspace') {
    $('#searchbar').val('')
    $('#results').empty()
    $('#results').hide()
    found = searches.concat()
    console.log(found);
  } else {
    $('#results').show()
    console.log(found);
    const searchtext = $('#searchbar').val().split(' ')
    console.log(searchtext);
    found = found.filter(x => {
      for (y of searchtext) {
        console.log(x[1], new RegExp(y, 'i'));
        if (!new RegExp(y, 'i').test(x[1])) { 
          console.log(x[0], 'false');
          return false }
      }
      console.log(x[0], 'true');
      return true
    })
    $('#results').empty()
    $('#results').html(
      '<p class="link">' + 
      found.map(x => { return x[0] }).join('</p><p class="link">') +
      '</p>'
    )
    setLinks('#results')
  }
}

function keyDown(ev) {
  if (ev.key == 'Escape') {
    $('#searchbar').val('')
    $('#results').empty()
    $('#results').hide()
    $('#searchbar').blur()
    found = searches.concat()
    console.log(found);
  } 
}

$('#results').hide()
updateLinks();
setTimeout(selectRandom, 100)
$('#searchbar').on('keydown', search)
$(document).on('keydown', keyDown)
hideToolTip()
$('#tooltip').on('mouseleave', hideToolTip)
$(document).on('mouseup', function (ev) {
  if (ev.target != $('#tooltip')[0] && 
    !$(ev.target).parents().toArray().includes($('#tooltip')[0])) {
    hideToolTip() 
  }
})

function assembleList(masterDir, type) {
  var doneloading = undefined
  // scans a directory to generate an object
  function scanDir(selectedDir, selectedList) {
    if (doneloading) clearTimeout(doneloading)
    let returnlist
    $.ajax('assets/php/listdir.php',
      {
        data: {dir: selectedDir},
        success: function(a,s,xhr) {
          // return full list
          var list = JSON.parse(xhr.responseText).filter(x => {
            return x.charAt(0) != '.'})
          var listObject = {
            name: selectedDir,
            contents: list.filter(x => 
              { return x.slice(x.length - 5) == '.html' })
          }
          // add to master list
          selectedList.contents.push(listObject)
          // start scan
          doneloading = setTimeout(function () {
            masterList = formatList(masterList)
          }, 1000)
          // scan all subdirectories of list
          for (dir of list.filter(x => {
            return x.slice(x.length - 5) != '.html'})) {
            scanDir(selectedDir + '/' + dir, listObject)
          }
          returnlist = listObject
        },
        async: false,
      }
    )
    return returnlist
  }
  function formatList(listObject, level) {
    console.log(listObject);
    // formats list of a single object
    let joinList
    if (level == 3) {
      joinList = ['<h3>' + listObject.title + '</h3>']
    } else {
      joinList = ['<h4>' + listObject.title + '</h4>']
    }
    for (entry of listObject.contents.filter(
      x => { return typeof x != 'object' })) {
      // push entries onto list
      joinList.push('<span class="' + type + '">' + entry.slice(0, entry.length - 5) + '</span>')
    }
    for (entry of listObject.contents.filter(x => 
      { return typeof x === 'object' })) {
      // scan objects and add them to the list
      joinList.push(formatList(entry))
    }
    console.log(joinList)
    return joinList.join('')
  }
  let masterList = scanDir(masterDir, {name: 'master', contents: []})
  return masterList
}

// try
console.log(assembleList('../../z', 'link'))