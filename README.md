# Reddit Lite
A basic reddit web client using VanillaJS written for a code challenge.


## The Task: Build a simple Reddit client

Given a ‘listing’ endpoint to the Reddit API (https://www.reddit.com/r/subreddit/new.json?sort=new), display a list of Reddit threads with the thumbnail and title. This list should be paginated. Clicking on one of the rows should take the user to a view with the comments for that listing. 

Possible endpoints can be [hot, new, random, top] anything you like. An example URL would be http://www.reddit.com/r/all/new.json

You can deploy it publicly and provide the URL or you can send the project with a readme to run it locally.

[Reddit API documentation](https://www.reddit.com/dev/api/)

Time investment should not be more than 2-4 hours.

## The Result: Reddit Lite

https://brenankeller.github.io/reddit-lite/

### My Approach

Rather than leaning on a framework, I chose to write the application in plain JS. Frameworks can be used as a crutch and given the scope of this task, would have resulted in unnecessary added weight. Bypassing the framework resulted in less than 154kb transmitted over the network and a load time of 185ms for the application root. As an added bonus, a simple static structure made delivery seamless. If I were building this as a long-term project, I would have opted to use a framework.

In addition to its small size (allowing for loading even on slow/degraded mobile networks), the application was built using mobile-first principles. The responsive design scales up to full HD monitors.

I used ES6 template literals to generate the HTML for Reddit content. Template literals are [compatible across all major modern browsers](https://kangax.github.io/compat-table/es6/), and provided significantly higher levels of readability in the source code. Of course, some <1% of users who are browsing with deprecated browsers (IE 10-11) may experience problems.

I used the following dependencies:
 * [Bootstrap](https://github.com/twbs/bootstrap) (HTML & CSS framework)
 * [Showdown](https://github.com/showdownjs/showdown) (Markdown to HTML)
 * [DOMPurify](https://github.com/cure53/DOMPurify) (DOM-only XSS sanitizer)
 * [jQuery](https://github.com/jquery/jquery) (various utilities)
 * [Timeago](https://github.com/rmm5t/jquery-timeago) (relative timestamps)

 ### Todo

 These are a few of the things I would have tackled given more time:

 * More explicit validation of API response types
 * Reduce right padding for deep threads on mobile
 * Add query string params to the list page to preserve position when navigating back

 ### My Reaction

What really stood out to me during this project were problems with the Reddit API documentation. The models were not clearly documented and their API responses contain an unclear combination of models. Some endpoints lacked proper documentation and parts of the documentation illustrated functionality that was apparently no longer available.