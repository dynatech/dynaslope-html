from fbchat import Client
from fbchat.models import *
import configparser
import sys
reload(sys)
sys.setdefaultencoding('utf8')

def send_messenger(email, password, thread_id):
	client = Client(email, password)
	# message_id = client.fetchThreadList(offset=None, limit=20, thread_location=ThreadLocation.INBOX, before=None)
	# for x in message_id:
	# 	print x
	message_id = client.send(Message(text='Sample Message via Python-AIS'), thread_id=thread_id, thread_type=ThreadType.GROUP)

if __name__ == "__main__":
	config = configparser.ConfigParser()
	config.readfp(open('../config/credentials.cfg'))
	send_messenger(config['DYNASLOPE-AIS']['email'], config['DYNASLOPE-AIS']['password'], config['DYNASLOPE-THREAD']['thread_id'])