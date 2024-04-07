build: clean
  npm ci
  hugo --minify

clean:
  rm -rf public/

server: clean
  hugo server --buildDrafts
