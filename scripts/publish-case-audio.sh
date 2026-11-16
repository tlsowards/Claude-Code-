#!/usr/bin/env bash
# Usage: scripts/publish-case-audio.sh <case id> [more ids...]
# Uploads a rendered Case library narration (audio-out/case-<id>-tim.mp3, from
# scripts/make-audio-elevenlabs.mjs --case) to the website's media library and records the URL, length,
# and size in content/cases/<id>.json under "audio". Needs ffprobe and a WordPress application password
# (proxy-injected in a Claude cloud session).
set -euo pipefail
cd "$(dirname "$0")/.."
AUTH="Authorization: Basic placeholder"; S=https://sowardsconsulting.com/wp-json
for ID in "$@"; do
  F="audio-out/case-$ID-tim.mp3"
  [ -f "$F" ] || { echo "$ID: $F not found; render it first" >&2; exit 1; }
  BYTES=$(stat -c %s "$F"); DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"); SECS=$(python3 -c "print(round($DUR))")
  URL=$(curl -sS --max-time 600 -X POST -H "$AUTH" -H "Content-Type: audio/mpeg" -H "Content-Disposition: attachment; filename=case-$ID.mp3" --data-binary @"$F" "$S/wp/v2/media" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['source_url'])")
  python3 - "$ID" "$URL" "$SECS" "$BYTES" <<'PY'
import json,sys
cid,url,secs,by=sys.argv[1:]
p=f'content/cases/{cid}.json'; d=json.load(open(p))
d['audio']={'url':url,'durationSeconds':int(secs),'bytes':int(by)}
json.dump(d,open(p,'w'),indent=2,ensure_ascii=False); open(p,'a').write('\n')
print(cid, url, f'{int(secs)//60}:{int(secs)%60:02d}', by, 'bytes')
PY
done
