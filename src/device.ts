/**
 * @package     tplink-cloud-api
 * @author      Alexandre Dumont <adumont@gmail.com>
 * @copyright   (C) 2017 - Alexandre Dumont
 * @license     https://www.gnu.org/licenses/gpl-3.0.txt
 * @link        http://itnerd.space
 */

/* This file is part of tplink-cloud-api.

tplink-cloud-api is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

tplink-cloud-api is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
tplink-cloud-api. If not, see http://www.gnu.org/licenses/. */

import fetch from "cross-fetch";

import tplink from "./tplink";
import {checkError} from "./api-utils";

export interface TPLinkDeviceInfo {
  fwVer: string;
  alias: string;
  status: number;
  deviceId: string;
  role: string;
  deviceMac: string;
  deviceName: string;
  deviceType: string;
  deviceModel: string;
  appServerUrl: string;
}

export default class TPLinkDevice {
  genericType: string;
  device: TPLinkDeviceInfo;
  baseUrl: string;
  private params: any;

  constructor(tpLink: tplink, deviceInfo: TPLinkDeviceInfo, baseUrl: string = 'https://wap.tplinkcloud.com') {
    if (!tpLink) {
      throw new Error("missing required parameter tpLink");
    } else if (!deviceInfo) {
      throw new Error("missing required paramemter deviceInfo");
    } else if (typeof deviceInfo !== "object") {
      throw new Error("invalid type passed for deviceInfo, expected object.");
    }

    this.baseUrl = baseUrl;
    this.device = deviceInfo;
    this.params = {
      appName: "Kasa_Android",
      termID: tpLink.termid,
      appVer: "1.4.4.607",
      ospf: "Android+6.0.1",
      netType: "wifi",
      locale: "es_ES",
      token: tpLink.token
    };
    this.genericType = "device";
  }

  get firmwareVersion() {
    return this.device.fwVer;
  }
  get role() {
    return this.device.role;
  }
  get mac() {
    return this.device.deviceMac;
  }
  get model() {
    return this.device.deviceModel;
  }
  get type() {
    return this.device.deviceType;
  }
  get name() {
    return this.device.deviceName;
  }
  get disconnected() {
    return this.status !== 1;
  }
  get connected() {
    return this.status === 1;
  }
  get status() {
    return this.device.status;
  }
  get humanName() {
    return this.device.alias;
  }
  get alias() {
    return this.device.alias;
  }
  get id() {
    return this.device.deviceId;
  }
  getDeviceId() {
    return this.device.deviceId;
  }
  get appServerUrl() {
    return this.device.appServerUrl;
  }

  async getSystemInfo() {
    const r = await this.passthroughRequest({ system: { get_sysinfo: {} } });
    return r.system.get_sysinfo;
  }

  /* send a device-specific request */
  async tplink_request(command) {
    // TODO remove
    return this.passthroughRequest(command);
  }
  async passthroughRequest(command) {
    const url = `${this.baseUrl}/?${this.encodeQueryData(this.params)}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "cache-control": "no-cache",
        "User-Agent":
          "Dalvik/2.1.0 (Linux; U; Android 6.0.1; A0001 Build/M4B30X)",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        method: "passthrough",
        params: {
          deviceId: this.device.deviceId,
          requestData: JSON.stringify(command)
        }
      }),
    });

    const responseData = await response.json();

    checkError(response, responseData);

    // eg: {"error_code":0,"result":{"responseData":"{\"smartlife.iot.smartbulb.lightingservice\":{\"get_light_state\":{\"on_off\":0,\"dft_on_state\":{\"mode\":\"normal\",\"hue\":0,\"saturation\":0,\"color_temp\":2700,\"brightness\":10},\"err_code\":0}}}"}}
    return responseData &&
      responseData.result &&
      responseData.result.responseData
      ? JSON.parse(responseData.result.responseData)
      : responseData;
  }

  encodeQueryData(data) {
    const ret = [];
    for (const d in data) {
      ret.push(`${encodeURIComponent(d)}=${encodeURIComponent(data[d])}`);
    }
    return ret.join('&');
 }
}
