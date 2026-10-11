"""Deterministic OG PNGs. Requires Pillow, fontTools and Brotli; uses bundled fonts.
Run from repository root: python3 scripts/social-cards/render.py [card keys...]
"""
import json, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[2]
DATA=json.loads((ROOT/'_data/social_cards.json').read_text())
NAVY='#042d4d'; CREAM='#fff6ec'; MUTED='#b5ccd7'

def render(key, fontdir):
 c=DATA[key]; im=Image.new('RGB',(1200,630),CREAM); d=ImageDraw.Draw(im)
 def font(name,size): return ImageFont.truetype(str(fontdir/name),size)
 serif=font('serif.ttf',88); sans=font('sans.ttf',27); small=font('sans.ttf',20)
 # A stable editorial frame, with enough negative space to survive a small feed card.
 d.rectangle((0,0,1199,14),fill=NAVY)
 logo=Image.open(ROOT/'assets/images/bluedobielogo_1.webp').convert('RGBA');logo.thumbnail((90,90))
 im.paste(logo,(55,39),logo)
 d.text((166,57),'Bluedobie Developing',font=font('sans.ttf',26),fill=NAVY)
 d.text((166,91),'Websites • Content • Practical AI',font=font('sans.ttf',18),fill=NAVY)
 d.text((62,162),c['category'],font=small,fill=NAVY)
 for i,line in enumerate(c['headline'].splitlines()):
  assert d.textlength(line,font=serif)<760,(key,line)
  d.text((58,211+i*91),line,font=serif,fill=NAVY,stroke_width=0)
 for i,line in enumerate(c['subhead'].splitlines()):
  assert d.textlength(line,font=sans)<775,(key,line)
  d.text((63,427+i*38),line,font=sans,fill=NAVY)
 d.line((62,542,1138,542),fill=NAVY,width=1)
 d.text((62,566),'bluedobiedev.com',font=small,fill=NAVY)
 d.text((943,566),'SMALL BUSINESS',font=font('sans.ttf',17),fill=NAVY)
 if c['photo']:
  # Contain screenshots rather than crop away evidence or manufacture client work.
  x,y,w,h=840,177,298,330
  d.rounded_rectangle((x,y,x+w,y+h),radius=16,fill=NAVY)
  photo=Image.open(ROOT/c['photo']).convert('RGB')
  if key=='meet-sabre': photo=ImageOps.fit(photo,(w-16,h-16),centering=(.5,.32))
  else: photo=ImageOps.contain(photo,(w-24,h-24))
  im.paste(photo,(x+(w-photo.width)//2,y+(h-photo.height)//2))
 else:
  # Topic-specific labels are deliberately short and large enough for feed size.
  labels={
   'home':['WEBSITE','CONTENT','CLARITY'],'about':['MELANIE','BROWN','FOUNDER'],
   'services':['BUILD','UPDATE','REPAIR'],'free-web-audit':['TECHNICAL','SEARCH','JOURNEY'],
   'contact':['ASK','PLAN','BEGIN'],'faq':['SCOPE','OWNERSHIP','SUPPORT'],
   'portfolio':['CLIENTS','PRODUCTS','PROCESS'],'ai-setup-review':['ACCESS','ACTIONS','APPROVAL'],
   'logo-sprint':['CONCEPT','REFINE','DELIVER'],'dobiecore':['VOICE','TOOLS','CONTEXT'],
   'learn':['EXPLAIN','PRACTICE','REFINE'],'dialogues':['CAPACITY','SYSTEMS','JUDGMENT'],
   'knowledge':['WEBSITES','SEARCH','AI'],'digital-foundation':['WEBSITE','SYSTEMS','FOUNDATION'],
   'website-audit':['REVIEW','PRIORITIZE','IMPROVE'],'geo':['CLEAR','CONSISTENT','STRUCTURED'],
   'website-cost':['SCOPE','OPTIONS','BUDGET'],'audit-roi':['SPEED','USABILITY','VISIBILITY'],
   'default':['WEBSITES','CONTENT','SUPPORT']}
  for i,label in enumerate(labels[key]):
   x=840+i*10;y=211+i*90
   d.rounded_rectangle((x,y,1138,y+68),radius=10,fill=NAVY if i==0 else None,outline=NAVY,width=2)
   d.text((x+20,y+23),label,font=font('sans.ttf',19),fill=CREAM if i==0 else NAVY)
 path=ROOT/c['image'].lstrip('/');path.parent.mkdir(parents=True,exist_ok=True);im.save(path,optimize=True)
 return im

with tempfile.TemporaryDirectory() as tmp:
 fontdir=Path(tmp)
 for source,dest in [('InstrumentSerif-Regular.woff2','serif.ttf'),('Inter-latin.woff2','sans.ttf')]:
  ft=TTFont(ROOT/'assets/fonts'/source);ft.flavor=None;ft.save(fontdir/dest)
 keys=sys.argv[1:] or list(DATA)
 for key in keys: render(key,fontdir)
 print(f'Rendered {len(keys)} cards at 1200×630.')
