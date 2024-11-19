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

export {changeButtonColour, togglePrimaryButton, toggleStopButton};

import { updateTime } from "./time.js";

/*****************************************************************************/

//  @button:  (DOM object) button to apply changes to
//  @id:      (string)     new id
//  @icon:    (string)     new icon name
const updateButton = (button, id, icon) => {
  if (icon == "pause") {
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="svgbutton" viewBox="0 0 320 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/></svg>`;
  } else {
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="svgbutton" viewBox="0 0 384 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>`;
  }
  
  button.id = id;
}

/*****************************************************************************/

//  @alarmName:  (number) name of alarm
const changeButtonColour = (alarmName) => {
  const colour = document.querySelector(":root");

  switch (alarmName) {
    case "breaktimer":
      chrome.action.setIcon({
        path: {
          "16":"../icons/green_icon_16.png",
          "32":"../icons/green_icon_32.png",
          "64":"../icons/green_icon_64.png"
        }
      });
      colour.style.setProperty("--accent", "#66be68");
      break;
    case "longbreaktimer":
      chrome.action.setIcon({
        path: {
          "16":"../icons/blue_icon_16.png",
          "32":"../icons/blue_icon_32.png",
          "64":"../icons/blue_icon_64.png"
        }
      });
      colour.style.setProperty("--accent", "#689dd6");
      break;
    default:
      chrome.action.setIcon({
        path: {
          "16":"../icons/red_icon_16.png",
          "32":"../icons/red_icon_32.png",
          "64":"../icons/red_icon_64.png"
        }
      });
      colour.style.setProperty("--accent", "#d66868");
      break;
  }
}

/*****************************************************************************/

// @state  (string) state to update button to 
const togglePrimaryButton = (state) => {
  const primaryButton = document.getElementsByClassName("alarmbutton")[0];
  const stopButton = document.getElementsByClassName("stopbutton")[0];

  if (state == "init") {
    updateButton(primaryButton, "start", "play_arrow");
    return;
  }

  primaryButton.classList.add("alarmbuttonactive");
  stopButton.classList.add("stopbuttonactive");
  
  if (state == "pause") {
    updateButton(primaryButton, "resume", "play_arrow");
  } else {
    updateButton(primaryButton, "pause", "pause");
  }

  updateTime(); //TODO: evaluate necessity
}

/*****************************************************************************/

const toggleStopButton = async () => {
  const primaryButton = document.getElementsByClassName("alarmbutton")[0];
  const stopButton = document.getElementsByClassName("stopbutton")[0];
  
  primaryButton.classList.remove("alarmbuttonactive");
  stopButton.classList.remove("stopbuttonactive");
  changeButtonColour("worktimer");
  updateButton(primaryButton, "start", "play_arrow");
  updateTime();
}