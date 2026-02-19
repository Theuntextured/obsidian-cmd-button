# Obsidian CMD Button

A lightweight Obsidian plugin that allows you to execute OS-level shell commands, `.bat` scripts, and executables directly from your markdown notes using customisable UI buttons. 

Instead of switching windows to run compilation scripts, file processors, or system tools, you can trigger them seamlessly from your documentation.

## Features

* **Native Execution:** Passes commands directly to the underlying Windows Node.js shell.
* **Context-Aware:** Automatically injects the absolute path of your active Obsidian note into your scripts using the `%file%` variable.
* **Vault-Anchored:** Scripts safely execute with your vault's root folder as the Current Working Directory.
* **Customisable:** Adjust colours, scale, borders, and alignment to match your specific vault theme.
* **Visual Feedback:** Provides native Obsidian toast notifications upon execution start, success, or failure.

## Usage

To create an execution button, write a markdown code block tagged with `batchbutton`. 

````markdown
```batchbutton
label: Compile Project
command: D:\Scripts\build.bat
justify: centre
```
````

### Parameters

* **`label:`** The text displayed on the button.
* **`command:`** The exact command passed to the OS terminal. You can chain commands using `&&` (e.g., `cd .. && run.bat`).
* **`justify:`** (Optional) Aligns the button within the note. Accepts `left`, `centre`, or `right`. If omitted, it defaults to your plugin settings.

## The Active File Variable

If your batch script needs to know exactly which note you are currently looking at, include the `%file%` variable in your command string. 

````markdown
```batchbutton
label: Process Current Note
command: python document_parser.py %file%
```
````

The plugin will dynamically replace `%file%` with the absolute Windows path of the active note, automatically wrapped in quotes to protect against spaces in your folder names (e.g., `"D:\My Vault\Current Note.md"`).

## Appearance Settings

The plugin integrates cleanly with Obsidian's native CSS variables so it looks good in any theme. You can override these defaults in the Obsidian Settings menu under **Batch Button**:

* **Text Colour:** Native CSS variables (like `var(--text-accent)`) or hex codes.
* **Border Width & Colour:** Control the thickness and tint of the button boundary.
* **Button Scale:** Use a multiplier (e.g., `1.2` or `1.5`) to increase the button size using native font-size scaling. The layout will adapt without clipping.
* **Default Justification:** Set a global alignment rule so you do not have to type `justify:` on every block.

## Installation

1. Download the latest release from the repository.
2. Inside your Obsidian vault, navigate to `.obsidian/plugins/`.
3. Create a new folder named `batch-button`.
4. Place the `main.js` and `manifest.json` files inside this new folder.
5. Reload Obsidian and enable **CMD Button** in the Community Plugins settings tab.

*Disclaimer: This plugin executes raw shell commands on your operating system. Do not execute buttons from untrusted markdown files.*
