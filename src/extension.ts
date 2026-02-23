import * as vscode from "vscode";

let skipping = false;

const isStylesheet = (doc: vscode.TextDocument) =>
  doc.languageId === "css" || doc.languageId === "scss" || doc.languageId === "less";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.workspace.onDidChangeTextDocument((e) => {
    if (skipping) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const doc = editor.document;
    if (doc !== e.document) return;
    if (!isStylesheet(doc)) return;

    if (e.contentChanges.length === 0) return;

    const change = e.contentChanges[0];
    if (!change.text) return;
    if (change.text.includes("\n") || change.text.includes("\r")) return;

    setTimeout(() => {
      if (skipping) return;

      const ed = vscode.window.activeTextEditor;
      if (!ed || ed.document !== doc) return;
      if (!ed.selection.isEmpty) return;

      const pos = ed.selection.active;
      const line = doc.lineAt(pos.line).text;

      if (pos.character >= line.length) return;
      if (line[pos.character] !== ";") return;

      const prevChar = pos.character > 0 ? line[pos.character - 1] : "";
      if (!prevChar || /\s/.test(prevChar)) return;

      skipping = true;
      try {
        const newPos = pos.translate(0, 1);
        ed.selection = new vscode.Selection(newPos, newPos);
      } finally {
        skipping = false;
      }
    }, 0);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}