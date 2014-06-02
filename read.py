import urllib

from goose import Goose
import bottle

@bottle.route('/')
def index():
    return bottle.static_file('index.html', root='.')

@bottle.route('/read/')
def read():
    url = bottle.request.query.url
    article = Goose().extract(url=url)

    article_data = {
        'title': article.title,
        'image': article.top_image and dict(src=article.top_image.src) or None,
        'article': article.cleaned_text,
        'movies': [dict(src=m.src,width=m.width, height=m.height) for m in article.movies],
    }
    return article_data

@bottle.route('/static/<filename:path>')
def send_static(filename):
    return bottle.static_file(filename, root='./static/')

bottle.debug(True)
bottle.run(host='localhost', port=8080)