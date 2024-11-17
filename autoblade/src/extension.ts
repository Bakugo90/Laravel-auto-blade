import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "autoblade" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand("autoblade.start", () => {
    // vscode.window.showInformationMessage("Hello World from autoBlade!");

    isHtml()
      ? vscode.window.showInformationMessage("The current opened file is html")
      : vscode.window.showErrorMessage("The current File must be html");
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * Check if the current opened file has .html extension
 * @returns {boolean} True if the file has a .html extension, false otherwise.
 */

function isHtml(): boolean {
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const fileName = document.fileName;
    return fileName.endsWith(".html");
  }

  return false;
}
