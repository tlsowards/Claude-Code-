#!/usr/bin/env bash
# Usage: scripts/publish-episode.sh <brief id> <site episode id>
# Needs ffmpeg and ffprobe, an ElevenLabs key and a WordPress application password (proxy-injected in a Claude cloud session).
# Renders the brief in Tim's voice, uploads the MP3 to the site, repoints the episode, and appends to content/episodes.json.
set -euo pipefail
cd "$(dirname "$0")/.."
export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt ELEVENLABS_API_KEY=proxy-injected
BRIEF=$1; EP=$2; AUTH="Authorization: Basic placeholder"; S=https://sowardsconsulting.com/wp-json
DATE=$(python3 -c "import json;print(json.load(open('content/briefs/$BRIEF.json'))['date'])")
node scripts/build-narration.mjs "$BRIEF" >/dev/null
node scripts/make-audio-elevenlabs.mjs "$BRIEF" --voice 06eBG0iLUZSHrjn7mONj --model eleven_v4 --out audio-out 2>&1 | grep -v UNDICI | tail -2
F="audio-out/$DATE-use-of-force-case-law-update-tim.mp3"
BYTES=$(stat -c %s "$F"); DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"); SECS=$(python3 -c "print(round($DUR))"); MMSS=$(python3 -c "s=$SECS;print(f'{s//60}:{s%60:02d}')"); MB=$(python3 -c "print(f'{$BYTES/1048576:.2f}M')")
URL=$(curl -sS --max-time 600 -X POST -H "$AUTH" -H "Content-Type: audio/mpeg" -H "Content-Disposition: attachment; filename=$DATE-use-of-force-case-law-update.mp3" --data-binary @"$F" "$S/wp/v2/media" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['source_url'])")
python3 - "$BRIEF" "$EP" "$URL" "$MMSS" "$MB" "$BYTES" "$SECS" "$DATE" <<'PY'
import json,sys,subprocess,html
brief_id,ep,url,mmss,mb,by,secs,date=sys.argv[1:]
b=json.load(open(f'content/briefs/{brief_id}.json'))
from datetime import date as D
d=D.fromisoformat(date); long=d.strftime('%B %-d, %Y')
content=f'<!-- wp:paragraph -->\n<p>{html.escape(b["summary"])}</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p><em>This episode was re-recorded in Dr. Sowards\' voice for a general training audience and rebuilt from the review originally published {long}. The written brief, with cases, applications, and a knowledge check, is in the Sowards Consulting app.</em></p>\n<!-- /wp:paragraph -->'
payload={"content":content,"meta":{"audio_file":url,"duration":mmss,"filesize":mb,"filesize_raw":by}}
r=subprocess.run(['curl','-sS','-X','POST','-H','Authorization: Basic placeholder','-H','Content-Type: application/json',f'https://sowardsconsulting.com/wp-json/wp/v2/podcast/{ep}','--data-binary',json.dumps(payload)],capture_output=True,text=True)
res=json.loads(r.stdout); print('site episode',res.get('id'),res.get('meta',{}).get('audio_file'),res.get('meta',{}).get('duration'))
eps=json.load(open('content/episodes.json'))
eps=[e for e in eps if e['id']!=date]
cases=[c['name'] for s in b['sections'] for c in s['cases']]
desc=(', '.join(cases[:4])+('.' if cases else ''))
cs=D.fromisoformat(b['coverageStart']); ce=D.fromisoformat(b['coverageEnd'])
title=f"Use of Force Case Law Update: {cs.strftime('%B %-d')} to {ce.strftime('%B %-d, %Y') if cs.month!=ce.month else ce.strftime('%-d, %Y')}"
eps.append({"id":date,"title":title,"date":date,"description":b['summary'],"file":f"{date}-use-of-force-case-law-update.mp3","bytes":int(by),"briefId":brief_id,"audioUrl":url,"durationSeconds":int(secs)})
eps.sort(key=lambda e:e['date'])
json.dump(eps,open('content/episodes.json','w'),indent=2,ensure_ascii=False); open('content/episodes.json','a').write('\n')
print('episodes.json now',len(eps),'entries; added',date,by,'bytes',secs,'s')
PY
