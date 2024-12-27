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

export { createAlert, toggleHandler, toggleTools, sendMessage, menuHandler, resetHandler, overrideHandler };

import { alarmExists } from "./alarms.js";
import { updateProgress, updateDailyProgress } from "./popup_progress.js";

/*****************************************************************************/

//  @param:  (string) parameter of the request
const sendMessage = (request, param) => {
  chrome.runtime.sendMessage({backendRequest: request, param: param})
    .catch((e) => {console.log(`[${e}]\n Likely popup is not active`)});
}

/*****************************************************************************/

const toggleTools = () => {
  const header = document.getElementsByClassName("tabheadtools")[0];
  const menu = document.getElementsByClassName("tools")[0];

  menu.classList.toggle("show");
  header.classList.toggle("hideborder");
  
}

/*****************************************************************************/

//  @button:  (DOM object) menu button
const toggleHandler = (button) => {
  switch (button.id) {
    case "toggletheme":
      sendMessage("theme");
      break;
    case "toggleauto":
      sendMessage("toggleauto");
      break;
    default:
      break;
  }
}

/*****************************************************************************/

//  @button:  (DOM object) menu button
const menuHandler = (button) => {
  const container = document.getElementsByClassName("togglecontainer")[0];
  const tab = document.getElementById(button.id + "tab");
  const togglebuttonList = document.getElementsByClassName("darktoolicon");
  
  if (button.id == "advanced") {
    sendMessage("toggleAdvanced");
    return;
  }

  updateProgress();
  updateDailyProgress();

  const tabOpened = toggleTab(tab, "flex");
  toggleTab(container, "flex", tabOpened);
  

  for (const togglebutton of togglebuttonList) {
    if (togglebutton.classList.contains("activeicon") && togglebutton.id != "advanced") {
      const tab = document.getElementById(togglebutton.id + "tab");
      toggleTab(tab, "none", true);
    }
    togglebutton.classList.remove("activeicon");
  }
  
  if (tabOpened) button.classList.add("activeicon");
}

/*****************************************************************************/

//  @msg:             (string)  message to pass onto the user
//  @alarmMustExist:  (boolean) toggle whether an active alarm must exist     
const createAlert = async (msg, alarmMustExist=false) => {
  const existingAlert = document.getElementById("helppopup");
  const alarm = await alarmExists();
  if (alarmMustExist && !alarm) return;
  if (existingAlert) existingAlert.remove();

  const dropDownButton = document.getElementById("maincontainer");
  dropDownButton.insertAdjacentHTML("beforeend", 
    `
    <div id="helppopup">
      <span>${msg}</span>
      <button id="closealert" type="button">&#215;&#xFE0E;</button>
    </div>
    `
  );
  const alertButton = document.getElementById("closealert");
  alertButton.addEventListener("click", () => {
    document.getElementById("helppopup").remove();
  });
}

/*****************************************************************************/

//  @element:    (DOM object) element
//  @display:    (string)     display property
//  @forceDisplay:  (boolean)    force display property 
//
//  Returns: true if tab was opened, false if tab was closed
const toggleTab = (element, display, forceDisplay = false) => {
  if (forceDisplay || !element.style.display || element.style.display == "none") {
    element.style.display = display;
    return true;
  }
  element.style.display = "none";
  
  return false;
}

/*****************************************************************************/

//  @button:  (DOM object) reset button
const resetHandler = (button) => {
  if (!button.classList.contains("confirmreset")) {
    button.classList.add("confirmreset");
    return;
  }
  button.classList.remove("confirmreset");
  switch (button.id) {
    case "resetsettings":
      sendMessage("resetSettings");
      break;
    case "resetprogress":
      sendMessage("resetProgress");
      break;
    default:
      break;
  }
}

/*****************************************************************************/

//  @button:  (DOM object) override button
const overrideHandler = async (button) => {
  switch (button.id) {
    case "setshort":
      sendMessage("overrideAlarm", "breaktimer");
      break;
    case "setlong":
      sendMessage("overrideAlarm", "longbreaktimer");
      break;
    default:
      sendMessage("overrideAlarm", "worktimer");
      break;
  }
}

/*****************************************************************************/