function fetchPosts(direction, position, count=0) {
    var url = 'https://www.reddit.com/r/raspberry_pi/new.json?sort=new'
    if (direction && position) {
        url += `&${direction}=${position}&count=${count}`
    }

    var postList = document.getElementById('postList')
    postList.innerHTML = '';

    $.ajax({
        url: url,
        type: 'GET',
        success: function(result){
            var resultCount = result['data']['dist']
            if (direction == 'before'){
                count -= resultCount
            } else if (direction == 'after'){
                count += resultCount
            } else {
                count = resultCount
            }
            renderPosts(result['data']['children'], result['data']['before'], result['data']['after'], count)
        },
        error: function(error){
            console.error(`Error ${error}`)
        }
    })
}

function renderPosts(threads, before, after, count) {
    var postList = document.getElementById('postList')

    const markup = threads.map(thread => `
        <a href="/comments.html?id=${thread['data']['id']}">
            <div class="row post">
                <div class="col-sm-3"><img class="img-fluid" src=${thread['data']['thumbnail_width'] ? `${thread['data']['thumbnail']}` : 'img/reddit-default.jpg'}></div>
                <div class="col-sm-9">
                    <div class="row">
                        <div class="col-sm-12">
                            ${thread['data']['title']}
                        </div>
                    </div>
                    <div class="row subtle-link">
                        <div class="col-sm-4">
                            ${$.timeago(new Date(thread['data']['created_utc']*1000))}
                        </div>
                        <div class="col-sm-4">
                            ${thread['data']['num_comments']} comments    
                        </div>
                        <div class="col-sm-4">
                            ${thread['data']['author']}
                        </div>
                    </div>
                    <div class="row preview-text">
                        <div class="col-sm-12">
                            ${thread['data']['selftext']}
                        </div>
                    </div>
                </div>
            </div>
        </a>`)

    before || after ? markup.push(`<div class="row"><div class="col-sm-12 text-center">`) : ''
    before ? markup.push(`<button class="btn btn-primary nav-buttons" onclick="fetchPosts('before', '${before}', ${count})">prev</button>`) : ''
    after ? markup.push(`<button class="btn btn-primary nav-buttons" onclick="fetchPosts('after', '${after}', ${count})">next</button>`) : ''
    before || after ? markup.push(`</div></div>`) : ''

    postList.innerHTML = markup.join('')
}

function fetchComments() {
    var params = getSearchParameters();
    $.ajax({
        url: `https://www.reddit.com/r/raspberry_pi/comments/${params.id}.json`,
        type: 'GET',
        success: function(result){
            renderComments(result[0]['data']['children'][0], result[1]['data']['children'])
        },
        error: function(error){
            console.error(`Error ${error}`)
        }
    })
}

function mapComments(comments) {
    const markup = comments.map(comment => `
        <div class="row comment">
            <div class="col-sm-12">
                <div class="row comment-author">
                    <div class="col-sm-6">${comment['data']['author']}</div>
                    <div class="col-sm-6">${$.timeago(new Date(comment['data']['created_utc']*1000))}</div>
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

function renderComments(post, comments) {
    var commentPage = document.getElementById('commentPage')
    commentPage.innerHTML = '';
    
    var imageHtml
    if ('preview' in post['data']){
        const images = post['data']['preview']['images']
        var imageHtml = post['data']['preview']['images'].map(image => `
            <img class="img-fluid" src="${image['source']['url']}">
        `)
        imageHtml.join('')
    }

    var converter = new showdown.Converter(),
        text = post['data']['selftext']
        postHtml = converter.makeHtml(text)

    var commentHtml = mapComments(comments)

    const markup = `
        <div class="row">
            <div class="col-sm-12">
                <h2 class="title">${post['data']['title']}</h2>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12">
                ${imageHtml ? imageHtml : ''}
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12 self-text">
                ${postHtml}
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12">
                ${commentHtml ? commentHtml : 'There are no comments on this post.'}
            </div>
        </div>
    `
    commentPage.innerHTML = markup
}