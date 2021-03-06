import os
from flask import Flask

app = Flask(__name__)

from util.gzipmiddleware import GzipMiddleware
app.wsgi_app = GzipMiddleware(app.wsgi_app, compresslevel=5)

import livecoding.views

#os.environ['CLIENT_ID'] = ''
#os.environ['CLIENT_SECRET'] = ''
#os.environ['SECRET_KEY'] = ""
app.secret_key = os.getenv('SECRET_KEY')
