build: clean
  npm ci
  hugo --minify

clean:
  rm -rf public/

server: clean
  npm ci
  hugo server --buildDrafts --bind 0.0.0.0
