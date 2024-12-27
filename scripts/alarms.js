/******************************************************************************
  Gala - A study timer built into your browser
  Copyright (C) 2023-Present  Kirjh

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
******************************************************************************/

export { alarmList, alarmExists, clearAlarm, createAlarm, startSession, pauseSession, resumeSession, increaseAlarmLength };
import { sendMessage } from "./background_functions.js";
import { createAlert } from "./popup_handler.js";

const alarmList = {
  timeInputs: ["worktimer", "breaktimer", "longbreaktimer", "timerinterval", "goal"]
}

/*****************************************************************************/

// Returns: alarm or null
const alarmExists = async () => {
  for (const alarm of alarmList.timeInputs) {
    let activeAlarm = await chrome.alarms.get(alarm);
    if (activeAlarm) return activeAlarm;
  }
  const storage = await chrome.storage.local.get(["paused", "activeAlarm"]);
  if (storage.paused && storage.activeAlarm) {
    // Alarms in storage must be reconverted to unix to ensure
    // compatibility with other functions
    storage.activeAlarm.scheduledTime += Date.now();
    return storage.activeAlarm;
  }
  return null;
}

/*****************************************************************************/

const startSession = async () => {
  console.log("creating timer");
  const time = await chrome.storage.local.get(["worktimer"]);
  chrome.storage.local.set({currentAlarm: time.worktimer, paused: false});

  createAlarm("worktimer", parseInt(time.worktimer));
  return time.worktimer;
}

/*****************************************************************************/

//  @alarm  (object) alarm
const clearAlarm = async (alarm=null) => {
  console.log("clearing timers");
  if (alarm) {
    chrome.alarms.clear(alarm.name);
    return;
  }
  // If @alarm is not specified all alarms will be cleared instead.
  await chrome.alarms.clear("worktimer");
  await chrome.alarms.clear("breaktimer");
  await chrome.alarms.clear("longbreaktimer");
}

/*****************************************************************************/

//  @name  (string) name of alarm. Must be either of: 
//                    ["worktimer", "breaktimer", "longbreaktimer"]
//  @time  (number) length of alarm
const createAlarm = async (name, time) => {
  await chrome.alarms.create(name, {delayInMinutes: time});
  console.log(`created alarm "${name}" with a delay of (${time}) minutes`);
  sendMessage("disableOverride", "true");
}

/*****************************************************************************/

const pauseSession = async() => {
  console.log("pausing alarms");
  const alarm = await alarmExists();
  if (!alarm) return;
  
  clearAlarm();


  // Convert unix time to time in milliseconds
  alarm.scheduledTime -= Date.now();

  await chrome.storage.local.set({paused: true, activeAlarm: alarm});
  return null;
} 

/*****************************************************************************/

const resumeSession = async() => {
  console.log("resuming alarms");
  const storage = await chrome.storage.local.get(["activeAlarm"]);

  if (storage.activeAlarm.scheduledTime < 60000) storage.activeAlarm.scheduledTime = 60000;

  createAlarm(storage.activeAlarm.name, storage.activeAlarm.scheduledTime/60000);

  storage.activeAlarm.new = false;
  await chrome.storage.local.set({paused: false, activeAlarm: storage.activeAlarm});
  return null;
}

/*****************************************************************************/

// Chrome API does not allow changes to be made to alarms, so
// the original alarm must be deleted and replaced with a new alarm.
const increaseAlarmLength = async () => {
  const alarm = await alarmExists();
  const alarmLength = await chrome.storage.local.get("currentAlarm").then((r) => {return r.currentAlarm});

  if (!alarm || alarm.paused) {
    createAlert("Cannot adjust time when there are no active sessions");
    return;
  }

  let time = (alarm.scheduledTime-Date.now());
  await chrome.alarms.clear(alarm.name);
  
  if (time + 60000 < alarmLength * 60000) {
    time += 60000
  } else {
    createAlert("Cannot adjust time past the session's original length");
  }
  if (time < 60000) time = 60000;

  createAlarm(alarm.name, time/60000)
}

/*****************************************************************************/