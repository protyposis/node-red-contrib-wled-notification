# WLED Notification example flows

## Home Assistant: Notify on service calls

Triggers the WLED notification by a service call in Home Assistant.

<div align="center">
	<img width="360" src="ha-example-flow.png">
</div>

This example specifically listens to calls of HA's notification service (e.g., `notify.my_phone`) to trigger a WLED notification, but it can be easily customized to trigger on other service calls by adjusting the filter in the `events` node. Watch the [video demonstration](https://youtu.be/AdlwtjTB3xg) of WLED displaying a notification effect when Home Assistant sends a notification to a phone.

- [Example flow (JSON)](../examples/Home%20Assistant%20service%20notifications.json)
