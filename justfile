build: clean
  npm ci
  hugo --minify

clean:
  rm -rf public/

server:
  hugo server --buildDrafts
