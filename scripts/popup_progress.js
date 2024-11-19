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

export { updateProgress, updateDailyProgress, resetProgress }
import { alarmExists } from "./alarms.js";

/*****************************************************************************/

//  @num:  (integer) sessions remaining until long break; can be null value
const updateBreakText = (num = null) => {
  const text = document.getElementById("nextsessiontrack");
  if (!num) {
      text.innerText = "Enjoy the break!";
      return;
  }
  text.innerText = "Long break in " + (num > 1 ? `${num} sessions` : "1 session");
}

/*****************************************************************************/

//  @intervalLength:  (number) long break interval
const updateProgress = async (intervalLength = null) => {
  if (!intervalLength) {
    const storage = await chrome.storage.local.get("timerinterval");
    intervalLength = storage.timerinterval;
  }
  const progressBar = document.getElementById("currentprogress");
  const sessionStorage = await chrome.storage.local.get("timercount");
  if (!sessionStorage.timercount) sessionStorage.timercount = 0;
  const alarm = await alarmExists();
  if (!alarm) {
    progressBar.style.width = "0%";
    updateBreakText(intervalLength);
    return;
  }
  if (alarm.name == "longbreaktimer") {
    progressBar.style.width = "100%";
    updateBreakText();
    return;
  }
  const progress = ((sessionStorage.timercount % intervalLength) / intervalLength) * 100;
  progressBar.style.width = `${progress}%`;
  updateBreakText(intervalLength - (sessionStorage.timercount % intervalLength));
}

/*****************************************************************************/

const updateDailyProgress = async () => {
  const progressbar = document.getElementById("dailyprogress");
  const storage = await chrome.storage.local.get(["dailyprogress", "goal", "dailyshortbreaks", "dailylongbreaks", "dailysessions", "dailystreak", "dailytasks"]);
  for (const stat of ["dailyshortbreaks", "dailylongbreaks", "dailysessions", "dailystreak", "dailytasks"]) {
    const statElement = document.getElementById(stat);
    if (!storage[stat]) storage[stat] = 0;
    if (storage[stat] > 99999) storage[stat] = 99999;
    statElement.innerHTML = storage[stat];
  }


  if (!storage.dailyprogress)
    storage.dailyprogress = 0;

  progressbar.style.width = `${storage.dailyprogress > storage.goal ? 100 : storage.dailyprogress / storage.goal * 100}%`;
}

/*****************************************************************************/

//  @settings  (object) list of progress and values
const resetProgress = async (progress) => {
  for (const stat in progress) {
    console.log("reset: " + stat);
    const statElement = document.getElementById(stat);
    if (stat == "dailyprogress")
      statElement.style.width = `0`;
    else
      statElement.innerHTML = 0;
    
  }
}

/*****************************************************************************/
