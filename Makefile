SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

ifeq ($(origin .RECIPEPREFIX), undefined)
  $(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >

## server: run server locally on port 1313
server:
> hugo server -D

## deploy: deploy the website to github pages
deploy:
> @echo -e "\033[0;32mDeploying updates to GitHub...\033[0m"
> hugo -t xmin
> cd public || exit; \
	git add .; \
	msg="rebuilding site $$(date)"; \
	git commit -m "$$msg"; \
	git push origin main; \
	cd .. || exit;

## help: Print this help message
help:
> @echo
> @echo "Usage:"
> @echo
> @sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /' | sort
> @echo
.PHONY: help
