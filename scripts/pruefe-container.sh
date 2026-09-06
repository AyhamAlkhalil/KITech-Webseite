#!/usr/bin/env bash
#
# Prueft die Website so, wie Coolify sie ausliefert: im Container, aus demselben
# Dockerfile. Was hier bricht, bricht auch dort.
#
#     bash scripts/pruefe-container.sh
#
# Warum nicht `npm start`: Wegen `output: "standalone"` startet das nur einen
# Teil dessen, was im Image liegt. Ein Deploy ist erst geprueft, wenn das Image
# geprueft ist.
#
# Warum ein Skript und keine Befehlsliste in der CLAUDE.md: Die Routenliste ist
# Arbeitsanweisung, kein Wissen. Abgetippt wird sie irgendwann unvollstaendig —
# und dann prueft man weniger, als man glaubt.
#
# Gehoert davor, laeuft hier NICHT mit (beides braucht keinen Container):
#     npm run lint && npm test && npm run build

set -euo pipefail

IMAGE=kitech-website-test:local
NAME=kitech-test
PORT=8124
BASIS="http://127.0.0.1:$PORT"

ROUTEN=(
  / /warum /leistungen /solo /enterprise /referenzen /haltung /karriere
  /kontakt /glossar /lass-uns-reden /selbstcheck_eu_ai_act /impressum
  /datenschutz /agb /gratis-wissen /autoren /autoren/ayham-alkhalil
  /gratis-wissen/rss.xml /gratis-wissen/thema/ki-strategie /llms.txt
  /images/og/standard.png /glossar/ki-audit /sitemap.xml
)
# Muss 404 liefern. Eine Website, die auf alles 200 sagt, hat keine 404-Seite.
ROUTE_404=/gibt-es-nicht

aufraeumen() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  docker rmi "$IMAGE" >/dev/null 2>&1 || true
}
trap aufraeumen EXIT

echo "-- Image bauen ---------------------------------------------------------"
docker build -t "$IMAGE" .

echo
echo "-- Container starten ---------------------------------------------------"
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" -p "$PORT:3000" "$IMAGE" >/dev/null

# Warten statt raten: Ein festes sleep ist entweder zu kurz (Fehlalarm) oder zu
# lang (jedes Mal). 60 Sekunden Frist reichen fuer den kalten Start.
for _ in $(seq 1 60); do
  curl -sf -o /dev/null "$BASIS/" && break
  sleep 1
done

echo
echo "-- Seitenabruf ---------------------------------------------------------"
fehler=0
for pfad in "${ROUTEN[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASIS$pfad")
  printf "%-40s %s" "$pfad" "$code"
  if [ "$code" != "200" ]; then printf "   <- erwartet 200"; fehler=$((fehler + 1)); fi
  printf "\n"
done

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASIS$ROUTE_404")
printf "%-40s %s" "$ROUTE_404" "$code"
if [ "$code" != "404" ]; then printf "   <- erwartet 404"; fehler=$((fehler + 1)); fi
printf "\n"

echo
echo "-- JSON-LD im ausgelieferten HTML --------------------------------------"
node scripts/pruefe-jsonld.mjs "$BASIS" || fehler=$((fehler + 1))

echo
if [ "$fehler" -eq 0 ]; then
  echo "Alles in Ordnung - dieses Image kann ausgeliefert werden."
else
  echo "$fehler Befund(e). NICHT ausliefern."
fi
exit "$fehler"
