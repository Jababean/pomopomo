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

export { changeTheme, toggleAuto, inputChange, updateInput, resetSettings };

/*****************************************************************************/

//  @theme:  (boolean) theme is light
const changeTheme = (theme) => {
  const colour = document.querySelector(":root");
  const button = document.getElementById("theme");
  const toggle = document.getElementById("toggletheme");

  if (theme) {
    toggle.checked = false;
    colour.style.setProperty("--background", "#e2dbd7");
    colour.style.setProperty("--tabBG", "#fff");
    colour.style.setProperty("--border", "#777574");
    colour.style.setProperty("--fontText", "#302f2e");
    colour.style.setProperty("--fontSubtext", "#777574");

  } else {
    toggle.checked = true;
    colour.style.setProperty("--background", "#2b2827");
    colour.style.setProperty("--tabBG", "#454545");
    colour.style.setProperty("--border", "#99928f");
    colour.style.setProperty("--fontText", "#fff");
    colour.style.setProperty("--fontSubtext", "#99928f");
  }
  
  return;
}

/*****************************************************************************/

//  @value:  (boolean) auto-start session is enabled
const toggleAuto = (value) => {
  const toggle = document.getElementById("toggleauto");
  toggle.checked = value;
  return;
}

/*****************************************************************************/

//  @inputListItem:  (DOM object) input
const inputChange = (inputListItem) => {
  const input = document.getElementById(inputListItem.id);

  input.value = (isNaN(parseFloat(input.value))) ? input.min : Math.round(parseFloat(input.value));
  if (input.value < parseInt(input.min)) input.value = parseInt(input.min);
  if (input.value > parseInt(input.max)) input.value = parseInt(input.max);

  chrome.storage.local.set({[input.id] : +input.value})
  input.blur();
}

/*****************************************************************************/

//  @key    (string) input 
//  @value  (string) new value of input
const updateInput = (key, value) => {
  const input = document.getElementById(key);
  input.value = value;
}

/*****************************************************************************/

//  @settings  (object) list of settings and values
const resetSettings = (settings) => {
  for (const setting in settings) {
    const input = document.getElementById(setting);
    input.value = settings[setting];
  }
}

/*****************************************************************************/