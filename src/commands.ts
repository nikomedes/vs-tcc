"use strict";
import * as vscode from 'vscode';

import * as path from "path";
const os = require('os');

let _terminalStack: vscode.Terminal[] = [];
let _context:vscode.ExtensionContext;

/**
 * Runs according to current flags.
 * Defaults to currently open C file if no flags are given.
 */
export function run(): void {
  checkTerminal();
  getLatestTerminal().sendText(tcc(getFlags() + " -run " + getArgs()));
  getLatestTerminal().show();
}

/**
 * Runs TCC according to given flags.
 * Defaults to currently open C file if no tcc.json file is found.
 */
export function compile(): void {
  checkTerminal();
  getLatestTerminal().sendText(tcc(getFlags() + " " + getArgs()));
  getLatestTerminal().show();
}

/**
 * Sets the context.
 */
export function setContext(context: vscode.ExtensionContext) {
  _context = context;
}

/**
 * Gets the flags from settings
 */
function getFlags(): string {
  let space = " ";
  try {
    var conf = vscode.workspace.getConfiguration("TCC").get("flags");
    if (conf !==  null && conf !== undefined) {
      return space + conf;
    }
    throw new Error("No flags given. Reverting to default.");
  } catch (error) {
    console.log(error);
    return space + getFileName();
  }
}

/**
 * Gets the args from settings
 */
function getArgs(): string {
  let space = " ";
  try {
    var conf = vscode.workspace.getConfiguration("TCC").get("args");
    if (conf !==  null && conf !== undefined) {
      return space + conf;
    }
    throw new Error("No args given. Reverting to default.");
  } catch (error) {
    console.log(error);
    return "";
  }
}

/**
 * Creates a new terminal if none exist.
 */
function checkTerminal() {
  if (0 === _terminalStack.length) {
    let terminal = vscode.window.createTerminal(
      `compiler #${_terminalStack.length + 1}`
    );
    _terminalStack.push(terminal);
  }
}

/**
 * Gets the current terminal.
 */
function getLatestTerminal(): vscode.Terminal {
  return _terminalStack[_terminalStack.length - 1];
}

/**
 * Gets the name of the current C file.
 */
function getFileName(): string {
  if (vscode.window.activeTextEditor == undefined)
    return '""';
  else
    return '"' + vscode.window.activeTextEditor.document.fileName.toString() + '"';
}

/**
 * Gets the path of TCC.
 * @param args Arguments for Tiny C Compiler.
 */
function tcc(flags: string): string {
  let space = " ";
  let tccPath = "";
  switch(os.platform()) {
    case 'linux':
      tccPath = "usr/bin/tcc";
      return path
        .join("/", tccPath)
        .concat(space + flags);
    case 'win32':
      tccPath = "/tcc-win32/tcc.exe";
      return path
        .join(_context.extensionPath, tccPath)
        .concat(space + flags);
    default:
      console.log("Error: plattform " + os.platform() + " not supported.");
  }

  return path
    .join(_context.extensionPath, tccPath)
    .concat(space + flags);
}
