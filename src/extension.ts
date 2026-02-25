import * as vscode from "vscode";

const isStylesheet = (doc: vscode.TextDocument) =>
  doc.languageId === "css" || doc.languageId === "scss" || doc.languageId === "less";

function isCursorInsideValue(doc: vscode.TextDocument, pos: vscode.Position) {
  const line = doc.lineAt(pos.line).text;

  const colon = line.lastIndexOf(":", pos.character - 1);
  if (colon === -1) return false;

  const semi = line.indexOf(";", colon + 1);
  if (semi === -1) return false;

  return pos.character > colon && pos.character <= semi;
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("skipcolon.acceptSuggestionAndSkipSemicolon", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const doc = editor.document;
      if (!isStylesheet(doc)) {
        await vscode.commands.executeCommand("acceptSelectedSuggestion");
        return;
      }

      const beforePos = editor.selection.active;
      const wasInsideValue = isCursorInsideValue(doc, beforePos);

      await vscode.commands.executeCommand("acceptSelectedSuggestion");
      await new Promise((r) => setTimeout(r, 0));

      if (!wasInsideValue) return;

      const pos = editor.selection.active;
      const nextChar = doc.getText(new vscode.Range(pos, pos.translate(0, 1)));
      if (nextChar === ";") {
        const newPos = pos.translate(0, 1);
        editor.selection = new vscode.Selection(newPos, newPos);
      }
    })
  );
}

export function deactivate() {}