import webapp2
from google.appengine.api import mail
import logging


# logging

def init_logging():
    logging.basicConfig( level    = logging.INFO,
                         format   = '%(asctime)s,%(message)s',
                         datefmt  = '%Y-%m-%d %H:%M:%S',
                         filename = './send.log',
                         filemode = 'a' )

def log( url, title, msg ):
    logging.info( ','.join( [ url, title, msg ] ) )


# get page url and title from request

def get_page_url( request ):
    url = request.get( 'u' )
    if url != None:
        return url
    else:
        raise Exception( "no page url" )

def get_page_title( request ):
    title = request.get( 't' )
    if title != None:
        return title
    else:
        raise Exception( "no page title" )


# mail functions

def send_mail( mail_from, mail_to, subject, content ):
    mail.send_mail( sender  = mail_from,
                    to      = mail_to,
                    subject = subject,
                    body    = content )


# response functions

def respond_success( response, url, title ):
    log( url, title, 'OK' )
    response.headers[ 'Content-Type' ] = 'text/plain'
    response.write( 'OK' )

def respond_failure( response, url, title, msg ):
    log( url, title, 'NG: ' + msg )
    response.headers[ 'Content-Type' ] = 'text/plain'
    response.write( 'NG: ' + msg )


# MainPage class
    
class MainPage( webapp2.RequestHandler ):

    def get( self ):
        
        # get page url and title
        try:
            url   = get_page_url( self.request )
            title = get_page_title( self.request )
        except Exception, msg:
            respond_failure( self.response, '', '', str( msg ) )
            return
        except:
            respond_failure( self.response, '', '', "fail to send a mail" )
            return
        
        # send mail
        try:
            send_mail( 'kamonama+mail-this-page@gmail.com',
                       'kamonama@gmail.com', title, url )
        except:
            respond_failure( self.response, url, title, "fail to send a mail" )
            return

        # respond successfully
        respond_success( self.response, url, title )
        
init_logging()
        
application = webapp2.WSGIApplication( [
        ( '/', MainPage ),
], debug = True )
