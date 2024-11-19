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

export { getTimeFromStorage, updateTime, getDate, setDate };

import { alarmList, alarmExists } from "./alarms.js";

/*****************************************************************************/

// Returns: Object containing alarm lengths
const getTimeFromStorage = async () => {
  const keyArray = alarmList.timeInputs;
  let storage = await chrome.storage.local.get(keyArray);

  for (const key of keyArray) {
    if (!storage[key]) {
      const value = document.getElementById(key).value;
      chrome.storage.local.set({[key] : +value});
      storage[key] = value;
    }
  }

  return storage;
}

/*****************************************************************************/

// Chrome API returns the remaining time of an active alarm as unix 
// epoch time, which is a specific time in the future. It must be 
// converted into minutes remaining by subtracting Date.now()
const updateTime = async () => {
  const timeDisplay = document.getElementById("timeDisplay");
  const storage = await chrome.storage.local.get("currentAlarm");
  const alarm = await alarmExists();

  const svghand = document.getElementById("svghand");
  const svghandborder = document.getElementById("svghandborder");
  
  let time;
  let circumference = svghand.r.baseVal.value * 2 * Math.PI;

  // If an active alarm does not exist, display current value of 
  // the worktimer setting.
  if (!alarm) {
    timeDisplay.innerHTML = (!document.getElementById("worktimer").value) ? 0 : document.getElementById("worktimer").value;
    svghand.style.strokeDasharray = `${circumference} ${circumference}`;
    svghand.style.strokeDashoffset = `${circumference}`;
    svghandborder.style.strokeDasharray = `${circumference} ${circumference}`;
    svghandborder.style.strokeDashoffset = `${circumference}`;
    return;
  }

  time = (alarm.scheduledTime-Date.now())/60000;

  if (!storage.currentAlarm) storage.currentAlarm = time;
  if (time > storage.currentAlarm) time = storage.currentAlarm;

  let offset = circumference - (1- time / storage.currentAlarm) * circumference;

  timeDisplay.innerHTML = Math.ceil(time);
  svghand.style.setProperty("stroke-dashoffset", offset);
  svghandborder.style.setProperty("stroke-dashoffset", offset);
  //console.log(`((360/[${storage.currentAlarm}])*[${time}] = ${((360/storage.currentAlarm)*time)}`)
  return;
}

/*****************************************************************************/

//  Returns: integer time expressed as YYYYMMDD
const getDate = () => {
  let date = new Date();
  let formatteddate = date.getFullYear().toString() + 
                      ((date.getMonth()+1) < 10 ? "0" : "") + (date.getMonth()+1).toString() +
                      (date.getDate() < 10 ? "0" : "") + date.getDate().toString();
  return +formatteddate;
}

/*****************************************************************************/

//  @date: (integer) time expressed as YYYYMMDD
const setDate = async (date) => {
  chrome.storage.local.set({lastsaveddate: date});
}