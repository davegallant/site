build: clean
  npm ci
  hugo --minify

clean:
  rm -rf public/

server: clean
  npm ci
  hugo server --buildDrafts
