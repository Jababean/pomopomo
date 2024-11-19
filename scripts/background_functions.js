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

import { getDate, setDate } from "./time.js";
export { sendMessage, countSessions, setTheme, setCounter, toggleAuto, checkDate, increaseDailyProgress, updateStats, addTask, closeTask, completeTask, resetSettings, resetProgress };

/*****************************************************************************/

//  @func   (string) function name
//  @param  (object) parameters
const sendMessage = (func, param) => {
  chrome.runtime.sendMessage({frontendRequest: func, param: param})
      .catch((e) => {console.log(`[${e}]\n Likely popup is not active`)});
}

/*****************************************************************************/

//  @alarm  (object) alarm
//
//  Returns: true if interval divides count cleanly, false otherwise
const countSessions = async (alarm) => {
  const storage = await chrome.storage.local.get(["timerinterval", "timercount"]);
  
  if (!storage.timercount) storage.timercount = 0;
  storage.timercount += 1;

  await setCounter(storage.timercount);

  if (storage.timercount % storage.timerinterval == 0) return true;
  return false;
}


/*****************************************************************************/

const setTheme = async () => {
    const storage = await chrome.storage.local.get("theme");
  
    if (storage.theme == "dark") {
      chrome.storage.local.set({theme: "light"});
      return true;
    } else {
      chrome.storage.local.set({theme: "dark"});
      return false;
    }
  }
  
/*****************************************************************************/
  
//  @sessions:  (number) number of sessions elapsed
const setCounter = async (sessions) => {
  await chrome.storage.local.set({timercount: sessions});
  return null;
}

/*****************************************************************************/

const toggleAuto = async () => {
  const storage = await chrome.storage.local.get(["toggleauto"]);
  let updatedValue = storage.toggleauto ? false : true;
  chrome.storage.local.set({toggleauto: updatedValue});
  return updatedValue;
}

/*****************************************************************************/

const checkDate = async () => {
  const storage = await chrome.storage.local.get(["lastsaveddate", "lastdailystreak"]);
  const date = getDate();
  await setDate(date);
  if (!storage.lastdailystreak) storage.lastdailystreak = 0;

  if (date == storage.lastsaveddate) return false;
  if (date - storage.lastdailystreak > 1) await chrome.storage.local.set({dailystreak : 0});

  await chrome.storage.local.set({dailyprogress : 0, dailysessions : 0, dailyshortbreaks : 0, dailylongbreaks : 0, dailytasks : 0});
  return true;
}

/*****************************************************************************/

const increaseDailyProgress = async () => {
  const storage = await chrome.storage.local.get(["lastdailystreak", "dailyprogress", "goal", "dailystreak"]);
  const date = getDate();
  if (!storage.lastdailystreak)
    storage.lastdailystreak = date-1;
  console.log("DATE" + (date - 1));
  if (!storage.dailyprogress)
    storage.dailyprogress = 0;
  if (!storage.dailystreak)
    storage.dailystreak = 0;
  
  storage.dailyprogress++;
  await chrome.storage.local.set({dailyprogress : storage.dailyprogress});

  storage.dailystreak++;

  if (storage.dailyprogress >= storage.goal && date - storage.lastdailystreak >= 1) {
    console.log("yeehaw" + (storage.dailystreak) + "/" + date)
    await chrome.storage.local.set({dailystreak : storage.dailystreak, lastdailystreak : date});
  }

  sendMessage("checkDate");
}

/*****************************************************************************/

//  @alarm:  (string) name of alarm
const updateStats = async (alarm) => {
  let stat;
  switch (alarm) {
    case "breaktimer":
      stat = "dailyshortbreaks";
      break;
    case "longbreaktimer":
      stat = "dailylongbreaks";
      break;
    default:
      stat = "dailysessions";
      break;
  }
  const storage = await chrome.storage.local.get([stat]);
  if (!storage[stat]) storage[stat] = 0;
  storage[stat]++;

  await chrome.storage.local.set({[stat] : storage[stat]})
  sendMessage("checkDate");
}

/*****************************************************************************/

// @text  (string) text input given by user
const addTask = async (text) => {
  const storage = await chrome.storage.local.get("tasks");
  const guid = Date.now().toString();

  if (!storage.tasks) storage.tasks = {};

  storage.tasks[guid] = {
    text: text,
    guid: guid,
    complete: false
  };

  await chrome.storage.local.set({tasks: storage.tasks});
  sendMessage("countTasks", Object.keys(storage.tasks).length);
  return storage.tasks[guid];
}

/*****************************************************************************/

// @guid  (string) id of task item
const closeTask = async (guid) => {
  const storage = await chrome.storage.local.get("tasks");

  delete storage.tasks[guid]

  await chrome.storage.local.set({tasks: storage.tasks});
  sendMessage("countTasks", Object.keys(storage.tasks).length);
  return guid;
}

/*****************************************************************************/

// @guid  (string) id of task item
const completeTask = async (guid) => {
  const storage = await chrome.storage.local.get(["tasks", "dailytasks"]);
  if (!storage.dailytasks) storage.dailytasks = 0;

  if (storage.tasks[guid].complete) {
    storage.tasks[guid].complete = false;
    storage.dailytasks = storage.dailytasks > 0 ? storage.dailytasks - 1 : 0;
    console.log(storage.dailytasks + " reduced");
  } else {
    storage.tasks[guid].complete = true;
    storage.dailytasks++;
  }

  await chrome.storage.local.set({tasks: storage.tasks, dailytasks: storage.dailytasks});
  sendMessage("checkDate");

  return {complete: storage.tasks[guid].complete, guid: guid};
}

/*****************************************************************************/

const resetSettings = async () => {
  const settings = {
    worktimer: 25,
    breaktimer: 5,
    longbreaktimer: 15,
    timerinterval: 4,
    goal: 4
  }
  await chrome.storage.local.set(settings);
  return settings;
}

/*****************************************************************************/

const resetProgress = async () => {
  const progress = {
    dailylongbreaks: 0,
    dailyshortbreaks: 0,
    dailysessions: 0,
    dailyprogress: 0,
    dailytasks: 0,
    dailystreak: 0
  }
  await chrome.storage.local.set(progress);
  console.log("e");
  return progress;
}

/*****************************************************************************/