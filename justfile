# Install dependencies (run once, or when package.json changes)
setup:
  npm ci

build: clean
  hugo --minify

# Run all linters (prettier, eslint, stylelint)
lint:
  npx prettier --check .
  npx eslint assets/js/dark-mode.js assets/js/prism.js assets/js/menu.js
  npx stylelint "assets/css/src/*.css"

clean:
  rm -rf public/

server:
  hugo server --buildDrafts --bind 0.0.0.0
