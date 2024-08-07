---
title: "Watching YouTube in private"
date: 2022-12-10T21:46:55-05:00
lastmod: 2022-12-10T21:46:55-05:00
draft: false
comments: true
tags:
  [
    "invidious",
    "youtube",
    "yewtu.be",
    "tailscale",
    "privacy",
    "self-hosted",
  ]
author: "Dave Gallant"
---

I recently stumbled upon [yewtu.be](https://yewtu.be) and found it intriguing. It not only allows you to watch YouTube without _being on YouTube_, but it also allows you to create an account and subscribe to channels without a Google account. What sort of wizardry is going on under the hood? It turns out that it's a hosted instance of [invidious](https://invidious.io/).

<!--more-->

![image](computerphile.png)

The layout is simple, and **JavaScript is not required**.

I started using [yewtu.be](https://yewtu.be) as my primary client for watching videos. I subscribe to several YouTube channels and I prefer the interface invidiuous provides due to its simplicity. It's also nice to be in control of my search and watch history.

A few days ago, yewtu.be went down briefly, and that motivated me enough to self-host invidious. There are several other hosted instances listed [here](https://docs.invidious.io/instances/), but being able to easily backup my own instance (including subscriptions and watch history) is more compelling in my case.

### Hosting invidious

The quickest way to get invidious up is with docker-compose as mentioned in the [docs](https://docs.invidious.io/installation/).

I made a few modifications, and ended up with:

```yaml
version: "3"
services:
  invidious:
    image: quay.io/invidious/invidious
    restart: unless-stopped
    ports:
      - "0.0.0.0:3000:3000"
    environment:
      INVIDIOUS_CONFIG: |
        db:
          dbname: invidious
          user: kemal
          password: kemal
          host: invidious-db
          port: 5432
        check_tables: true
    healthcheck:
      test: wget -nv --tries=1 --spider http://127.0.0.1:3000/api/v1/comments/jNQXAC9IVRw || exit 1
      interval: 30s
      timeout: 5s
      retries: 2
    depends_on:
      - invidious-db

  invidious-db:
    image: docker.io/library/postgres:14
    restart: unless-stopped
    volumes:
      - postgresdata:/var/lib/postgresql/data
      - ./config/sql:/config/sql
      - ./docker/init-invidious-db.sh:/docker-entrypoint-initdb.d/init-invidious-db.sh
    environment:
      POSTGRES_DB: invidious
      POSTGRES_USER: kemal
      POSTGRES_PASSWORD: kemal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]

volumes:
  postgresdata:
```

After invidious was up and running, I installed [Tailscale](https://tailscale.com/) on it to leverage its MagicDNS, and I'm now able to access this instance from anywhere at [http://invidious:3000/feed/subscriptions](http://invidious:3000/feed/subscriptions).

### Redirecting YouTube links

I figured it would be nice to redirect existing YouTube links that others send me, so that I could seamlessly watch the videos using invidious.

I went looking for a way to redirect paths at the browser level. I found [Redirector](https://github.com/einaregilsson/Redirector), which can be used to modify http requests in the browser. I created the following redirect (exported as json):

```json
{
    "redirects": [
        {
            "description": "youtube to invidious",
            "exampleUrl": "https://www.youtube.com/watch?v=-lz30by8-sU",
            "exampleResult": "http://invidious:3000/watch?v=-lz30by8-sU",
            "error": null,
            "includePattern": "https://*youtube.com/*",
            "excludePattern": "",
            "patternDesc": "Any youtube video should redirect to invidious",
            "redirectUrl": "http://invidious:3000/$2",
            "patternType": "W",
            "processMatches": "noProcessing",
            "disabled": false,
            "grouped": false,
            "appliesTo": [
                "main_frame"
            ]
        }
    ]
}
```

Now the link <https://www.youtube.com/watch?v=-lz30by8-sU> will redirect to [http://invidious:3000/watch?v=-lz30by8-sU](http://invidious:3000/watch?v=-lz30by8-sU)

I'm still looking for ways to improve this invidious setup. There doesn't appear to be a way to stream in 4K yet.
