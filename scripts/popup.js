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

import { alarmExists } from "./alarms.js";
import { getTimeFromStorage, updateTime } from "./time.js";
import { toggleHandler, toggleTools, sendMessage, menuHandler, resetHandler, overrideHandler } from "./popup_handler.js";
import { changeTheme, toggleAuto, updateInput, inputChange, resetSettings, toggleAdvanced } from "./popup_settings.js";
import { changeButtonColour, togglePrimaryButton, toggleStopButton, disableOverride } from "./popup_button.js";
import JSON from '../manifest.json' with {type: 'json'};
import { updateProgress, updateDailyProgress, resetProgress } from "./popup_progress.js";
import { countTasks, createTask, addTask, closeTask, completeTask, updateTasks } from "./popup_tasks.js";

/*****************************************************************************/

const runFrontend = {
  startTimer: (param) => {togglePrimaryButton("start");},
  resumeTimer: (param) => {togglePrimaryButton("resume");},
  pauseTimer: (param) => {togglePrimaryButton("pause");},
  
  stopTimer: (param) => {toggleStopButton();},

  changeButtonColour: (param) => {changeButtonColour(param);},
  setCounter: (param) => {updateProgress()},
  updateProgress: (param) => {updateProgress(param);},
  updateInput: (param) => {updateInput(param.key, param.value);},
  theme: (param) => {changeTheme(param);},
  toggleauto: (param) => {toggleAuto(param);},
  checkDate: (param) => {updateDailyProgress()},
  disableOverride: async (param) => {disableOverride(param)},

  addTask: (param) => {addTask(param);},
  closeTask: (param) => {closeTask(param);},
  completeTask: (param) => {completeTask(param);},
  countTasks: (param) => {countTasks(param);},

  resetSettings: async (param) => {resetSettings(param);},
  resetProgress: async (param) => {resetProgress(param);},

  overrideAlarm: async (param) => {},
  toggleAdvanced: async (param) => {toggleAdvanced(param);}
}

/*****************************************************************************/

// Call when the extension is opened, and initializes everything the 
// popup needs to work correctly.
document.addEventListener('DOMContentLoaded', async () => {
  const primaryButton = document.getElementsByClassName("alarmbutton")[0];
  const stopButton = document.getElementsByClassName("stopbutton")[0];
  const inputList = document.getElementsByClassName("timeinput");
  const resetList = document.getElementsByClassName("resetbutton");
  const overrideList = document.getElementsByClassName("settimer");
  const toggleButtonList = document.getElementsByClassName("darktoolicon");
  const toggleSettingList = document.getElementsByClassName("togglesettings");
  const versionLinks = document.getElementsByClassName("githublink");
  const header = document.getElementById("toolbutton");
  const taskInput = document.getElementById("createtask");

  //const borderElements = document.getElementsByClassName("lightborder");

  // Update version
  for (const link of versionLinks) {
    link.innerHTML = JSON.version;
  }

  // Retrive data from storage
  const storedTime = await getTimeFromStorage();
  const storage = await chrome.storage.local.get(["advanced", "theme", "toggleauto", "paused"]);

  const alarm = await alarmExists();
  
  // Initialize active/inactive state
  if (alarm) {
    if (!alarm.new) disableOverride("true");
    primaryButton.id = (storage.paused) ? "pause" : "start";
    changeButtonColour(alarm.name);
  } else {
    disableOverride("false");
    changeButtonColour("worktimer");
  }
  if (storage.theme && storage.theme == "dark")
    changeTheme(false);
  if (storage.toggleauto)
    toggleAuto(true);
  if (storage.advanced)
    toggleAdvanced(true);

  togglePrimaryButton(primaryButton.id);
  updateTime();
  setInterval(updateTime, 1000);
  updateProgress();
  updateDailyProgress();
  updateTasks();
  sendMessage("checkDate");

  // Listeners
  header.addEventListener('click', ()=> {toggleTools();});

  primaryButton.addEventListener('click', () => {sendMessage(`${primaryButton.id}Timer`)});
  stopButton.addEventListener('click', () => {sendMessage(`stopTimer`)});
  for (const button of overrideList) {
    button.addEventListener('click', ()=> {overrideHandler(button);});
  }
  for (const button of toggleButtonList) {
    button.addEventListener('click', ()=> {menuHandler(button);});
  }
  for (const button of toggleSettingList) {
    button.addEventListener('click', async ()=> {toggleHandler(button);});
  }
  for (const button of resetList) {
    button.addEventListener('mouseleave', function () {this.classList.remove("confirmreset")});
    button.addEventListener('click', async ()=> {resetHandler(button);});
    
  }
  for (const input of inputList) {
    document.getElementById(input.id).value = storedTime[input.id];
    input.addEventListener('change', ()=> {inputChange(input);});
  }
  taskInput.addEventListener('change', ()=> {createTask();});

  // Message handler passes message onto the relevant function
  // Use to sync background updates to an instance
  chrome.runtime.onMessage.addListener((message) => {
    if (message.frontendRequest) {
      runFrontend[message.frontendRequest](message.param);
    }
  });
});

/*****************************************************************************/