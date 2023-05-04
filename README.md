# node-red-contrib-wled-notification

A Node-RED node for visual notification effects with [WLED](https://kno.wled.ge/) lights. It is inspired by notification effects of smart bulbs (e.g., Tradfri, Hue) and can be used for home automation or any other use case where visual notification signals are desired.

Watch the [demo video](https://youtu.be/AdlwtjTB3xg) to see an example use case with [Home Assistant](https://www.home-assistant.io/) in action.

This node uses WLED's [UDP Realtime protocol](https://kno.wled.ge/interfaces/udp-realtime/) to display notification effects. Whatever WLED currently displays is temporarily replaced by the notification effect and continued afterward. This protocol does not change any WLED settings and therefore does not introduce edge cases in state handling (WLED settings can be safely changed during a notification effect).

## Installation

To install this node, follow the instructions in the [Node-RED documentation](https://nodered.org/docs/user-guide/runtime/adding-nodes) (use the `Manage palette` feature or run `npm install node-red-contrib-wled-notification` in your Node-RED user directory).

## Getting Started

Add the `WLED Notification` node from the network category to your flow and configure the WLED host. All other settings have reasonable defaults. See [examples](examples/examples.md) for inspiration.

## Effects

The node currently comes with a single customizable effect `Blink` which starts with black, then smoothly fades to a configured `effectColor`, then smoothly fades out again. The speed/duration can be controlled by `effectFrequency` (`1` Hz means that the fade-in-out sequence takes one second), and the number of fade sequences can be controlled by `effectCycles` (`3` means that the fade-in-out is repeated three times, amounting to 3 seconds duration at 1 Hz of the full effect).

Effects can be displayed on subsections of LED strips by setting `ledStart` and `ledCount` accordingly. This even allows to display multiple effect configurations in parallel on the same strip.

## Advanced Use

- All settings can be overridden by the input message, see the documentation within the Node-RED UI for details.
- The node outputs the received message that triggered the notification effect after the effect has finished.
- Subsequent messages received during an ongoing notification effect are discarded to avoid overlapping effects. From a user perspective, if two notifications happen within a very short time, it is sufficient to display a single visual notification to the user. This approach fails with different effects that carry different meanings, and it is yet to be determined whether queueing the effects makes sense.
- It does not override other realtime effects that use the same protocol (e.g., Hyperion, Prismatik ambilight). Multiple active realtime effects interfere with each other and should best be avoided.

## Contributing

This project welcomes pull requests. To contribute, please fork this repository, make your changes, and submit a pull request. Please ensure that your PR adheres to the project's standards.

- Write PR title in [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) format.
- Add a concise PR description.
- Add tests that cover 100% of the changed/added code.
  - Exceptions are allowed. Use [skip comments](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md) to exclude code from coverage.

## License

This project is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
