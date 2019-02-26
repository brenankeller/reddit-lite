function fetchThreads() {
    $.ajax({
        url: 'https://www.reddit.com/r/raspberry_pi/new.json?sort=new',
        type: 'GET',
        success: function(result){
            renderThreads(result['data']['children'])
        },
        error: function(error){
            console.log(`Error ${error}`)
            return
        }
    })
}

function renderThreads(threads) {
    var threadList = document.getElementById('threadList')
    threadList.innerHTML = '';

    const markup = threads.map(thread => `
        <div class="row">
            <div class="col-sm-3">${thread['data']['thumbnail_width'] ? `<img src=${thread['data']['thumbnail']}>` : ''}</div>
            <div class="col-sm-9">${thread['data']['title']}</div>
        </div>`)
    threadList.innerHTML = markup.join('')
}