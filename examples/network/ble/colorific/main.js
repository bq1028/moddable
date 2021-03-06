/*
 * Copyright (c) 2016-2018  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */
 /*
 	BLE Colorific Light Bulb
 	https://learn.adafruit.com/reverse-engineering-a-bluetooth-low-energy-light-bulb/overview
	https://www.walmart.com/ip/Star-Tech-Bc090-Colorific-A19-Bluetooth-D67-Controlled-LED-Bulb/46711393
 */

import BLEClient from "bleclient";
import Timer from "timer";
import {uuid} from "btutils";

class Colorific extends BLEClient {
	onReady() {
		this.timer = null;
		this.payload = Uint8Array.of(0x58, 0x01, 0x03, 0x01, 0x10, 0x00, 0xFF, 0xFF, 0xFF);
		this.startScanning();
	}
	onDiscovered(device) {
		if ('RGBLightOne' == device.scanResponse.completeName) {
			this.stopScanning();
			this.connect(device);
		}
	}
	onConnected(device) {
		device.discoverPrimaryService(uuid`1802`);
	}
	onServices(services) {
		if (services.length)
			services[0].discoverCharacteristic(uuid`2A06`);
	}
	onCharacteristics(characteristics) {
		if (characteristics.length) {
			let characteristic = characteristics[0];
			this.timer = Timer.repeat(() => {
				let payload = this.payload;
				payload[6] = Math.floor(Math.random() * 256);
				payload[7] = Math.floor(Math.random() * 256);
				payload[8] = Math.floor(Math.random() * 256);
				characteristic.writeWithoutResponse(payload.buffer);
			}, 100);
		}
	}
	onDisconnected() {
		if (this.timer) {
			Timer.clear(this.timer);
			this.timer = null;
		}
		this.startScanning();
	}
}

let colorific = new Colorific;
