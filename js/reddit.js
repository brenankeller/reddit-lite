const loader = `
<div class="row">
    <div class="col-sm-12 text-center">
        <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</div>
`

/**
 * Retrieves newest posts from Reddit and passes to renderPosts.
 * @param  {String} direction   Determines pagination direction; either 'after' or 'before'. Optional.
 * @param  {Number} position    The fullname of the Reddit post on which to anchor pagination. Optional.
 * @param  {Number} count       The number of items already seen in this subreddit. Optional.
 */
function fetchPosts(direction, position, count=0) {
    var postList = document.getElementById('postList')
    postList.innerHTML = loader;
    var url = 'https://www.reddit.com/r/raspberry_pi/new.json?sort=new'
    if (direction && position) {
        url += `&${direction}=${position}&count=${count}`
    }

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

/**
 * Renders posts retrieved from Reddit in list format to the postLists div. Called from index.html.
 * @param  {Array}  posts     Array of Reddit posts objects.
 * @param  {String} before    Fullname of the Reddit post preceeding the results.
 * @param  {String} after     Fullname of the Reddit post proceeding the results.
 * @param  {Number} count     The number of items already seen in this subreddit.
 */
function renderPosts(posts, before, after, count) {
    var postList = document.getElementById('postList')

    const markup = posts.map(post => `
        <a href="comments.html?id=${post['data']['id']}">
            <div class="row post">
                <div class="col-sm-3 col-md-2">
                    <img class="img-fluid-large" src=${post['data']['thumbnail_width'] ? `${post['data']['thumbnail']}` : 'img/reddit-default.jpg'}>
                </div>
                <div class="col-sm-9 col-md-10">
                    <div class="row">
                        <div class="col-sm-12 list-title">
                            ${DOMPurify.sanitize(post['data']['title'])}
                        </div>
                    </div>
                    <div class="row subtle-link">
                        <div class="col-auto col-lg-2">
                            ${$.timeago(new Date(post['data']['created_utc']*1000))}
                        </div>
                        <div class="col-auto col-lg-2">
                            ${post['data']['num_comments']} comments    
                        </div>
                        <div class="col-auto col-lg-8">
                            ${post['data']['author']}
                        </div>
                    </div>
                    <div class="row preview-text">
                        <div class="col-sm-12">
                            ${DOMPurify.sanitize(post['data']['selftext'])}
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

/**
 * Retrieves a listing of comments for a Reddit post and passes to renderComments. Note that some comments are ommited from the base tree.
 */
function fetchComments() {
    var commentPage = document.getElementById('commentPage')
    commentPage.innerHTML = loader;
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

/**
 * Recursive function which traverses the comment base tree and generates HTML.
 * @param  {Array}  comments     Array of Reddit comment objects.
 */
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
                        ${DOMPurify.sanitize(comment['data']['body'])}
                        ${comment['data']['replies'] ? mapComments(comment['data']['replies']['data']['children']) : ''}
                    </div>
                </div>
            </div>
        </div>`)
    return markup.join('')
}

/**
 * Renders post and comments retrieved from Reddit to the commentPage div. Called from comments.html.
 * @param  {Object} post     Reddit posts object.
 * @param  {String} comments  HTML of the comment base tree.
 */
function renderComments(post, comments) {
    var commentPage = document.getElementById('commentPage')
    var imageHtml
    if ('preview' in post['data']){
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
                ${DOMPurify.sanitize(postHtml)}
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