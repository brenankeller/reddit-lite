function fetchPosts() {
    $.ajax({
        url: 'https://www.reddit.com/r/raspberry_pi/new.json?sort=new',
        type: 'GET',
        success: function(result){
            renderPosts(result['data']['children'])
        },
        error: function(error){
            console.log(`Error ${error}`)
            return
        }
    })
}

function renderPosts(threads) {
    var postList = document.getElementById('postList')
    postList.innerHTML = '';

    const markup = threads.map(thread => `
        <a href="/comments.html?id=${thread['data']['id']}">
            <div class="row post">
                <div class="col-sm-3"><img class="img-fluid" src=${thread['data']['thumbnail_width'] ? `${thread['data']['thumbnail']}` : 'img/reddit-default.jpg'}></div>
                <div class="col-sm-9">${thread['data']['title']}</div>
            </div>
        </a>`)
    postList.innerHTML = markup.join('')
}

function fetchComments() {
    var params = getSearchParameters();
    $.ajax({
        url: `https://www.reddit.com/r/raspberry_pi/comments/${params.id}.json`,
        type: 'GET',
        success: function(result){
            renderComments(result[1]['data']['children'])
        },
        error: function(error){
            console.log(`Error ${error}`)
            return
        }
    })
}

function mapComments(comments) {
    const markup = comments.map(comment => `
        <div class="row comment">
            <div class="col-sm-12">
                <div class="row comment-author">
                    <div class="col-sm-6">${comment['data']['author']}</div>
                    <div class="col-sm-6">${comment['data']['created_utc']}</div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        ${comment['data']['body']}
                        ${comment['data']['replies'] ? mapComments(comment['data']['replies']['data']['children']) : ''}
                    </div>
                </div>
            </div>
        </div>`)
    return markup.join('')
}

function renderComments(comments) {
    var commentThread = document.getElementById('commentThread')
    commentThread.innerHTML = '';
    var commentHtml = mapComments(comments)
    commentThread.innerHTML = commentHtml ? commentHtml : 'There are no comments on this post.'
}