---
title: "Using Home Assistant and Grafana to Track Radon"
date: "2026-03-25T20:22:39-04:00"
draft: true
comments: true
toc: false
tags:
  [
    "radon",
    "grafana",
    "home-assistant",
    "homelab",
    "tailscale",
  ]
author: "Dave Gallant"
---

Radon is a radioactive gas that can be found in homes, and at high levels and persistent exposure, can be [extremely dangerous to breathe in](https://www.youtube.com/watch?v=PLYMBdJ5SvI). Radon gas comes from the natural decay of uranium in soil and rock, and it can seep into homes through cracks in the foundation, and can even permetate through concrete. It is important to monitor radon levels in your home, especially if you live in an area with high levels of radon. I recently became more concerned about radon since I live and work in a basement daily. I decided to explore some ways to, not only monitor radon levels, but also hook up the metrics to my existing homelab.

<!--more-->

## Home Assistant

My first thought was to try to plug into an ecosystem that is already robust. [Home Assistant](https://www.home-assistant.io/) is an open-source home automation platform that allows you to monitor and control various aspects of your home. It supports a wide range of sensors and devices, including radon detectors. By integrating sensors with Home Assistant, it is easy to monitor radon levels in your home and receive alerts if they exceed safe thresholds.

Of course, the first step is to get actual hardware that is designed to detect radon. I went with the [Airthings 325 Corentium Home 2](https://www.airthings.com/en-ca/corentium-home-2-ca), which is the sequel to a well-trusted radon detector. It has a built-in display that shows the current radon levels, and it also has Bluetooth connectivity, which could unlock the ability share metrics with Home Assistant. I was skeptical at first if this could work without having to integrate with a cloud subscription, but it turns out that Home Assistant has a [built-in integration](https://www.home-assistant.io/integrations/airthings_ble/) that can pull in the radon levels and other metrics from the device, and `Corentium Home 2` is on the list of supported devices!

Installing home assistant is straightforward. In my case, I installed it on Proxmox, using [this community script](https://community-scripts.org/scripts/haos-vm).

```
__  __                        ___              _      __              __     ____  _____
/ / / /___  ____ ___  ___     /   |  __________(_)____/ /_____ _____  / /_   / __ \/ ___/
/ /_/ / __ \/ __ `__ \/ _ \   / /| | / ___/ ___/ / ___/ __/ __ `/ __ \/ __/  / / / /\__ \
/ __  / /_/ / / / / / /  __/  / ___ |(__  |__  ) (__  ) /_/ /_/ / / / / /_   / /_/ /___/ /
/_/ /_/\____/_/ /_/ /_/\___/  /_/  |_/____/____/_/____/\__/\__,_/_/ /_/\__/   \____//____/
```

After installing home assistant and passing through my bluetooth dongle to the VM, I was able to add the Airthings BLE integration and start to see metrics in the home assistant web ui:

[![Home Assistant Airthings Integration](./home-assistant-airthings-ble.png)](./home-assistant-airthings-ble.png)

## InfluxDB

Okay, so I have a view of the sensor data in Airthings BE integration in HA (Home Assistant), how do I export these metrics as  time series data and integrate with grafana? I explored a few options: prometheus, influxdb, and [statistics](https://www.home-assistant.io/integrations/statistics/). I went with InfluxDB since it is a popular time series database that has good support for home assistant and grafana.

For simplicity's sake, I installed it using [InfluxDB Community Addon](https://github.com/hassio-addons/addon-influxdb).

After installing the addon, I had to configure Home Assistant to send the metrics to InfluxDB. This is done by adding the following configuration to the `configuration.yaml` file:

```yaml
influxdb:
  include:
    entities:
      - sensor.corentium_home_2_019191_radon_1_day_average
      - sensor.corentium_home_2_019191_radon_longterm_average
      - sensor.corentium_home_2_019191_temperature
      - sensor.corentium_home_2_019191_humidity
      - sensor.corentium_home_2_019191_battery
```

I restarted HA but was unable to see any metrics in InfluxDB. After some troubleshooting, I realized that I had to create a database and then configure HA to use that database. I created a database called `homeassistant` and created a new user with appropriate permissions to this database. I can now see the metrics in InfluxDB, and I can query them using the InfluxDB web interface:

[![InfluxDB Web Interface](./home-assistant-influxdb.png)](./home-assistant-influxdb.png)

## Grafana Dashboard

It's nice to be able to visualize the data in InfluxDB, but I want to be able to create custom dashboards and alerts. Grafana's alerting is powerful. It's also easy to setup notifications via Slack, email, PagerDuty, etc. when radon spikes above a threshold.

After exposing both grafana and homeassistant to my [tailnet](https://tailscale.com/docs/concepts/tailnet), I added InfluxDB as a datasource in Grafana and created a dashboard to visualize the radon levels over time:

[![Grafana Dashboard](./home-assistant-grafana-dashboard.png)](./home-assistant-grafana-dashboard.png)

The json export of the graph is the following:

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "panels": [
    {
      "datasource": {
        "type": "influxdb",
        "uid": "${datasource}"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "barWidthFactor": 0.6,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "insertNulls": false,
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "showValues": false,
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": 0
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 24,
        "x": 0,
        "y": 0
      },
      "id": 3,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "hideZeros": false,
          "mode": "single",
          "sort": "none"
        }
      },
      "pluginVersion": "12.4.1",
      "targets": [
        {
          "datasource": {
            "type": "influxdb",
            "uid": "${datasource}"
          },
          "query": "SELECT mean(\"value\") FROM \"Bq/m³\" \nWHERE \"entity_id\" = '${entity_id_prefix}_radon_1_day_average' \nAND $timeFilter \nGROUP BY time($__interval) fill(previous)",
          "rawQuery": true,
          "refId": "A",
          "resultFormat": "time_series"
        }
      ],
      "title": "Radon (Bq/m³)",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "influxdb",
        "uid": "${datasource}"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "barWidthFactor": 0.6,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "insertNulls": false,
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "showValues": false,
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": 0
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 24,
        "x": 0,
        "y": 9
      },
      "id": 2,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "hideZeros": false,
          "mode": "single",
          "sort": "none"
        }
      },
      "pluginVersion": "12.4.1",
      "targets": [
        {
          "datasource": {
            "type": "influxdb",
            "uid": "${datasource}"
          },
          "query": "SELECT mean(\"value\") FROM \"%\" \nWHERE \"entity_id\" = '${entity_id_prefix}_humidity' \nAND $timeFilter \nGROUP BY time($__interval) fill(previous)",
          "rawQuery": true,
          "refId": "A",
          "resultFormat": "time_series"
        }
      ],
      "title": "Humidity (%)",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "influxdb",
        "uid": "${datasource}"
      },
      "description": "In Celsius",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "barWidthFactor": 0.6,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "insertNulls": false,
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "showValues": false,
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": 0
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 24,
        "x": 0,
        "y": 17
      },
      "id": 1,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "hideZeros": false,
          "mode": "single",
          "sort": "none"
        }
      },
      "pluginVersion": "12.4.1",
      "targets": [
        {
          "datasource": {
            "type": "influxdb",
            "uid": "${datasource}"
          },
          "query": "SELECT mean(\"value\") FROM \"°C\" \nWHERE \"entity_id\" = '${entity_id_prefix}_temperature' \nAND $timeFilter \nGROUP BY time($__interval) fill(previous)",
          "rawQuery": true,
          "refId": "A",
          "resultFormat": "time_series"
        }
      ],
      "title": "Temperature (°C)",
      "type": "timeseries"
    }
  ],
  "preload": false,
  "schemaVersion": 42,
  "tags": [],
  "templating": {
    "list": [
      {
        "current": {},
        "hide": 0,
        "includeAll": false,
        "multi": false,
        "name": "datasource",
        "options": [],
        "query": "influxdb",
        "refresh": 1,
        "type": "datasource",
        "label": "InfluxDB Datasource"
      },
      {
        "current": {
          "selected": false,
          "text": "corentium_home_2_019191",
          "value": "corentium_home_2_019191"
        },
        "hide": 0,
        "label": "Entity ID Prefix",
        "name": "entity_id_prefix",
        "options": [
          {
            "selected": true,
            "text": "corentium_home_2_019191",
            "value": "corentium_home_2_019191"
          }
        ],
        "query": "corentium_home_2_019191",
        "type": "textbox"
      }
    ]
  },
  "time": {
    "from": "now-12h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "browser",
  "title": "Airthings 325 Corentium Home 2",
  "uid": "adpwdbm",
  "version": 9,
  "weekStart": ""
}
```

## Grafana Alerts

Now that the dashboard is setup, I would prefer to setup an alerting rule to notify me when radon levels spike above a certain threshold.

Make sure before you setup an alert, you create a [contact point](https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/contact-points/). I chose a web hook that sends to a [gotify](https://gotify.net/) instance that I have running in my homelab, since I prefer this over email.

I setup an alert such that if the radon levels exceed 100 Bq/m³, I get a notification:

[![Grafana Alerting](./home-assistant-grafana-alert.png)](./home-assistant-grafana-alert.png)

I modifed this to a lower threshold temporarily to simulate an alert, and it worked!

[![Grafana Alert Notification](./home-assistant-gotify.png)](./home-assistant-gotify.png)
