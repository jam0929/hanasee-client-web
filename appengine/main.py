#!/usr/bin/env python
# -*- coding: utf-8 -*-
#   
#       This program is free software; you can redistribute it and/or modify
#       it under the terms of the GNU General Public License as published by
#       the Free Software Foundation; either version 2 of the License, or
#       (at your option) any later version.
#       
#       This program is distributed in the hope that it will be useful,
#       but WITHOUT ANY WARRANTY; without even the implied warranty of
#       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#       GNU General Public License for more details.
#       
#       You should have received a copy of the GNU General Public License
#       along with this program; if not, write to the Free Software
#       Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#       MA 02110-1301, USA.
import os
import sys
import webapp2
import urllib2
import logging
import urlparse
from google.appengine.api import memcache

class MainPage(webapp2.RequestHandler):
  def get(self):
    is_bot = 0
    if 'User-Agent' in self.request.headers:
      is_bot = self.request.headers['User-Agent'].find('facebookexternalhit')
      
    _escaped_fragment_ = self.request.get('_escaped_fragment_') if is_bot < 0 else self.request.path
    
    output = ''
    
    if(_escaped_fragment_):
      is_ok = False
      if(_escaped_fragment_.find('/') != 0):
          _escaped_fragment_ = '/'+_escaped_fragment_
      
      output = memcache.get(_escaped_fragment_)
      
      if output is None:
        while(not is_ok):
          url = "http://api.seo4ajax.com/c674edfc1fb2b6541c18aff2bb3e8264"+_escaped_fragment_
          
          try:
            resp = urllib2.urlopen(url)
            if(resp.read(19) == 'Service Unavailable'):
              continue
            output = resp.read()
            resp.close()
            memcache.add(_escaped_fragment_, output, 60)
            is_ok = True
          except:
            is_ok = False
      
    else:
      output = memcache.get('index.html')
      if output is None:
        f = open('dist/index.html', 'r')
        output = f.read()
        f.close()
        memcache.add('index.html', output, 60)
      
    self.response.write(output)

url_map = [
            ('/', MainPage),
            ('/.*', MainPage)]
            
application = webapp2.WSGIApplication(url_map, debug=True)
