"""Check built social metadata and optional baseline preservation.
Usage: python3 scripts/social-cards/verify.py BUILD [BASELINE_BUILD]
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
from PIL import Image
import json,sys,re,hashlib
ROOT=Path(__file__).resolve().parents[2]
build=Path(sys.argv[1]);baseline=Path(sys.argv[2]) if len(sys.argv)>2 else None
cards=json.loads((ROOT/'_data/social_cards.json').read_text())
class Head(HTMLParser):
 def __init__(self,s):
  super().__init__();self.meta={};self.canon=[];self.title='';self.in_title=False;self.feed(s)
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='meta': self.meta.setdefault(a.get('property',a.get('name')),[]).append(a.get('content'))
  if t=='link' and a.get('rel')=='canonical':self.canon.append(a['href'])
  if t=='title':self.in_title=True
 def handle_endtag(self,t):
  if t=='title':self.in_title=False
 def handle_data(self,s):
  if self.in_title:self.title+=s
 def one(self,k):assert len(self.meta.get(k,[]))==1,(k,self.meta.get(k));return self.meta[k][0]

def route(url):return build/('index.html' if url=='/' else url.lstrip('/')+('index.html' if url.endswith('/') else '.html'))
checked=[]
for key,c in cards.items():
 image=build/c['image'].lstrip('/');im=Image.open(image)
 assert im.format=='PNG' and im.size==(1200,630)
 assert image.stat().st_size<500000
 if not c['source']:continue
 file=route(c['url']);s=file.read_text();h=Head(s)
 assert h.canon==['https://www.bluedobiedev.com'+c['url']],(key,h.canon)
 for kind in ['og','twitter']:
  for prop,expected in [('title',c['title']),('description',c['description']),('image','https://www.bluedobiedev.com'+c['image']),('image:alt',c['alt'])]:
   assert h.one(kind+':'+prop)==expected,(key,kind,prop)
 assert h.one('twitter:card')=='summary_large_image'
 for prop in ['width','height','type']:assert h.one('og:image:'+prop)==str(c[prop])
 assert h.one('og:url')==h.canon[0]
 assert urlparse(h.one('og:image')).scheme=='https'
 checked.append(dict(page=c['url'],image=h.one('og:image'),dimensions=list(im.size),bytes=image.stat().st_size))
for rel in ['privacy.html','terms-and-conditions.html','404.html','business-links.html','sabrebeats/index.html']:
 h=Head((build/rel).read_text());assert h.one('og:image').endswith('/social/default.png'),rel
 assert h.one('og:image:width')=='1200'
compared=0
if baseline:
 for f in baseline.rglob('*.html'):
  g=build/f.relative_to(baseline)
  if not g.exists():continue
  before=f.read_text();after=g.read_text();a=Head(before);b=Head(after)
  assert a.title==b.title,(f,'search title')
  assert a.canon==b.canon,(f,'canonical')
  for k in ['description','robots','og:type','og:url']:assert a.meta.get(k)==b.meta.get(k),(f,k)
  schema=lambda s: [json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)]
  assert schema(before)==schema(after),(f,'schema')
  body=lambda s: re.sub(r'\?v=\d+','?v=BUILD_TIME',s.split('<body',1)[-1])
  assert body(before)==body(after),(f,'body')
  compared+=1
assert not (build/'scripts').exists(),'Authoring scripts leaked into build'
print(json.dumps(dict(status='passed',cards=len(cards),target_pages=len(checked),baseline_pages_compared=compared,utility_defaults_checked=5,checks=['unique OG/Twitter values','absolute HTTPS images','canonical URLs','PNG dimensions/type/size','search metadata preserved','JSON-LD preserved','body preserved except build timestamp','authoring scripts excluded'],pages=checked),indent=2))
